import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:lsa_calendar_app/core/app_colors.dart';
import 'package:lsa_calendar_app/core/app_text_styles.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
    // serverClientId: '161849371047-otkli989emb35cefsmlo9aalekrnhm9l.apps.googleusercontent.com',
  );

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text("LSA Calendars", style: AppTextStyles.h1),
          const SizedBox(height: 40), // space between text and button
          ElevatedButton.icon(
            onPressed: testGoogleSignIn,
            icon: FaIcon(FontAwesomeIcons.google),
            label: const Text('Sign in with Google'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.light,
              foregroundColor: AppColors.dark,
              padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 15),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showSnack(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  Future<void> _handleGoogleSignIn() async {
    try {
      await _googleSignIn.signOut();
      final GoogleSignInAccount? googleSignInAccount = await _googleSignIn
          .signIn();

      if (googleSignInAccount == null) {
        _showSnack('Canceled by user');
        return;
      }

      final GoogleSignInAuthentication googleSignInAuthentication =
          await googleSignInAccount.authentication;

      if (googleSignInAuthentication.idToken == null) {
        _showSnack('Failed to get Google token');
        return;
      }

      await dotenv.load();
      final baseUrl = dotenv.get('API_BASE_URL');
      debugPrint('#### Base URL: $baseUrl');

      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/google-mobile'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'idToken': googleSignInAuthentication.idToken}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final accessToken = data['accesToken'];

        _showSnack('Welcome ${googleSignInAccount.displayName}');

        debugPrint('Signed in: ${googleSignInAccount.displayName}');
        debugPrint('Email: ${googleSignInAccount.email}');
        debugPrint('Access Token: $accessToken');

        // Aquí guardarías el token y navegarías
        // await _saveToken(accessToken);
        // Navigator.pushReplacementNamed(context, '/home');
      } else if (response.statusCode == 401) {
        final error = jsonDecode(response.body);
        _showSnack(error['message'] ?? 'User not registered');
      } else {
        _showSnack('Error ${response.statusCode}: ${response.body}');
      }
    } catch (error) {
      _showSnack('Error: $error');
      debugPrint('#### Error: $error');
    }
  }

  Future<void> testGoogleSignIn() async {
    try {
      final account = await _googleSignIn.signIn();
      debugPrint('Success: ${account?.email}');
    } catch (e) {
      debugPrint('Error details: $e');
    }
  }
}
