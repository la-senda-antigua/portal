import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:lsa_calendar_app/services/api_service.dart';

class FirebaseService {
  static final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  static final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();
  static String? _fcmToken;

  static String? get fcmToken => _fcmToken;

  static Future<void> initialize() async {
    try {
      // Initialize local notifications for displaying messages when the app is in the foreground
      await _initializeLocalNotifications();

      // Request permissions for iOS (no-op on Android)
      NotificationSettings settings = await _firebaseMessaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );

      debugPrint('###### Notification permission: ${settings.authorizationStatus}');

      // Get FCM token
      _fcmToken = await _firebaseMessaging.getToken();
      debugPrint('###### FCM Token: $_fcmToken');

      // Set up message handlers
      await setupForegroundMessageHandler();
      await setupBackgroundMessageHandler();

      // Listen for token changes
      FirebaseMessaging.instance.onTokenRefresh.listen((newToken) {
        _fcmToken = newToken;
        debugPrint('New FCM Token: $_fcmToken');
        _registerDeviceOnBackend(newToken);
      });
    } catch (e) {
      debugPrint('Error initializing Firebase Messaging: $e');
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

    // Create notification channel for Android
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
      debugPrint('Message received in foreground: ${message.notification?.title}');
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
      debugPrint('Message tap: ${message.notification?.title}');
      // Navigate to screen
    });
  }

  static Future<void> _registerDeviceOnBackend(String token) async {
    final normalizedToken = token.trim();
    if (normalizedToken.isEmpty) return;

    String platform;
    if (kIsWeb) {
      platform = 'web';
    } else {
      switch (defaultTargetPlatform) {
        case TargetPlatform.android:
          platform = 'android';
          break;
        case TargetPlatform.iOS:
          platform = 'ios';
          break;
        case TargetPlatform.windows:
          platform = 'windows';
          break;
        case TargetPlatform.macOS:
          platform = 'macos';
          break;
        case TargetPlatform.linux:
          platform = 'linux';
          break;
        default:
          platform = 'other';
      }
    }

    try {
      await ApiService.post(
        '/notifications/register-device',
        body: {
          'fcmToken': normalizedToken,
          'platform': platform,
        },
      );
    } catch (e) {
      debugPrint('register-device (onTokenRefresh) error: $e');
    }
  }
}
