import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:lsa_calendar_app/core/app_text_styles.dart';

class MonthNavigator extends StatelessWidget {
  final DateTime currentDate;
  final ValueChanged<int> onMonthChanged;

  const MonthNavigator({
    super.key,
    required this.currentDate,
    required this.onMonthChanged,
  });

  @override
  Widget build(BuildContext context) {
    final locale = Localizations.localeOf(context).toString();

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
      width: double.infinity,
      color: Colors.grey[200],
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Previous Month
          TextButton(
            onPressed: () => onMonthChanged(-1),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.chevron_left),
                Text(
                  DateFormat.MMM(locale).format(
                    DateTime(currentDate.year, currentDate.month - 1),
                  ),
                ),
              ],
            ),
          ),
          
          //Current Month
          Column(
            children: [
              Text(
                DateFormat.MMMM(locale).format(currentDate),
                style: AppTextStyles.h2,
              ),
              Text(
                '${currentDate.year}',
                style: AppTextStyles.body,
              ),
            ],
          ),

          // Next Month
          TextButton(
            onPressed: () => onMonthChanged(1),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  DateFormat.MMM(locale).format(
                    DateTime(currentDate.year, currentDate.month + 1),
                  ),
                ),
                const Icon(Icons.chevron_right),
              ],
            ),
          ),
        ],
      ),
    );
  }
}