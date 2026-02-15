// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get usernameLabel => 'Username';

  @override
  String get passwordLabel => 'Password';

  @override
  String get loginButton => 'Log In';

  @override
  String get appleLoginButton => 'Continue with Apple';

  @override
  String get googleLoginButton => 'Continue with Google';

  @override
  String get loggingIn => 'Logging in...';

  @override
  String get enterCredentials => 'Please enter username and password';

  @override
  String get loginError => 'Incorrect username or password';

  @override
  String get loginCancelled => 'Login cancelled';

  @override
  String get googleTokenError => 'Failed to get Google access token';

  @override
  String welcomeMessage(Object name) {
    return 'Welcome $name!';
  }

  @override
  String get connectionError => 'Connection error. Please try again.';

  @override
  String get serverConnectionError =>
      'Could not connect to server. Try refreshing.';

  @override
  String get noPermission =>
      'User not registered, please contact your administrator.';

  @override
  String get fetchEventsError => 'Error fetching events';

  @override
  String get guestUser => 'Guest';

  @override
  String get myCalendars => 'My Calendars';

  @override
  String get logout => 'Logout';

  @override
  String get selectCalendarMessage =>
      'Select a calendar from the menu to show its events';

  @override
  String get viewEventsBy => 'View Events by';

  @override
  String get day => 'Day';

  @override
  String get month => 'Month';

  @override
  String get allDay => 'All Day';

  @override
  String eventDateRange(Object endDate, Object startDate) {
    return 'From $startDate to $endDate';
  }

  @override
  String dayXofY(Object current, Object total) {
    return 'Day $current of $total';
  }
}
