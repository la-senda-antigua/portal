import 'package:flutter/material.dart';
import 'package:lsa_calendar_app/core/app_text_styles.dart';

class MonthNavigator extends StatelessWidget {
  final DateTime currentDate;
  final ValueChanged<int> onMonthChanged;

  const MonthNavigator({
    super.key,
    required this.currentDate,
    required this.onMonthChanged,
  });

  String _getMonthName(int month) {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[month - 1];
  }

  @override
  Widget build(BuildContext context) {
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
                  _getMonthName(
                    DateTime(
                      currentDate.year,
                      currentDate.month - 1,
                    ).month,
                  ).substring(0,3),                  
                ),
              ],
            ),
          ),
          
          //Current Month
          Column(
            children: [
              Text(
                _getMonthName(currentDate.month),                
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
                  _getMonthName(
                    DateTime(
                      currentDate.year,
                      currentDate.month + 1,
                    ).month,
                  ).substring(0,3),
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