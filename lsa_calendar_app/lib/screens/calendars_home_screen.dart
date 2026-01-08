import 'package:flutter/material.dart';
import 'package:lsa_calendar_app/core/app_colors.dart';
import 'package:lsa_calendar_app/core/calendar_colors.dart';
import 'package:lsa_calendar_app/core/app_text_styles.dart';
import 'package:lsa_calendar_app/models/calendar.dart';
import 'package:lsa_calendar_app/models/event.dart';
import 'package:lsa_calendar_app/screens/login_screen.dart';
import 'package:lsa_calendar_app/services/api_service.dart';
import 'package:lsa_calendar_app/widgets/calendars_drawer.dart';
import 'package:lsa_calendar_app/widgets/user_profile_menu.dart';
import 'package:lsa_calendar_app/widgets/date_navigator.dart';
import 'package:lsa_calendar_app/widgets/events_list.dart';
import 'package:lsa_calendar_app/widgets/month_navigator.dart';
import 'package:shared_preferences/shared_preferences.dart';

class CalendarsHomeScreen extends StatefulWidget {
  const CalendarsHomeScreen({super.key});

  @override
  State<CalendarsHomeScreen> createState() => _CalendarsHomeScreenState();
}

class _CalendarsHomeScreenState extends State<CalendarsHomeScreen> {
  List<Calendar> calendars = [];
  List<Event> events = [];
  List<String>? selectedCalendarIds;
  bool isLoading = true;
  bool isLoadingEvents = false;
  String? error;
  String username = 'Guest';
  String? avatar;
  String? email;

  DateTime currentDate = DateTime.now();
  String? previousDate;
  String? nextDate;

  Future<void> fetchCalendars() async {
    try {
      final data = await ApiService.get('/calendars/myCalendars');
      setState(() {
        calendars = (data as List).map((json) => Calendar.fromJson(json)).toList();
      });
    } catch (e) {
      setState(() {
        error = 'Could not connect to server. Try refreshing.';
        debugPrint('Error fetching calendars: $error');
      });
    }
  }

  Future<void> fetchEvents() async {
    setState(() => isLoadingEvents = true);

    try {
      final body = {
        'month': currentDate.month,
        'year': currentDate.year,
        'calendarIds': selectedCalendarIds ?? [],
      };

      final response = await ApiService.post(
        '/calendars/GetEventsByMonth',
        body: body,
      );

      setState(() {
        events = (response as List).map((e) => Event.fromJson(e)).toList();
        _updateNavigationDates();
        isLoadingEvents = false;
      });
    } catch (e) {
      setState(() {
        error = 'Error fetching events';
        isLoadingEvents = false;
      });
    }
  }

  void _updateNavigationDates() {
    final uniqueDates =
        events
            .where(
              (e) =>
                  selectedCalendarIds == null ||
                  selectedCalendarIds!.contains(e.calendarId),
            )
            .map((e) => "${e.start.year}-${e.start.month.toString().padLeft(2, '0')}-${e.start.day.toString().padLeft(2, '0')}")
            .toSet()
            .toList()
          ..sort();

    final dateStr =
        "${currentDate.year}-${currentDate.month.toString().padLeft(2, '0')}-${currentDate.day.toString().padLeft(2, '0')}";

    if (uniqueDates.isNotEmpty && !uniqueDates.contains(dateStr)) {
      currentDate = DateTime.parse(uniqueDates.first);
    }

    final currentStr =
        "${currentDate.year}-${currentDate.month.toString().padLeft(2, '0')}-${currentDate.day.toString().padLeft(2, '0')}";
    String? prev;
    String? next;

    final prevList = uniqueDates.where((d) => d.compareTo(currentStr) < 0);
    if (prevList.isNotEmpty) prev = prevList.last;

    final nextList = uniqueDates.where((d) => d.compareTo(currentStr) > 0);
    if (nextList.isNotEmpty) next = nextList.first;

    previousDate = prev;
    nextDate = next;
  }

  Future<void> _loadSelectedCalendars() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      selectedCalendarIds = prefs.getStringList('selected_calendars');
    });
  }

  @override
  void initState() {
    super.initState();
    _loadUsername();
    _loadData();
  }

  Future<void> _loadData({bool showLoading = true}) async {
    if (showLoading) setState(() => isLoading = true);
    setState(() => error = null);
    await _loadSelectedCalendars();
    await fetchCalendars();
    await fetchEvents();
    setState(() => isLoading = false);
  }

  Future<void> _loadUsername() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      username = prefs.getString('username') ?? 'Guest';
      avatar = prefs.getString('avatar');
      email = prefs.getString('email');
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

  void _goToDate(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return;
    setState(() {
      currentDate = DateTime.parse(dateStr);
      _updateNavigationDates();
    });
  }

  void _changeMonth(int offset) {
    setState(() {
      currentDate = DateTime(currentDate.year, currentDate.month + offset, 1);
    });
    fetchEvents();
  }

  @override
  Widget build(BuildContext context) {
    final visibleEvents = events.where((e) {
      final matchesCalendar =
          selectedCalendarIds == null ||
          selectedCalendarIds!.contains(e.calendarId);
      final matchesDate = e.start.year == currentDate.year &&
          e.start.month == currentDate.month &&
          e.start.day == currentDate.day;
      return matchesCalendar && matchesDate;
    }).toList();

    return Scaffold(
      appBar: AppBar(
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
      drawer: CalendarsDrawer(calendars: calendars),
      onDrawerChanged: (isOpened) {
        if (!isOpened) {
          _loadSelectedCalendars().then((_) => fetchEvents());
        }
      },
      body: Column(
        children: [
          MonthNavigator(
            currentDate: currentDate,
            onMonthChanged: _changeMonth,
          ),
          if (!isLoading &&
              !isLoadingEvents &&
              events.any(
                (e) =>
                    selectedCalendarIds == null ||
                    selectedCalendarIds!.contains(e.calendarId),
              ))
            DateNavigator(
              currentDate: currentDate,
              previousDate: previousDate,
              nextDate: nextDate,
              onDateSelected: (dateStr) => _goToDate(dateStr),
            ),
          Expanded(
            child: EventsList(
              events: visibleEvents,
              calendars: calendars,
              isLoading: isLoading || isLoadingEvents,
              error: error,
              onRefresh: () => _loadData(showLoading: false),
              onEventTap: (event) {
                // TODO: Navigate to calendar details
              },
            ),
          ),
        ],
      ),
    );
  }
}
