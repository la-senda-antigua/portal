# lsa_calendar_app

A new Flutter project.


# for building ios
flutter build ipa --release --dart-define=ENV_FILE=.env.testing
flutter build ipa --release --dart-define=ENV_FILE=.env.production
# for building android
flutter build apk --release --dart-define=ENV_FILE=.env.testing
flutter build apk --release --dart-define=ENV_FILE=.env.production

# for creating splash screen
dart run flutter_native_splash:create
# for creating icon
flutter pub run flutter_launcher_icons:main