import 'package:flutter/material.dart';
import 'package:lsa_calendar_app/core/calendar_colors.dart';
import 'package:lsa_calendar_app/core/app_text_styles.dart';
import 'package:lsa_calendar_app/models/calendar.dart';
import 'package:lsa_calendar_app/screens/login_screen.dart';
import 'package:lsa_calendar_app/services/api_service.dart';
import 'package:lsa_calendar_app/widgets/calendars_drawer.dart';
import 'package:lsa_calendar_app/widgets/user_profile_menu.dart';
import 'package:shared_preferences/shared_preferences.dart';

class CalendarsHomeScreen extends StatefulWidget {
  const CalendarsHomeScreen({super.key});

  @override
  State<CalendarsHomeScreen> createState() => _CalendarsHomeScreenState();
}

class _CalendarsHomeScreenState extends State<CalendarsHomeScreen> {
  List<Calendar> calendars = [];
  List<dynamic> events = [];
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
      final List<dynamic> data = await ApiService.get('/calendars/myCalendars');
      setState(() {
        calendars = data.map((json) => Calendar.fromJson(json)).toList();
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
    final dateStr = "${currentDate.year}-${currentDate.month.toString().padLeft(2, '0')}-${currentDate.day.toString().padLeft(2, '0')}";
    
    try {
      final response = await ApiService.get('/calendars/dateEvents/$dateStr');
      setState(() {
        events = response['events'] ?? [];
        previousDate = response['previousDate'];
        nextDate = response['nextDate'];
        isLoadingEvents = false;
      });
    } catch (e) {
      setState(() {
        error = 'Error fetching events';
        isLoadingEvents = false;
      });
    }
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

  // Métodos auxiliares para fechas en español
  String _getMonthName(int month) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[month - 1];
  }

  String _getDayName(int weekday) {
    const days = [
      'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
    ];
    return days[weekday - 1];
  }

  String _formatDateButton(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return '';
    try {
      final date = DateTime.parse(dateStr);
      return '${_getDayName(date.weekday)} ${date.day}';
    } catch (e) {
      return '';
    }
  }

  void _goToDate(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return;
    setState(() {
      currentDate = DateTime.parse(dateStr);
    });
    fetchEvents();
  }

  @override
  Widget build(BuildContext context) {
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
          _loadSelectedCalendars();
        }
      },
      body: Column(
        children: [
          // Barra de Mes y Año
          Container(
            padding: const EdgeInsets.symmetric(vertical: 12),
            width: double.infinity,
            color: Colors.grey[200],
            child: Text(
              '${_getMonthName(currentDate.month)} ${currentDate.year}',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
          ),
          // Barra de Navegación (Anterior - Actual - Siguiente)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                if (previousDate != null && previousDate!.isNotEmpty)
                  TextButton(
                    onPressed: () => _goToDate(previousDate),
                    child: Text('< ${_formatDateButton(previousDate)}'),
                  )
                else
                  const SizedBox(width: 80), // Espacio para mantener centrado
                Text(
                  '${_getDayName(currentDate.weekday)} ${currentDate.day}',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                if (nextDate != null && nextDate!.isNotEmpty)
                  TextButton(
                    onPressed: () => _goToDate(nextDate),
                    child: Text('${_formatDateButton(nextDate)} >'),
                  )
                else
                  const SizedBox(width: 80),
              ],
            ),
          ),
          // Lista de Eventos
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => _loadData(showLoading: false),
              child: isLoading || isLoadingEvents
                  ? const Center(child: CircularProgressIndicator())
                  : error != null
                      ? ListView(
                          physics: const AlwaysScrollableScrollPhysics(),
                          children: [
                            SizedBox(height: MediaQuery.of(context).size.height * 0.3),
                            Center(child: Text(error!)),
                          ],
                        )
                      : _buildEventList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEventList() {    
    final visibleEvents = events.where((e) => selectedCalendarIds == null || selectedCalendarIds!.contains(e['calendarId'].toString())).toList();
    
    if (visibleEvents.isEmpty) {
      return ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        children: [
          SizedBox(height: MediaQuery.of(context).size.height * 0.3),
          const Center(child: Text('No events found')),
        ],
      );
    }

    return ListView.builder(
      physics: const AlwaysScrollableScrollPhysics(),
      itemCount: visibleEvents.length,
      itemBuilder: (context, index) {
        final event = visibleEvents[index];
        
        final calendarIndex = calendars.indexWhere((c) => c.id.toString() == event['calendarId'].toString());
        final color = calendarIndex != -1 
            ? CalendarColors.colors[calendarIndex % CalendarColors.colors.length] 
            : Colors.grey;
        final calendarName = calendarIndex != -1 ? calendars[calendarIndex].name : '';
        final start = event['start'] != null && event['start'].length >= 16 
            ? event['start'].toString().substring(11, 16) 
            : '';
        final end = event['end'] != null && event['end'].length >= 16 
            ? event['end'].toString().substring(11, 16) 
            : '';

        return Card(
          color: color,
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: ListTile(
            title: Text(event['title'] ?? '- -', style: AppTextStyles.title),
            subtitle: Text.rich(
              TextSpan(
                text: '$start - $end - ',
                style: AppTextStyles.body,
                children: [
                  TextSpan(text: calendarName, style: AppTextStyles.bodyItalic),
                ],
              ),
            ),
            onTap: () {
              // TODO: Navigate to calendar details
            },
          ),
        );
      },
    );
  }
}
