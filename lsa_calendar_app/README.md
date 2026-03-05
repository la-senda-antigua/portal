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

# allowed signs for android envs
needs to be added in api credentials
home
28:1C:7B:22:9D:EB:D7:67:7D:44:AC:F2:A4:3F:48:6B:9C:28:FB:44
work
1D:35:3B:9D:5D:A7:79:3F:EA:EB:06:B7:FA:8D:B9:C5:B2:E9:3C:BF