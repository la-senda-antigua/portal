import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:lsa_calendar_app/models/apiException.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class ApiService {
  static Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('access_token');
  }

  static Future<Map<String, String>> _getHeaders() async {
    final token = await _getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  static Future<T> get<T>(
    String endpoint, {
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final baseUrl = dotenv.env['API_BASE_URL']!;
      final headers = await _getHeaders();
      debugPrint('Making GET request to: $baseUrl$endpoint with headers: $headers');
      
      final response = await http.get(
        Uri.parse('$baseUrl$endpoint'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return fromJson != null ? fromJson(data) : data;
      } else {
        throw ApiException(response.statusCode, response.body);
      }
    } catch (e) {
      rethrow;
    }
  }

  static Future<T> post<T>(
    String endpoint, {
    Map<String, dynamic>? body,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final baseUrl = dotenv.env['API_BASE_URL']!;
      debugPrint('Making POST request to: $baseUrl$endpoint with body: $body');
      final headers = await _getHeaders();      
      final response = await http.post(
        Uri.parse('$baseUrl$endpoint'),
        headers: headers,
        body: body != null ? json.encode(body) : null,
      );

      debugPrint('post request response code: ${response.statusCode}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = json.decode(response.body);
        return fromJson != null ? fromJson(data) : data;
      } else {        
        throw ApiException(response.statusCode, response.body);

      }
    } catch (e) {
      rethrow;
    }
  }
}
