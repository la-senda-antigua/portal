class EventConflict {
  final String userId;
  final String username;
  final String name;
  final String lastName;
  final String calendarName;

  EventConflict({
    required this.userId,
    required this.username,
    required this.name,
    required this.lastName,
    required this.calendarName,
  });

  factory EventConflict.fromJson(Map<String, dynamic> json) {
    return EventConflict(
      userId: json['userId'] ?? '',
      username: json['username'] ?? '',
      name: json['name'] ?? '',
      lastName: json['lastName'] ?? '',
      calendarName: json['calendarName'] ?? '',
    );
  }
}