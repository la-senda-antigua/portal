import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class AuthService {
  final GoogleSignIn _googleSignIn = GoogleSignIn(scopes: ['email', 'profile']);

  Future<String?> loginWithGoogle() async {
    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        return null;
      }

      final GoogleSignInAuthentication googleAuth =
          await googleUser.authentication;

      if (googleAuth.idToken == null) {
        throw Exception('Cannot obtain idToken from Google Sign-In');
      }

      final baseUrl = dotenv.get('API_BASE_URL');

      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/google-mobile'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'idToken': googleAuth.idToken}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final accessToken = data['accesToken'];
        return accessToken;
      } else {
        final error = jsonDecode(response.body);
        throw Exception(error['message'] ?? 'Error en autenticación');
      }
    } catch (e) {
      rethrow;
    }
  }
}
