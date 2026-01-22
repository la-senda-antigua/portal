import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import 'package:lsa_calendar_app/core/app_colors.dart';
import 'package:lsa_calendar_app/core/app_text_styles.dart';
import 'package:lsa_calendar_app/l10n/app_localizations.dart';
import 'package:lsa_calendar_app/screens/calendars_home_screen.dart';
import 'package:lsa_calendar_app/services/api_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final GoogleSignIn _googleSignIn = GoogleSignIn(scopes: ['email', 'profile']);
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _isLoading = true;
  bool _obscurePassword = true;

  @override
  void initState() {
    super.initState();
    _checkExistingSession();
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _showSnack(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), duration: const Duration(seconds: 4)),
    );
  }

  Future<void> _saveData(String token, String? refreshToken, String? username, String? email, String? avatar) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('access_token', token);
    if (refreshToken != null) await prefs.setString('refresh_token', refreshToken);
    await prefs.setString('username', username ?? 'Guest');
    if (email != null) await prefs.setString('email', email);
    if (avatar != null) await prefs.setString('avatar', avatar);
  }

  Future<void> _checkExistingSession() async {
    final prefs = await SharedPreferences.getInstance();
    try {
      final token = prefs.getString('access_token');
      
      if (token != null && token.isNotEmpty) {
        await ApiService.get('/auth/validate-token');

        if (!mounted) return;
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (_) => const CalendarsHomeScreen()),
          (route) => false,
        );
        return;
      }
    } catch (e) {
      debugPrint('Sesión inválida o expirada: $e. Intentando refresh...');
      
      final token = prefs.getString('access_token');
      final refreshToken = prefs.getString('refresh_token');

      if (token != null && refreshToken != null) {
        try {
          // Intentamos refrescar los tokens
          final response = await ApiService.post('/auth/refresh-tokens', body: {
            'accessToken': token,
            'refreshToken': refreshToken,
            'expirationDays': 40,
          });

          final newToken = response['accesToken'] ?? response['accessToken'];
          final newRefreshToken = response['refreshToken'];

          if (newToken != null) {
            // Guardamos los nuevos tokens y mantenemos los datos de usuario
            await _saveData(newToken, newRefreshToken, prefs.getString('username'), prefs.getString('email'), prefs.getString('avatar'));
            
            if (!mounted) return;
            Navigator.of(context).pushAndRemoveUntil(
              MaterialPageRoute(builder: (_) => const CalendarsHomeScreen()),
              (route) => false,
            );
            return;
          }
        } catch (refreshError) {
          debugPrint('Error al refrescar token: $refreshError');
        }
      }

      // Si falló el refresh o no había tokens, limpiamos todo
      await prefs.remove('access_token');
      await prefs.remove('refresh_token');
    }

    // Si no hay token o hubo error, quitamos la carga para mostrar el botón de login
    if (mounted) setState(() => _isLoading = false);
  }

  Future<void> _handleStandardLogin() async {
    if (_usernameController.text.isEmpty || _passwordController.text.isEmpty) {
      _showSnack(AppLocalizations.of(context)!.enterCredentials);
      return;
    }

    setState(() => _isLoading = true);

    try {
      final response = await ApiService.post('/auth/login', body: {
        'username': _usernameController.text,
        'password': _passwordController.text,
      });

      final String token = response['accesToken'] ?? response['accessToken'];
      final String? refreshToken = response['refreshToken'];

      await _saveData(token, refreshToken, _usernameController.text, null, null);

      if (!mounted) return;
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const CalendarsHomeScreen()),
        (route) => false,
      );
    } catch (e) {
      debugPrint('Login error: $e');
      if (mounted) {
        _showSnack(AppLocalizations.of(context)!.loginError);
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleGoogleSignIn() async {
    debugPrint('Starting Google Sign-In##');
    if (_isLoading) return;

    setState(() => _isLoading = true);

    try {
      final account = await _googleSignIn.signIn();

      if (account == null) {
        if (!mounted) return;
        setState(() => _isLoading = false);
        _showSnack(AppLocalizations.of(context)!.loginCancelled);
        return;
      }

      final auth = await account.authentication;
      final String? accessToken = auth.accessToken;

      if (accessToken == null) {
        if (!mounted) return;
        setState(() => _isLoading = false);
        _showSnack(AppLocalizations.of(context)!.googleTokenError);
        return;
      }

      final response = await ApiService.post('/auth/google-mobile', 
        body: {'accessToken': accessToken}
      );

      final tokenData = response['token'];
      final userData = response['user'];

      final String token = tokenData['accesToken'] ?? 
                          tokenData['accessToken'] ?? 
                          tokenData['token'];
      final String? refreshToken = tokenData['refreshToken'];

      // Guardamos token y datos del usuario (nombre, email, avatar)
      await _saveData(token, refreshToken, userData['name'], userData['email'], userData['avatar']);

      if (!mounted) return;

      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const CalendarsHomeScreen()),
        (route) => false,
      );

      _showSnack(AppLocalizations.of(context)!.welcomeMessage(account.displayName ?? 'User'));
    } catch (e) {
      debugPrint('Google Sign-In error: $e');
      if (mounted) {
        _showSnack(AppLocalizations.of(context)!.connectionError);
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _handleAppleSignIn() async {
    if (_isLoading) return;
    setState(() => _isLoading = true);

    try {
      final credential = await SignInWithApple.getAppleIDCredential(
        scopes: [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ]
      );

      final response = await ApiService.post('/auth/apple-login', body: {
        'identityToken': credential.identityToken,
      });

      final String token = response['accesToken'] ?? response['accessToken'];
      final String? refreshToken = response['refreshToken'];

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('access_token', token);

      String username = 'Apple User';
      String? email = credential.email;
      
      try {
        final userValidation = await ApiService.get('/auth/validate-token');
        if (userValidation['valid'] == true && userValidation['user'] != null) {
          email = userValidation['user']['email'] ?? email;
          if (credential.givenName != null) {
            username = '${credential.givenName} ${credential.familyName ?? ''}'.trim();
          } else if (email != null) {
             username = email.split('@')[0];
          }
        }
      } catch (_) {}

      await _saveData(token, refreshToken, username, email, null);

      if (!mounted) return;
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const CalendarsHomeScreen()),
        (route) => false,
      );
    } catch (e) {
      debugPrint('Apple Sign-In error: $e');
      if (mounted) {
        _showSnack(AppLocalizations.of(context)!.connectionError);
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(42.0),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 400),
            child: _isLoading
                ? Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const CircularProgressIndicator(),
                    const SizedBox(height: 16),
                    Text(AppLocalizations.of(context)!.loggingIn, style: AppTextStyles.body),
                  ],
                )
              : Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    TextField(
                      controller: _usernameController,
                      decoration: InputDecoration(
                        labelText: AppLocalizations.of(context)!.usernameLabel,
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.person),
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _passwordController,
                      obscureText: _obscurePassword,
                      decoration: InputDecoration(
                        labelText: AppLocalizations.of(context)!.passwordLabel,
                        border: const OutlineInputBorder(),
                        prefixIcon: const Icon(Icons.lock),
                        suffixIcon: IconButton(
                          icon: Icon(_obscurePassword
                              ? Icons.visibility_off
                              : Icons.visibility),
                          onPressed: () {
                            setState(() {
                              _obscurePassword = !_obscurePassword;
                            });
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _handleStandardLogin,
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          backgroundColor: AppColors.accent,
                          foregroundColor: AppColors.light,
                          fixedSize: const Size.fromHeight(60),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(30),
                          ),
                        ),
                        child: Text(AppLocalizations.of(context)!.loginButton, style: AppTextStyles.body),
                      ),
                    ),
                    const SizedBox(height: 24),
                    const Row(children: [
                      Expanded(child: Divider()),                      
                    ]),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _handleGoogleSignIn,
                        icon: const FaIcon(FontAwesomeIcons.google, size: 28),
                        label: Text(
                          AppLocalizations.of(context)!.googleLoginButton,
                          style: AppTextStyles.body,
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.light,
                          foregroundColor: AppColors.dark,
                          padding: const EdgeInsets.symmetric(
                            vertical: 16,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(30),
                            side: const BorderSide(color: AppColors.secondary),
                          ),
                          elevation: 0,
                        ),
                      ),
                    ),
                    if (Platform.isIOS) ...[
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: _handleAppleSignIn,
                          icon: const FaIcon(FontAwesomeIcons.apple, size: 28),
                          label: Text(
                            AppLocalizations.of(context)!.appleLoginButton,
                            style: AppTextStyles.body,
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.black,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(
                              vertical: 16,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(30),
                            ),
                            elevation: 0,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
          ),
        ),
      ),
    );
  }
}
