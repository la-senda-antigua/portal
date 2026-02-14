import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:lsa_calendar_app/core/app_colors.dart';
import 'package:lsa_calendar_app/core/app_text_styles.dart';
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

  void _showConflictToast() {
    final conflicts = widget.event.conflicts;
    debugPrint('Event has ${conflicts.length} conflict(s)');

    if (conflicts.isEmpty) return;

    final Map<String, Set<String>> conflictsByUser = {};
    for (var c in conflicts) {
      String displayName = c.username;
      if (c.name.isNotEmpty || c.lastName.isNotEmpty) {
        displayName = '${c.name} ${c.lastName}'.trim();
      }

      conflictsByUser.putIfAbsent(displayName, () => <String>{});
      if (c.calendarName.isNotEmpty) {
        conflictsByUser[displayName]!.add(c.calendarName);
      }
    }

    String message;

    if (conflictsByUser.length == 1) {
      final userName = conflictsByUser.keys.first;
      final calendars = conflictsByUser.values.first.join(', ');
      message = AppLocalizations.of(context,)!.singleUserConflict(calendars, userName);
    } else {
      final userNames = conflictsByUser.keys.join(', ');
      message = AppLocalizations.of(context)!.multipleUsersConflict(userNames);
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), duration: const Duration(seconds: 5)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final calendarIndex = widget.calendars.indexWhere(
      (c) => c.id.toString() == widget.event.calendarId,
    );
    final color = AppColors.getCalendarColor(calendarIndex);
    final textColor = AppColors.getContrastColor(color);
    final calendarName = calendarIndex != -1
        ? widget.calendars[calendarIndex].name
        : '';

    final hasDescription =
        widget.event.description != null &&
        widget.event.description!.isNotEmpty;
    final timeDesc = widget.event.getTimeDescription(
      AppLocalizations.of(context)!.allDay,
    );

    String? dateRangeText;
    if (widget.isMonthView && widget.event.totalDays > 1) {
      final locale = Localizations.localeOf(context).languageCode;
      final startStr = DateFormat('EEEE d',locale,).format(widget.event.originalStart);
      final endStr = DateFormat('EEEE d',locale,).format(widget.event.originalEnd);
      dateRangeText = AppLocalizations.of(context,)!.eventDateRange(startStr, endStr);
    }

    return Card(
      color: color,
      elevation: 0,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Stack(
        children: [
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                title: Text(
                  widget.event.displayTitle ?? widget.event.title,
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
                        style: AppTextStyles.bodyItalic.copyWith(
                          color: textColor,
                        ),
                      ),
                    ],
                  ),
                ),
                trailing: widget.event.totalDays > 1 && !widget.isMonthView
                    ? Text(
                        AppLocalizations.of(context)!.dayXofY(
                          widget.event.currentDay,
                          widget.event.totalDays,
                        ),
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
                          style: AppTextStyles.subtitle.copyWith(
                            color: textColor,
                          ),
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
          if (widget.event.conflicts.isNotEmpty)
            Positioned(
              bottom: 4,
              right: 4,
              child: GestureDetector(
                onTap: _showConflictToast,
                child: Container(
                  padding: const EdgeInsets.all(5),
                  decoration: BoxDecoration(
                    color: AppColors.dark,
                    borderRadius: BorderRadius.circular(10),                    
                  ),
                  child: Icon(
                    Icons.warning_rounded,
                    size: 24,
                    color: AppColors.warning,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
