import 'package:lsa_calendar_app/models/eventConflict.dart';

class Event {
  final String title;
  final String? displayTitle;
  final String? description;
  final DateTime start;
  final DateTime end;
  final bool allDay;
  final String calendarId;
  final int totalDays;
  final int currentDay;
  final List<EventConflict> conflicts;

  Event({
    required this.title,
    this.displayTitle,
    this.description,
    required this.start,
    required this.end,
    required this.allDay,
    required this.calendarId,
    this.totalDays = 0,
    this.currentDay = 0,
    this.conflicts = const [],
  });

  factory Event.fromJson(Map<String, dynamic> json) {
    return Event(
      title: json['title'] ?? '- -',
      displayTitle: json['displayTitle'],
      description: json['description'],
      start: DateTime.parse(json['start']),
      end: json['end'] != null ? DateTime.parse(json['end']) : DateTime.parse(json['start']),
      allDay: json['allDay'] ?? false,
      calendarId: json['calendarId'].toString(),
      totalDays: json['totalDays'] ?? 0,
      currentDay: json['currentDay'] ?? 0,
      conflicts: json['conflicts'] != null
          ? List<EventConflict>.from((json['conflicts'] as List)
              .map((i) => EventConflict.fromJson(i)))
          : [],
    );
  }

  String getTimeDescription(String allDayText) {
    if (allDay) return allDayText;
    final startStr = "${start.hour.toString().padLeft(2, '0')}:${start.minute.toString().padLeft(2, '0')}";
    final endStr = "${end.hour.toString().padLeft(2, '0')}:${end.minute.toString().padLeft(2, '0')}";
    return '$startStr - $endStr';
  }

  DateTime get originalStart {
    if (currentDay <= 1) return start;
    return start.subtract(Duration(days: currentDay - 1));
  }

  DateTime get originalEnd {
    if (totalDays <= 1) return end;
    return originalStart.add(Duration(days: totalDays - 1));
  }
}
