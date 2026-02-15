// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Spanish Castilian (`es`).
class AppLocalizationsEs extends AppLocalizations {
  AppLocalizationsEs([String locale = 'es']) : super(locale);

  @override
  String get usernameLabel => 'Usuario';

  @override
  String get passwordLabel => 'Contraseña';

  @override
  String get loginButton => 'Iniciar Sesión';

  @override
  String get appleLoginButton => 'Continuar con Apple';

  @override
  String get googleLoginButton => 'Continuar con Google';

  @override
  String get loggingIn => 'Iniciando sesión...';

  @override
  String get enterCredentials => 'Por favor ingrese usuario y contraseña';

  @override
  String get loginError => 'Usuario o contraseña incorrectos';

  @override
  String get loginCancelled => 'Inicio de sesión cancelado';

  @override
  String get googleTokenError => 'Error al obtener token de Google';

  @override
  String welcomeMessage(Object name) {
    return 'Bienvenido $name!';
  }

  @override
  String get connectionError =>
      'Error de conexión. Por favor intente de nuevo.';

  @override
  String get serverConnectionError =>
      'No se pudo conectar al servidor. Intente refrescar.';

  @override
  String get noPermission =>
      'Usuario no registrado, por favor contacte al administrador.';

  @override
  String get fetchEventsError => 'Error al obtener eventos';

  @override
  String get guestUser => 'Invitado';

  @override
  String get myCalendars => 'Mis Calendarios';

  @override
  String get logout => 'Cerrar Sesión';

  @override
  String get selectCalendarMessage =>
      'Seleccione un calendario del menú para mostrar sus eventos';

  @override
  String get viewEventsBy => 'Ver eventos por';

  @override
  String get day => 'Día';

  @override
  String get month => 'Mes';

  @override
  String get allDay => 'Todo el día';

  @override
  String eventDateRange(Object endDate, Object startDate) {
    return 'Del $startDate al $endDate';
  }

  @override
  String dayXofY(Object current, Object total) {
    return 'Día $current de $total';
  }
}
