import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:lsa_calendar_app/core/app_colors.dart';
import 'package:lsa_calendar_app/screens/login_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  try {
    if (kReleaseMode) {
      await dotenv.load(fileName: ".env.production");
    } else {
      await dotenv.load(fileName: ".env.testing");
    }
  } catch (e) {
    // Fallback
    await dotenv.load(fileName: ".env");
    debugPrint('Fallback to default .env');
  }

  runApp(const MainApp());
}

class MainApp extends StatelessWidget {
  const MainApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        backgroundColor: AppColors.background,
        body: LoginScreen(),
      ),
    );
  }
}
