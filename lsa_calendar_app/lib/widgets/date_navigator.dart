import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

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

  String _formatDateButton(String? dateStr, String locale) {
    if (dateStr == null || dateStr.isEmpty) return '';
    try {
      final date = DateTime.parse(dateStr);
      return '${DateFormat.E(locale).format(date)} ${date.day}';
    } catch (e) {
      return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    final locale = Localizations.localeOf(context).toString();

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
                  Text(_formatDateButton(previousDate, locale)),
                ],
              ),
            )
          else
            const SizedBox(width: 80),
          Text(
            '${DateFormat.E(locale).format(currentDate)} ${currentDate.day}',
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
                  Text(_formatDateButton(nextDate, locale)),
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