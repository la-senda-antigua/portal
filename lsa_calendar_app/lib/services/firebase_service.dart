import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class FirebaseService {
  static final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  static final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();
  static String? _fcmToken;

  static String? get fcmToken => _fcmToken;

  static Future<void> initialize() async {
    try {
      // Inicializar notificaciones locales
      await _initializeLocalNotifications();

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

      // Configurar handlers de mensajes
      await setupForegroundMessageHandler();
      await setupBackgroundMessageHandler();

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

  static Future<void> _initializeLocalNotifications() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/launcher_icon');
    const iosSettings = DarwinInitializationSettings();
    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _localNotifications.initialize(initSettings);

    // Crear canal de notificaciones para Android
    const androidChannel = AndroidNotificationChannel(
      'high_importance_channel',
      'High Importance Notifications',
      description: 'This channel is used for important notifications.',
      importance: Importance.high,
    );

    await _localNotifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(androidChannel);
  }

  static Future<void> setupForegroundMessageHandler() async {
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      debugPrint('Mensaje recibido en foreground: ${message.notification?.title}');
      debugPrint('Body: ${message.notification?.body}');

      // Mostrar notificación local
      _showLocalNotification(message);
    });
  }

  static Future<void> _showLocalNotification(RemoteMessage message) async {
    const androidDetails = AndroidNotificationDetails(
      'high_importance_channel',
      'High Importance Notifications',
      channelDescription: 'This channel is used for important notifications.',
      importance: Importance.high,
      priority: Priority.high,
    );

    const iosDetails = DarwinNotificationDetails();

    const notificationDetails = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _localNotifications.show(
      message.hashCode,
      message.notification?.title ?? 'Notificación',
      message.notification?.body ?? '',
      notificationDetails,
    );
  }

  static Future<void> setupBackgroundMessageHandler() async {
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      debugPrint('Mensaje tocado: ${message.notification?.title}');
      // Navegar a la pantalla correspondiente
    });
  }
}
