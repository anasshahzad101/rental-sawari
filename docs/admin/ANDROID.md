# Admin app for Android

`android/` is a small Android app (a Trusted Web Activity) that opens
`https://rentalsawari.com/admin` full screen, with its own icon and no
browser bar. Every screen comes from the website, so admin changes go live
with the normal deploy. The APK only needs rebuilding if the app's name,
icon or colours change.

GitHub builds the APK (`.github/workflows/android-app.yml`) and puts it at
one link that never changes:

**https://github.com/anasshahzad101/rental-sawari/releases/download/android-app/RentalSawari-Admin.apk**

## One-time setup: add the signing key to GitHub

The key was made on the owner's PC and lives in
`Documents\RentalSawari-Android-Key` (back that folder up; it never goes in
the repository). Add two secrets on GitHub:

1. Open the repository on GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
2. Name `ANDROID_KEYSTORE_BASE64`. Value: the whole content of `github-secret-ANDROID_KEYSTORE_BASE64.txt`.
3. Name `ANDROID_KEYSTORE_PASSWORD`. Value: the content of `github-secret-ANDROID_KEYSTORE_PASSWORD.txt`.

## Build the app

1. GitHub → **Actions** → **Android admin app** → **Run workflow** → **Run workflow**.
2. Wait about 3–5 minutes for the green tick. The APK is now at the link above.

It also builds by itself whenever something in `android/` changes. Without
the secrets it only makes a test build (an artifact on the run, not published).

## Install on the phone

1. Open the link above on the Android phone and download the APK.
2. Tap it. If Android asks, allow your browser to **install unknown apps**, then **Install**.
3. Open **RS Admin** and log in once. The login lasts 30 days, like in Chrome.

To update, install a newer APK over the old one. It must be signed with the
same key, which the workflow does.

## How it fits together

- `public/.well-known/assetlinks.json` tells Android that the app signed with
  our key may show rentalsawari.com without a browser bar. If the bar shows,
  this file isn't reachable or the key's fingerprint doesn't match
  (`fingerprint.txt` in the key folder).
- `public/admin/manifest.webmanifest`, the `app-icon-*` images and
  `app/(admin)/admin/sw.js` make the admin installable from Chrome too, and
  show an offline page when there's no connection. The service worker caches
  nothing.
- Links to `rentalsawari.com/admin/...` (for example in the "new request"
  emails) open in the app.

## Play Store (optional, later)

The same APK setup works for the Play Store ($25 one-time developer account).
Play needs an `.aab` instead of an `.apk` (`gradle bundleRelease`) and, with
Play App Signing, a second fingerprint added to `assetlinks.json`.
