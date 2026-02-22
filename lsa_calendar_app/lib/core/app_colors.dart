import 'package:flutter/material.dart';
import 'package:lsa_calendar_app/core/calendar_colors.dart';

class AppColors {
  static const Color primary = Color.fromARGB(255, 247, 202, 184);
  static const Color secondary = Color(0XFFe8dcff);
  static const Color accent = Color(0XFF4f378b);
  static const Color light = Color(0xFFFFFDFC);
  static const Color dark = Color(0xFF111111);
  static const Color background = Color(0XFFFDF9F0);
  static const Color warning = Color(0xFFFFEB3B);

  static Color getCalendarColor(int index) {
    if (index == -1) return Colors.grey;
    return CalendarColors.colors[index % CalendarColors.colors.length];
  }

  static Color getContrastColor(Color color) {
    return color.computeLuminance() > 0.15 ? Colors.black : Colors.white;
  }
}