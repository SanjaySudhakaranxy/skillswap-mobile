# SkillSwap Mobile

SkillSwap is an Expo/React Native app for exchanging skills through scheduled learning sessions and SkillCoins. It uses Supabase for authentication and data, and supports Android builds through Expo or the GitHub Actions workflow.

## Features

- Email/password sign-in and sign-up
- Dashboard for SkillCoin balance, completed sessions, and upcoming sessions
- Teacher search by name or skill
- Session requests, teacher approval, completion confirmation, and refunds
- Wallet transaction history
- Editable user profile, skills, bio, and session cost

## Tech stack

- Expo SDK 51 and React Native 0.74
- React Navigation native stack
- Supabase authentication and database
- Jest for unit tests
- GitHub Actions for automated tests and Android debug APK artifacts

## Prerequisites

- Node.js 20 or later
- npm
- A Supabase project configured for SkillSwap
- Expo Go on an Android device, or an Android emulator, for local app testing

## Install and run

```bash
npm install
npm start
```

Scan the Expo QR code with Expo Go, or start Android directly:

```bash
npm run android
```

## Configure Supabase

Update the Supabase URL and anonymous key in [src/lib/supabase.js](src/lib/supabase.js). Use the project's **anon/public** key only�never put a service-role key in the mobile app.

The app expects Supabase data for profiles, sessions, and transactions, plus the RPC functions used by the screens:

- `request_session`
- `respond_session`
- `confirm_session`

## Testing

The project includes 45 unit tests for authentication validation, profile and skill rules, time parsing, teacher search, wallet calculations, transaction labels, and session-state logic.

```bash
npm run test:unit
```

The command reports the result in the terminal. To generate a JUnit XML report locally:

```bash
JEST_JUNIT_OUTPUT_DIR=reports/junit JEST_JUNIT_OUTPUT_NAME=unit-tests.xml npm run test:unit
```

On PowerShell:

```powershell
$env:JEST_JUNIT_OUTPUT_DIR='reports/junit'
$env:JEST_JUNIT_OUTPUT_NAME='unit-tests.xml'
npm run test:unit
```

## Continuous integration

The workflow in [.github/workflows/appium.yml](.github/workflows/appium.yml) has a 10-minute timeout and runs on pushes and pull requests to `main`.

It performs the following work:

1. Installs dependencies.
2. Generates the Android project.
3. Builds the debug APK.
4. Runs the 45 unit tests.
5. Publishes a workflow summary and uploads artifacts.

Artifacts available from each run:

- `app-debug-apk` � `app-debug.apk`
- `test-report` � JUnit XML test report

## Project structure

```text
App.js                 Authentication gate and navigation
src/components/        Shared UI components
src/screens/           App screens
src/lib/appLogic.js    Reusable, unit-tested business rules
src/lib/supabase.js    Supabase client configuration
test/unit/             45 Jest unit tests
.github/workflows/     CI workflow
```

## Android APK

The easiest way to obtain a debug APK is from the `app-debug-apk` artifact in a successful GitHub Actions run.

For a local Android build, first generate the native project, then build it:

```bash
npx expo prebuild --platform android
cd android
./gradlew assembleDebug
```

The generated APK is located at:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## Troubleshooting

- **Login or data loading fails:** verify the Supabase URL/key and device internet connection.
- **Android build fails:** delete the generated `android` directory only if you intend to regenerate it, then run `npx expo prebuild --platform android` again.
- **CI artifact is missing:** open the workflow run and check the build step before the upload step.
- **Tests fail:** run `npm run test:unit` locally and use the failed test name to locate the relevant rule in `src/lib/appLogic.js`.

## License

This repository is private unless a license is added.
