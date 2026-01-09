import 'package:flutter/material.dart';

class DateNavigator extends StatelessWidget {
  final DateTime currentDate;
  final String? previousDate;
  final String? nextDate;
  final ValueChanged<String> onDateSelected;

  const DateNavigator({
    super.key,
    required this.currentDate,
    this.previousDate,
    this.nextDate,
    required this.onDateSelected,
  });

  String _getDayName(int weekday) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
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

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: 8.0,
        vertical: 4.0,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          if (previousDate != null && previousDate!.isNotEmpty)
            TextButton(
              onPressed: () => onDateSelected(previousDate!),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.chevron_left),
                  Text(_formatDateButton(previousDate)),
                ],
              ),
            )
          else
            const SizedBox(width: 80),
          Text(
            '${_getDayName(currentDate.weekday)} ${currentDate.day}',
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
          if (nextDate != null && nextDate!.isNotEmpty)
            TextButton(
              onPressed: () => onDateSelected(nextDate!),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(_formatDateButton(nextDate)),
                  const Icon(Icons.chevron_right),
                ],
              ),
            )
          else
            const SizedBox(width: 80),
        ],
      ),
    );
  }
}