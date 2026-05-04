begin;

update public.officials
set
  photo_url = coalesce(photo_url, 'https://commons.wikimedia.org/wiki/Special:FilePath/Bola%20Tinubu%20portrait.jpg'),
  social_twitter = coalesce(social_twitter, 'officialABAT'),
  website = coalesce(website, 'https://statehouse.gov.ng/'),
  profile_bio = coalesce(profile_bio, 'Bola Ahmed Tinubu is the President of the Federal Republic of Nigeria. He previously served as Governor of Lagos State (1999–2007) and has been a central figure in Nigeria''s contemporary political landscape.\n\nThis profile will be expanded with verified background, education, career history, and a tracked mandate scorecard with evidence links.\n\nWhere possible, official sources and reputable references are used for factual fields such as dates, offices held, and public records.'),
  profile_generated = true,
  profile_verified = false,
  profile_updated_at = now()
where
  status = 'active'
  and tier = 'federal_executive'
  and role ilike '%president%'
  and full_name ilike '%tinubu%';

commit;

