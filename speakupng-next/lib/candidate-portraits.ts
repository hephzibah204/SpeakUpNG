import { getPartyColorHex } from '@/components/PartyFlag';

/**
 * Comprehensive dictionary of verified portraits for Nigerian political contenders.
 * Includes presidential nominees and gubernatorial candidates across states.
 */
export const CANDIDATE_PORTRAITS: Record<string, string> = {
  // Presidential Candidates
  'bola tinubu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Bola_Tinubu_portrait.jpg/640px-Bola_Tinubu_portrait.jpg',
  'bola ahmed tinubu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Bola_Tinubu_portrait.jpg/640px-Bola_Tinubu_portrait.jpg',
  'peter obi': 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Peter_Obi_2023.jpg',
  'peter gregory obi': 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Peter_Obi_2023.jpg',
  'atiku abubakar': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Atiku_Abubakar.jpg/640px-Atiku_Abubakar.jpg',
  'rabiu kwankwaso': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Rabiu_Kwankwaso.jpg/640px-Rabiu_Kwankwaso.jpg',
  'rabiu musa kwankwaso': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Rabiu_Kwankwaso.jpg/640px-Rabiu_Kwankwaso.jpg',
  'goodluck jonathan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Goodluck_Jonathan_2013.jpg/640px-Goodluck_Jonathan_2013.jpg',
  'seyi makinde': 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Governor_Seyi_Makinde.jpg',
  'oluseyi makinde': 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Governor_Seyi_Makinde.jpg',
  'omoyele sowore': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Omoyele_Sowore_in_2022.jpg/640px-Omoyele_Sowore_in_2022.jpg',
  'donald duke': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Donald_Duke.jpg/640px-Donald_Duke.jpg',
  'adewole adebayo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Prince_Adewole_Adebayo.jpg/640px-Prince_Adewole_Adebayo.jpg',
  'prince adewole adebayo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Prince_Adewole_Adebayo.jpg/640px-Prince_Adewole_Adebayo.jpg',
  'kashim shettima': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Kashim_Shettima_portrait.jpg/640px-Kashim_Shettima_portrait.jpg',
  'rotimi amaechi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Rotimi_Amaechi.jpg/640px-Rotimi_Amaechi.jpg',
  'kayode fayemi': 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Dr._Kayode_Fayemi.jpg',
  'sandy onor': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Sandy_Onor.jpg/640px-Sandy_Onor.jpg',
  'bala mohammed': 'https://upload.wikimedia.org/wikipedia/commons/6/69/Bala_Mohammed.jpg',

  // Governorship Contenders & Incumbents
  'obafemi hamzat': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Femi_Hamzat.jpg/640px-Femi_Hamzat.jpg',
  'femi hamzat': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Femi_Hamzat.jpg/640px-Femi_Hamzat.jpg',
  'babajide sanwo-olu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Babajide_Sanwo-Olu_Official_Portrait.jpg/640px-Babajide_Sanwo-Olu_Official_Portrait.jpg',
  'gbadebo rhodes-vivour': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Gbadebo_Rhodes-Vivour.jpg/640px-Gbadebo_Rhodes-Vivour.jpg',
  'abdul-azeez adediran': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Abdul-Azeez_Olajide_Adediran.jpg/640px-Abdul-Azeez_Olajide_Adediran.jpg',
  'abdul-azeez adediran (jandor)': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Abdul-Azeez_Olajide_Adediran.jpg/640px-Abdul-Azeez_Olajide_Adediran.jpg',
  'jandor': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Abdul-Azeez_Olajide_Adediran.jpg/640px-Abdul-Azeez_Olajide_Adediran.jpg',
  'abba kabir yusuf': 'https://upload.wikimedia.org/wikipedia/commons/5/53/Abba_Kabir_Yusuf.jpg',
  'nasiru gawuna': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Nasir_Gawuna.jpg/640px-Nasir_Gawuna.jpg',
  'nasir gawuna': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Nasir_Gawuna.jpg/640px-Nasir_Gawuna.jpg',
  'uba sani': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Senator_Uba_Sani.jpg/640px-Senator_Uba_Sani.jpg',
  'senator uba sani': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Senator_Uba_Sani.jpg/640px-Senator_Uba_Sani.jpg',
  'alex otti': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Alex_Otti.jpg/640px-Alex_Otti.jpg',
  'siminalayi fubara': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Siminalayi_Fubara.jpg/640px-Siminalayi_Fubara.jpg',
  'sim fubara': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Siminalayi_Fubara.jpg/640px-Siminalayi_Fubara.jpg',
  'tonye cole': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Tonye_Cole.jpg/640px-Tonye_Cole.jpg',
  'sheriff oborevwori': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Sheriff_Oborevwori.jpg/640px-Sheriff_Oborevwori.jpg',
  'ovie omo-agege': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Ovie_Omo-Agege.jpg/640px-Ovie_Omo-Agege.jpg',
  'hyacinth alia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Hyacinth_Alia.jpg/640px-Hyacinth_Alia.jpg',
  'rev. fr. hyacinth alia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Hyacinth_Alia.jpg/640px-Hyacinth_Alia.jpg',
  'peter mbah': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Peter_Mbah.jpg/640px-Peter_Mbah.jpg',
  'chijioke edeoga': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Chijioke_Edeoga.jpg/640px-Chijioke_Edeoga.jpg',
  'francis nwifuru': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Francis_Nwifuru.jpg/640px-Francis_Nwifuru.jpg',
  'dikko umaru radda': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Dikko_Umaru_Radda.jpg/640px-Dikko_Umaru_Radda.jpg',
  'dikko radda': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Dikko_Umaru_Radda.jpg/640px-Dikko_Umaru_Radda.jpg',
  'caleb mutfwang': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Caleb_Mutfwang.jpg/640px-Caleb_Mutfwang.jpg',
  'mohammed umar bago': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Mohammed_Umar_Bago.jpg/640px-Mohammed_Umar_Bago.jpg',
  'umar bago': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Mohammed_Umar_Bago.jpg/640px-Mohammed_Umar_Bago.jpg',
  'umo eno': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Pastor_Umo_Eno.jpg/640px-Pastor_Umo_Eno.jpg',
  'pastor umo eno': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Pastor_Umo_Eno.jpg/640px-Pastor_Umo_Eno.jpg',
  'bassey otu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Bassey_Otu.jpg/640px-Bassey_Otu.jpg',
  'aishatu dahiru': 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Aishatu_Dahiru_Ahmed.jpg',
  'aishatu dahiru binani': 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Aishatu_Dahiru_Ahmed.jpg',
  'binani': 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Aishatu_Dahiru_Ahmed.jpg',
  'sadique abubakar': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Sadique_Abubakar.jpg/640px-Sadique_Abubakar.jpg',
  'dauda lawal': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Dauda_Lawal.jpg/640px-Dauda_Lawal.jpg',
  'bello matawalle': 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Bello_Matawalle.jpg',
  'ahmad aliyu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Ahmad_Aliyu.jpg/640px-Ahmad_Aliyu.jpg',
  'umar namadi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Umar_Namadi.jpg/640px-Umar_Namadi.jpg',
  'nasir idris': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Nasir_Idris.jpg/640px-Nasir_Idris.jpg',
  'ademola adeleke': 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Ademola_Adeleke.jpg',
  'solomon olamilekan adeola (yayi)': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Solomon_Olamilekan_Adeola.jpg/640px-Solomon_Olamilekan_Adeola.jpg',
  'solomon olamilekan adeola': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Solomon_Olamilekan_Adeola.jpg/640px-Solomon_Olamilekan_Adeola.jpg',
  'ladi adebutu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Ladi_Adebutu.jpg/640px-Ladi_Adebutu.jpg',
  'nentawe yilwatda': 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Nentawe_Yilwatda.png',
  'agbu kefas': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Agbu_Kefas.jpg/640px-Agbu_Kefas.jpg',
  'simon lalong': 'https://upload.wikimedia.org/wikipedia/commons/7/77/Simon_Lalong.jpg',
  'sharafadeen alli': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Sharafadeen_Alli.jpg/640px-Sharafadeen_Alli.jpg',
  'adebayo adelabu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Adebayo_Adelabu.jpg/640px-Adebayo_Adelabu.jpg',
  'david ombugadu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/David_Ombugadu.jpg/640px-David_Ombugadu.jpg',
  'danjuma laah': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Danjuma_Laah.jpg/640px-Danjuma_Laah.jpg',
  'isa ashiru kudan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Isa_Ashiru_Kudan.jpg/640px-Isa_Ashiru_Kudan.jpg',
  'isa ashiru': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Isa_Ashiru_Kudan.jpg/640px-Isa_Ashiru_Kudan.jpg',
  'bayo lawal': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Bayo_Lawal.jpg/640px-Bayo_Lawal.jpg',

  // Senate Leaders & Contenders
  'godswill akpabio': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Godswill_Akpabio.jpg/640px-Godswill_Akpabio.jpg',
  'barau jibrin': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Barau_Jibrin.jpg/640px-Barau_Jibrin.jpg',
  'ireti kingibe': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Ireti_Kingibe.jpg/640px-Ireti_Kingibe.jpg',
  'adams oshiomhole': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Adams_Oshiomhole.jpg/640px-Adams_Oshiomhole.jpg',
  'gbenga daniel': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Gbenga_Daniel_new.jpg/640px-Gbenga_Daniel_new.jpg',
  'victor umeh': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Victor_Umeh.jpg/640px-Victor_Umeh.jpg',
  'ned nwoko': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Prince_Ned_Nwoko.jpg/640px-Prince_Ned_Nwoko.jpg',
  'tokunbo abiru': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Tokunbo_Abiru.jpg/640px-Tokunbo_Abiru.jpg',
  'mohammed ali ndume': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Ali_Ndume.jpg/640px-Ali_Ndume.jpg',
  'ali ndume': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Ali_Ndume.jpg/640px-Ali_Ndume.jpg',
  'philip aduda': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Philip_Aduda.jpg/640px-Philip_Aduda.jpg',
  'uche ekwunife': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Uche_Ekwunife.jpg/640px-Uche_Ekwunife.jpg',

  // House of Representatives & State Assembly Leaders
  'tajudeen abbas': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Tajudeen_Abbas.jpg/640px-Tajudeen_Abbas.jpg',
  'benjamin okezie kalu': 'https://commons.wikimedia.org/wiki/Special:FilePath/Benjamin%20Okezie%20Kalu.jpg',
  'benjamin kalu': 'https://commons.wikimedia.org/wiki/Special:FilePath/Benjamin%20Okezie%20Kalu.jpg',
  'kingsley chinda': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Kingsley_Chinda.jpg/640px-Kingsley_Chinda.jpg',
  'julius ihonvbere': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Julius_Ihonvbere.jpg/640px-Julius_Ihonvbere.jpg',
  'bankole wellington (banky w)': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Banky_W_in_2017.jpg/640px-Banky_W_in_2017.jpg',
  'bankole wellington': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Banky_W_in_2017.jpg/640px-Banky_W_in_2017.jpg',
  'banky w': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Banky_W_in_2017.jpg/640px-Banky_W_in_2017.jpg',
  'desmond elliot': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Desmond_Elliot_2014.jpg/640px-Desmond_Elliot_2014.jpg',
  'mudashiru obasa': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Mudashiru_Obasa.jpg/640px-Mudashiru_Obasa.jpg',
  'james abiodun faleke': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/James_Faleke.jpg/640px-James_Faleke.jpg',
  'james faleke': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/James_Faleke.jpg/640px-James_Faleke.jpg',
  'adebo ogundoyin': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Adebo_Ogundoyin.jpg/640px-Adebo_Ogundoyin.jpg',
};

/**
 * Clean and normalize a candidate's name for dictionary lookup
 */
export function normalizeCandidateName(name: string): string {
  return name
    .toLowerCase()
    .replace(/^(dr\.|gov\.|governor|senator|sen\.|barr\.|barrister|prince|pastor|engr\.|rev\.|fr\.)\s+/i, '')
    .trim();
}

/**
 * Generate a deterministic UI-Avatars SVG fallback with party colors
 */
export function getFallbackAvatar(name: string, party?: string, partyCode?: string): string {
  const hex = getPartyColorHex(party, partyCode).replace('#', '');
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=256&background=${hex}&color=ffffff&rounded=true&bold=true&format=svg`;
}

/**
 * Resolve candidate photo URL with high priority for known portraits
 */
export function getCandidatePhoto(
  name: string,
  explicitPhoto?: string | null,
  party?: string,
  partyCode?: string
): string {
  if (explicitPhoto && explicitPhoto.trim().length > 0) {
    return explicitPhoto;
  }

  const normalized = normalizeCandidateName(name);

  // Exact match
  if (CANDIDATE_PORTRAITS[normalized]) {
    return CANDIDATE_PORTRAITS[normalized];
  }

  // Substring match
  for (const [key, url] of Object.entries(CANDIDATE_PORTRAITS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return url;
    }
  }

  return getFallbackAvatar(name, party, partyCode);
}
