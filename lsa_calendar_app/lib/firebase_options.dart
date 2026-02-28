import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return macos;
      case TargetPlatform.windows:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for windows - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      case TargetPlatform.linux:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for linux - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyBx_U68JkSJXaYjq5OCQoNcY_BTfglJd-U',
    appId: '1:394230192742:web:a03632f30240154a6e6ba7',
    messagingSenderId: '394230192742',
    projectId: 'ilsa-661a4',
    authDomain: 'ilsa-661a4.firebaseapp.com',
    storageBucket: 'ilsa-661a4.firebasestorage.app',
    measurementId: 'G-MEASUREMENT_ID',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyBx_U68JkSJXaYjq5OCQoNcY_BTfglJd-U',
    appId: '1:394230192742:android:a03632f30240154a6e6ba7',
    messagingSenderId: '394230192742',
    projectId: 'ilsa-661a4',
    storageBucket: 'ilsa-661a4.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyBx_U68JkSJXaYjq5OCQoNcY_BTfglJd-U',
    appId: '1:394230192742:ios:a03632f30240154a6e6ba7',
    messagingSenderId: '394230192742',
    projectId: 'ilsa-661a4',
    storageBucket: 'ilsa-661a4.firebasestorage.app',
    iosBundleId: 'com.iglesialasendaantigua.calendar',
  );

  static const FirebaseOptions macos = FirebaseOptions(
    apiKey: 'AIzaSyBx_U68JkSJXaYjq5OCQoNcY_BTfglJd-U',
    appId: '1:394230192742:ios:a03632f30240154a6e6ba7',
    messagingSenderId: '394230192742',
    projectId: 'ilsa-661a4',
    storageBucket: 'ilsa-661a4.firebasestorage.app',
    iosBundleId: 'com.iglesialasendaantigua.calendar',
  );
}
