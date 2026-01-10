import 'package:flutter/material.dart';
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

  Future<void> fetchEvents({bool snapToFirst = false}) async {
    debugPrint('--- fetchEvents called. Month: ${currentDate.month}, Year: ${currentDate.year}, snapToFirst: $snapToFirst');
    setState(() => isLoadingEvents = true);

    try {
      final body = {
        'month': currentDate.month,
        'year': currentDate.year,
        'calendarIds': selectedCalendarIds ?? [],
      };
      debugPrint('--- Sending body: $body');

      final response = await ApiService.post('/calendars/GetEventsByMonth',body: body);
      debugPrint('--- API Response items: ${(response as List).length}');

      setState(() {
        events = [];
        for (var item in (response)) {
          try {
            events.add(Event.fromJson(item));
          } catch (e) {
            debugPrint('### ERROR PARSING EVENT: $item');
            debugPrint('### REASON: $e');
          }
        }
        debugPrint('### Fetched ${events.length} events for ${currentDate.month}/${currentDate.year}');
        if (snapToFirst) {
          final uniqueDates = events
              .where(
                (e) =>
                    selectedCalendarIds == null ||
                    selectedCalendarIds!.contains(e.calendarId),
              )
              .map((e) => "${e.start.year}-${e.start.month.toString().padLeft(2, '0')}-${e.start.day.toString().padLeft(2, '0')}")
              .toSet()
              .toList()
            ..sort();
          debugPrint('--- Unique dates: $uniqueDates');
          final currentStr = "${currentDate.year}-${currentDate.month.toString().padLeft(2, '0')}-${currentDate.day.toString().padLeft(2, '0')}";
          if (uniqueDates.isNotEmpty && !uniqueDates.contains(currentStr)) {
            debugPrint('--- Snapping to first date: ${uniqueDates.first}');
            currentDate = DateTime.parse(uniqueDates.first);
          }
        }
        _updateNavigationDates();
        isLoadingEvents = false;
      });
    } catch (e) {
      debugPrint('--- Error fetching events: $e');
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

    final currentStr = "${currentDate.year}-${currentDate.month.toString().padLeft(2, '0')}-${currentDate.day.toString().padLeft(2, '0')}";
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
      selectedCalendarIds ??= calendars.map((c) => c.id.toString()).toList();
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
    await fetchCalendars();
    await _loadSelectedCalendars();
    await fetchEvents();

    final visibleEvents = events.where((e) {
      final matchesCalendar = selectedCalendarIds == null || selectedCalendarIds!.contains(e.calendarId);
      final matchesDate = e.start.year == currentDate.year && e.start.month == currentDate.month && e.start.day == currentDate.day;
      return matchesCalendar && matchesDate;
    }).toList();
    if (visibleEvents.isEmpty) {
      final found = await _findAndSetNextEventDateFrom(currentDate);
      if (found) await fetchEvents();
    }
    setState(() => isLoading = false);
  }

  Future<bool> _findAndSetNextEventDateFrom(DateTime fromDate) async {
    final uniqueDatesCurrent = events
        .where((e) => selectedCalendarIds == null || selectedCalendarIds!.contains(e.calendarId))
        .map((e) => DateTime(e.start.year, e.start.month, e.start.day))
        .toSet()
        .toList()
      ..sort();

    for (final d in uniqueDatesCurrent) {
      if (d.isAfter(DateTime(fromDate.year, fromDate.month, fromDate.day))) {
        setState(() => currentDate = d);
        _updateNavigationDates();
        return true;
      }
    }

    DateTime probe = DateTime(fromDate.year, fromDate.month + 1, 1);
    for (int i = 0; i < 24; i++) {
      final body = {
        'month': probe.month,
        'year': probe.year,
        'calendarIds': selectedCalendarIds ?? [],
      };
      try {
        final resp = await ApiService.post('/calendars/GetEventsByMonth', body: body);
        final monthEvents = (resp as List)
            .map((json) => Event.fromJson(json))
            .where((e) => selectedCalendarIds == null || selectedCalendarIds!.contains(e.calendarId))
            .toList();
        if (monthEvents.isNotEmpty) {
          monthEvents.sort((a, b) => a.start.compareTo(b.start));
          final earliest = DateTime(monthEvents.first.start.year, monthEvents.first.start.month, monthEvents.first.start.day);
          setState(() => currentDate = earliest);
          _updateNavigationDates();
          return true;
        }
      } catch (e) {
        debugPrint('Error probing month ${probe.month}/${probe.year}: $e');
      }
      probe = DateTime(probe.year, probe.month + 1, 1);
    }

    return false;
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
    debugPrint('--- _changeMonth called. Offset: $offset');
    setState(() {
      currentDate = DateTime(currentDate.year, currentDate.month + offset, 1);
      debugPrint('--- New currentDate: $currentDate');
      events = [];
      previousDate = null;
      nextDate = null;
    });
    fetchEvents(snapToFirst: true);
  }

  @override
  Widget build(BuildContext context) {
    debugPrint('--- Build. CurrentDate: $currentDate. Events: ${events.length}');
    final visibleEvents = events.where((e) {
      final matchesCalendar = selectedCalendarIds == null || selectedCalendarIds!.contains(e.calendarId);
      final matchesDate = e.start.year == currentDate.year && e.start.month == currentDate.month && e.start.day == currentDate.day;
      return matchesCalendar && matchesDate;
    }).toList();
    debugPrint('--- Visible events: ${visibleEvents.length}');

    return Scaffold(
      appBar: AppBar(
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu, size: 42),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
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
              onEventTap: (event) {                // Implement event details navigation if needed
                // Implement event details navigation if needed
              },
            ),
          ),
        ],
      ),
    );
  }
}
