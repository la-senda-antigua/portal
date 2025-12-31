import 'package:flutter/material.dart';
import 'package:lsa_calendar_app/core/app_text_styles.dart';
import 'package:lsa_calendar_app/models/calendar.dart';
import 'package:lsa_calendar_app/screens/login_screen.dart';
import 'package:lsa_calendar_app/services/api_service.dart';
import 'package:lsa_calendar_app/widgets/user_profile_menu.dart';
import 'package:shared_preferences/shared_preferences.dart';

class CalendarsHomeScreen extends StatefulWidget {
  const CalendarsHomeScreen({super.key});

  @override
  State<CalendarsHomeScreen> createState() => _CalendarsHomeScreenState();
}

class _CalendarsHomeScreenState extends State<CalendarsHomeScreen> {
  List<Calendar> calendars = [];
  bool isLoading = true;
  String? error;
  String username = 'Guest';
  String? avatar;
  String? email;

  Future<void> fetchCalendars() async {
    try {
      final List<dynamic> data = await ApiService.get('/calendars/myCalendars');
      setState(() {
        calendars = data.map((json) => Calendar.fromJson(json)).toList();
        error = null;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        error = 'Could not connect to server. Try refreshing.';
        debugPrint('Error fetching calendars: $error');
        isLoading = false;
      });
    }
  }

  @override
  void initState() {
    super.initState();
    _loadUsername();
    fetchCalendars();
  }

  Future<void> _loadUsername() async {
  final prefs = await SharedPreferences.getInstance();
  setState(() {
    username = prefs.getString('username') ?? 'Guest';
    avatar = prefs.getString('avatar');
    email = prefs.getString('email');
    debugPrint('Username: $username');
    debugPrint('Avatar: $avatar');
  });
}

  Future<void> _logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    if (!mounted) return;
    
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (context) => const LoginScreen()),
      (route) => false, 
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.menu),
          onPressed: () {
            // TODO: Acción del menú hamburguesa
          },
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: UserProfileMenu(
              username: username,
              email: email,
              avatar: avatar,
              onLogout: _logout,
            ),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: fetchCalendars,
        child: isLoading
            ? const Center(child: CircularProgressIndicator())
            : error != null
            ? ListView(
                children: [
                  SizedBox(height: MediaQuery.of(context).size.height * 0.4),
                  Center(child: Text(error!)),
                ],
              )
            : ListView.builder(
                itemCount: calendars.length,
                itemBuilder: (context, index) {
                  final calendar = calendars[index];
                  return Card(
                    margin: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    child: ListTile(
                      title: Text(calendar.name, style: AppTextStyles.h3),
                      subtitle: Text('ID: ${calendar.id}'),
                      onTap: () {
                        // TODO: Navigate to calendar details
                      },
                    ),
                  );
                },
              ),
      ),
    );
  }
}
