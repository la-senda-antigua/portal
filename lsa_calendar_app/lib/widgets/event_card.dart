import 'package:flutter/material.dart';
import 'package:lsa_calendar_app/core/app_text_styles.dart';
import 'package:lsa_calendar_app/core/calendar_colors.dart';
import 'package:lsa_calendar_app/models/calendar.dart';
import 'package:lsa_calendar_app/models/event.dart';

class EventCard extends StatelessWidget {
  final Event event;
  final List<Calendar> calendars;
  final VoidCallback? onTap;

  const EventCard({
    super.key,
    required this.event,
    required this.calendars,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final calendarIndex = calendars.indexWhere(
      (c) => c.id.toString() == event.calendarId,
    );
    final color = calendarIndex != -1
        ? CalendarColors.colors[calendarIndex % CalendarColors.colors.length]
        : Colors.grey;
    final textColor = color.computeLuminance() > 0.15
        ? Colors.black
        : Colors.white;
    final calendarName = calendarIndex != -1 ? calendars[calendarIndex].name : '';

    return Card(
      color: color,
      elevation: 8.0,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: ListTile(
        title: Text(
          event.title,
          style: AppTextStyles.title.copyWith(color: textColor),
        ),
        subtitle: Text.rich(
          TextSpan(
            text: '${event.timeDescription} - ',
            style: AppTextStyles.body.copyWith(color: textColor),
            children: [
              TextSpan(
                text: calendarName,
                style: AppTextStyles.bodyItalic.copyWith(color: textColor),
              ),
            ],
          ),
        ),
        trailing: event.totalDays > 1
            ? Text(
                'Day ${event.currentDay} of ${event.totalDays}',
                style: AppTextStyles.body.copyWith(
                  color: textColor,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              )
            : null,
        onTap: onTap,
      ),
    );
  }
}