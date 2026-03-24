class Calendar {
  final String id;
  final String name;
  final bool active;
  final bool isPublic;
  final bool isHidden;
  final List<String> managers;
  final List<String> members;

  Calendar({
    required this.id,
    required this.name,
    required this.active,
    required this.isPublic,
    required this.isHidden,
    required this.managers,
    required this.members,
  });

  List<String> get allowedAssigneeIds {
    return {...members, ...managers}.toList();
  }

  bool get allowsAllAssignees => isPublic || isHidden;

  factory Calendar.fromJson(Map<String, dynamic> json) {
    return Calendar(
      id: json['id'],
      name: json['name'],
      active: json['active'] ?? true,
      isPublic: json['isPublic'] ?? false,
      isHidden: json['isHidden'] ?? false,
      managers: (json['managers'] as List<dynamic>? ?? const [])
          .map((item) => item.toString())
          .toList(),
      members: (json['members'] as List<dynamic>? ?? const [])
          .map((item) => item.toString())
          .toList(),
    );
  }
}