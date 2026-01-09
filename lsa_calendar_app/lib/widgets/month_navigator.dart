import 'package:flutter/material.dart';

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
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
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
                  ),
                ),
              ],
            ),
          ),
          Column(
            children: [
              Text(
                _getMonthName(currentDate.month),
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                '${currentDate.year}',
                style: const TextStyle(fontSize: 12),
              ),
            ],
          ),
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