import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:lsa_calendar_app/screens/calendars_home_screen.dart';

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

  Future<void> _saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('access_token', token);
  }

  Future<void> _handleGoogleSignIn() async {    
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

      await dotenv.load();
      final String baseUrl = dotenv.env['API_BASE_URL']!;

      final response = await http.post(
        Uri.parse('$baseUrl/auth/google-mobile'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'accessToken': accessToken}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final String token = data['accesToken'] ?? data['accessToken'] ?? data['token'];

        await _saveToken(token);

        if (!mounted) return;

        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (_) => const CalendarsHomeScreen()),
          (route) => false,
        );

        _showSnack('Welcome ${account.displayName ?? 'User'}!');
      } else {
        final errorBody = response.body.isNotEmpty? jsonDecode(response.body): {};
        final message = errorBody['message'] ?? 'Login failed (${response.statusCode})';
        _showSnack(message);
      }
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
            const Text(
              "LSA Calendars",
              style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 60),

            // ← Botón con loading
            _isLoading
                ? const Column(
                    children: [
                      CircularProgressIndicator(),
                      SizedBox(height: 16),
                      Text('Signing you in...', style: TextStyle(fontSize: 16)),
                    ],
                  )
                : ElevatedButton.icon(
                    onPressed: _handleGoogleSignIn,
                    icon: const FaIcon(FontAwesomeIcons.google, size: 28),
                    label: const Text(
                      'Continue with Google',
                      style: TextStyle(fontSize: 18),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: Colors.black87,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 32,
                        vertical: 16,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(30),
                        side: const BorderSide(color: Colors.grey),
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
