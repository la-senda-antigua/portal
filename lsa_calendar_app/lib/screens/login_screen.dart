import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:lsa_calendar_app/core/app_colors.dart';
import 'package:lsa_calendar_app/core/app_text_styles.dart';
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
  bool _isLoading = false;

  void _showSnack(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), duration: const Duration(seconds: 4)),
    );
  }

  Future<void> _saveData(String token, String? username) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('access_token', token);
    await prefs.setString('username', username ?? 'Guest');
  }

  Future<void> _handleGoogleSignIn() async {
    debugPrint('Starting Google Sign-In!!!!!!');
    if (_isLoading) return;

    setState(() => _isLoading = true);

    try {
      final account = await _googleSignIn.signIn();

      if (account == null) {
        setState(() => _isLoading = false);
        _showSnack('Login cancelled');
        return;
      }

      final auth = await account.authentication;
      final String? accessToken = auth.accessToken;

      if (accessToken == null) {
        setState(() => _isLoading = false);
        _showSnack('Failed to get Google access token');
        return;
      }

      final response = await ApiService.post('/auth/google-mobile', 
        body: {'accessToken': accessToken}
      );

      final String token = response['accesToken'] ?? 
                          response['accessToken'] ?? 
                          response['token'];

      await _saveData(token, account.displayName);

      if (!mounted) return;

      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const CalendarsHomeScreen()),
        (route) => false,
      );

      _showSnack('Welcome ${account.displayName ?? 'User'}!');
    } catch (e) {
      debugPrint('Google Sign-In error: $e');
      _showSnack('Connection error. Please try again.');
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _isLoading
                ? const Column(
                    children: [
                      CircularProgressIndicator(),
                      SizedBox(height: 16),
                      Text('Signing you in...', style: AppTextStyles.body),
                    ],
                  )
                : ElevatedButton.icon(
                    onPressed: _handleGoogleSignIn,
                    icon: const FaIcon(FontAwesomeIcons.google, size: 28),
                    label: const Text('Continue with Google',style: AppTextStyles.body,),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.light,
                      foregroundColor: AppColors.dark,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 32,
                        vertical: 16,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(30),
                        side: const BorderSide(color: AppColors.secondary),
                      ),
                      elevation: 3,
                    ),
                  ),
          ],
        ),
      ),
    );
  }
}
