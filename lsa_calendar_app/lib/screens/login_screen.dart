import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:lsa_calendar_app/core/app_colors.dart';
import 'package:lsa_calendar_app/core/app_text_styles.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:firebase_auth/firebase_auth.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text("LSA Calendars", style: AppTextStyles.h1),
          const SizedBox(height: 40), // space between text and button
          ElevatedButton.icon(
            onPressed: _handleGoogleSignIn,
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

  final GoogleSignIn _googleSignIn = GoogleSignIn();
  final FirebaseAuth _auth = FirebaseAuth.instance;

  Future<void> _handleGoogleSignIn() async {
    try {
      // Inicia el flujo de inicio de sesión con Google
      final GoogleSignInAccount? googleSignInAccount = await _googleSignIn
          .signIn();

      if (googleSignInAccount == null) {
        return; // Usuario canceló
      }

      // Obtiene los detalles de autenticación de Google
      final GoogleSignInAuthentication googleSignInAuthentication =
          await googleSignInAccount.authentication;

      // Crea una credencial para Firebase
      final OAuthCredential credential = GoogleAuthProvider.credential(
        accessToken: googleSignInAuthentication.accessToken,
        idToken: googleSignInAuthentication.idToken,
      );

      // Inicia sesión en Firebase con la credencial
      final UserCredential userCredential = await FirebaseAuth.instance
          .signInWithCredential(credential);

      print('############################################################');
      print('Signed in: ${userCredential.user?.displayName}');
      print('Email: ${userCredential.user?.email}');
    } catch (error) {
      print('############################################################');
      print('Error signing in: $error');
    }
  }
}
