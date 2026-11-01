# AI evaluation proxy — Cloudflare Worker

The offline scorer in `scoring.js` counts key words. It cannot tell a real answer
from one that merely contains the right words — `I like cricket and my favourite
food is pizza with speed and feed tool` scores 7.3 out of 10 on a question about
feed rate, because those words genuinely are present in a genuine sentence.
Telling that apart needs something that reads meaning.

This Worker is the piece that lets the app do that **without putting an API key
on the student's phone**. The phone POSTs an answer here; the Worker adds the
key, calls Gemini, and returns a small fixed-shape JSON object.

**The feature is off until you do all three steps below.** With `JUDGE_URL` empty
in `judge.js`, the app never shows the setting and behaves exactly as before.

---

## What reaches this Worker

| Sent | Not sent |
|---|---|
| The question text | The student's name |
| The answer text they spoke | Their email or any user id |
| The model answer and key points from the question bank | Anything from their progress history |
| A language code (`en` / `gu` / `hi`) | The audio — never recorded anywhere |

`judge.js` builds that payload in `payload()`. Nothing identifying is in it, and
this Worker has no concept of who a student is.

**This is the one place answer text leaves the phone.** It only happens when the
student has read the explanation in Settings and pressed *Turn on AI evaluation*,
which is off by default and separate from the progress-backup consent.

---

## 1. Get a Gemini key

[aistudio.google.com](https://aistudio.google.com/apikey) → **Create API key**.
No credit card. The free tier is roughly 15 requests/minute and 1,500/day, which
comfortably covers a classroom given the client caches repeat answers.

> **Do not enable billing on that Google Cloud project.** The moment you do, the
> free tier stops applying to it and every call bills from the first token. If
> you need billing for something else, use a separate project for this key.

Model ids change. `gemini-flash-latest` is the default here; check the current
list at [ai.google.dev/gemini-api/docs/models](https://ai.google.dev/gemini-api/docs/models)
and set `GEMINI_MODEL` if you want to pin a specific version.

## Groq first, Gemini behind

Interview marking and voice answers go to **Groq** first (`groq.js`) and only
fall back to **Gemini** when every Groq model is used up or failing. They are
separate free allowances, so a class has two pools instead of one.

| Step | Order tried |
|---|---|
| Mark a typed answer (`/`) | `llama-3.3-70b-versatile` → `openai/gpt-oss-120b` → `openai/gpt-oss-20b` → `gemini-3.1-flash-lite` → `gemini-3.6-flash` |
| Voice answer (`/answer`, `/transcribe`) | Groq Whisper (`whisper-large-v3-turbo` → `whisper-large-v3`) writes it down, then the row above marks it; if Whisper is out, Gemini reads the recording itself |

**Gujarati goes to Gemini first** - typed and spoken - because Gemini hears
and writes Gujarati far better than Whisper and Llama (tried live,
2026-11-01); Groq is its backup. English and Hindi go to Groq first.

The **chapter quiz never calls the Worker**: it is checked on the phone
against the book answer (`quiz.js`).

**Quota.** A model that answers 429 (quota used up) is not asked again: it
rests - for the provider's own delay on a per-minute limit, for half an hour
on a per-day one - and the next model gets one go. When every model is
resting the app is told `{"error":"ai_busy","retry_after":…}` at once, and
the phone marks answers itself until then. Each attempt is one log line in
`wrangler tail`, with the provider, the model and, on a 429, which limit:

```
{"via":"groq","model":"llama-3.3-70b-versatile","attempt":1,"ms":412,"result":"upstream_429","limit":"per_day","quota_id":"groq-RPD","retry_s":1200}
```

**Setup:** make a free key at [console.groq.com/keys](https://console.groq.com/keys)
(no card) and give it to the Worker:

```bash
wrangler secret put GROQ_API_KEY
```

Without it the Worker uses Gemini alone, as before. Groq retires models from
time to time ([its model list](https://console.groq.com/docs/models)); to
change them without touching code, set `GROQ_MODELS` and `GROQ_STT_MODELS`
(comma-separated) as secrets.

## The two endpoints

| Path | Body | Returns |
|---|---|---|
| `/` | the question and the student's answer, as text | the six scores and advice |
| `/transcribe` | a recording of the student answering | `{text}` |
| `/access` | a student's access code | a token for that phone (`students.js`) |
| `/me` | (the token) | is this phone still allowed? |
| `/progress` | (the token) chapter quiz attempts and interview scores | `{ok}` — saved in Supabase |

The last three, and the access check on the first two, are off until the
Supabase secrets are set — see [`../supabase/README.md`](../supabase/README.md).
Once they are, `/` and `/transcribe` answer only a phone with a valid token.

`/transcribe` exists because Android will not give a web page a microphone that
stays open across a whole answer. `dictation.js` records the answer in one piece
and sends it here; the audio is transcribed and dropped. It is never stored,
never logged (only its size is), and never reaches the progress database.

It is only reached if `DICTATION_URL` is filled in on the client, so deploying
this Worker does not by itself start any recording.

Audio is far larger than text, so that path has its own 8 MB ceiling — roughly
four minutes of the 16 kHz mono WAV the client sends, comfortably past the
client's own 3-minute limit.

## 2. Deploy the Worker

```bash
npm install -g wrangler
```

```bash
wrangler login
```

`wrangler.toml` is already in this folder:

```toml
name = "interview-judge"
main = "interview-judge.js"
compatibility_date = "2024-11-01"
```

Then deploy and set the key as a secret (a secret is encrypted and never shows
in the dashboard or in `wrangler.toml` — do not put the key in a `[vars]` block):

```bash
wrangler deploy
```

```bash
wrangler secret put GEMINI_API_KEY
```

Wrangler prints the URL, something like
`https://interview-judge.<your-account>.workers.dev`.

## 3. Point the app at it

In `judge.js`, line 32:

```js
const JUDGE_URL = "https://interview-judge.<your-account>.workers.dev";
```

Bump `CACHE` in `sw.js` so installed phones pick up the change, and redeploy the
site. The **AI evaluation** section now appears in Settings, switched off.

---

## Lock it down before sharing the link

Until you set `ALLOWED_ORIGINS`, anyone who finds the URL can spend your quota.

```bash
wrangler secret put ALLOWED_ORIGINS
```

Give it the exact origin the app is served from, comma-separated if more than
one — scheme and host only, no path:

```
https://msavtc-web2025.github.io
```

With that set, a request from any other origin gets `403 bad_origin`, and so does
a request with no `Origin` header at all (which is what `curl` sends). This is
modest protection — a determined person can forge an origin header outside a
browser — but it stops casual copying of the URL. The real ceiling is Gemini's
own free-tier quota.

### Optional: a per-IP daily cap

Create a KV namespace, bind it as `RATE`, and set `DAILY_LIMIT`:

```bash
wrangler kv namespace create RATE
```

Add the binding it prints to `wrangler.toml`, then:

```bash
wrangler secret put DAILY_LIMIT
```

With `DAILY_LIMIT` unset or `0`, no counting happens and KV is never touched.
Note the KV free tier allows 1,000 writes/day, and each evaluated answer is one
write — so this caps abuse, not scale.

---

## Checking it works

```bash
curl -X POST https://interview-judge.<your-account>.workers.dev -H "Content-Type: application/json" -H "Origin: https://msavtc-web2025.github.io" -d '{"question":"What is feed rate?","answer":"Feed rate is how fast the tool moves into the job, in mm per minute.","lang":"en","mode":"technical"}'
```

You should get back `classification`, six `scores`, `overall`, `missed` and
`advice`. Errors are deliberately terse so nothing about the key can leak:

| Response | Meaning |
|---|---|
| `403 bad_origin` | `ALLOWED_ORIGINS` is set and this origin is not in it |
| `500 not_configured` | `GEMINI_API_KEY` secret was never set |
| `502 upstream_400` | Gemini rejected the request — usually a bad or expired key |
| `502 upstream_429` | Free-tier quota exhausted for now |
| `502 unparsable` | The model returned prose instead of JSON |
| `429 rate_limited` | Your own `DAILY_LIMIT` was hit |

Every one of these makes the app fall back to offline scoring silently. The
student still gets marked; they just do not get the AI badge. If you want to see
which is happening, open the Worker's live log:

```bash
wrangler tail
```

---

## If you ever turn it off

Set `JUDGE_URL` back to `""` in `judge.js` and redeploy the site. The setting
disappears, cached AI results on each phone are dropped the next time a student
switches the toggle, and everything reverts to offline scoring. Then:

```bash
wrangler delete
```
