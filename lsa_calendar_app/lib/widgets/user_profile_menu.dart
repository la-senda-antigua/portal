import 'package:flutter/material.dart';

class UserProfileMenu extends StatelessWidget {
  final String username;
  final String? email;
  final String? avatar;
  final VoidCallback onLogout;

  const UserProfileMenu({
    super.key,
    required this.username,
    this.email,
    this.avatar,
    required this.onLogout,
  });

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<String>(
      offset: const Offset(0, 50),
      onSelected: (value) {
        if (value == 'logout') onLogout();
      },
      itemBuilder: (BuildContext context) => <PopupMenuEntry<String>>[
        PopupMenuItem<String>(
          enabled: false,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                username,
                style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.black),
              ),
              Text(
                email ?? '',
                style: const TextStyle(fontSize: 12, color: Colors.grey),
              ),
            ],
          ),
        ),
        const PopupMenuDivider(),
        const PopupMenuItem<String>(
          value: 'logout',
          child: Text('Logout'),
        ),
      ],
      child: CircleAvatar(
        backgroundImage: avatar != null ? NetworkImage(avatar!) : null,
        child: avatar == null ? Text(username.isNotEmpty ? username[0].toUpperCase() : '?') : null,
      ),
    );
  }
}