begin;

update public.politicians
set party = 'NDC', updated_at = now()
where lower(full_name) = lower('Peter Gregory Obi')
   or lower(common_name) = lower('Peter Obi');

update public.politicians
set party = 'NDC', updated_at = now()
where lower(full_name) = lower('Rabiu Musa Kwankwaso')
   or lower(common_name) = lower('Kwankwaso');

update public.politicians
set party = 'ADC', updated_at = now()
where lower(full_name) = lower('Atiku Abubakar')
   or lower(common_name) = lower('Atiku');

update public.politicians
set party = 'ADC', updated_at = now()
where lower(full_name) = lower('Rotimi Chibuike Amaechi')
   or lower(common_name) = lower('Rotimi Amaechi');

update public.politicians
set party = 'ADC', updated_at = now()
where lower(full_name) = lower('Nasir Ahmad El-Rufai')
   or lower(common_name) = lower('El-Rufai');

commit;
