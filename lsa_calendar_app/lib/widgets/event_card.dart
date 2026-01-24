import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:lsa_calendar_app/core/app_text_styles.dart';
import 'package:lsa_calendar_app/core/calendar_colors.dart';
import 'package:lsa_calendar_app/l10n/app_localizations.dart';
import 'package:lsa_calendar_app/models/calendar.dart';
import 'package:lsa_calendar_app/models/event.dart';

class EventCard extends StatefulWidget {
  final Event event;
  final List<Calendar> calendars;
  final VoidCallback? onTap;
  final String? dateLabel;
  final bool isMonthView;

  const EventCard({
    super.key,
    required this.event,
    required this.calendars,
    this.onTap,
    this.dateLabel,
    this.isMonthView = false,
  });

  @override
  State<EventCard> createState() => _EventCardState();
}

class _EventCardState extends State<EventCard> {
  bool _isExpanded = false;

  String _capitalize(String s) {
    if (s.isEmpty) return s;
    return '${s[0].toUpperCase()}${s.substring(1)}';
  }

  @override
  Widget build(BuildContext context) {
    final calendarIndex = widget.calendars.indexWhere(
      (c) => c.id.toString() == widget.event.calendarId,
    );
    final color = calendarIndex != -1
        ? CalendarColors.colors[calendarIndex % CalendarColors.colors.length]
        : Colors.grey;
    final textColor = color.computeLuminance() > 0.15
        ? Colors.black
        : Colors.white;
    final calendarName = calendarIndex != -1 ? widget.calendars[calendarIndex].name : '';

    final hasDescription = widget.event.description != null && widget.event.description!.isNotEmpty;
    final timeDesc = widget.event.getTimeDescription(AppLocalizations.of(context)!.allDay);

    String? dateRangeText;
    if (widget.isMonthView && widget.event.totalDays > 1) {
      final locale = Localizations.localeOf(context).languageCode;
      final startStr = _capitalize(DateFormat('EEEE d', locale).format(widget.event.originalStart));
      final endStr = _capitalize(DateFormat('EEEE d', locale).format(widget.event.originalEnd));
      
      dateRangeText = AppLocalizations.of(context)!.eventDateRange(startStr, endStr);
    }

    return Card(
      color: color,
      elevation: 0,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            title: Text(
              widget.event.title,
              style: AppTextStyles.title.copyWith(color: textColor),
            ),
            subtitle: Text.rich(
              TextSpan(
                text: dateRangeText != null
                    ? '$dateRangeText - '
                    : (widget.dateLabel != null
                        ? '${widget.dateLabel} - '
                        : '$timeDesc - '),
                style: AppTextStyles.body.copyWith(color: textColor),
                children: [
                  TextSpan(
                    text: calendarName,
                    style: AppTextStyles.bodyItalic.copyWith(color: textColor),
                  ),
                ],
              ),
            ),
            trailing: widget.event.totalDays > 1 && !widget.isMonthView
                ? Text(
                    AppLocalizations.of(context)!.dayXofY(widget.event.currentDay, widget.event.totalDays),
                    style: AppTextStyles.body.copyWith(
                      color: textColor,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  )
                : null,
            onTap: hasDescription
                ? () {
                    setState(() {
                      _isExpanded = !_isExpanded;
                    });
                  }
                : widget.onTap,
          ),
          if (hasDescription)
            AnimatedCrossFade(
              firstChild: const SizedBox(width: double.infinity),
              secondChild: Container(
                width: double.infinity,
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [                    
                    Text(
                      widget.event.description!,
                      style: AppTextStyles.subtitle.copyWith(color: textColor),
                    ),
                  ],
                ),
              ),
              crossFadeState: _isExpanded
                  ? CrossFadeState.showSecond
                  : CrossFadeState.showFirst,
              duration: const Duration(milliseconds: 300),
              alignment: Alignment.topCenter,
            ),
        ],
      ),
    );
  }
}