-- MSA-VTC Interview Prep - OPTIONAL read-only login for charts and reports
-- (Looker Studio, Google Sheets add-ons, Metabase ...). Not needed for the
-- admin page. Run after schema.sql, once, with your own password below.
--
-- It can read results and student names, batches and trades - but not the
-- access codes or phone numbers, and it cannot change anything.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'report_reader') then
    create role report_reader login password 'CHANGE-THIS-PASSWORD';
  end if;
end $$;

alter role report_reader set statement_timeout = '30s';
grant usage on schema public to report_reader;

-- Students without their codes or phone numbers
create or replace view public.report_students with (security_invoker = true) as
select id, name, trade, batch, active, expires_on, created_at, last_seen_at
from public.students;

revoke all on public.report_students from anon;
grant select on public.report_students to authenticated;

grant select (id, name, trade, batch, active, expires_on, created_at, last_seen_at) on public.students to report_reader;
grant select on public.quiz_attempts, public.interview_answers,
                public.report_students, public.chapter_progress, public.interview_progress to report_reader;

-- Row-level security: this reader sees every row, read only
drop policy if exists reader_read on public.students;
create policy reader_read on public.students for select to report_reader using (true);
drop policy if exists reader_read on public.quiz_attempts;
create policy reader_read on public.quiz_attempts for select to report_reader using (true);
drop policy if exists reader_read on public.interview_answers;
create policy reader_read on public.interview_answers for select to report_reader using (true);
