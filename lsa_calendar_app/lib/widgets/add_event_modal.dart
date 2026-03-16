import 'package:flutter/material.dart';
import 'package:lsa_calendar_app/core/app_colors.dart';
import 'package:lsa_calendar_app/core/app_text_styles.dart';
import 'package:lsa_calendar_app/l10n/app_localizations.dart';
import 'package:lsa_calendar_app/models/calendar.dart';

class AddEventModalResult {
	final String? calendarId;
	final String title;
	final String description;
	final DateTime start;
	final DateTime? end;
	final bool allDay;
	final String trigger;

	AddEventModalResult({
		required this.calendarId,
		required this.title,
		required this.description,
		required this.start,
		required this.end,
		required this.allDay,
		required this.trigger,
	});
}

class AddEventModal extends StatefulWidget {
	final List<Calendar> calendars;

	const AddEventModal({super.key, required this.calendars});

	static Future<AddEventModalResult?> show(
		BuildContext context, {
		required List<Calendar> calendars,
	}) {
		return showModalBottomSheet<AddEventModalResult>(
			context: context,
			isScrollControlled: true,
			backgroundColor: Colors.transparent,
			builder: (_) => AddEventModal(calendars: calendars),
		);
	}

	@override
	State<AddEventModal> createState() => _AddEventModalState();
}

class _AddEventModalState extends State<AddEventModal> {
	final _formKey = GlobalKey<FormState>();
	final _titleController = TextEditingController();
	final _descriptionController = TextEditingController();

	String? _selectedCalendarId;
	late DateTime _startDateTime;
	DateTime? _endDateTime;
	bool _allDay = false;

	@override
	void initState() {
		super.initState();
		_startDateTime = DateTime.now();
		_endDateTime = _startDateTime.add(const Duration(hours: 1));
	}

	@override
	void dispose() {
		_titleController.dispose();
		_descriptionController.dispose();
		super.dispose();
	}

	void _closeWithResult(String trigger) {
		if (!_formKey.currentState!.validate()) return;

		Navigator.of(context).pop(
			AddEventModalResult(
				calendarId: _selectedCalendarId,
				title: _titleController.text.trim(),
				description: _descriptionController.text.trim(),
				start: _startDateTime,
				end: _endDateTime,
				allDay: _allDay,
				trigger: trigger,
			),
		);
	}

	Future<void> _pickStartDate() async {
		final picked = await showDatePicker(
			context: context,
			initialDate: _startDateTime,
			firstDate: DateTime(2000),
			lastDate: DateTime(2100),
		);
		if (picked == null) return;
		setState(() {
			_startDateTime = DateTime(
				picked.year, picked.month, picked.day,
				_startDateTime.hour, _startDateTime.minute,
			);
			// Ajustar fin si queda antes del inicio
			if (_endDateTime != null && _endDateTime!.isBefore(_startDateTime)) {
				_endDateTime = _startDateTime.add(const Duration(hours: 1));
			}
		});
	}

	Future<void> _pickStartTime() async {
		final picked = await showTimePicker(
			context: context,
			initialTime: TimeOfDay.fromDateTime(_startDateTime),
		);
		if (picked == null) return;
		setState(() {
			_startDateTime = DateTime(
				_startDateTime.year, _startDateTime.month, _startDateTime.day,
				picked.hour, picked.minute,
			);
			if (_endDateTime != null && _endDateTime!.isBefore(_startDateTime)) {
				_endDateTime = _startDateTime.add(const Duration(hours: 1));
			}
		});
	}

	Future<void> _pickEndDate() async {
		final picked = await showDatePicker(
			context: context,
			initialDate: _endDateTime ?? _startDateTime,
			firstDate: _startDateTime,
			lastDate: DateTime(2100),
		);
		if (picked == null) return;
		setState(() {
			final endTime = _endDateTime ?? _startDateTime.add(const Duration(hours: 1));
			_endDateTime = DateTime(
				picked.year, picked.month, picked.day,
				endTime.hour, endTime.minute,
			);
		});
	}

	Future<void> _pickEndTime() async {
		final base = _endDateTime ?? _startDateTime.add(const Duration(hours: 1));
		final picked = await showTimePicker(
			context: context,
			initialTime: TimeOfDay.fromDateTime(base),
		);
		if (picked == null) return;
		setState(() {
			_endDateTime = DateTime(
				base.year, base.month, base.day,
				picked.hour, picked.minute,
			);
		});
	}

	String _formatDate(DateTime dt) {
		return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year}';
	}

	String _formatTime(DateTime dt) {
		final h = dt.hour.toString().padLeft(2, '0');
		final m = dt.minute.toString().padLeft(2, '0');
		return '$h:$m';
	}

	@override
	Widget build(BuildContext context) {
		final localizations = AppLocalizations.of(context)!;
		final bottomInset = MediaQuery.of(context).viewInsets.bottom;

		return SafeArea(
			top: false,
			child: Padding(
				padding: EdgeInsets.only(bottom: bottomInset),
				child: Container(
					decoration: const BoxDecoration(
						color: AppColors.light,
						borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
					),
					child: SingleChildScrollView(
						child: Padding(
							padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
							child: Form(
								key: _formKey,
								child: Column(
									crossAxisAlignment: CrossAxisAlignment.start,
									mainAxisSize: MainAxisSize.min,
									children: [
										Center(
											child: Container(
												width: 44,
												height: 5,
												decoration: BoxDecoration(
													color: AppColors.dark.withOpacity(0.3),
													borderRadius: BorderRadius.circular(999),
												),
											),
										),
										const SizedBox(height: 14),
										Text(localizations.addNewEvent, style: AppTextStyles.title),
										const SizedBox(height: 16),
										DropdownButtonFormField<String>(
											value: _selectedCalendarId,
											decoration: InputDecoration(
												labelText: localizations.calendar,
												border: OutlineInputBorder(),
											),
											items: widget.calendars
													.map(
														(c) => DropdownMenuItem<String>(
															value: c.id,
															child: Text(c.name),
														),
													)
													.toList(),
											onChanged: (value) {
												setState(() => _selectedCalendarId = value);
											},
											validator: (value) {
												if (value == null || value.isEmpty) {
													return localizations.calendarRequired;
												}
												return null;
											},
										),
										const SizedBox(height: 12),
										TextFormField(
											controller: _titleController,
											decoration: InputDecoration(
												labelText: localizations.eventTitle,
												border: OutlineInputBorder(),
											),
											validator: (value) {
												if (value == null || value.trim().isEmpty) {
													return localizations.titleRequired;
												}
												return null;
											},
										),
										const SizedBox(height: 12),
										TextFormField(
											controller: _descriptionController,
											decoration: InputDecoration(
												labelText: localizations.description,
												border: OutlineInputBorder(),
											),											
											maxLines: 2,
										),
										const SizedBox(height: 16),
										// --- Start Date and Time ---
										Row(
											children: [
												Expanded(
													child: _DatePickerField(
														label: localizations.startDate,
														value: _formatDate(_startDateTime),
														onTap: _pickStartDate,
													),
												),
												if (!_allDay) ...[
													const SizedBox(width: 10),
													Expanded(
														child: _DatePickerField(
															label: localizations.startTime,
															value: _formatTime(_startDateTime),
															onTap: _pickStartTime,
														),
													),
												],
											],
										),
										const SizedBox(height: 14),
										// --- End Date and Time ---
										Row(
											children: [
												Expanded(
													child: _DatePickerField(
														label: localizations.endDate,
														value: _endDateTime != null
																? _formatDate(_endDateTime!)
																: '-',
														onTap: _pickEndDate,
													),
												),
												if (!_allDay) ...[
													const SizedBox(width: 10),
													Expanded(
														child: _DatePickerField(
															label: localizations.endTime,
															value: _endDateTime != null
																	? _formatTime(_endDateTime!)
																	: '-',
															onTap: _pickEndTime,
														),
													),
												],
											],
										),
										const SizedBox(height: 12),
										// --- All Day ---
										SwitchListTile.adaptive(
											value: _allDay,
											contentPadding: EdgeInsets.zero,
											title: Text(localizations.allDay),
											onChanged: (value) {
												setState(() => _allDay = value);
											},
										),
										const SizedBox(height: 12),
                    // --- Action Buttons ---
										Row(
											children: [
												TextButton(
													onPressed: () => Navigator.of(context).pop(),
													child: Text(localizations.cancel),
												),
												const Spacer(),
												OutlinedButton(
													onPressed: () => _closeWithResult('copy'),
													child: Text(localizations.saveAndCopy),
												),
												const SizedBox(width: 8),
												ElevatedButton(
													style: ElevatedButton.styleFrom(
														backgroundColor: AppColors.accent,
														foregroundColor: AppColors.light,
													),
													onPressed: () => _closeWithResult('save'),
													child: Text(localizations.save),
												),
											],
										),
									],
								),
							),
						),
					),
				),
			),
		);
	}
}

class _DatePickerField extends StatelessWidget {
	final String label;
	final String value;
	final VoidCallback onTap;

	const _DatePickerField({
		required this.label,
		required this.value,
		required this.onTap,
	});

	@override
	Widget build(BuildContext context) {
		return InkWell(
			onTap: onTap,
			borderRadius: BorderRadius.circular(4),
			child: InputDecorator(
				decoration: InputDecoration(
					labelText: label,
					border: const OutlineInputBorder(),
					suffixIcon: const Icon(Icons.arrow_drop_down, size: 20),
					contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
				),
				child: Text(value, style: AppTextStyles.body),
			),
		);
	}
}
