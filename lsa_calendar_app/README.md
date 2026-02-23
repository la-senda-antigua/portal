# lsa_calendar_app

A new Flutter project.


# for building ios
flutter build ipa --release --dart-define=ENV_FILE=.env.testing
flutter build ipa --release --dart-define=ENV_FILE=.env.production
# for building android (apk)
flutter build apk --release --dart-define=ENV_FILE=.env.testing
flutter build apk --release --dart-define=ENV_FILE=.env.production
# for building android (aab)
flutter build appbundle --release --dart-define=ENV_FILE=.env.testing
flutter build appbundle --release --dart-define=ENV_FILE=.env.production

# for creating splash screen
dart run flutter_native_splash:create
# for creating icon
dart run flutter_launcher_icons

# for generating language files
flutter gen-l10n