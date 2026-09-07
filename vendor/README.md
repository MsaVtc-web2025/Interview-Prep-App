# vendor/

Third-party code copied in on purpose rather than loaded from a CDN.

The app has to work with no internet, and it is installed as a PWA whose service
worker caches every asset listed in `sw.js`. A CDN `<script>` would be a runtime
dependency on a host we do not control, so anything we need lives here and gets
cached like the rest of the app.

## pocketbase.umd.js

- **Version:** 0.28.1
- **Source:** `https://cdn.jsdelivr.net/npm/pocketbase@0.28.1/dist/pocketbase.umd.js`
- **Upstream:** https://github.com/pocketbase/pocketbase-js-sdk
- **Licence:** MIT, © PocketBase authors

Used for Google OAuth2 and for writing `progress` records. Hand-rolling the
OAuth2 popup and PKCE exchange was the alternative; the SDK is 40 KB and already
correct.

Pair it with a server on the same major line — this is the 0.28.x client against
the PocketBase v0.40.x server documented in `backend/README.md`. To update, drop
in a new file, bump the `CACHE` constant in `sw.js`, and check sign-in still
works.
