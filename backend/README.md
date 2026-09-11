# Interview Prep — backend runbook

PocketBase (single Go binary + one SQLite file) holding student progress, with
its own admin UI as the management console.

**Verified against PocketBase v0.40.3.** The migration in `pb_migrations/` was
written against that release's collection API (`fields`, not the pre-0.23
`schema`). If you run a much newer version and the migration errors, the field
table at the bottom of this file tells you what to create by hand.

## What this stores, and what it does not

| Synced | Never leaves the phone |
|---|---|
| Score, the six criteria, category, course, question id | **The answer text** — the spoken self-introduction |
| Words, key-point coverage, seconds spent | The audio (never recorded anywhere, not even locally) |
| Timestamp, and the student's Google display name | Email is used for sign-in only, not stored by us |

`progress` has no column for answer text. Even if a future client sent it, there
is nowhere to put it. That is deliberate — see the header comment in the
migration.

> **One thing this table does not cover.** The optional AI evaluation feature
> does send answer text — to a Cloudflare Worker, not here. It is off by default,
> needs its own separate consent from the student, and never touches this server
> or this database. See `backend/worker/README.md`.

## 1. What you need

- A small Linux box. **Oracle Cloud Always Free** (ARM, 4 vCPU / 24 GB) costs
  nothing indefinitely; Hetzner CX22 is ~€4/mo and easier to get. 1 vCPU and
  512 MB is genuinely enough for a few hundred students.
- **A domain name.** Google will not accept an IP address as an OAuth redirect
  target, so this is not optional. A `*.duckdns.org` subdomain is free and works
  with Let's Encrypt. Point an `A` record at the server.

Below assumes `api.interviewprep.example` — substitute yours everywhere.

## 2. Install

```bash
sudo useradd -r -s /bin/false -m -d /opt/pocketbase pocketbase
cd /opt/pocketbase
# check the current release first: https://github.com/pocketbase/pocketbase/releases
sudo -u pocketbase curl -fsSL -o pb.zip \
  https://github.com/pocketbase/pocketbase/releases/download/v0.40.3/pocketbase_0.40.3_linux_arm64.zip
sudo -u pocketbase unzip pb.zip && sudo -u pocketbase rm pb.zip
```

Use `linux_amd64` instead if the box is x86. Then copy the migration up:

```bash
sudo -u pocketbase mkdir -p /opt/pocketbase/pb_migrations
sudo install -o pocketbase -g pocketbase -m 644 \
  pb_migrations/1757200000_interview_prep_init.js /opt/pocketbase/pb_migrations/
```

PocketBase binds :80 and :443 itself and gets its own Let's Encrypt certificate —
no nginx or Caddy needed. Let it hold the low ports without running as root:

```bash
sudo setcap 'cap_net_bind_service=+ep' /opt/pocketbase/pocketbase
```

## 3. Run it as a service

`/etc/systemd/system/pocketbase.service`:

```ini
[Unit]
Description=PocketBase — Interview Prep
After=network.target

[Service]
Type=simple
User=pocketbase
Group=pocketbase
WorkingDirectory=/opt/pocketbase
ExecStart=/opt/pocketbase/pocketbase serve \
  --http=0.0.0.0:80 --https=0.0.0.0:443 \
  --dir=/opt/pocketbase/pb_data \
  --migrationsDir=/opt/pocketbase/pb_migrations
Restart=always
RestartSec=5
LimitNOFILE=8192
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=/opt/pocketbase/pb_data

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload && sudo systemctl enable --now pocketbase
sudo journalctl -u pocketbase -f
```

Migrations apply on start. You should see the three collections created in the
log. If it reports a migration error, stop and read it before going further —
a half-applied schema is worse than none.

## 4. Create your superuser

```bash
sudo -u pocketbase /opt/pocketbase/pocketbase superuser create \
  you@example.com 'a-long-random-password' --dir=/opt/pocketbase/pb_data
```

Admin UI: `https://api.interviewprep.example/_/`

This account is the whole backend. Put the password in a password manager and
turn on 2FA in the admin UI under your account settings.

## 5. Google sign-in

Two sides. Do PocketBase first so you know the redirect URI.

### PocketBase side

Admin UI → **Collections → users → Options → OAuth2** → enable, add **Google**,
paste the Client ID and **Client secret**.

The secret lives server-side only. This is why sign-in moves to PocketBase: the
old in-app flow could never hold a secret, so it could only read a display name
out of a token. Now you get real sessions.

### Google Cloud Console side

**This supersedes the guidance for the old browser-only flow.** That flow needed
a JavaScript origin and no redirect URI. This one is the reverse.

APIs & Services → Credentials → your **Web application** OAuth client:

| Field | Value |
|---|---|
| **Authorized redirect URIs** | `https://api.interviewprep.example/api/oauth2-redirect` |
| **Authorized JavaScript origins** | Not needed. Harmless to leave `https://msavtc-web2025.github.io` in place. |

That path is exact — `/api/oauth2-redirect`, registered by PocketBase for both
GET and POST. No trailing slash. Wrong or missing here gives
`Error 400: redirect_uri_mismatch`, which is a *different* error from the
`origin_mismatch` you hit before, so the message tells you which side is wrong.

Also on the **OAuth consent screen**: if publishing status is **Testing**, only
listed test users can sign in. Click **PUBLISH APP** — the scopes
(`openid`, `email`, `profile`) are non-sensitive, so it publishes with no review.
Set the app name to `Interview Prep`; students see it in the consent dialog.

## 6. Make yourself an instructor

Sign in once through the app so a `users` record exists. Then in the admin UI →
**instructors → New record** → pick your user.

Nothing in the API can add rows to `instructors` — every rule on it is `null`,
so only a superuser in this UI can grant class-wide visibility. That is the one
thing standing between a student and everyone else's scores, which is why role
is not a field on `users`: PocketBase has no per-field rules, so a student who
can edit their own record could otherwise promote themselves.

Create your classes under **batches**, then set each student's `batch` on their
`users` record.

> A student *can* change their own `batch` (rules are per record, not per field).
> Worst case is a mis-filed student, not a data leak. If that matters, move the
> assignment into a `pb_hooks` guard.

## 7. Backups

PocketBase can do this itself: **Settings → Backups** → enable, set a cron, and
point it at S3-compatible storage (Backblaze B2's free tier is fine). Do that
rather than trusting the local disk.

Belt and braces, nightly to disk:

```bash
sudo tee /etc/cron.daily/pb-backup >/dev/null <<'SH'
#!/bin/sh
d=/var/backups/pocketbase; mkdir -p "$d"
sqlite3 /opt/pocketbase/pb_data/data.db ".backup '$d/data-$(date +%F).db'"
find "$d" -name 'data-*.db' -mtime +30 -delete
SH
sudo chmod +x /etc/cron.daily/pb-backup
```

Use `.backup`, not `cp` — copying a live SQLite file can capture a torn write.

Restore is: stop the service, drop the file back as `pb_data/data.db`, start.
**Test that once now**, while it does not matter.

## 8. Upgrading

```bash
sudo systemctl stop pocketbase
sudo -u pocketbase cp /opt/pocketbase/pb_data/data.db /tmp/pre-upgrade.db
# replace the binary, then:
sudo systemctl start pocketbase && sudo journalctl -u pocketbase -n 50
```

PocketBase is pre-1.0 and occasionally breaks things between minor versions.
Read its release notes, and never upgrade straight after a class.

## 9. Check it works

```bash
curl -s https://api.interviewprep.example/api/health
```

Unauthenticated reads must be refused — this is the check that matters:

```bash
curl -s -o /dev/null -w '%{http_code}\n' \
  https://api.interviewprep.example/api/collections/progress/records
```

`400` or `403` is correct. **`200` means your rules are wrong — stop and fix
that before any student signs in.**

## The schema, if you ever need to rebuild it by hand

**batches** — a class. `name*`, `institute`, `year`, `notes`.
List/View `@request.auth.id != ""`; everything else `null`.

**instructors** — who sees the whole class. `user*` (relation → users, cascade),
`batches` (relation → batches, multi), `note`. **All five rules `null`.**
Unique index on `user`.

**progress** — one answered question. `user*` (relation → users, cascade),
`cid*`, `course*`, `category`, `question`, `mode` (select: interview/technical),
`overall*`, `communication`, `sentences`, `thought`, `speech_grammar`,
`accuracy`, `coherence`, `words`, `coverage`, `secs`, `missed` (json),
`answered_at*` (date), `created` (autodate).

- List/View: `user = @request.auth.id || @request.auth.id ?= @collection.instructors.user`
- Create: `@request.auth.id != "" && user = @request.auth.id`
- Update: `null` — append-only, so scores cannot be edited after the fact
- Delete: `user = @request.auth.id` — a student can erase their own data
- **Unique index on (`user`, `cid`)** — this is what makes the phone's offline
  queue safe to retry. Without it, every reconnect duplicates rows.

**users** — adds `batch`, `institute`, `consent_at`. List/View widened to
`id = @request.auth.id || @request.auth.id ?= @collection.instructors.user`.
