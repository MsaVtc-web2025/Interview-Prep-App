# Student access and results — Supabase

MSA-VTC (Muniseva Ashram Vocational Training Centre) decides who may use the
Interview Prep app. Each student gets an **access code**; without one the app
shows only the "Enter your access code" screen, and the AI server refuses to
mark or transcribe anything. Their scores come back to the institute, where the
admin page (`admin.html`) shows them chapter by chapter.

```
 Student's phone ──code──▶ Cloudflare Worker ──service key──▶ Supabase (students, scores)
 (access.js)     ◀─token──  (students.js)                         ▲
                                                                  │ email + password,
                                          admin.html ─────────────┘ row-level security
```

* **Students never talk to Supabase.** The Worker checks the code and writes
  their scores with the service key, which exists only as a Worker secret.
* **The admin page** uses the public anon key plus your sign-in. Row-level
  security opens the tables only to accounts listed in `public.admins`; the
  anon key alone reads nothing.
* **Only scores leave the phone** — right/partial/wrong counts, percentages,
  interview scores, dates. Never what the student said or typed.
* **Students sign themselves in.** The first screen asks for their first
  name, last name and mobile number; the access code comes last. What they
  type is kept next to the name you entered, and a different name shows on
  the admin page as "Signed up as ..." - often a typo, sometimes a shared code.
* **A code works on any number of phones.** Change it from the admin page and
  every phone using the old code asks for the new one (within a minute when
  online). Turning a student off or deleting them works the same way.
* **Offline still works.** A phone that has been let in keeps working without
  internet; its results wait on the phone and go when it is back online.

Until every step below is done, nothing changes for students: the Worker
answers "codes are off" until it has all three Supabase secrets, and the app
then lets everyone in as before. The moment the third secret is set, every
phone asks for a code.

**One code for everyone** (admin page, *Sign-up code for everyone*): students
type the same code with their own name and mobile number, and each gets a
record of their own - found again by mobile number + first name on a new
phone. Personal codes and sign-up codes can be used side by side.

---

## 1. Create the Supabase project (free)

1. Sign up at [supabase.com](https://supabase.com) with the institute's Google
   account, and create a **new project**: name `msa-vtc-interview-prep`, region
   **Mumbai (ap-south-1)**. Keep the database password somewhere safe.
2. **SQL Editor → New query**, paste all of [`schema.sql`](schema.sql), **Run**.
   It is safe to run again later - and it must be run again whenever
   `schema.sql` changes (it only adds what is missing; no data is lost).

## 2. Your admin login

1. **Authentication → Sign In / Providers**: turn **off** "Allow new users to
   sign up". Only accounts you create can sign in.
2. **Authentication → Users → Add user → Create new user**: your email and a
   strong password (tick *Auto Confirm User*). Repeat for each instructor.
3. **SQL Editor**, once per admin (with their email):

   ```sql
   insert into public.admins (user_id, email)
   select id, email from auth.users where email = 'instructor@greenashram.org';
   ```

## 3. Connect the admin page

**Project Settings → API Keys.** At the top of `admin.js`:

```js
const SUPABASE_URL = "https://<project-ref>.supabase.co";
const SUPABASE_ANON_KEY = "<the anon / publishable key>";
```

The anon (publishable) key is meant to be public. **Never** put the
`service_role` / secret key in any file in this repository.

## 4. Give the Worker the keys

From `backend/worker`, set three secrets. Each command asks you to paste the value:

```bash
wrangler secret put SUPABASE_URL
```

```bash
wrangler secret put SUPABASE_SERVICE_KEY
```

```bash
wrangler secret put ACCESS_SECRET
```

* `SUPABASE_URL` — the same `https://<project-ref>.supabase.co`.
* `SUPABASE_SERVICE_KEY` — **Project Settings → API Keys**, the `service_role`
  (or new `sb_secret_…`) key.
* `ACCESS_SECRET` — any long random text; it signs the phones' tokens. One way
  to make one:

  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```

  Changing it later signs every phone out at once.

Then deploy the Worker:

```bash
wrangler deploy
```

From this moment AI marking needs a code, so do step 5 right after.

## 5. Add students, then switch the app on

1. Open `https://<your-site>/admin.html`, sign in, and add your students —
   **+ Add a batch** takes a list of names and makes a code for each. Print or
   download the codes to hand out.
2. In `access.js`, set
   `const ACCESS_URL = "https://interview-judge.msa-vtc.workers.dev";`, bump
   `CACHE` in `sw.js`, and publish the site.
3. Every phone now asks for a code the next time the app opens online. Test with
   one code before handing them all out.

## Day to day

| To… | In admin.html |
|---|---|
| Add one student / a class | **+ Add student** / **+ Add a batch** |
| Give someone a new code (lost, or shared it) | Open the student → **Change code** |
| Change every code in a batch (e.g. new term) | Choose the batch → **Change codes for this batch** |
| Stop someone using the app | Open the student → untick **Access is on** → Save |
| End access on a date | **Access ends on** (the whole batch can be added with one) |
| Limit AI marking | **AI marks per day** (150 by default) |
| See results | Click a student: chapter by chapter (attempts, best, last, average), interview practice, latest attempts, phones used |
| Take it to Excel / Sheets | **Download list (CSV)**, or **Download this student's results** |

**Many phones on one code** (see *Phones used*) usually means the code was
shared — change it.

**A phone shared by several students** (at the centre): Profile → Institute →
**Switch student**. It sends that student's results, clears the phone, and asks
for the next code.

## Limits of the free plan

* 500 MB of database — years of results for a few hundred students.
* **The project pauses after 7 days with no activity.** Students using the app
  keep it awake. After a holiday, open the Supabase dashboard and press
  *Restore*; nothing is lost. While it is paused, phones already signed in keep
  working offline and send their results later.

## Charts and insights (optional)

The admin page covers day-to-day needs. For charts — class averages by chapter,
progress over weeks, batch against batch — connect **Google Looker Studio**
(free) with a read-only login:

1. Put your own password in [`insights.sql`](insights.sql) and run it in the SQL
   Editor. The login `report_reader` can read results and names, but not
   access codes or phone numbers, and can change nothing.
2. Supabase → **Connect** → **Session pooler**: note the host and port.
3. [lookerstudio.google.com](https://lookerstudio.google.com) → Create → Data
   source → **PostgreSQL**: that host and port, database `postgres`, user
   `report_reader.<project-ref>`, your password, tick *Enable SSL*.
4. Use the tables `chapter_progress`, `interview_progress`, `quiz_attempts`,
   `interview_answers` and `report_students` (join on `student_id` = `id`).
