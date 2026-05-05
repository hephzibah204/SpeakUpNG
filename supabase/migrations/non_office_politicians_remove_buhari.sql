begin;

update public.politicians
set is_active = false, updated_at = now()
where lower(full_name) = lower('Muhammadu Buhari')
   or lower(common_name) = lower('Buhari');

commit;
