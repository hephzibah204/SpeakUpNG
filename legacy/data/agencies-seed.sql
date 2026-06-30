begin;

-- Agencies (bodies) seed data for evote.ng
-- Safe to re-run (each row inserts only if missing by full_name + tier).

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'National Agency for Food and Drug Administration and Control', 'NAFDAC', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://www.nafdac.gov.ng'
where not exists (select 1 from public.officials where full_name='National Agency for Food and Drug Administration and Control' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Nigerian National Petroleum Company Limited', 'NNPC', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://www.nnpcgroup.com'
where not exists (select 1 from public.officials where full_name='Nigerian National Petroleum Company Limited' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Central Bank of Nigeria', 'CBN', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://www.cbn.gov.ng'
where not exists (select 1 from public.officials where full_name='Central Bank of Nigeria' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Federal Inland Revenue Service', 'FIRS', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://www.firs.gov.ng'
where not exists (select 1 from public.officials where full_name='Federal Inland Revenue Service' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Nigerian Customs Service', 'NCS', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://customs.gov.ng'
where not exists (select 1 from public.officials where full_name='Nigerian Customs Service' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Nigeria Immigration Service', 'NIS', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://immigration.gov.ng'
where not exists (select 1 from public.officials where full_name='Nigeria Immigration Service' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Federal Road Safety Corps', 'FRSC', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://frsc.gov.ng'
where not exists (select 1 from public.officials where full_name='Federal Road Safety Corps' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Nigeria Security and Civil Defence Corps', 'NSCDC', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://nscdc.gov.ng'
where not exists (select 1 from public.officials where full_name='Nigeria Security and Civil Defence Corps' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'National Emergency Management Agency', 'NEMA', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://nema.gov.ng'
where not exists (select 1 from public.officials where full_name='National Emergency Management Agency' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Economic and Financial Crimes Commission', 'EFCC', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://www.efcc.gov.ng'
where not exists (select 1 from public.officials where full_name='Economic and Financial Crimes Commission' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Independent Corrupt Practices and Other Related Offences Commission', 'ICPC', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://icpc.gov.ng'
where not exists (select 1 from public.officials where full_name='Independent Corrupt Practices and Other Related Offences Commission' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'National Drug Law Enforcement Agency', 'NDLEA', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://ndlea.gov.ng'
where not exists (select 1 from public.officials where full_name='National Drug Law Enforcement Agency' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Nigerian Communications Commission', 'NCC', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://www.ncc.gov.ng'
where not exists (select 1 from public.officials where full_name='Nigerian Communications Commission' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Nigerian Electricity Regulatory Commission', 'NERC', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://nerc.gov.ng'
where not exists (select 1 from public.officials where full_name='Nigerian Electricity Regulatory Commission' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Transmission Company of Nigeria', 'TCN', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://tcn.org.ng'
where not exists (select 1 from public.officials where full_name='Transmission Company of Nigeria' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Nigerian Bulk Electricity Trading Plc', 'NBET', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://nbet.com.ng'
where not exists (select 1 from public.officials where full_name='Nigerian Bulk Electricity Trading Plc' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Niger Delta Power Holding Company', 'NDPHC', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://ndphc.net'
where not exists (select 1 from public.officials where full_name='Niger Delta Power Holding Company' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Nigerian Ports Authority', 'NPA', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://nigerianports.gov.ng'
where not exists (select 1 from public.officials where full_name='Nigerian Ports Authority' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Nigerian Maritime Administration and Safety Agency', 'NIMASA', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://nimasa.gov.ng'
where not exists (select 1 from public.officials where full_name='Nigerian Maritime Administration and Safety Agency' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Nigerian Civil Aviation Authority', 'NCAA', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://ncaa.gov.ng'
where not exists (select 1 from public.officials where full_name='Nigerian Civil Aviation Authority' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Securities and Exchange Commission Nigeria', 'SEC', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://sec.gov.ng'
where not exists (select 1 from public.officials where full_name='Securities and Exchange Commission Nigeria' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Corporate Affairs Commission', 'CAC', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://www.cac.gov.ng'
where not exists (select 1 from public.officials where full_name='Corporate Affairs Commission' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'National Bureau of Statistics', 'NBS', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://nigerianstat.gov.ng'
where not exists (select 1 from public.officials where full_name='National Bureau of Statistics' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'National Identity Management Commission', 'NIMC', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://nimc.gov.ng'
where not exists (select 1 from public.officials where full_name='National Identity Management Commission' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'National Health Insurance Authority', 'NHIA', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://www.nhia.gov.ng'
where not exists (select 1 from public.officials where full_name='National Health Insurance Authority' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'National Primary Health Care Development Agency', 'NPHCDA', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://nphcda.gov.ng'
where not exists (select 1 from public.officials where full_name='National Primary Health Care Development Agency' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'National Agency for the Control of AIDS', 'NACA', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://naca.gov.ng'
where not exists (select 1 from public.officials where full_name='National Agency for the Control of AIDS' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'National Environmental Standards and Regulations Enforcement Agency', 'NESREA', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://nesrea.gov.ng'
where not exists (select 1 from public.officials where full_name='National Environmental Standards and Regulations Enforcement Agency' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'National Agency for Science and Engineering Infrastructure', 'NASENI', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://naseni.gov.ng'
where not exists (select 1 from public.officials where full_name='National Agency for Science and Engineering Infrastructure' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Nigerian Meteorological Agency', 'NiMet', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://nimet.gov.ng'
where not exists (select 1 from public.officials where full_name='Nigerian Meteorological Agency' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Nigerian National Bureau of Investigation', 'NNBI', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, null
where not exists (select 1 from public.officials where full_name='Nigerian National Bureau of Investigation' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Independent National Electoral Commission', 'INEC', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://inecnigeria.org'
where not exists (select 1 from public.officials where full_name='Independent National Electoral Commission' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Joint Admissions and Matriculation Board', 'JAMB', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://www.jamb.gov.ng'
where not exists (select 1 from public.officials where full_name='Joint Admissions and Matriculation Board' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'National Youth Service Corps', 'NYSC', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://www.nysc.gov.ng'
where not exists (select 1 from public.officials where full_name='National Youth Service Corps' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'National Information Technology Development Agency', 'NITDA', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://nitda.gov.ng'
where not exists (select 1 from public.officials where full_name='National Information Technology Development Agency' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Niger Delta Development Commission', 'NDDC', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://nddc.gov.ng'
where not exists (select 1 from public.officials where full_name='Niger Delta Development Commission' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Standards Organisation of Nigeria', 'SON', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://son.gov.ng'
where not exists (select 1 from public.officials where full_name='Standards Organisation of Nigeria' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Nigeria Centre for Disease Control', 'NCDC', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://ncdc.gov.ng'
where not exists (select 1 from public.officials where full_name='Nigeria Centre for Disease Control' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'National Agency for the Prohibition of Trafficking in Persons', 'NAPTIP', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://naptip.gov.ng'
where not exists (select 1 from public.officials where full_name='National Agency for the Prohibition of Trafficking in Persons' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'National Universities Commission', 'NUC', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://www.nuc.edu.ng'
where not exists (select 1 from public.officials where full_name='National Universities Commission' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Tertiary Education Trust Fund', 'TETFund', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://tetfund.gov.ng'
where not exists (select 1 from public.officials where full_name='Tertiary Education Trust Fund' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Universal Basic Education Commission', 'UBEC', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://ubec.gov.ng'
where not exists (select 1 from public.officials where full_name='Universal Basic Education Commission' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'National Pension Commission', 'PenCom', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://www.pencom.gov.ng'
where not exists (select 1 from public.officials where full_name='National Pension Commission' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'National Insurance Commission', 'NAICOM', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://www.naicom.gov.ng'
where not exists (select 1 from public.officials where full_name='National Insurance Commission' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Nigerian Investment Promotion Commission', 'NIPC', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://nipc.gov.ng'
where not exists (select 1 from public.officials where full_name='Nigerian Investment Promotion Commission' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Nigerian Export Promotion Council', 'NEPC', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://nepc.gov.ng'
where not exists (select 1 from public.officials where full_name='Nigerian Export Promotion Council' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Bureau of Public Procurement', 'BPP', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://www.bpp.gov.ng'
where not exists (select 1 from public.officials where full_name='Bureau of Public Procurement' and tier='federal_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'National Broadcasting Commission', 'NBC', null, 'Agency', 'federal_agency', null, 'active', null, null, null, null, 'https://nbc.gov.ng'
where not exists (select 1 from public.officials where full_name='National Broadcasting Commission' and tier='federal_agency');

-- Power DisCos (agency bodies)
insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Abuja Electricity Distribution Company', 'AEDC', null, 'Agency', 'state_agency', null, 'active', null, null, null, null, 'https://aedc.com.ng'
where not exists (select 1 from public.officials where full_name='Abuja Electricity Distribution Company' and tier='state_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Ibadan Electricity Distribution Company', 'IBEDC', null, 'Agency', 'state_agency', null, 'active', null, null, null, null, 'https://ibedc.com'
where not exists (select 1 from public.officials where full_name='Ibadan Electricity Distribution Company' and tier='state_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Ikeja Electric', 'IKEDC', null, 'Agency', 'state_agency', null, 'active', null, null, null, null, 'https://www.ikejaelectric.com'
where not exists (select 1 from public.officials where full_name='Ikeja Electric' and tier='state_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Eko Electricity Distribution Company', 'EKEDC', null, 'Agency', 'state_agency', null, 'active', null, null, null, null, 'https://ekolectrics.com'
where not exists (select 1 from public.officials where full_name='Eko Electricity Distribution Company' and tier='state_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Benin Electricity Distribution Company', 'BEDC', null, 'Agency', 'state_agency', null, 'active', null, null, null, null, 'https://bedc.com.ng'
where not exists (select 1 from public.officials where full_name='Benin Electricity Distribution Company' and tier='state_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Port Harcourt Electricity Distribution Company', 'PHED', null, 'Agency', 'state_agency', null, 'active', null, null, null, null, 'https://phed.com.ng'
where not exists (select 1 from public.officials where full_name='Port Harcourt Electricity Distribution Company' and tier='state_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Enugu Electricity Distribution Company', 'EEDC', null, 'Agency', 'state_agency', null, 'active', null, null, null, null, 'https://enugudisco.com'
where not exists (select 1 from public.officials where full_name='Enugu Electricity Distribution Company' and tier='state_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Kano Electricity Distribution Company', 'KEDCO', null, 'Agency', 'state_agency', null, 'active', null, null, null, null, 'https://kedco.ng'
where not exists (select 1 from public.officials where full_name='Kano Electricity Distribution Company' and tier='state_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Kaduna Electric', 'KAEDCO', null, 'Agency', 'state_agency', null, 'active', null, null, null, null, 'https://www.kadunaelectric.com'
where not exists (select 1 from public.officials where full_name='Kaduna Electric' and tier='state_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Jos Electricity Distribution Company', 'JED', null, 'Agency', 'state_agency', null, 'active', null, null, null, null, 'https://jedplc.com'
where not exists (select 1 from public.officials where full_name='Jos Electricity Distribution Company' and tier='state_agency');

insert into public.officials (full_name, common_name, party, role, tier, state_id, status, office_start, photo_url, bio, social_twitter, website)
select 'Yola Electricity Distribution Company', 'YEDC', null, 'Agency', 'state_agency', null, 'active', null, null, null, null, 'https://yedc.com.ng'
where not exists (select 1 from public.officials where full_name='Yola Electricity Distribution Company' and tier='state_agency');

update public.officials
set photo_url = coalesce(
  nullif(photo_url,''),
  'https://logo.clearbit.com/' || regexp_replace(substring(website from '^https?://([^/]+)'), '^www\\.', '')
)
where website is not null
  and tier in ('federal_agency','state_agency');

commit;
