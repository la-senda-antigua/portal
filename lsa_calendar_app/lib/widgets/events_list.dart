import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:lsa_calendar_app/models/calendar.dart';
import 'package:lsa_calendar_app/models/event.dart';
import 'package:lsa_calendar_app/widgets/event_card.dart';

class EventsList extends StatelessWidget {
  final List<Event> events;
  final List<Calendar> calendars;
  final bool isLoading;
  final String? error;
  final RefreshCallback onRefresh;
  final void Function(Event)? onEventTap;
  final bool showDate;

  const EventsList({
    super.key,
    required this.events,
    required this.calendars,
    required this.isLoading,
    this.error,
    required this.onRefresh,
    this.onEventTap,
    this.showDate = false,
  });

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: onRefresh,
      child: _buildContent(context),
    );
  }

  Widget _buildContent(BuildContext context) {
    if (isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (error != null) {
      return ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        children: [
          SizedBox(height: MediaQuery.of(context).size.height * 0.3),
          Center(child: Text(error!)),
        ],
      );
    }

    if (events.isEmpty) {
      return ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        children: [
          SizedBox(height: MediaQuery.of(context).size.height * 0.3),
          const Center(child: Text('No events found')),
        ],
      );
    }

    // In month view (showDate=true), we want to show only one card for multi-day events
    List<Event> displayEvents = events;
    if (showDate) {
      final seenMultiDayEvents = <String>{};
      displayEvents = [];
      for (var event in events) {
        if (event.totalDays > 1) {
          final key = '${event.calendarId}_${event.title}';
          if (seenMultiDayEvents.contains(key)) continue;
          seenMultiDayEvents.add(key);
        }
        displayEvents.add(event);
      }
    }

    return ListView.builder(
      physics: const AlwaysScrollableScrollPhysics(),
      itemCount: displayEvents.length,
      itemBuilder: (context, index) {
        final event = displayEvents[index];
        
        String? dateLabel;
        if (showDate) {
          final isFirst = index == 0;
          final isNewDay = isFirst || 
              displayEvents[index - 1].start.day != event.start.day || 
              displayEvents[index - 1].start.month != event.start.month;

          if (isNewDay) {
            final dateStr = DateFormat('EEEE d', 'es').format(event.start);
            dateLabel = '${dateStr[0].toUpperCase()}${dateStr.substring(1)}';
          }
        }

        return EventCard(
          event: event,
          calendars: calendars,
          onTap: onEventTap != null ? () => onEventTap!(event) : null,
          dateLabel: dateLabel,
          isMonthView: showDate,
        );
      },
    );
  }
}