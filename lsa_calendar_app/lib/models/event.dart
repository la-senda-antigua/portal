import 'package:intl/intl.dart';
import 'package:lsa_calendar_app/models/eventConflict.dart';

class EventAssignee {
  final String username;
  final String? name;
  final String? lastName;

  EventAssignee({required this.username, this.name, this.lastName});

  static String _normalizeSpaces(String value) {
    return value.replaceAll(RegExp(r'\s+'), ' ').trim();
  }

  static String? _normalizeNullable(dynamic value) {
    if (value == null) return null;
    final normalized = _normalizeSpaces(value.toString());
    return normalized.isEmpty ? null : normalized;
  }

  factory EventAssignee.fromJson(Map<String, dynamic> json) {
    return EventAssignee(
      username: _normalizeSpaces((json['username'] ?? '').toString()),
      name: _normalizeNullable(json['name']),
      lastName: _normalizeNullable(json['lastName']),
    );
  }

  String get displayName {
    final fullName = _normalizeSpaces('${name ?? ''} ${lastName ?? ''}');
    if (fullName.isNotEmpty) return fullName;
    return username;
  }
}

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
  final List<EventAssignee> assignees;

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
    this.assignees = const [],
  });

  factory Event.fromJson(Map<String, dynamic> json) {
    return Event(
      title: json['title'] ?? '- -',
      displayTitle: json['displayTitle'],
      description: json['description'],
      start: DateTime.parse(json['start']),
      end: json['end'] != null
          ? DateTime.parse(json['end'])
          : DateTime.parse(json['start']),
      allDay: json['allDay'] ?? false,
      calendarId: json['calendarId'].toString(),
      totalDays: json['totalDays'] ?? 0,
      currentDay: json['currentDay'] ?? 0,
      conflicts: json['conflicts'] != null
          ? List<EventConflict>.from(
              (json['conflicts'] as List).map((i) => EventConflict.fromJson(i)),
            )
          : [],
      assignees: json['assignees'] != null
          ? List<EventAssignee>.from(
              (json['assignees'] as List).map((i) => EventAssignee.fromJson(i)),
            )
          : [],
    );
  }

  String getTimeDescription(String allDayText) {
    if (allDay) return allDayText;
    final startStr = DateFormat('hh:mm a').format(start);
    final endStr = DateFormat('hh:mm a').format(end);
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
