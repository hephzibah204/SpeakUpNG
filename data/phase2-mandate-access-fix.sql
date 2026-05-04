begin;

grant usage on schema public to anon, authenticated;

grant select on public.official_mandate_scores to anon, authenticated;
grant select on public.official_promises to anon, authenticated;
grant select on public.promise_milestones to anon, authenticated;
grant select on public.promise_evidence_submissions to anon, authenticated;

grant insert, update, delete on public.official_promises to authenticated;
grant insert, update, delete on public.promise_milestones to authenticated;
grant insert, update, delete on public.promise_evidence_submissions to authenticated;

alter table public.official_promises enable row level security;
alter table public.promise_milestones enable row level security;
alter table public.promise_evidence_submissions enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='official_promises' and policyname='public_read') then
    create policy public_read on public.official_promises for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='official_promises' and policyname='auth_write') then
    create policy auth_write on public.official_promises for all to authenticated using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='promise_milestones' and policyname='public_read') then
    create policy public_read on public.promise_milestones for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='promise_milestones' and policyname='auth_write') then
    create policy auth_write on public.promise_milestones for all to authenticated using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='promise_evidence_submissions' and policyname='public_read') then
    create policy public_read on public.promise_evidence_submissions for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='promise_evidence_submissions' and policyname='auth_write') then
    create policy auth_write on public.promise_evidence_submissions for all to authenticated using (true) with check (true);
  end if;
end $$;

commit;

