class Calendar {
  final String id;
  final String name;

  Calendar({required this.id, required this.name});

  factory Calendar.fromJson(Map<String, dynamic> json) {
    return Calendar(
      id: json['id'],
      name: json['name'],
    );
  }
}