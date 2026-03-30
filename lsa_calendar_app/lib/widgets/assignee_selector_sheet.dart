import 'package:flutter/material.dart';
import 'package:lsa_calendar_app/core/app_colors.dart';
import 'package:lsa_calendar_app/core/app_text_styles.dart';
import 'package:lsa_calendar_app/l10n/app_localizations.dart';
import 'package:lsa_calendar_app/models/assignable_user.dart';
import 'package:lsa_calendar_app/models/user_group.dart';

class AssigneeSelectorSheet extends StatefulWidget {
	final List<AssignableUser> initialSelection;
	final List<AssignableUser> availableUsers;
	final List<UserGroup> availableGroups;

	const AssigneeSelectorSheet({
		super.key,
		required this.initialSelection,
		required this.availableUsers,
		required this.availableGroups,
	});

	@override
	State<AssigneeSelectorSheet> createState() => _AssigneeSelectorSheetState();
}

class _AssigneeSelectorSheetState extends State<AssigneeSelectorSheet> {
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
      .replaceAll('ñ', 'n')
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

	bool _isGroupSelected(UserGroup group) {
		final selectedIds = _selectedUsers.map((u) => u.userId).toSet();
		final availableIds = widget.availableUsers.map((u) => u.userId).toSet();
		final membersInThisCalendar = group.memberIds.where((id) => availableIds.contains(id)).toList();

		if (membersInThisCalendar.isEmpty) return false;

		return membersInThisCalendar.every((id) => selectedIds.contains(id));
	}

	void _toggleGroup(UserGroup group) {
		final isComplete = _isGroupSelected(group);
		final groupMemberIdsSet = group.memberIds.toSet();

		setState(() {
			if (isComplete) {
				_selectedUsers = _selectedUsers
					.where((user) => !groupMemberIdsSet.contains(user.userId))
					.toList();
			} else {
				final currentSelectedIds = _selectedUsers.map((u) => u.userId).toSet();
				final toAdd = <AssignableUser>[];

				for (final user in widget.availableUsers) {
					if (groupMemberIdsSet.contains(user.userId) &&
						!currentSelectedIds.contains(user.userId)) {
						toAdd.add(user);
					}
				}
				_selectedUsers = [..._selectedUsers, ...toAdd];
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

		return Container(
			height: MediaQuery.of(context).size.height * 0.85,
			decoration: const BoxDecoration(
				color: AppColors.light,
				borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
			),
			child: Padding(
				padding: EdgeInsets.fromLTRB(20, 16, 20, 20 + bottomInset),
				child: Column(
					children: [
						Center(
							child: Container(
								width: 44, height: 5,
								decoration: BoxDecoration(
									color: AppColors.dark.withOpacity(0.3),
									borderRadius: BorderRadius.circular(999),
								),
							),
						),
						const SizedBox(height: 14),
						Align(alignment: Alignment.centerLeft, child: Text(localizations.assignees, style: AppTextStyles.title)),
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
						const SizedBox(height: 12),
						Expanded(
							child: ListView(
								children: [									
									if (!hasResults)
										Center(child: Padding(padding: const EdgeInsets.symmetric(vertical: 24), child: Text(localizations.noResultsFound, style: AppTextStyles.body)))
									else ...[
										...filteredUsers.map((user) => ListTile(
											contentPadding: EdgeInsets.zero,
											leading: CircleAvatar(backgroundColor: AppColors.accent.withOpacity(0.12), child: Text(user.displayName.isNotEmpty ? user.displayName[0].toUpperCase() : '?', style: AppTextStyles.body.copyWith(color: AppColors.accent))),
											title: Text(user.displayName),
											subtitle: Text(user.username),
											trailing: Icon(_selectedUsers.any((item) => item.userId == user.userId) ? Icons.check_circle : Icons.add_circle_outline, color: _selectedUsers.any((item) => item.userId == user.userId) ? AppColors.accent : AppColors.dark.withOpacity(0.6)),
											onTap: () => _toggleUser(user),
										)),
										...filteredGroups.map((group) {
											final isSelected = _isGroupSelected(group);
											return ListTile(
												contentPadding: EdgeInsets.zero,
												leading: CircleAvatar(
													backgroundColor: isSelected ? AppColors.accent.withOpacity(0.12) : AppColors.dark.withOpacity(0.08),
													child: Icon(
														isSelected ? Icons.group : Icons.group_outlined,
														color: isSelected ? AppColors.accent : AppColors.dark
													),
												),
												title: Text(group.groupName),
												subtitle: Text('${group.memberIds.length}'),
												trailing: Icon(
													isSelected ? Icons.check_circle : Icons.add_circle_outline,
													color: isSelected ? AppColors.accent : AppColors.dark.withOpacity(0.6),
												),
												onTap: () => _toggleGroup(group),
											);
										}),
									],
								],
							),
						),
						Row(children: [TextButton(onPressed: () => Navigator.of(context).pop(), child: Text(localizations.cancel)), const Spacer(), ElevatedButton(style: ElevatedButton.styleFrom(backgroundColor: AppColors.accent, foregroundColor: AppColors.light), onPressed: () => Navigator.of(context).pop(_selectedUsers), child: Text(localizations.save))]),
					],
				),
			),
		);
	}
}