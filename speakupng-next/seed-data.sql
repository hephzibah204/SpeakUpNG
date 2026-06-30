-- ============================================
-- Seed data for evote.ng D1 database
-- Generated on 2026-06-24T19:36:52.977Z
-- ============================================

-- Officials
INSERT OR REPLACE INTO officials (id, full_name, common_name, role, tier, state, website, photo_url, rating_avg, rating_count, bio, status)
VALUES
('626f6c61-2d61-486d-6564-2d74696e7562', 'Bola Ahmed Tinubu', 'Tinubu', 'President', 'federal_executive', 'FCT', 'https://president.gov.ng', 'https://upload.wikimedia.org/wikipedia/commons/2/21/Bola_Tinubu_2023_%28cropped%29.jpg', 4.2, 1245, 'President of Nigeria since 2023. Former Governor of Lagos State.', 'active'),
('73657969-2d6d-416b-696e-646500000000', 'Seyi Makinde', 'Makinde', 'Governor', 'state_executive', 'Oyo', 'https://oyostate.gov.ng', 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Seyi_Makinde_2023_%28cropped%29.jpg', 4.5, 892, 'Governor of Oyo State. Known for infrastructure development and education reforms.', 'active'),
('62616261-6a69-4465-2d73-616e776f2d6f', 'Babajide Sanwo-Olu', 'Sanwo-Olu', 'Governor', 'state_executive', 'Lagos', 'https://lagosstate.gov.ng', 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Babajide_Sanwo-Olu_2023_%28cropped%29.jpg', 4.1, 2156, 'Governor of Lagos State. Focused on infrastructure, transportation, and technology.', 'active'),
('6e796573-6f6d-4d77-696b-650000000000', 'Nyesom Wike', 'Wike', 'Minister of FCT', 'federal_executive', 'FCT', 'https://fct.gov.ng', 'https://upload.wikimedia.org/wikipedia/commons/7/71/Nyesom_Ezenwo_Wike.jpg', 3.8, 1567, 'Minister of the Federal Capital Territory. Former Governor of Rivers State.', 'active'),
('6461706f-2d61-4269-6f64-756e00000000', 'Dapo Abiodun', 'Abiodun', 'Governor', 'state_executive', 'Ogun', 'https://ogunstate.gov.ng', 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Dapo_Abiodun.jpg', 4, 678, 'Governor of Ogun State. Focused on infrastructure development and industrial growth.', 'active'),
('616c6578-2d6f-4474-6900-000000000000', 'Alex Otti', 'Otti', 'Governor', 'state_executive', 'Abia', 'https://abiastate.gov.ng', 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Alex_Otti_2023.jpg', 4.3, 456, 'Governor of Abia State. Former banker and technocrat.', 'active'),
('65666363-0000-4000-0000-000000000000', 'Economic and Financial Crimes Commission', 'EFCC', 'Law Enforcement Agency', 'federal_agency', NULL, 'https://www.efcc.gov.ng', NULL, 3.5, 890, 'Federal agency responsible for investigating and prosecuting financial crimes.', 'active'),
('69637063-0000-4000-0000-000000000000', 'Independent Corrupt Practices Commission', 'ICPC', 'Anti-Corruption Agency', 'federal_agency', NULL, 'https://icpc.gov.ng', NULL, 3.2, 567, 'Federal agency responsible for combating corruption in the public service.', 'active'),
('6e696765-7269-416e-2d70-6f6c69636500', 'Nigeria Police Force', 'NPF', 'National Police Service', 'federal_agency', NULL, 'https://www.npf.gov.ng', NULL, 2.8, 3245, 'Principal law enforcement agency in Nigeria.', 'active'),
('6e696765-7269-416e-2d72-61696c776179', 'Nigerian Railway Corporation', 'NRC', 'Rail Transport', 'federal_agency', NULL, 'https://nrc.gov.ng', NULL, 3.7, 345, 'Federal agency responsible for railway transportation in Nigeria.', 'active');


-- Politicians
INSERT OR REPLACE INTO politicians (id, full_name, common_name, party, aspiration_title, aspiring_for, previous_offices, wiki_title, wiki_url, bio, profile_bio, photo_url, aliases, social_links, source_urls, source_notes, priority, is_active)
VALUES
('70657465-722d-4772-6567-6f72792d6f62', 'Peter Gregory Obi', 'Peter Obi', 'LP', 'Presidential Aspirant', 'President of Nigeria', 'Governor of Anambra State (2006-2014)', 'Peter_Obi', 'https://en.wikipedia.org/wiki/Peter_Obi', 'Prominent Nigerian politician and former Governor of Anambra State. Known for his frugal governance and economic reforms.', 'A transformative leader with a vision for inclusive development and good governance.', 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Peter_Obi_2023.jpg', '["Peter Obi","Mr Peter Obi","H.E. Peter Obi"]', '{"twitter":"@peterobi"}', '["https://en.wikipedia.org/wiki/Peter_Obi"]', 'Former Anambra State governor', 100, 1),
('72616269-752d-4d75-7361-2d6b77616e6b', 'Rabiu Musa Kwankwaso', 'Kwankwaso', 'NDC', 'Presidential Aspirant', 'President of Nigeria', 'Governor of Kano State (1999-2003, 2011-2015)', 'Rabiu_Kwankwaso', 'https://en.wikipedia.org/wiki/Rabiu_Kwankwaso', 'Prominent Nigerian politician and former Governor of Kano State. Founder of the Kwankwasiyya movement.', 'A seasoned politician with strong grassroots support in Northern Nigeria.', 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Rabiu_Kwankwaso_2023.jpg', '["Rabiu Kwankwaso","R. M. Kwankwaso"]', '{"twitter":"@kwankwasorm"}', '["https://en.wikipedia.org/wiki/Rabiu_Kwankwaso"]', NULL, 90, 1),
('6174696b-752d-4162-7562-616b61720000', 'Atiku Abubakar', 'Atiku', 'PDP', 'Presidential Aspirant', 'President of Nigeria', 'Vice President of Nigeria (1999-2007)', 'Atiku_Abubakar', 'https://en.wikipedia.org/wiki/Atiku_Abubakar', 'Former Vice President of Nigeria and perennial presidential candidate.', 'A seasoned statesman and business leader with decades of political experience.', NULL, '["Atiku Abubakar","Atiku","Turakin Adamawa"]', '{"twitter":"@atiku"}', '["https://en.wikipedia.org/wiki/Atiku_Abubakar"]', NULL, 85, 1),
('6e756875-2d72-4962-6164-750000000000', 'Nuhu Ribadu', 'Ribadu', 'APC', 'Political Leader', 'National Security Advisor', 'Chairman of EFCC (2003-2007)', 'Nuhu_Ribadu', 'https://en.wikipedia.org/wiki/Nuhu_Ribadu', 'Former Chairman of the Economic and Financial Crimes Commission (EFCC).', 'An anti-corruption crusader and legal expert.', NULL, '["Nuhu Ribadu","Mallam Ribadu"]', '{"twitter":"@nuhuribadu"}', '["https://en.wikipedia.org/wiki/Nuhu_Ribadu"]', NULL, 70, 1);


-- News Sources
INSERT OR REPLACE INTO news_sources (id, name, home_url, feed_url, ingest_type, credibility_tier, is_active, max_fetch_kb)
VALUES
('6262632d-6e65-4773-0000-000000000000', 'BBC News', 'https://www.bbc.com', 'https://feeds.bbci.co.uk/news/rss.xml', 'rss', 'tier1', 1, 512),
('70756e63-682d-4e65-7773-706170657273', 'Punch Newspapers', 'https://punchng.com', 'https://punchng.com/feed/', 'rss', 'tier2', 1, 1024),
('76616e67-7561-4264-0000-000000000000', 'Vanguard', 'https://www.vanguardngr.com', 'https://www.vanguardngr.com/feed/', 'rss', 'tier2', 1, 1024),
('7468652d-6e61-4469-6f6e-000000000000', 'The Nation', 'https://thenationonlineng.net', 'https://thenationonlineng.net/feed/', 'rss', 'tier2', 1, 1024);


-- Public Ratings
INSERT OR REPLACE INTO public_ratings (id, official_id, overall, accountability, service, transparency, responsiveness, power, security, economic_stability, education, healthcare, reviewer_state, review_text, device_hash)
VALUES
('72617469-6e67-4d31-0000-000000000000', '626f6c61-2d61-486d-6564-2d74696e7562', 4.2, 4, 4, 3, 3, 5, 4, 4, 4, 4, 'Lagos', 'Strong leadership but needs more transparency.', 'dev-sample-1'),
('72617469-6e67-4d32-0000-000000000000', '626f6c61-2d61-486d-6564-2d74696e7562', 4, 4, 4, 3, 4, 5, 3, 4, 4, 4, 'FCT', 'Economic reforms are promising but slow.', 'dev-sample-2'),
('72617469-6e67-4d33-0000-000000000000', '73657969-2d6d-416b-696e-646500000000', 4.8, 5, 5, 4, 5, 4, 5, 5, 5, 5, 'Oyo', 'Excellent governor! Visible development across the state.', 'dev-sample-3'),
('72617469-6e67-4d34-0000-000000000000', '73657969-2d6d-416b-696e-646500000000', 4.5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 'Oyo', 'Best governor Oyo has ever had.', 'dev-sample-4'),
('72617469-6e67-4d35-0000-000000000000', '62616261-6a69-4465-2d73-616e776f2d6f', 4, 4, 4, 3, 3, 4, 4, 4, 4, 4, 'Lagos', 'Good on infrastructure. Traffic still a problem.', 'dev-sample-5'),
('72617469-6e67-4d36-0000-000000000000', '62616261-6a69-4465-2d73-616e776f2d6f', 4.2, 4, 4, 4, 4, 4, 4, 4, 5, 4, 'Lagos', 'The rail project is transformative for Lagos.', 'dev-sample-6'),
('72617469-6e67-4d37-0000-000000000000', '6e796573-6f6d-4d77-696b-650000000000', 3.5, 3, 4, 3, 3, 5, 3, 3, 3, 4, 'Rivers', 'Strong willed but controversial.', 'dev-sample-7'),
('72617469-6e67-4d38-0000-000000000000', '65666363-0000-4000-0000-000000000000', 3.6, 3, 4, 3, 3, 4, 4, 3, 3, 3, 'FCT', 'Doing important work but needs more independence.', 'dev-sample-8'),
('72617469-6e67-4d39-0000-000000000000', '6e696765-7269-416e-2d70-6f6c69636500', 2.5, 2, 2, 2, 2, 4, 3, 2, 2, 2, 'Lagos', 'Needs major reform. Harassment is common.', 'dev-sample-9'),
('72617469-6e67-4d31-3000-000000000000', '616c6578-2d6f-4474-6900-000000000000', 4.5, 5, 4, 4, 5, 4, 5, 4, 4, 5, 'Abia', 'Great start. Visible changes in Abia.', 'dev-sample-10');


-- Politician Ratings
INSERT OR REPLACE INTO politician_ratings (id, politician_id, device_hash, overall, accountability, service, transparency, responsiveness, power, security, economic_stability, education, healthcare, review_text)
VALUES
('706f6c2d-7261-4469-6e67-2d3100000000', '70657465-722d-4772-6567-6f72792d6f62', 'dev-sample-1', 4.8, 5, 5, 5, 4, 4, 5, 5, 5, 5, 'The most credible candidate for Nigeria.'),
('706f6c2d-7261-4469-6e67-2d3200000000', '6174696b-752d-4162-7562-616b61720000', 'dev-sample-2', 3.5, 3, 4, 3, 3, 5, 3, 4, 3, 3, 'Experienced but needs to connect with youth.'),
('706f6c2d-7261-4469-6e67-2d3300000000', '70657465-722d-4772-6567-6f72792d6f62', 'dev-sample-3', 4.6, 5, 5, 4, 5, 4, 4, 5, 5, 4, 'A new kind of Nigerian leader!');


-- Official Promises
INSERT OR REPLACE INTO official_promises (id, official_id, promise_title, promise_detail, promise_category, promise_date, status, progress_percent)
VALUES
('70726f6d-6973-452d-3100-000000000000', '626f6c61-2d61-486d-6564-2d74696e7562', 'Economic Revival', 'Revive the Nigerian economy through fiscal and monetary reforms.', 'Economy', '2023-05-29', 'in_progress', 40),
('70726f6d-6973-452d-3200-000000000000', '626f6c61-2d61-486d-6564-2d74696e7562', 'Security Improvement', 'Improve national security and combat insurgency.', 'Security', '2023-05-29', 'in_progress', 35),
('70726f6d-6973-452d-3300-000000000000', '73657969-2d6d-416b-696e-646500000000', 'Education Reform', 'Improve quality of education in Oyo State.', 'Education', '2023-05-29', 'fulfilled', 100),
('70726f6d-6973-452d-3400-000000000000', '62616261-6a69-4465-2d73-616e776f2d6f', 'Lagos Rail Mass Transit', 'Complete the Lagos rail mass transit system.', 'Infrastructure', '2023-01-01', 'in_progress', 60),
('70726f6d-6973-452d-3500-000000000000', NULL, 'Production Economy', 'Shift Nigeria from consumption to production economy.', 'Economy', '2022-09-01', 'disputed', 0);

