import 'package:flutter/material.dart';
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

  const EventsList({
    super.key,
    required this.events,
    required this.calendars,
    required this.isLoading,
    this.error,
    required this.onRefresh,
    this.onEventTap,
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

    return ListView.builder(
      physics: const AlwaysScrollableScrollPhysics(),
      itemCount: events.length,
      itemBuilder: (context, index) {
        final event = events[index];
        return EventCard(
          event: event,
          calendars: calendars,
          onTap: onEventTap != null ? () => onEventTap!(event) : null,
        );
      },
    );
  }
}