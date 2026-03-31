import 'dart:async';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:lsa_calendar_app/l10n/app_localizations.dart';
import 'package:lsa_calendar_app/models/calendar.dart';
import 'package:lsa_calendar_app/models/event.dart';
import 'package:lsa_calendar_app/screens/login_screen.dart';
import 'package:lsa_calendar_app/services/api_service.dart';
import 'package:lsa_calendar_app/services/firebase_service.dart';
import 'package:lsa_calendar_app/widgets/calendars_drawer.dart';
import 'package:lsa_calendar_app/widgets/add_event_modal.dart';
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
  bool canCreateEvents = false;
  String? currentUserId;

  bool _isAdmin = false;

  DateTime currentDate = DateTime.now();
  bool _isMovingForward = true;
  String? previousDate;
  String? nextDate;
  String viewMode = 'day';
  StreamSubscription<RemoteMessage>? _notificationSubscription;
  bool _isRefreshingFromNotification = false;

  String _toApiDateTime(DateTime value) {
    final yyyy = value.year.toString().padLeft(4, '0');
    final mm = value.month.toString().padLeft(2, '0');
    final dd = value.day.toString().padLeft(2, '0');
    final hh = value.hour.toString().padLeft(2, '0');
    final min = value.minute.toString().padLeft(2, '0');
    final ss = value.second.toString().padLeft(2, '0');
    return '$yyyy-$mm-${dd}T$hh:$min:$ss';
  }

  Future<void> _persistEvent({
    required AddEventModalResult result,
    Event? originalEvent,
  }) async {
    final calendarId = result.calendarId;
    if (calendarId == null || calendarId.isEmpty) {
      return;
    }

    final startDate = result.start;
    final endDate = result.end ?? result.start.add(const Duration(hours: 1));

    late final DateTime normalizedStart;
    late final DateTime normalizedEnd;

    if (result.allDay) {
      normalizedStart = DateTime(startDate.year,startDate.month,startDate.day,0,0,0,0);
      normalizedEnd = DateTime(endDate.year,endDate.month,endDate.day,23,59,59,);
    } else {
      normalizedStart = startDate;
      normalizedEnd = endDate.isBefore(startDate)
          ? startDate.add(const Duration(hours: 1))
          : endDate;
    }

    final payload = {
      'title': result.title,
      'description': result.description,
      'calendarId': calendarId,
      'start': _toApiDateTime(normalizedStart),
      'end': _toApiDateTime(normalizedEnd),
      'allDay': result.allDay,
      'assignees': result.assignees
          .map(
            (user) => {
              'userId': user.userId,
              'username': user.username,
              'name': user.name,
              'lastName': user.lastName,
              'role': user.role,
            },
          )
          .toList(),
    };

    final idValue = result.eventId ?? originalEvent?.id;
    if (idValue != null) {
      payload['id'] = idValue;
      await ApiService.put('/calendars/updateEvent', body: payload);
    } else {
      await ApiService.post('/calendars/addEvent', body: payload);
    }
  }

  Future<void> _eventFlow({Event? event}) async {
    final localization = AppLocalizations.of(context)!;
    final manageCalendars = _managedCalendarsForCurrentUser;
    if (manageCalendars.isEmpty) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(localization.noPermission)));
      return;
    }

    AddEventModalInitialData? prefill;
    String? eventId;
    bool isEdit = event != null;

    if (isEdit) {
      prefill = AddEventModalInitialData.fromEvent(event!);
      eventId = event.id;
    } else {      
      if (viewMode == 'day') {
        prefill = AddEventModalInitialData(
          start: DateTime(
            currentDate.year,
            currentDate.month,
            currentDate.day,
            9,
            0,
          ),
        );
      } else if (viewMode == 'month') {
        prefill = AddEventModalInitialData(
          start: DateTime(
            currentDate.year,
            currentDate.month,
            1,
            9,
            0,
          ),
        );
      }
    }

    bool isFirstCycle = true;
    while (mounted) {
      final result = await AddEventModal.show(
        context,
        calendars: manageCalendars,
        initialData: prefill,
        eventId: isEdit && isFirstCycle ? eventId : null,
      );

      if (result == null) {
        return;
      }

      try {
        setState(() => isLoadingEvents = true);
        await _persistEvent(
          result: result,
          originalEvent: isEdit && isFirstCycle ? event : null,
        );
        setState(() {
          final newDate = DateTime(
            result.start.year,
            result.start.month,
            result.start.day,
          );
          _isMovingForward = newDate.isAfter(currentDate);
          currentDate = newDate;
        });
        await fetchEvents();
        if (!mounted) return;
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(localization.eventSaved)));
      } catch (e) {
        if (!mounted) return;
        setState(() => isLoadingEvents = false);
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(localization.connectionError)));
        return;
      }

      if (result.trigger != 'copy') {
        return;
      }

      prefill = AddEventModalInitialData.fromResult(result);
      isFirstCycle = false;
    }
  }

  Future<void> _editEvent(Event event) async {
    await _eventFlow(event: event);
  }

  Future<void> _deleteEvent(Event event) async {
    final localization = AppLocalizations.of(context)!;
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(localization.deleteTitle),
        content: Text(localization.deleteConfirmation(event.displayTitle!)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text(localization.cancel),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text(localization.deleteTitle),
          ),
        ],
      ),
    );

    if (confirm != true || !mounted) return;

    try {
      setState(() => isLoadingEvents = true);
      await ApiService.delete('/calendars/events/${event.id}');
      await fetchEvents();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${event.title} ${localization.deleted}')),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => isLoadingEvents = false);
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(localization.connectionError)));
    }
  }

  Future<void> fetchCalendars() async {
    try {
      final data = await ApiService.get('/calendars/myCalendars');
      setState(() {
        calendars = (data as List)
            .map((json) => Calendar.fromJson(json))
            .toList();
      });
    } catch (e) {
      if (mounted) {
        setState(() {
          error = AppLocalizations.of(context)!.serverConnectionError;
          debugPrint('Error fetching calendars: $error');
        });
      }
    }
  }

  Future<void> fetchEvents({bool snapToFirst = false}) async {
    setState(() => isLoadingEvents = true);
    try {
      final body = {
        'month': currentDate.month,
        'year': currentDate.year,
        'calendarIds': calendars.map((c) => c.id.toString()).toList(),
      };

      final response = await ApiService.post(
        '/calendars/GetEventsByMonth',
        body: body,
      );

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

        if (snapToFirst) {
          final uniqueDates =
              events
                  .map(
                    (e) =>
                        "${e.start.year}-${e.start.month.toString().padLeft(2, '0')}-${e.start.day.toString().padLeft(2, '0')}",
                  )
                  .toSet()
                  .toList()
                ..sort();
          final currentStr =
              "${currentDate.year}-${currentDate.month.toString().padLeft(2, '0')}-${currentDate.day.toString().padLeft(2, '0')}";
          if (uniqueDates.isNotEmpty && !uniqueDates.contains(currentStr)) {
            currentDate = DateTime.parse(uniqueDates.first);
          }
        }
        _updateNavigationDates();
        isLoadingEvents = false;
      });
    } catch (e) {
      debugPrint('--- Error fetching events: $e');
      if (mounted) {
        setState(() {
          error = AppLocalizations.of(context)!.fetchEventsError;
          isLoadingEvents = false;
        });
      }
    }
  }

  void _updateNavigationDates() {
    final uniqueDates =
        events
            .map(
              (e) =>
                  "${e.start.year}-${e.start.month.toString().padLeft(2, '0')}-${e.start.day.toString().padLeft(2, '0')}",
            )
            .toSet()
            .toList()
          ..sort();

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
      selectedCalendarIds ??= calendars.map((c) => c.id.toString()).toList();
    });
  }

  Future<void> _loadViewMode() async {
    final prefs = await SharedPreferences.getInstance();
    if (!mounted) return;
    setState(() {
      viewMode = prefs.getString('view_mode') ?? 'day';
    });
  }

  Future<void> _saveViewMode(String mode) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('view_mode', mode);
  }

  List<Calendar> get _managedCalendarsForCurrentUser {
    if (_isAdmin) {
      return calendars;
    }
    final userId = currentUserId?.trim().toLowerCase();
    if (userId == null || userId.isEmpty) {
      return const [];
    }

    return calendars.where((calendar) {
      return calendar.managers.any(
        (managerId) => managerId.trim().toLowerCase() == userId,
      );
    }).toList();
  }

  @override
  void initState() {
    super.initState();
    _loadUsername();
    _loadRolePermissions();
    _loadCurrentUserId();
    _loadData();
    _setupNotificationRefreshListener();
  }

  @override
  void dispose() {
    _notificationSubscription?.cancel();
    super.dispose();
  }

  Future<void> _setupNotificationRefreshListener() async {
    _notificationSubscription = FirebaseService.notificationEvents.listen((_) {
      _refreshFromNotification();
    });

    final initialMessage = await FirebaseService.getInitialMessage();
    if (initialMessage != null) {
      debugPrint('--- App opened from terminated state via notification');
      await _refreshFromNotification();
    }
  }

  Future<void> _refreshFromNotification() async {
    if (!mounted || _isRefreshingFromNotification) return;
    _isRefreshingFromNotification = true;
    debugPrint('--- Refreshing calendars/events due to notification');
    try {
      await _loadData(showLoading: false);
    } finally {
      _isRefreshingFromNotification = false;
    }
  }

  Future<void> _loadData({bool showLoading = true}) async {
    if (showLoading) setState(() => isLoading = true);
    setState(() => error = null);
    await fetchCalendars();
    await _loadSelectedCalendars();
    await _loadViewMode();
    await fetchEvents();

    final eventsOnDate = events
        .where(
          (e) =>
              e.start.year == currentDate.year &&
              e.start.month == currentDate.month &&
              e.start.day == currentDate.day,
        )
        .toList();

    if (eventsOnDate.isEmpty) {
      final found = await _findAndSetNextEventDateFrom(currentDate);
      if (found) await fetchEvents();
    }
    setState(() => isLoading = false);
  }

  Future<bool> _findAndSetNextEventDateFrom(DateTime fromDate) async {
    final uniqueDatesCurrent =
        events
            .map((e) => DateTime(e.start.year, e.start.month, e.start.day))
            .toSet()
            .toList()
          ..sort();

    for (final d in uniqueDatesCurrent) {
      if (d.isAfter(DateTime(fromDate.year, fromDate.month, fromDate.day))) {
        setState(() {
          _isMovingForward = d.isAfter(currentDate);
          currentDate = d;
        });
        _updateNavigationDates();
        return true;
      }
    }

    DateTime probe = DateTime(fromDate.year, fromDate.month + 1, 1);
    for (int i = 0; i < 24; i++) {
      final body = {
        'month': probe.month,
        'year': probe.year,
        'calendarIds': calendars.map((c) => c.id.toString()).toList(),
      };
      try {
        final resp = await ApiService.post(
          '/calendars/GetEventsByMonth',
          body: body,
        );
        final monthEvents = (resp as List)
            .map((json) => Event.fromJson(json))
            .toList();
        if (monthEvents.isNotEmpty) {
          monthEvents.sort((a, b) => a.start.compareTo(b.start));
          final earliest = DateTime(
            monthEvents.first.start.year,
            monthEvents.first.start.month,
            monthEvents.first.start.day,
          );
          setState(() {
            _isMovingForward = earliest.isAfter(currentDate);
            currentDate = earliest;
          });
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
    if (!mounted) return;
    setState(() {
      username =
          prefs.getString('username') ??
          AppLocalizations.of(context)!.guestUser;
      avatar = prefs.getString('avatar');
      email = prefs.getString('email');
    });
  }

  Future<void> _loadRolePermissions() async {
    final prefs = await SharedPreferences.getInstance();
    final roles = prefs.getStringList('roles') ?? [];

    final normalizedRoles = roles
        .map((r) => r.trim().toLowerCase())
        .where((r) => r.isNotEmpty)
        .toSet();

    for (var r in normalizedRoles) {
      debugPrint('--- User role: $r');
    }

    final isAdmin = normalizedRoles.contains('admin');
    if (!mounted) return;
    setState(() {
      _isAdmin = isAdmin;
      canCreateEvents = isAdmin || normalizedRoles.contains('calendarmanager');
    });
  }

  Future<void> _loadCurrentUserId() async {
    final prefs = await SharedPreferences.getInstance();
    if (!mounted) return;
    setState(() {
      currentUserId = prefs.getString('user_id');
    });
  }

  Future<void> _logout() async {
    final fcmToken = FirebaseService.fcmToken;
    if (fcmToken != null && fcmToken.isNotEmpty) {
      try {
        await ApiService.post(
          '/notifications/unregister-device',
          body: {'fcmToken': fcmToken},
        );
      } catch (e) {
        debugPrint('unregister-device error: $e');
      }
    }

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
    final newDate = DateTime.parse(dateStr);
    setState(() {
      _isMovingForward = newDate.isAfter(currentDate);
      currentDate = newDate;
      _updateNavigationDates();
    });
  }

  void _changeMonth(int offset) {
    debugPrint('--- _changeMonth called. Offset: $offset');
    setState(() {
      _isMovingForward = offset > 0;
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
    debugPrint(
      '--- Build. CurrentDate: $currentDate. Events: ${events.length}',
    );

    final eventsToShow = switch (viewMode) {
      'day' => events
          .where(
            (e) =>
                e.start.year == currentDate.year &&
                e.start.month == currentDate.month &&
                e.start.day == currentDate.day,
          )
          .toList(),
      'assigned' => events.where((e) {
          final userIdentifier = email;
          return e.assignees.any((a) =>
              a.username.toLowerCase() == userIdentifier?.toLowerCase());
        }).toList(),
      _ => events,
    };

    final visibleEvents = eventsToShow.where((e) {
      final matchesCalendar =
          selectedCalendarIds == null ||
          selectedCalendarIds!.contains(e.calendarId);
      return matchesCalendar;
    }).toList();

    if (viewMode == 'month' || viewMode == 'assigned') {
      final calendarNames = {for (var c in calendars) c.id.toString(): c.name};
      visibleEvents.sort((a, b) {
        final nameA = calendarNames[a.calendarId] ?? '';
        final nameB = calendarNames[b.calendarId] ?? '';
        int cmp = nameA.compareTo(nameB);
        if (cmp != 0) return cmp;
        return a.start.compareTo(b.start);
      });
    }

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
      drawer: CalendarsDrawer(
        calendars: calendars,
        viewMode: viewMode,
        onSelectedCalendarsChanged: (ids) =>
            setState(() => selectedCalendarIds = ids),
        onViewModeChanged: (mode) {
          setState(() => viewMode = mode);
          _saveViewMode(mode);
        },
      ),
      onDrawerChanged: (isOpened) {},
      floatingActionButton:
          (canCreateEvents && _managedCalendarsForCurrentUser.isNotEmpty)
          ? FloatingActionButton(
              onPressed: () async {
                await _eventFlow();
              },
              tooltip: AppLocalizations.of(context)!.addNewEvent,
              child: const Icon(Icons.add),
            )
          : null,
      body: Column(
        children: [
          MonthNavigator(
            currentDate: currentDate,
            onMonthChanged: _changeMonth,
          ),
          if (!isLoading &&
              !isLoadingEvents &&
              events.isNotEmpty &&
              viewMode == 'day')
            DateNavigator(
              currentDate: currentDate,
              previousDate: previousDate,
              nextDate: nextDate,
              onDateSelected: (dateStr) => _goToDate(dateStr),
            ),
          Expanded(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 300),
              transitionBuilder: (Widget child, Animation<double> animation) {
                final isIncoming = child.key == ValueKey(currentDate);
                final Offset begin = _isMovingForward
                    ? (isIncoming ? const Offset(1.0, 0.0) : const Offset(-1.0, 0.0))
                    : (isIncoming ? const Offset(-1.0, 0.0) : const Offset(1.0, 0.0));

                return SlideTransition(
                  position: Tween<Offset>(
                    begin: begin,
                    end: Offset.zero,
                  ).animate(CurvedAnimation(
                    parent: animation,
                    curve: Curves.easeInOut,
                  )),
                  child: child,
                );
              },
              child: SizedBox.expand(
                key: ValueKey(currentDate),
                child: (visibleEvents.isEmpty && eventsToShow.isNotEmpty)
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24.0),
                          child: Text(
                            AppLocalizations.of(context)!.selectCalendarMessage,
                            textAlign: TextAlign.center,
                            style: Theme.of(context).textTheme.bodyLarge,
                          ),
                        ),
                      )
                    : EventsList(
                        events: visibleEvents,
                        calendars: calendars,
                        isLoading: isLoading || isLoadingEvents,
                        error: error,
                        onRefresh: () => _loadData(showLoading: false),
                        onEventTap: (event) {},
                        onEditEvent: _editEvent,
                        onDeleteEvent: _deleteEvent,
                        managedCalendarIds: _isAdmin
                            ? calendars.map((c) => c.id).toSet()
                            : _managedCalendarsForCurrentUser
                                  .map((c) => c.id)
                                  .toSet(),
                        showDate: viewMode != 'day',
                      ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
