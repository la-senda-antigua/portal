import 'package:flutter/material.dart';
import 'package:lsa_calendar_app/core/app_text_styles.dart';
import 'package:lsa_calendar_app/models/calendar.dart';
import 'package:lsa_calendar_app/services/api_service.dart';
import 'package:lsa_calendar_app/services/user_service.dart';

class CalendarsHomeScreen extends StatefulWidget {
  const CalendarsHomeScreen({super.key});

  @override
  State<CalendarsHomeScreen> createState() => _CalendarsHomeScreenState();
}

class _CalendarsHomeScreenState extends State<CalendarsHomeScreen> {
  List<Calendar> calendars = [];
  bool isLoading = true;
  String? error;

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
    fetchCalendars();
  }

  @override
  Widget build(BuildContext context) {
    final user = UserService.currentUser;

    return Scaffold(
      appBar: AppBar(title: Text('My Calendars - ${user?.name ?? "Guest"}')),
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
