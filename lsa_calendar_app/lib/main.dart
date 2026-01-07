import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:lsa_calendar_app/core/app_colors.dart';
import 'package:lsa_calendar_app/screens/login_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // use '.env' by default
  const envFile = String.fromEnvironment('ENV_FILE', defaultValue: '.env');
  await dotenv.load(fileName: envFile);

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
