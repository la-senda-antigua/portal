import 'package:flutter/material.dart';
import 'package:lsa_calendar_app/core/app_colors.dart';
import 'package:lsa_calendar_app/core/app_text_styles.dart';
import 'package:lsa_calendar_app/l10n/app_localizations.dart';
import 'package:lsa_calendar_app/models/assignable_user.dart';
import 'package:lsa_calendar_app/models/calendar.dart';
import 'package:lsa_calendar_app/models/event.dart';
import 'package:lsa_calendar_app/models/user_group.dart';
import 'package:lsa_calendar_app/services/api_service.dart';
import 'package:intl/intl.dart';

class AddEventModalResult {
	final String? calendarId;
	final String title;
	final String description;
	final DateTime start;
	final DateTime? end;
	final bool allDay;
	final List<AssignableUser> assignees;
	final String trigger;
	final String? eventId;

	AddEventModalResult({
		required this.calendarId,
		required this.title,
		required this.description,
		required this.start,
		required this.end,
		required this.allDay,
		required this.assignees,
		required this.trigger,
		this.eventId,
	});
}

class AddEventModalInitialData {
	final String? calendarId;
	final String title;
	final String description;
	final DateTime start;
	final DateTime? end;
	final bool allDay;
	final List<AssignableUser> assignees;

	const AddEventModalInitialData({
		this.calendarId,
		this.title = '',
		this.description = '',
		required this.start,
		this.end,
		this.allDay = false,
		this.assignees = const [],
	});

	factory AddEventModalInitialData.fromResult(AddEventModalResult result) {
		return AddEventModalInitialData(
			calendarId: result.calendarId,
			title: result.title,
			description: result.description,
			start: result.start,
			end: result.end,
			allDay: result.allDay,
			assignees: result.assignees,
		);
	}

	factory AddEventModalInitialData.fromEvent(Event event) {
		return AddEventModalInitialData(
			calendarId: event.calendarId,
			title: event.title,
			description: event.description ?? '',
			start: event.originalStart,
			end: event.originalEnd,
			allDay: event.allDay,
			assignees: event.assignees
				.map((a) => AssignableUser(
					userId: a.userId.isNotEmpty ? a.userId : a.username,
					username: a.username,
					name: a.name,
					lastName: a.lastName,
					role: a.role,
				))
				.toList(),
		);
	}
}

class AddEventModal extends StatefulWidget {
	final List<Calendar> calendars;
	final AddEventModalInitialData? initialData;
	final String? eventId;

	const AddEventModal({
		super.key,
		required this.calendars,
		this.initialData,
		this.eventId,
	});

	static Future<AddEventModalResult?> show(
		BuildContext context, {
		required List<Calendar> calendars,
		AddEventModalInitialData? initialData,
		String? eventId,
	}) {
		return showModalBottomSheet<AddEventModalResult>(
			context: context,
			isScrollControlled: true,
			backgroundColor: Colors.transparent,
			builder: (_) => AddEventModal(
				calendars: calendars,
				initialData: initialData,
				eventId: eventId,
			),
		);
	}

	@override
	State<AddEventModal> createState() => _AddEventModalState();
}

class _AddEventModalState extends State<AddEventModal> {
	final _formKey = GlobalKey<FormState>();
	final _titleController = TextEditingController();
	final _descriptionController = TextEditingController();

	List<AssignableUser> _allUsers = [];
	List<UserGroup> _allGroups = [];
	List<AssignableUser> _selectedAssignees = [];
	bool _isLoadingAssigneeData = true;
	String? _assigneeDataError;

	String? _selectedCalendarId;
	late DateTime _startDateTime;
	DateTime? _endDateTime;
	bool _allDay = false;
	bool _isCheckingConflicts = false;
	String _conflictMessage = '';

	@override
	void initState() {
		super.initState();
		final initialData = widget.initialData;
		final now = DateTime.now();
		final defaultStart = DateTime(now.year, now.month, now.day, 10, 0, 0);
		_startDateTime = initialData?.start ?? defaultStart;
		_endDateTime = initialData?.end ?? _startDateTime.add(const Duration(hours: 1));
		_selectedCalendarId = initialData?.calendarId;
		_allDay = initialData?.allDay ?? false;
		_titleController.text = initialData?.title ?? '';
		_descriptionController.text = initialData?.description ?? '';
		_selectedAssignees = List<AssignableUser>.from(initialData?.assignees ?? const []);
		_loadAssigneeData();
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
				assignees: List<AssignableUser>.from(_selectedAssignees),
				trigger: trigger,
				eventId: trigger == 'copy' ? null : widget.eventId,
			),
		);
	}

	Future<void> _loadAssigneeData() async {
		setState(() {
			_isLoadingAssigneeData = true;
			_assigneeDataError = null;
		});

		try {
			final usersResponse = await ApiService.get('/users/getAll');
			final groupsResponse = await ApiService.get('/userGroups/getAll');

			if (!mounted) return;

			setState(() {
				_allUsers = (usersResponse as List<dynamic>)
					.map((json) => AssignableUser.fromJson(json as Map<String, dynamic>))
					.toList();
				_allGroups = (groupsResponse as List<dynamic>)
					.map((json) => UserGroup.fromJson(json as Map<String, dynamic>))
					.toList();
				_isLoadingAssigneeData = false;
			});
		} catch (_) {
			if (!mounted) return;

			setState(() {
				_assigneeDataError = 'load_assignees_failed';
				_isLoadingAssigneeData = false;
			});
		}
	}

	Calendar? get _selectedCalendar {
		if (_selectedCalendarId == null) return null;
		for (final calendar in widget.calendars) {
			if (calendar.id == _selectedCalendarId) {
				return calendar;
			}
		}
		return null;
	}

	List<AssignableUser> get _availableUsers {
		final calendar = _selectedCalendar;
		if (calendar == null) return const [];

		if (calendar.allowsAllAssignees) {
			return _allUsers;
		}

		final allowedIds = calendar.allowedAssigneeIds.toSet();
		return _allUsers.where((user) {
			return user.role.toLowerCase() == 'admin' || allowedIds.contains(user.userId);
		}).toList();
	}

	List<UserGroup> get _availableGroups {
		final calendar = _selectedCalendar;
		if (calendar == null) return const [];

		final allowedIds = _availableUsers.map((user) => user.userId).toSet();
		return _allGroups.where((group) {
			return group.memberIds.any(allowedIds.contains);
		}).toList();
	}

	Future<void> _openAssigneeSelector() async {
		if (_selectedCalendar == null) return;

		final result = await showModalBottomSheet<List<AssignableUser>>(
			context: context,
			isScrollControlled: true,
			backgroundColor: Colors.transparent,
			builder: (_) => _AssigneeSelectorSheet(
				initialSelection: _selectedAssignees,
				availableUsers: _availableUsers,
				availableGroups: _availableGroups,
			),
		);

		if (result == null || !mounted) return;

		setState(() {
			_selectedAssignees = result;
		});
		_checkAvailability();
	}

	void _removeAssignee(String userId) {
		setState(() {
			_selectedAssignees = _selectedAssignees
				.where((user) => user.userId != userId)
				.toList();
		});
		_checkAvailability();
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
		_checkAvailability();
	}

	Future<void> _pickStartTime() async {
		final localizations = AppLocalizations.of(context)!;
		final picked = await showTimePicker(
			context: context,
			initialTime: TimeOfDay.fromDateTime(_startDateTime),
			helpText: localizations.startTime,
			cancelText: localizations.cancel,
			confirmText: localizations.save,
			builder: (context, child) {
				return Localizations.override(
					context: context,
					locale: const Locale('en', 'US'),
					child: MediaQuery(
						data: MediaQuery.of(context).copyWith(alwaysUse24HourFormat: false),
						child: child!,
					),
				);
			},
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
		_checkAvailability();
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
		_checkAvailability();
	}

	Future<void> _pickEndTime() async {
		final base = _endDateTime ?? _startDateTime.add(const Duration(hours: 1));
		final localizations = AppLocalizations.of(context)!;
		final picked = await showTimePicker(
			context: context,
			initialTime: TimeOfDay.fromDateTime(base),
			helpText: localizations.endTime,
			cancelText: localizations.cancel,
			confirmText: localizations.save,
			builder: (context, child) {
				return Localizations.override(
					context: context,
					locale: const Locale('en', 'US'),
					child: MediaQuery(
						data: MediaQuery.of(context).copyWith(alwaysUse24HourFormat: false),
						child: child!,
					),
				);
			},
		);
		if (picked == null) return;
		setState(() {
			final nextEnd = DateTime(
				base.year, base.month, base.day,
				picked.hour, picked.minute,
			);
			_endDateTime = nextEnd.isBefore(_startDateTime)
				? _startDateTime.add(const Duration(hours: 1))
				: nextEnd;
		});
		_checkAvailability();
	}

	String _formatDate(DateTime dt) {		
		final locale = Localizations.localeOf(context).toString();
		return DateFormat.yMd(locale).format(dt);
	}

	String _formatTime(DateTime dt) {
		final hour12 = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
		final m = dt.minute.toString().padLeft(2, '0');
		final period = dt.hour >= 12 ? 'PM' : 'AM';
		return '$hour12:$m $period';
	}

	Future<void> _checkAvailability() async {
		if (_selectedAssignees.isEmpty) {
			setState(() => _conflictMessage = '');
			return;
		}

		setState(() => _isCheckingConflicts = true);

		try {
			final endForCheck = _endDateTime ?? _startDateTime.add(const Duration(hours: 1));
			final response = await ApiService.post('/calendars/UserAvailability', body: {
				'userIds': _selectedAssignees.map((u) => u.userId).toList(),
				'startTime': _startDateTime.toUtc().toIso8601String(),
				'endTime': endForCheck.toUtc().toIso8601String(),
			});

			if (!mounted) return;

			final results = response as List<dynamic>;
			final List<({String userName, List<String> calendarNames})> conflicts = [];

			for (final item in results) {
				final user = item['user'] as Map<String, dynamic>;
				final userConflicts = (item['conflicts'] as List<dynamic>)
					.where((c) => widget.eventId == null || c['eventId'] != widget.eventId)
					.toList();

				if (userConflicts.isNotEmpty) {
					final calendarNames = userConflicts
						.map((c) => c['name'] as String? ?? '')
						.where((n) => n.isNotEmpty)
						.toList();
					final userName = '${user['name'] ?? ''} ${user['lastName'] ?? ''}'.trim();
					conflicts.add((userName: userName, calendarNames: calendarNames));
				}
			}

			final localizations = AppLocalizations.of(context)!;
			String message = '';

			if (conflicts.length == 1) {
				message = localizations.singleUserConflict(
					conflicts[0].calendarNames.join(', '),
					conflicts[0].userName,
				);
			} else if (conflicts.length > 1) {
				message = localizations.multipleUsersConflict(
					conflicts.map((c) => c.userName).join(', '),
				);
			}

			setState(() {
				_conflictMessage = message;
				_isCheckingConflicts = false;
			});
		} catch (_) {
			if (!mounted) return;
			setState(() => _isCheckingConflicts = false);
		}
	}

	@override
	Widget build(BuildContext context) {
		final localizations = AppLocalizations.of(context)!;
		final bottomInset = MediaQuery.of(context).viewInsets.bottom;
		final hasCalendarSelected = _selectedCalendar != null;

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
							child: _isLoadingAssigneeData
								? const Padding(
									padding: EdgeInsets.symmetric(vertical: 48),
									child: Center(child: CircularProgressIndicator()),
								)
								: _assigneeDataError != null
									? Padding(
										padding: const EdgeInsets.symmetric(vertical: 24),
										child: Column(
											mainAxisSize: MainAxisSize.min,
											children: [
												Text(
													localizations.serverConnectionError,
													style: AppTextStyles.body,
													textAlign: TextAlign.center,
												),
												const SizedBox(height: 12),
												OutlinedButton(
													onPressed: _loadAssigneeData,
													child: Text(localizations.retry),
												),
											],
										),
									)
									: Form(
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
												setState(() {
													_selectedCalendarId = value;
													_selectedAssignees = [];
												});
											},
											validator: (value) {
												if (value == null || value.isEmpty) {
													return localizations.calendarRequired;
												}
												return null;
											},
										),
										const SizedBox(height: 12),
										_AssigneesField(
											label: localizations.assignees,
											enabled: hasCalendarSelected,
											valueText: hasCalendarSelected
												? localizations.selectAssignees
												: localizations.selectCalendarFirst,
											onTap: _openAssigneeSelector,
										),
										if (_selectedAssignees.isNotEmpty) ...[
											const SizedBox(height: 10),
											Wrap(
												spacing: 8,
												runSpacing: 8,
												children: _selectedAssignees.map((assignee) {
													return Chip(
														label: Text(assignee.displayName),
														onDeleted: () => _removeAssignee(assignee.userId),
													);
												}).toList(),
											),
										],
										const SizedBox(height: 12),
										TextFormField(
											controller: _titleController,
											decoration: InputDecoration(
												labelText: localizations.eventTitle,
												border: OutlineInputBorder(),
											),
											validator: (value) {
												if (_selectedAssignees.isEmpty && (value == null || value.trim().isEmpty)) {
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
												setState(() {
													_allDay = value;
													if (value) {
														_startDateTime = DateTime(
															_startDateTime.year,
															_startDateTime.month,
															_startDateTime.day,
															0,
															0,
															0,
														);
														final endBase = _endDateTime ?? _startDateTime;
														_endDateTime = DateTime(
															endBase.year,
															endBase.month,
															endBase.day,
															23,
															59,
															59,
														);
													}
												});
											},
										),
										const SizedBox(height: 12),                    // --- Conflict Warning ---
									if (_isCheckingConflicts) ...[
										const LinearProgressIndicator(),
										const SizedBox(height: 8),
									],
									if (_conflictMessage.isNotEmpty) ...[
										Container(
											padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
											decoration: BoxDecoration(
												color: Colors.orange.shade50,
												border: Border.all(color: Colors.orange.shade300),
												borderRadius: BorderRadius.circular(8),
											),
											child: Row(
												crossAxisAlignment: CrossAxisAlignment.start,
												children: [
													Icon(Icons.warning_amber_rounded, color: Colors.orange.shade700, size: 18),
													const SizedBox(width: 8),
													Expanded(
														child: Text(
															_conflictMessage,
															style: TextStyle(color: Colors.orange.shade800, fontSize: 13),
														),
													),
												],
											),
										),
										const SizedBox(height: 8),
									],                    // --- Action Buttons ---
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

class _AssigneesField extends StatelessWidget {
	final String label;
	final bool enabled;
	final String valueText;
	final VoidCallback onTap;

	const _AssigneesField({
		required this.label,
		required this.enabled,
		required this.valueText,
		required this.onTap,
	});

	@override
	Widget build(BuildContext context) {
		final foregroundColor = enabled ? AppColors.dark : AppColors.dark.withOpacity(0.45);

		return InkWell(
			onTap: enabled ? onTap : null,
			borderRadius: BorderRadius.circular(4),
			child: InputDecorator(
				decoration: InputDecoration(
					labelText: label,
					border: const OutlineInputBorder(),
					suffixIcon: Icon(
						enabled ? Icons.arrow_forward_ios : Icons.lock_outline,
						size: 18,
					),
				),
				child: Row(
					children: [
						Icon(Icons.people_alt_outlined, size: 18, color: foregroundColor),
						const SizedBox(width: 8),
						Expanded(
							child: Text(
								valueText,
								style: AppTextStyles.body.copyWith(color: foregroundColor),
							),
						),
					],
				),
			),
		);
	}
}

class _AssigneeSelectorSheet extends StatefulWidget {
	final List<AssignableUser> initialSelection;
	final List<AssignableUser> availableUsers;
	final List<UserGroup> availableGroups;

	const _AssigneeSelectorSheet({
		required this.initialSelection,
		required this.availableUsers,
		required this.availableGroups,
	});

	@override
	State<_AssigneeSelectorSheet> createState() => _AssigneeSelectorSheetState();
}

class _AssigneeSelectorSheetState extends State<_AssigneeSelectorSheet> {
	late final TextEditingController _searchController;
	late List<AssignableUser> _selectedUsers;

	@override
	void initState() {
		super.initState();
		_searchController = TextEditingController();
		_selectedUsers = List<AssignableUser>.from(widget.initialSelection);
	}

	@override
	void dispose() {
		_searchController.dispose();
		super.dispose();
	}

	String _normalize(String value) {
		return value
			.toLowerCase()
			.replaceAll('á', 'a')
			.replaceAll('é', 'e')
			.replaceAll('í', 'i')
			.replaceAll('ó', 'o')
			.replaceAll('ú', 'u');
	}

	List<AssignableUser> get _filteredUsers {
		final query = _normalize(_searchController.text.trim());
		final users = List<AssignableUser>.from(widget.availableUsers)
			..sort((a, b) => a.displayName.compareTo(b.displayName));
		if (query.isEmpty) return users;

		return users.where((user) {
			final haystack = _normalize('${user.displayName} ${user.username}');
			return haystack.contains(query);
		}).toList();
	}

	List<UserGroup> get _filteredGroups {
		final query = _normalize(_searchController.text.trim());
		final groups = List<UserGroup>.from(widget.availableGroups)
			..sort((a, b) => a.groupName.compareTo(b.groupName));
		if (query.isEmpty) return groups;

		return groups.where((group) {
			return _normalize(group.groupName).contains(query);
		}).toList();
	}

	void _toggleUser(AssignableUser user) {
		setState(() {
			final exists = _selectedUsers.any((item) => item.userId == user.userId);
			if (exists) {
				_selectedUsers = _selectedUsers
					.where((item) => item.userId != user.userId)
					.toList();
				return;
			}
			_selectedUsers = [..._selectedUsers, user];
		});
	}

	void _selectGroup(UserGroup group) {
		setState(() {
			final availableById = {
				for (final user in widget.availableUsers) user.userId: user,
			};
			final selectedIds = _selectedUsers.map((user) => user.userId).toSet();

			for (final memberId in group.memberIds) {
				final user = availableById[memberId];
				if (user == null || selectedIds.contains(memberId)) {
					continue;
				}
				_selectedUsers.add(user);
				selectedIds.add(memberId);
			}
		});
	}

	@override
	Widget build(BuildContext context) {
		final localizations = AppLocalizations.of(context)!;
		final bottomInset = MediaQuery.of(context).viewInsets.bottom;
		final filteredUsers = _filteredUsers;
		final filteredGroups = _filteredGroups;
		final hasResults = filteredUsers.isNotEmpty || filteredGroups.isNotEmpty;

		return SafeArea(
			top: false,
			child: Padding(
				padding: EdgeInsets.only(bottom: bottomInset),
				child: Container(
					decoration: const BoxDecoration(
						color: AppColors.light,
						borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
					),
					child: Padding(
						padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
						child: Column(
							mainAxisSize: MainAxisSize.min,
							crossAxisAlignment: CrossAxisAlignment.start,
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
								Text(localizations.assignees, style: AppTextStyles.title),
								const SizedBox(height: 12),
								TextField(
									controller: _searchController,
									onChanged: (_) => setState(() {}),
									decoration: InputDecoration(
										labelText: localizations.searchAssignees,
										border: const OutlineInputBorder(),
										prefixIcon: const Icon(Icons.search),
									),
								),
								if (_selectedUsers.isNotEmpty) ...[
									const SizedBox(height: 12),
									Wrap(
										spacing: 8,
										runSpacing: 8,
										children: _selectedUsers.map((user) {
											return Chip(
												label: Text(user.displayName),
												onDeleted: () => _toggleUser(user),
											);
										}).toList(),
									),
								],
								const SizedBox(height: 12),
								Flexible(
									child: ConstrainedBox(
										constraints: const BoxConstraints(maxHeight: 360),
										child: hasResults
											? ListView(
												shrinkWrap: true,
												children: [
													...filteredUsers.map((user) {
														final selected = _selectedUsers.any((item) => item.userId == user.userId);
														return ListTile(
															contentPadding: EdgeInsets.zero,
															leading: CircleAvatar(
																backgroundColor: AppColors.accent.withOpacity(0.12),
																child: Text(
																	user.displayName.isNotEmpty ? user.displayName[0].toUpperCase() : '?',
																	style: AppTextStyles.body.copyWith(color: AppColors.accent),
																),
															),
															title: Text(user.displayName),
															subtitle: Text(user.username),
															trailing: Icon(
																selected ? Icons.check_circle : Icons.add_circle_outline,
																color: selected ? AppColors.accent : AppColors.dark.withOpacity(0.6),
															),
															onTap: () => _toggleUser(user),
														);
													}),
													...filteredGroups.map((group) {
														return ListTile(
															contentPadding: EdgeInsets.zero,
															leading: CircleAvatar(
																backgroundColor: AppColors.dark.withOpacity(0.08),
																child: const Icon(Icons.group_outlined, color: AppColors.dark),
															),
															title: Text(group.groupName),
															subtitle: Text('${group.memberIds.length}'),
															trailing: const Icon(Icons.add_circle_outline),
															onTap: () => _selectGroup(group),
														);
													}),
												],
											)
											: Center(
												child: Padding(
													padding: const EdgeInsets.symmetric(vertical: 24),
													child: Text(
														localizations.noResultsFound,
														style: AppTextStyles.body,
													),
												),
											),
									),
								),
								const SizedBox(height: 12),
								Row(
									children: [
										TextButton(
											onPressed: () => Navigator.of(context).pop(),
											child: Text(localizations.cancel),
										),
										const Spacer(),
										ElevatedButton(
											style: ElevatedButton.styleFrom(
												backgroundColor: AppColors.accent,
												foregroundColor: AppColors.light,
											),
											onPressed: () => Navigator.of(context).pop(_selectedUsers),
											child: Text(localizations.save),
										),
									],
								),
							],
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
