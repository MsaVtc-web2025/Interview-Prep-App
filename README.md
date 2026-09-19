# Interview Prep — Android App (PWA)

An app that prepares vocational training students for job interviews.
An on-screen avatar **speaks the question in English**, the student **answers out
loud in English**, and the marks, advice and model answer come back **in
Gujarati**.

---

## App language — English · ગુજરાતી · हिन्दी

The home screen has a button for changing the **app language**. The default is
**English**. Changing it changes the whole interface, the marking notes, the
advice, the grammar corrections, the safety warnings, the course names and the
category names. The chosen language is remembered on the phone.

**The questions are always in English and the answer must be in English too** —
changing the language does not change that, because training students to answer
in English is the whole point of the app.

Only system fonts are used (Noto Sans Gujarati for Gujarati, Noto Sans Devanagari
for Hindi), so the app still renders correctly offline.

> **Still outstanding:** each question's `gu` (the model answer explanation) and
> `tip` are Gujarati only. With English or हिन्दी selected, those two parts show
> in Gujarati with a "not translated" note above them. How to add translations is
> described under "Adding a question" below.

---

## Eight modes

| Mode | Questions | Type |
|---|---|---|
| 💼 Interview (general) | 22 | HR / personal |
| 💻 Computer | 10 | technical |
| ⚙️ CNC machining | 10 | technical |
| ⚡ Electrician | 10 | technical |
| 🔧 Automobile | 10 | technical |
| 🔋 E-vehicle | 10 | technical |
| 🩺 Nursing | 10 | technical |
| 🔥 Welding | 10 | technical |

Progress is kept separately for each mode.

---

## Installing it on a phone

To run the app the files have to be served from a web address (HTTPS).

### Option 1 — GitHub Pages (free, permanent)

1. Create a new repository on github.com (Public).
2. Upload every file in this folder to it.
3. Settings → Pages → Source: `main` branch → Save.
4. Within two minutes you get a link like `https://<your-name>.github.io/<repo>/`.
5. Open that link in **Chrome** on the phone.
6. Chrome menu (⋮) → **Add to Home screen** → **Install**.

### Option 2 — testing from a computer

Open a terminal in this folder and run:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in a browser.
(Opening it as `file://` will not work — the scripts do not load.)

---

## Google sign-in

The first time the app opens it asks for a name. The student can type one, press
**Sign up with Google**, or press "maybe later" and carry on. The name is used
only to address them during the interview, and is stored on the phone.

The Client ID is at the top of `app.js` in `GOOGLE_CLIENT_ID`. A Client ID is
public information — it appears in the script of every web app.
**Never put the Client SECRET here.**

### Required for this to work — Authorized JavaScript origins

In Google Cloud Console → APIs & Services → Credentials → this OAuth client →
**Authorized JavaScript origins**, register the app's full address:

```
https://<your-name>.github.io
http://localhost:8123
```

- If the address is not registered, the button appears but Google returns an
  **origin_mismatch** error at sign-in.
- Write the whole origin including the port; do not write a path
  (`/interview-app/`).
- If the GitHub Pages address changes, it has to be changed there too.

**Only the name** is read from Google — no email or photo is stored, and no
permission depends on this token.

> Google's script is blocked inside an artifact (claude.ai), so the button does
> not appear there — use the name field instead. It works on your own address.

---

## Changing the interviewer's photo

Replace `interviewer.jpg` with another **square** file of the same name (around
480×480, under 50 KB). Nothing in the code needs changing — just bump the number
in `CACHE` in `sw.js`. If the photo is missing, the app draws a face itself, so
it never looks empty.

A photo cannot move its lips, so what the avatar is doing is shown by the badge
under the tile: sound bars while speaking, a red dot while listening, and three
dots while marking.

---

## Using the app

1. On the home screen, press the tile for the mode you want to practise.
2. The avatar asks the question in English.
3. Press **answer** and speak your answer in English. With **hands-free mode**
   on, the mic opens by itself once the question finishes and the answer is
   marked automatically when you stop speaking.
4. You get 1 to 10 on six criteria, notes in Gujarati, grammar corrections,
   advice and a model answer. The avatar also reads the feedback aloud in
   Gujarati.
5. Press **next question** when you are ready to move on.

If the mic will not work or there is no internet, press **⌨ type instead** and
type the answer — the marking is fully offline.

---

## Settings (⚙)

| Setting | What it does |
|---|---|
| Hands-free mode | Off by default. On, the mic opens by itself and the answer is submitted after a silence. Leave it off in a noisy workshop. |
| Speak the question | Turn off the avatar's voice |
| Read the feedback aloud | Reads the marks and advice aloud in Gujarati |
| Speaking speed | Slow / normal / fast |
| Silence time | 2 / 3 / 4.5 seconds — stay quiet this long and the answer counts as finished |

Lower down, the settings screen reports whether the phone has a microphone, an
English voice and a Gujarati voice.

---

## The six criteria

| On interview modes | On technical modes | What is measured |
|---|---|---|
| Clear communication | Clear communication | Answer length, relevance to the question, filler words |
| Complete sentences | Complete sentences | Full sentences with a subject and a verb |
| Clarity of thought | **Order of steps** | Whether the points are in a sensible, logical order |
| Grammar and word choice | Grammar and word choice | Grammar mistakes, filler words, Gujarati/Hindi words mixed in. (Pronunciation cannot be measured — Chrome returns text, not audio.) |
| Answer accuracy | **Technical accuracy** | Whether the expected points were covered |
| Coherence of speech | Coherence of speech | Whether the answer flows or sounds disjointed |

On technical modes **technical accuracy** carries the most weight and the length
requirement is relaxed — a short but correct technical answer can score full
marks.

### The safety gate

Some points on technical questions are **mandatory** — "emergency stop" on CNC,
"switch off the supply" for an electrician, "helmet" for welding, "wash your
hands" for nursing. Miss one and a red warning appears and the overall score is
**capped at 6**, because an answer like that is not accepted in industry.

---

## Things worth knowing

- **Speaking (text to speech):** works offline if the voice is downloaded on the
  phone. With no Gujarati voice the app stops speaking Gujarati (the text is
  still shown). To install one: phone **Settings → Language & input →
  Text-to-speech**.
- **Listening (speech to text):** Chrome's implementation **needs internet**.
  Without it, typing the answer still gives full marking.
- **Android closes the mic after every sentence** and the app reopens it, so on a
  long answer the student hears one "off... on" chime per sentence. No browser
  API can suppress that. `tools/mic-restart-test.html` checks that the gap stays
  as short as possible and that the mic always comes back.
- **The marking is automatic.** The offline scorer (`scoring.js`) runs entirely
  on the phone with no API key. It is guidance — it does not replace a teacher's
  judgement. "Accuracy" in particular is measured against a list of expected
  points, so a correct answer phrased differently can score low. See
  **AI evaluation** below for closer marking.
- **Data:** every answer is stored on the phone. The one thing that leaves it is
  **AI evaluation** (below), which sends the answer text for marking. That is
  separate from progress backup — backup sends only scores, never answer text.
- The mic and speaker stop by themselves when the app goes to the background or
  the screen turns off.
- **The phone's back button** behaves like the on-screen back button — it goes up
  one step (interview → course briefing → course list). On the three bottom tabs
  it takes two presses to exit, so nobody leaves an interview by accident.

---

## AI evaluation

The offline scorer counts key words; it does not understand meaning. On a
question about feed rate, an answer like "I like cricket and my favourite food is
pizza with speed and feed tool" scores 7.3 — the words genuinely are there in a
genuine sentence, but the understanding is not. Key words cannot tell those
apart.

With AI evaluation on, the same answer scores 2.8.

**This is currently on by default**, and the Cloudflare Worker at `JUDGE_URL` in
`judge.js` is live. To turn the whole feature off, empty `JUDGE_URL` — the
section then disappears from settings and the app is the offline app it was. A
student can also turn it off for themselves under **Profile → AI evaluation**,
and there is a switch on the interview screen itself so they can see who is
marking them before they answer.

To run it against your own Worker, follow `backend/worker/README.md` (free) and
put its address in `JUDGE_URL`.

| What is sent | What is not sent |
|---|---|
| The question, the student's answer, the model answer, the language | Name, email, any identity |
| — | Progress history |
| — | Audio, unless continuous dictation is switched on (see below) |

The API key never reaches the phone — it lives in the Worker. With no internet,
a Worker that is down, or a model that does not answer, the offline score is used
in every case and the student never notices. The safety gate stays offline: miss
a mandatory point and the score is capped at 6 whatever the AI says.

When the AI did the marking, a "✦ scored by AI" badge appears on the result —
never hide from the student who gave them their marks.

---

## Continuous dictation (optional, off by default)

Android does not give a web page a microphone that stays open. Its
`SpeechRecognition` ends the session after every sentence, plays a chime, and
hands control back a moment later. `continuous = true` is already set and
ignored. Words spoken in that moment are lost, and no setting in the Web Speech
API changes it.

`dictation.js` sidesteps the whole API. It opens **one** audio stream with
`getUserMedia` and holds it for the entire answer — no sessions, no restarts, no
chimes, no gaps. The student speaks for as long as they like, with whatever
pauses they like, and the mic is released only when they press the button.

Because the browser is then only a recorder, the audio has to be transcribed
somewhere. That is the same Worker the AI evaluation uses, on `/transcribe`.

**This changes two things you should decide on deliberately:**

| | SpeechRecognition (default) | Continuous dictation |
|---|---|---|
| Mic between sentences | Closed and reopened by Android | Stays open |
| The student's voice | Never leaves the phone | Recorded and sent for transcription |
| Without internet | Nothing transcribes either way; they type | Same — falls back automatically |
| Cost | Free | Transcription is charged per minute of audio |

The recording is transcribed and dropped. It is not stored, not logged, and
never reaches the progress backup.

To turn it on:

1. Redeploy the Worker from `backend/worker/` — it now answers on `/transcribe`.
2. Put that URL in `DICTATION_URL` at the top of `dictation.js`, ending in
   `/transcribe`.
3. Bump `CACHE` in `sw.js`.

Leave `DICTATION_URL` empty and none of this runs; the app behaves exactly as it
did before. It also falls back to `SpeechRecognition` on its own when the phone
is offline or has no microphone access, so there is no state in which a student
is left unable to answer.

While recording, a level bar under the status line moves with the student's
voice. That replaces the words-appearing-as-you-speak feedback of the old
engine, which continuous capture cannot provide — the transcript only exists
once the recording has been sent.

Recording stops on its own after `MAX_SECONDS` (3 minutes), with a warning on
screen for the last 20 seconds.

## File layout

| File | What it does |
|---|---|
| `index.html` | Screens and design |
| `i18n.js` | All text in three languages (interface + marking + grammar) |
| `i18n-content.js` | Translations for course names, category names and safety points |
| `courses.js` | Course registry — each bank registers itself here |
| `questions.js` | The 22 questions of the Interview (general) mode |
| `bank-*.js` | Question banks for the seven technical courses |
| `scoring.js` | Offline marking, grammar checks, the safety gate |
| `speech.js` | Speaking and listening (Web Speech API) |
| `dictation.js` | Optional continuous recording, transcribed by the Worker |
| `judge.js` | AI evaluation via the Worker |
| `avatar.js` | The on-screen interviewer (photo + status badge) |
| `interviewer.jpg` | The interviewer's photo (480×480 square) |
| `app.js` | App logic |
| `sw.js` | Offline support |
| `manifest.webmanifest` | App name and icons |
| `tools/*.html` | Developer test pages — open them in a browser, every line should be green |

> **Required:** whenever you change any file, bump the number in
> `CACHE = "interview-practice-v29"` in `sw.js` (v30, v31…). Otherwise phones
> that already have the app installed keep running the old version.

---

## Adding a question

Open the file for the mode you want (`questions.js`, `bank-cnc.js` and so on) and
add this template after the last question:

```js
{
  id: 11,
  cat: "સલામતી",                    // category name, in Gujarati
  q: "Question in English?",
  kw: [["keyword1", "synonym"], ["keyword2"]],
  must: [{ kw: ["emergency stop", "e-stop"], gu: "ઇમરજન્સી સ્ટોપ" }],
  gu: "Model answer and explanation, in Gujarati.",
  en: "Sample answer in English.",
  tip: "A specific hint, in Gujarati.",

  // Optional - explanation and tip for English and Hindi
  i18n: {
    en: { gu: "Explanation in English.", tip: "Special tip in English." },
    hi: { gu: "हिन्दी में समझ.",          tip: "हिन्दी में ख़ास सुझाव." }
  }
}
```

- In `kw`, each `[...]` is **one expected point**; matching any one of the words
  inside counts that point. The accuracy mark comes from this.
- `must` is **optional** and is only for mandatory points such as safety. Missing
  one caps the overall score at 6, so only put things there that genuinely
  warrant it.
- Write the question in English even on modes like electrician or welding —
  answering in English is the point of the training.
- `i18n` can be left out — that question's explanation then shows in Gujarati.
- **If you add a new `cat` or a new `must`**, add its translation to `CAT_I18N` /
  `MUST_I18N` in `i18n-content.js`. Without it the label shows in Gujarati; the
  app does not break.
- If you add any new line to the app (a button, a warning, a note), add that key
  in all three languages in `i18n.js`.

## Adding a course

1. Create a new `bank-<name>.js` file containing `registerCourse({ ... })`
   (start by copying any existing `bank-*.js`).
2. Add its `<script>` line in `index.html` after the other `bank-*.js` scripts.
3. Add the filename to `ASSETS` in `sw.js` and bump the `CACHE` number.

The tile appears on the home screen by itself — nothing else needs changing.
