# SkillSwap Mobile — Phase 3

Expo SDK 51 + React Navigation (native stack) + Supabase. Android APK via EAS Build.
No Android Studio required. Same Supabase project as the web app.

## File tree

```
skillswap-mobile/
  package.json
  app.json
  eas.json                  -> preview profile builds an APK
  babel.config.js
  App.js                    -> navigation + auth session gate
  src/
    theme.js
    lib/supabase.js         -> PASTE YOUR KEYS HERE
    components/
      Button.js  Field.js  Card.js  Chip.js  TabBar.js
    screens/
      LoginScreen.js
      DashboardScreen.js
      BrowseScreen.js
      TeacherScreen.js
      SessionsScreen.js
      WalletScreen.js
      ProfileScreen.js
```

## Step 1 — paste your Supabase keys (do this FIRST)

Open `src/lib/supabase.js`. Replace these two lines with your real values:

```js
const SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
const SUPABASE_ANON_KEY = "YOUR-ANON-PUBLIC-KEY";
```

Same project as the web app. Anon public key only.
If you skip this, the app builds fine and then fails to log in — the exact bug
you hit last time.

## Step 2 — install

```
cd C:\Users\you\projects\skillswap-mobile
npm install
```

## Step 3 — test on your phone before building the APK

```
npx expo start
```

Install "Expo Go" from the Play Store, scan the QR code in the terminal.
The whole app runs live and reloads on save. Do all your testing here — an EAS
build takes 10-15 minutes, Expo Go takes 3 seconds.

Log in with the same account you made on the web app. Your balance and sessions
should match exactly, because it is the same database.

## Step 4 — build the APK

```
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```

`eas build:configure` fills in the `projectId` in `app.json` automatically.
The build runs on Expo's servers. When it finishes, the terminal prints a
download URL. Open it on your phone, download the `.apk`, tap it, allow
"install from unknown sources", done.

## Step 5 — verify

On the APK (not Expo Go):
1. Log in as an existing web account.
2. Dashboard shows the same balance as the web app.
3. Browse shows the other account.
4. Request a session -> balance drops immediately.
5. Open the web app -> the same request is sitting in Sessions -> Pending.

That cross-checks both clients against one backend, which is the whole point.

## Notes and known limits

- Data loads on screen focus, not in realtime. Pull down to refresh on
  Dashboard and Wallet; navigating away and back refreshes the others.
- Scheduled time is a plain text field in `YYYY-MM-DD HH:MM` format. A native
  date picker needs `@react-native-community/datetimepicker`, which is one more
  dependency and one more thing to break. Text is fine for MVP.
- Navigation is a native stack plus a custom bottom `TabBar` component. This
  keeps the dependency list to exactly what you specified.
- No HTML form tags anywhere. Every action is a `TouchableOpacity` with `onPress`.

## Common errors

- **Blank white screen on launch** -> placeholder keys still in `src/lib/supabase.js`.
- **"Network request failed"** -> wrong Supabase URL, or phone has no internet.
- **Login works on web but not mobile** -> "Confirm email" is still ON in Supabase.
- **`URL.protocol is not implemented`** -> the `react-native-url-polyfill/auto`
  import was moved or deleted. It must be the first line of `src/lib/supabase.js`.
- **`eas build` fails on the `projectId`** -> run `eas build:configure` first.
