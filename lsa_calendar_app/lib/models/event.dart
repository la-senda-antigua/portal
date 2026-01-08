class Event {
  final String title;
  final DateTime start;
  final DateTime end;
  final bool allDay;
  final String calendarId;
  final int totalDays;
  final int currentDay;

  Event({
    required this.title,
    required this.start,
    required this.end,
    required this.allDay,
    required this.calendarId,
    this.totalDays = 0,
    this.currentDay = 0,
  });

  factory Event.fromJson(Map<String, dynamic> json) {
    return Event(
      title: json['title'] ?? '- -',
      start: DateTime.parse(json['start']),
      end: DateTime.parse(json['end']),
      allDay: json['allDay'] ?? false,
      calendarId: json['calendarId'].toString(),
      totalDays: json['totalDays'] ?? 0,
      currentDay: json['currentDay'] ?? 0,
    );
  }

  String get timeDescription {
    if (allDay) return 'All Day';
    final startStr = "${start.hour.toString().padLeft(2, '0')}:${start.minute.toString().padLeft(2, '0')}";
    final endStr = "${end.hour.toString().padLeft(2, '0')}:${end.minute.toString().padLeft(2, '0')}";
    return '$startStr - $endStr';
  }
}