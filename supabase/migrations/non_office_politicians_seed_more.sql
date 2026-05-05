begin;

create unique index if not exists uq_politicians_full_name_ci on public.politicians (lower(full_name));

insert into public.politicians(full_name, common_name, party, aspiration_title, bio, photo_url, aliases, social_links, priority, is_active)
select
  v.full_name,
  v.common_name,
  v.party,
  v.aspiration_title,
  v.bio,
  v.photo_url,
  v.aliases,
  v.social_links,
  v.priority,
  v.is_active
from (
  values
    ('Atiku Abubakar','Atiku','PDP','Presidential Aspirant','Prominent Nigerian politician and former Vice President of Nigeria.',null,'["Atiku","Atiku Abubakar","H.E. Atiku Abubakar"]'::jsonb,'{}'::jsonb,85,true),
    ('Goodluck Ebele Jonathan','Goodluck Jonathan','PDP','National Political Figure','Prominent Nigerian politician and former President of Nigeria.',null,'["Goodluck Jonathan","GEJ","Dr Goodluck Jonathan"]'::jsonb,'{}'::jsonb,80,true),
    ('Bukola Saraki','Saraki','PDP','National Political Figure','Prominent Nigerian politician and former Senate President of Nigeria.',null,'["Bukola Saraki","Dr Bukola Saraki","Senator Saraki"]'::jsonb,'{}'::jsonb,70,true),
    ('Aminu Waziri Tambuwal','Tambuwal','PDP','National Political Figure','Prominent Nigerian politician and former Speaker of the House of Representatives.',null,'["Aminu Tambuwal","Tambuwal"]'::jsonb,'{}'::jsonb,66,true),
    ('Kayode Fayemi','Kayode Fayemi','APC','National Political Figure','Prominent Nigerian politician and former Governor of Ekiti State.',null,'["Kayode Fayemi","Dr Kayode Fayemi"]'::jsonb,'{}'::jsonb,64,true),
    ('Nasir Ahmad El-Rufai','El-Rufai','APC','National Political Figure','Prominent Nigerian politician and former Governor of Kaduna State.',null,'["Nasir El-Rufai","El Rufai","Mallam El-Rufai"]'::jsonb,'{}'::jsonb,63,true),
    ('Rotimi Chibuike Amaechi','Rotimi Amaechi','APC','National Political Figure','Prominent Nigerian politician and former Governor of Rivers State.',null,'["Rotimi Amaechi","Chibuike Amaechi"]'::jsonb,'{}'::jsonb,62,true),
    ('Yemi Osinbajo','Osinbajo','APC','National Political Figure','Prominent Nigerian lawyer and politician; former Vice President of Nigeria.',null,'["Yemi Osinbajo","Prof. Yemi Osinbajo","Professor Osinbajo"]'::jsonb,'{}'::jsonb,61,true),
    ('Rochas Anayo Okorocha','Rochas Okorocha','APC','National Political Figure','Prominent Nigerian politician and former Governor of Imo State.',null,'["Rochas Okorocha","Senator Okorocha"]'::jsonb,'{}'::jsonb,60,true)
) as v(full_name, common_name, party, aspiration_title, bio, photo_url, aliases, social_links, priority, is_active)
where not exists (
  select 1 from public.politicians p where lower(p.full_name) = lower(v.full_name)
);

commit;
