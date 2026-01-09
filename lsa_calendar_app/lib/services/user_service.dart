import 'package:lsa_calendar_app/models/user.dart';

class UserService {
  static User? _currentUser;

  static User? get currentUser => _currentUser;

  static void setUser(User user) {
    _currentUser = user;
  }

  static void clearUser() {
    _currentUser = null;
  }
}
