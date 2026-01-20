import 'package:flutter/material.dart';
import 'package:lsa_calendar_app/core/app_colors.dart';
import 'package:lsa_calendar_app/core/app_text_styles.dart';
import 'package:lsa_calendar_app/core/calendar_colors.dart';
import 'package:lsa_calendar_app/l10n/app_localizations.dart';
import 'package:lsa_calendar_app/models/calendar.dart';
import 'package:shared_preferences/shared_preferences.dart';

class CalendarsDrawer extends StatefulWidget {
  final List<Calendar> calendars;
  final String viewMode;
  final ValueChanged<String> onViewModeChanged;

  const CalendarsDrawer({
    super.key,
    required this.calendars,
    required this.viewMode,
    required this.onViewModeChanged,
  });

  @override
  State<CalendarsDrawer> createState() => _CalendarsDrawerState();
}

class _CalendarsDrawerState extends State<CalendarsDrawer> {
  Set<String> _selectedIds = {};

  @override
  void initState() {
    super.initState();
    _selectedIds = widget.calendars.map((c) => c.id.toString()).toSet();
    _loadPreferences();
  }

  Future<void> _loadPreferences() async {
    final prefs = await SharedPreferences.getInstance();
    final savedIds = prefs.getStringList('selected_calendars');
    
    if (savedIds != null) {
      if (!mounted) return;
      setState(() {
        final currentIds = widget.calendars.map((c) => c.id.toString()).toSet();
        _selectedIds = savedIds.where((id) => currentIds.contains(id)).toSet();
      });
    }
  }

  Future<void> _toggleCalendar(String id, bool selected) async {
    setState(() {
      if (selected) {
        _selectedIds.add(id);
      } else {
        _selectedIds.remove(id);
      }
    });
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList('selected_calendars', _selectedIds.toList());
  }

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SizedBox(height: 60),
          const Divider(),
          Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                child: Text(AppLocalizations.of(context)!.viewEventsBy, style: AppTextStyles.subtitle),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                child: ElevatedButton.icon(
                  onPressed: () => widget.onViewModeChanged('day'),
                  icon: const Icon(Icons.calendar_view_day),
                  label: Text(AppLocalizations.of(context)!.day),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: widget.viewMode == 'day' ? AppColors.accent : AppColors.secondary,
                    foregroundColor: widget.viewMode == 'day' ?  AppColors.secondary : AppColors.accent ,
                    elevation: 0,
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                child: ElevatedButton.icon(
                  onPressed: () => widget.onViewModeChanged('month'),
                  icon: const Icon(Icons.calendar_month),
                  label: Text(AppLocalizations.of(context)!.month),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: widget.viewMode == 'month' ? AppColors.accent :  AppColors.secondary,
                    foregroundColor: widget.viewMode == 'month' ?  AppColors.secondary : AppColors.accent,
                    elevation: 0,
                  ),
                ),
              ),
            ],
          ),
          Divider(),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Text(
              AppLocalizations.of(context)!.myCalendars,
              style: AppTextStyles.subtitle,
              textAlign: TextAlign.left,
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: EdgeInsets.zero,
              itemCount: widget.calendars.length,
              itemBuilder: (context, index) {
                final calendar = widget.calendars[index];
                final color = CalendarColors.colors[index % CalendarColors.colors.length];
                final isSelected = _selectedIds.contains(calendar.id.toString());

                return CheckboxListTile(                
                  value: isSelected,
                  onChanged: (bool? value) {
                    if (value != null) {
                      _toggleCalendar(calendar.id.toString(), value);
                    }
                  },
                  title: Row(
                    children: [
                      Container(
                        width: 12,
                        height: 12,
                        decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                      ),
                      const SizedBox(width: 12),
                      Expanded(child: Text(calendar.name, overflow: TextOverflow.ellipsis)),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}