-- MSA-VTC (Muniseva Ashram Vocational Training Centre) - Interview Prep
-- Students, their access codes, and the scores the app sends in.
--
-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Running it again is safe: it only creates what is missing.
--
-- Who can reach what:
--   * Students never talk to Supabase. The app talks to the Cloudflare Worker,
--     which checks the access code and writes here with the service-role key
--     (that key bypasses row-level security and lives only in the Worker).
--   * The admin page signs in with an email and password. Row-level security
--     lets a signed-in user see and change anything ONLY if they are listed in
--     public.admins. Anyone else - including the public anon key - gets nothing.
--   * No answer text is stored: scores, counts and dates only.

-- ---------------------------------------------------------------- tables

create table if not exists public.students (
  id              uuid primary key default gen_random_uuid(),
  name            text not null check (length(btrim(name)) between 1 and 80),
  trade           text not null default '',          -- the app's course id: cnc, nursing ...
  batch           text not null default '',
  phone           text not null default '',
  code            text not null unique check (code ~ '^[A-Z0-9]{6,16}$'),
  code_changed_at timestamptz not null default now(), -- phones signed in before this must re-enter
  active          boolean not null default true,
  expires_on      date,                                -- no access after this day (IST)
  daily_ai_limit  integer not null default 150 check (daily_ai_limit >= 0),
  notes           text not null default '',
  created_at      timestamptz not null default now(),
  last_seen_at    timestamptz
);

-- Every phone a code has been used on. Not a limit - a code works on any
-- number of phones - but many phones on one code is a sign it was shared.
create table if not exists public.devices (
  student_id    uuid not null references public.students(id) on delete cascade,
  device_id     text not null check (length(device_id) between 8 and 64),
  first_seen_at timestamptz not null default now(),
  last_seen_at  timestamptz not null default now(),
  user_agent    text not null default '',
  primary key (student_id, device_id)
);

-- One row per finished chapter quiz
create table if not exists public.quiz_attempts (
  id            bigint generated always as identity primary key,
  student_id    uuid not null references public.students(id) on delete cascade,
  client_id     text not null,                       -- made on the phone; stops double counting
  course        text not null,
  chapter_id    text not null,
  chapter_no    text not null default '',
  chapter_title text not null default '',
  total         integer not null check (total > 0),
  answered      integer not null check (answered >= 0),
  right_n       integer not null default 0,
  partial_n     integer not null default 0,
  wrong_n       integer not null default 0,
  skipped_n     integer not null default 0,
  pct           integer not null check (pct between 0 and 100),
  lang          text not null default '',
  finished_at   timestamptz not null,
  received_at   timestamptz not null default now(),
  unique (student_id, client_id)
);

-- One row per answer in the interview practice (scores out of 10)
create table if not exists public.interview_answers (
  id             bigint generated always as identity primary key,
  student_id     uuid not null references public.students(id) on delete cascade,
  client_id      text not null,
  course         text not null,
  round_id       text not null default '',            -- answers of one mock interview share it
  category       text not null default '',
  question_id    text not null default '',
  mode           text not null default 'interview',
  overall        numeric(3,1),
  communication  numeric(3,1),
  sentences      numeric(3,1),
  thought        numeric(3,1),
  speech_grammar numeric(3,1),
  accuracy       numeric(3,1),
  coherence      numeric(3,1),
  words          integer,
  secs           integer,
  by_ai          boolean not null default false,
  answered_at    timestamptz not null,
  received_at    timestamptz not null default now(),
  unique (student_id, client_id)
);

-- AI marks and transcriptions per student per day, for the daily limit
create table if not exists public.ai_usage (
  student_id uuid not null references public.students(id) on delete cascade,
  day        date not null,
  calls      integer not null default 0,
  primary key (student_id, day)
);

-- Who may use the admin page. Add a row after creating the user in
-- Authentication -> Users (see README.md).
create table if not exists public.admins (
  user_id  uuid primary key references auth.users(id) on delete cascade,
  email    text not null,
  added_at timestamptz not null default now()
);

-- What the student types on their own phone the first time they enter the
-- code (the app's code screen). Kept apart from `name` and `phone`, which the
-- institute entered, so a different name stands out - a sign of a shared code.
alter table public.students add column if not exists first_name text not null default '';
alter table public.students add column if not exists last_name  text not null default '';
alter table public.students add column if not exists mobile     text not null default '';
alter table public.students add column if not exists details_at timestamptz;

-- A sign-up code: ONE code for many students. Each student types it with
-- their own name and mobile number and gets their own record (and their own
-- personal code) the first time - found again by mobile + first name after
-- that. Turning a sign-up code off stops new sign-ups with it; students who
-- already joined keep working until turned off one by one.
create table if not exists public.signup_codes (
  id         uuid primary key default gen_random_uuid(),
  code       text not null unique check (code ~ '^[A-Z0-9]{6,16}$'),
  label      text not null default 'Everyone',
  trade      text not null default '',
  batch      text not null default 'Open sign-up',
  active     boolean not null default true,
  expires_on date,
  created_at timestamptz not null default now()
);
alter table public.students add column if not exists signup_code_id uuid
  references public.signup_codes(id) on delete set null;
create index if not exists students_mobile_idx on public.students (mobile);

create index if not exists quiz_attempts_student_idx on public.quiz_attempts (student_id, finished_at desc);
create index if not exists interview_answers_student_idx on public.interview_answers (student_id, answered_at desc);
create index if not exists students_batch_idx on public.students (batch);

-- ---------------------------------------------------------------- functions

-- Today in India - the daily limit and "used today" count from midnight IST
create or replace function public.ist_today() returns date
language sql stable set search_path = public as $$
  select (now() at time zone 'Asia/Kolkata')::date;
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- Count one AI call and return the day's total. Called by the Worker only.
create or replace function public.bump_ai_usage(sid uuid) returns integer
language sql security definer set search_path = public as $$
  insert into public.ai_usage (student_id, day, calls)
  values (sid, public.ist_today(), 1)
  on conflict (student_id, day) do update set calls = public.ai_usage.calls + 1
  returning calls;
$$;

revoke execute on function public.bump_ai_usage(uuid) from public, anon, authenticated;
grant execute on function public.bump_ai_usage(uuid) to service_role;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------- security

alter table public.students          enable row level security;
alter table public.devices           enable row level security;
alter table public.quiz_attempts     enable row level security;
alter table public.interview_answers enable row level security;
alter table public.ai_usage          enable row level security;
alter table public.admins            enable row level security;
alter table public.signup_codes      enable row level security;

-- The public (anon) key can do nothing at all here
revoke all on public.students, public.devices, public.quiz_attempts,
              public.interview_answers, public.ai_usage, public.admins from anon;
grant select, insert, update, delete on public.students to authenticated;
grant select, delete on public.devices, public.quiz_attempts,
                        public.interview_answers, public.ai_usage to authenticated;
grant select on public.admins to authenticated;
revoke all on public.signup_codes from anon;
grant select, insert, update, delete on public.signup_codes to authenticated;

drop policy if exists admin_all on public.students;
create policy admin_all on public.students for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists admin_all on public.signup_codes;
create policy admin_all on public.signup_codes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists admin_read on public.devices;
create policy admin_read on public.devices for select to authenticated using (public.is_admin());
drop policy if exists admin_delete on public.devices;
create policy admin_delete on public.devices for delete to authenticated using (public.is_admin());

drop policy if exists admin_read on public.quiz_attempts;
create policy admin_read on public.quiz_attempts for select to authenticated using (public.is_admin());
drop policy if exists admin_delete on public.quiz_attempts;
create policy admin_delete on public.quiz_attempts for delete to authenticated using (public.is_admin());

drop policy if exists admin_read on public.interview_answers;
create policy admin_read on public.interview_answers for select to authenticated using (public.is_admin());
drop policy if exists admin_delete on public.interview_answers;
create policy admin_delete on public.interview_answers for delete to authenticated using (public.is_admin());

drop policy if exists admin_read on public.ai_usage;
create policy admin_read on public.ai_usage for select to authenticated using (public.is_admin());

-- An admin can see the admin list; nobody changes it from the page
drop policy if exists admin_read on public.admins;
create policy admin_read on public.admins for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------- report views
-- security_invoker: a view reads with the caller's rights, so the policies
-- above apply to it too - an outsider gets no rows from a view either.

create or replace view public.chapter_progress with (security_invoker = true) as
select student_id, course, chapter_id,
       max(chapter_no)    as chapter_no,
       max(chapter_title) as chapter_title,
       max(total)         as questions,
       count(*)           as attempts,
       max(pct)           as best_pct,
       round(avg(pct))    as avg_pct,
       (array_agg(pct order by finished_at desc))[1] as last_pct,
       max(finished_at)   as last_at
from public.quiz_attempts
group by student_id, course, chapter_id;

create or replace view public.interview_progress with (security_invoker = true) as
select student_id, course,
       count(*)                                 as answers,
       count(distinct nullif(round_id, ''))     as rounds,
       round(avg(overall), 1)                   as avg_score,
       max(overall)                             as best_score,
       count(*) filter (where by_ai)            as ai_marked,
       max(answered_at)                         as last_at
from public.interview_answers
group by student_id, course;

-- Dropped first: s.* gains columns when students does, and a view cannot be
-- replaced with columns in a new order
drop view if exists public.student_overview;
create view public.student_overview with (security_invoker = true) as
select s.*,
       (select count(*) from public.devices d where d.student_id = s.id)                as devices,
       (select count(*) from public.quiz_attempts q where q.student_id = s.id)          as quiz_attempts,
       (select round(avg(q.pct)) from public.quiz_attempts q where q.student_id = s.id) as quiz_avg,
       (select count(*) from public.interview_answers i where i.student_id = s.id)      as interview_answers,
       (select round(avg(i.overall), 1) from public.interview_answers i
         where i.student_id = s.id)                                                     as interview_avg,
       coalesce((select u.calls from public.ai_usage u
                  where u.student_id = s.id and u.day = public.ist_today()), 0)          as ai_today
from public.students s;

revoke all on public.chapter_progress, public.interview_progress, public.student_overview from anon;
grant select on public.chapter_progress, public.interview_progress, public.student_overview to authenticated;
