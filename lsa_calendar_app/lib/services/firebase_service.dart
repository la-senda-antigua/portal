import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';

class FirebaseService {
  static final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  static String? _fcmToken;

  static String? get fcmToken => _fcmToken;

  static Future<void> initialize() async {
    try {
      // Solicitar permiso para notificaciones
      NotificationSettings settings = await _firebaseMessaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );

      debugPrint('###### Permiso de notificaciones: ${settings.authorizationStatus}');

      // Obtener token FCM
      _fcmToken = await _firebaseMessaging.getToken();
      debugPrint('###### FCM Token: $_fcmToken');

      // Escuchar cambios del token
      FirebaseMessaging.instance.onTokenRefresh.listen((newToken) {
        _fcmToken = newToken;
        debugPrint('Nuevo FCM Token: $_fcmToken');
        // Aquí puedes actualizar el token en el backend
      });
    } catch (e) {
      debugPrint('Error inicializando Firebase Messaging: $e');
    }
  }

  static Future<void> setupForegroundMessageHandler() async {
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      debugPrint('Mensaje recibido en foreground: ${message.notification?.title}');
      debugPrint('Body: ${message.notification?.body}');
    });
  }

  static Future<void> setupBackgroundMessageHandler() async {
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      debugPrint('Mensaje tocado: ${message.notification?.title}');
      // Navegar a la pantalla correspondiente
    });
  }
}
