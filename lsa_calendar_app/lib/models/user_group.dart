class UserGroup {
  final String id;
  final String groupName;
  final List<String> memberIds;

  const UserGroup({
    required this.id,
    required this.groupName,
    required this.memberIds,
  });

  factory UserGroup.fromJson(Map<String, dynamic> json) {
    return UserGroup(
      id: json['id'].toString(),
      groupName: (json['groupName'] ?? '').toString(),
      memberIds: (json['members'] as List<dynamic>? ?? const [])
          .map((item) => item.toString())
          .toList(),
    );
  }
}