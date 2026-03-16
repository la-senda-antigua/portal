class AssignableUser {
  final String userId;
  final String username;
  final String? name;
  final String? lastName;
  final String role;

  const AssignableUser({
    required this.userId,
    required this.username,
    required this.name,
    required this.lastName,
    required this.role,
  });

  String get displayName {
    final parts = [name, lastName]
        .where((part) => part != null && part.trim().isNotEmpty)
        .cast<String>()
        .toList();
    if (parts.isNotEmpty) {
      return parts.join(' ');
    }
    return username;
  }

  factory AssignableUser.fromJson(Map<String, dynamic> json) {
    return AssignableUser(
      userId: (json['userId'] ?? json['id']).toString(),
      username: (json['username'] ?? '').toString(),
      name: json['name']?.toString(),
      lastName: json['lastName']?.toString(),
      role: (json['role'] ?? 'User').toString(),
    );
  }
}