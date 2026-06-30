begin;

grant select on public.official_career_history to anon, authenticated;
grant select on public.official_education to anon, authenticated;
grant select on public.official_achievements to anon, authenticated;

commit;
