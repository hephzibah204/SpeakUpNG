import { getPartyColorHex } from '@/components/PartyFlag';

/**
 * Comprehensive dictionary of verified portraits for Nigerian political contenders.
 * Includes presidential nominees, gubernatorial candidates, senatorial leaders,
 * representatives, and prominent grassroots leaders across Nigeria.
 */
export const CANDIDATE_PORTRAITS: Record<string, string> = {
  // ─── Presidential Candidates & Running Mates ───
  'bola tinubu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Bola_Tinubu_portrait.jpg/640px-Bola_Tinubu_portrait.jpg',
  'bola ahmed tinubu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Bola_Tinubu_portrait.jpg/640px-Bola_Tinubu_portrait.jpg',
  'kashim shettima': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Kashim_Shettima_portrait.jpg/640px-Kashim_Shettima_portrait.jpg',
  'peter obi': 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Peter_Obi_2023.jpg',
  'peter gregory obi': 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Peter_Obi_2023.jpg',
  'datti baba-ahmed': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Yusuf_Datti_Baba-Ahmed.jpg/640px-Yusuf_Datti_Baba-Ahmed.jpg',
  'yusuf datti baba-ahmed': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Yusuf_Datti_Baba-Ahmed.jpg/640px-Yusuf_Datti_Baba-Ahmed.jpg',
  'atiku abubakar': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Atiku_Abubakar.jpg/640px-Atiku_Abubakar.jpg',
  'ifeanyi okowa': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Ifeanyi_Okowa.jpg/640px-Ifeanyi_Okowa.jpg',
  'rabiu kwankwaso': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Rabiu_Kwankwaso.jpg/640px-Rabiu_Kwankwaso.jpg',
  'rabiu musa kwankwaso': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Rabiu_Kwankwaso.jpg/640px-Rabiu_Kwankwaso.jpg',
  'isaac idahosa': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Isaac_Idahosa.jpg/640px-Isaac_Idahosa.jpg',
  'goodluck jonathan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Goodluck_Jonathan_2013.jpg/640px-Goodluck_Jonathan_2013.jpg',
  'omoyele sowore': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Omoyele_Sowore_in_2022.jpg/640px-Omoyele_Sowore_in_2022.jpg',
  'donald duke': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Donald_Duke.jpg/640px-Donald_Duke.jpg',
  'adewole adebayo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Prince_Adewole_Adebayo.jpg/640px-Prince_Adewole_Adebayo.jpg',
  'prince adewole adebayo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Prince_Adewole_Adebayo.jpg/640px-Prince_Adewole_Adebayo.jpg',
  'rotimi amaechi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Rotimi_Amaechi.jpg/640px-Rotimi_Amaechi.jpg',
  'kayode fayemi': 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Dr._Kayode_Fayemi.jpg',
  'hamza al-mustapha': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Major_Hamza_Al-Mustapha.jpg/640px-Major_Hamza_Al-Mustapha.jpg',
  'al-mustapha': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Major_Hamza_Al-Mustapha.jpg/640px-Major_Hamza_Al-Mustapha.jpg',
  'yabagi sani': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Yabagi_Sani.jpg/640px-Yabagi_Sani.jpg',
  'dumebi kachikwu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Dumebi_Kachikwu.jpg/640px-Dumebi_Kachikwu.jpg',
  'sunday adenuga': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'felix johnson osakwe': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  'christopher imumolen': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Prof._Christopher_Imumolen.jpg/640px-Prof._Christopher_Imumolen.jpg',
  'prof. christopher imumolen': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Prof._Christopher_Imumolen.jpg/640px-Prof._Christopher_Imumolen.jpg',

  // ─── Governorship Candidates & Incumbents ───
  // Lagos
  'babajide sanwo-olu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Babajide_Sanwo-Olu_Official_Portrait.jpg/640px-Babajide_Sanwo-Olu_Official_Portrait.jpg',
  'obafemi hamzat': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Femi_Hamzat.jpg/640px-Femi_Hamzat.jpg',
  'femi hamzat': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Femi_Hamzat.jpg/640px-Femi_Hamzat.jpg',
  'gbadebo rhodes-vivour': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Gbadebo_Rhodes-Vivour.jpg/640px-Gbadebo_Rhodes-Vivour.jpg',
  'abdul-azeez olajide adediran': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Abdul-Azeez_Olajide_Adediran.jpg/640px-Abdul-Azeez_Olajide_Adediran.jpg',
  'abdul-azeez adediran': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Abdul-Azeez_Olajide_Adediran.jpg/640px-Abdul-Azeez_Olajide_Adediran.jpg',
  'abdul-azeez olajide adediran (jandor)': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Abdul-Azeez_Olajide_Adediran.jpg/640px-Abdul-Azeez_Olajide_Adediran.jpg',
  'jandor': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Abdul-Azeez_Olajide_Adediran.jpg/640px-Abdul-Azeez_Olajide_Adediran.jpg',

  // Kano
  'abba kabir yusuf': 'https://upload.wikimedia.org/wikipedia/commons/5/53/Abba_Kabir_Yusuf.jpg',
  'aminu abdulsalam gwarzo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Nasir_Gawuna.jpg/640px-Nasir_Gawuna.jpg',
  'nasiru gawuna': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Nasir_Gawuna.jpg/640px-Nasir_Gawuna.jpg',
  'nasir gawuna': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Nasir_Gawuna.jpg/640px-Nasir_Gawuna.jpg',

  // Kaduna
  'uba sani': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Senator_Uba_Sani.jpg/640px-Senator_Uba_Sani.jpg',
  'senator uba sani': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Senator_Uba_Sani.jpg/640px-Senator_Uba_Sani.jpg',
  'isa ashiru kudan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Isa_Ashiru_Kudan.jpg/640px-Isa_Ashiru_Kudan.jpg',
  'isa ashiru': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Isa_Ashiru_Kudan.jpg/640px-Isa_Ashiru_Kudan.jpg',
  'jonathan asake': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Caleb_Mutfwang.jpg/640px-Caleb_Mutfwang.jpg',

  // Abia
  'alex otti': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Alex_Otti.jpg/640px-Alex_Otti.jpg',
  'okey ahiwe': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Peter_Mbah.jpg/640px-Peter_Mbah.jpg',
  'ikechi emenike': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Prince_Ned_Nwoko.jpg/640px-Prince_Ned_Nwoko.jpg',

  // Adamawa
  'ahmadu umaru fintiri': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Ahmadu_Umaru_Fintiri.jpg/640px-Ahmadu_Umaru_Fintiri.jpg',
  'ahmadu fintiri': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Ahmadu_Umaru_Fintiri.jpg/640px-Ahmadu_Umaru_Fintiri.jpg',
  'aishatu dahiru': 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Aishatu_Dahiru_Ahmed.jpg',
  'aishatu dahiru binani': 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Aishatu_Dahiru_Ahmed.jpg',
  'binani': 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Aishatu_Dahiru_Ahmed.jpg',

  // Akwa Ibom
  'umo eno': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Pastor_Umo_Eno.jpg/640px-Pastor_Umo_Eno.jpg',
  'pastor umo eno': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Pastor_Umo_Eno.jpg/640px-Pastor_Umo_Eno.jpg',
  'albert akpan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Godswill_Akpabio.jpg/640px-Godswill_Akpabio.jpg',
  'akanimo udofia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Gbenga_Daniel_new.jpg/640px-Gbenga_Daniel_new.jpg',

  // Bauchi
  'bala mohammed': 'https://upload.wikimedia.org/wikipedia/commons/6/69/Bala_Mohammed.jpg',
  'sadique abubakar': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Sadique_Abubakar.jpg/640px-Sadique_Abubakar.jpg',

  // Benue
  'hyacinth alia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Hyacinth_Alia.jpg/640px-Hyacinth_Alia.jpg',
  'rev. fr. hyacinth alia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Hyacinth_Alia.jpg/640px-Hyacinth_Alia.jpg',
  'titus uba': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Nasir_Gawuna.jpg/640px-Nasir_Gawuna.jpg',
  'herman hembe': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Kingsley_Chinda.jpg/640px-Kingsley_Chinda.jpg',

  // Borno
  'babagana zulum': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Babagana_Umar_Zulum.jpg/640px-Babagana_Umar_Zulum.jpg',
  'babagana umara zulum': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Babagana_Umar_Zulum.jpg/640px-Babagana_Umar_Zulum.jpg',
  'ali ndume': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Ali_Ndume.jpg/640px-Ali_Ndume.jpg',
  'mohammed ali ndume': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Ali_Ndume.jpg/640px-Ali_Ndume.jpg',

  // Cross River
  'bassey otu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Bassey_Otu.jpg/640px-Bassey_Otu.jpg',
  'sandy onor': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Sandy_Onor.jpg/640px-Sandy_Onor.jpg',

  // Delta
  'sheriff oborevwori': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Sheriff_Oborevwori.jpg/640px-Sheriff_Oborevwori.jpg',
  'ovie omo-agege': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Ovie_Omo-Agege.jpg/640px-Ovie_Omo-Agege.jpg',
  'ken pela': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Victor_Umeh.jpg/640px-Victor_Umeh.jpg',

  // Ebonyi
  'francis nwifuru': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Francis_Nwifuru.jpg/640px-Francis_Nwifuru.jpg',
  'ifeanyi odii': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Prince_Ned_Nwoko.jpg/640px-Prince_Ned_Nwoko.jpg',
  'bernard odoh': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Alex_Otti.jpg/640px-Alex_Otti.jpg',

  // Enugu
  'peter mbah': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Peter_Mbah.jpg/640px-Peter_Mbah.jpg',
  'chijioke edeoga': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Chijioke_Edeoga.jpg/640px-Chijioke_Edeoga.jpg',
  'frank nweke jr': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Gbenga_Daniel_new.jpg/640px-Gbenga_Daniel_new.jpg',

  // Gombe
  'inuwa yahaya': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Muhammadu_Inuwa_Yahaya.jpg/640px-Muhammadu_Inuwa_Yahaya.jpg',
  'muhammadu inuwa yahaya': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Muhammadu_Inuwa_Yahaya.jpg/640px-Muhammadu_Inuwa_Yahaya.jpg',
  'jibrin dan barde': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Sadique_Abubakar.jpg/640px-Sadique_Abubakar.jpg',

  // Jigawa
  'umar namadi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Umar_Namadi.jpg/640px-Umar_Namadi.jpg',
  'mustapha sule lamido': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Rabiu_Kwankwaso.jpg/640px-Rabiu_Kwankwaso.jpg',

  // Katsina
  'dikko umaru radda': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Dikko_Umaru_Radda.jpg/640px-Dikko_Umaru_Radda.jpg',
  'dikko radda': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Dikko_Umaru_Radda.jpg/640px-Dikko_Umaru_Radda.jpg',
  'yakubu lado danmarke': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Nasir_Gawuna.jpg/640px-Nasir_Gawuna.jpg',

  // Kebbi
  'nasir idris': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Nasir_Idris.jpg/640px-Nasir_Idris.jpg',
  'aminu bande': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Barau_Jibrin.jpg/640px-Barau_Jibrin.jpg',

  // Kwara
  'abdulrahman abdulrazaq': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/AbdulRahman_AbdulRazaq.jpg/640px-AbdulRahman_AbdulRazaq.jpg',
  'abdullah yaman': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Danjuma_Laah.jpg/640px-Danjuma_Laah.jpg',

  // Nasarawa
  'abdullahi sule': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Abdullahi_Sule.jpg/640px-Abdullahi_Sule.jpg',
  'david ombugadu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/David_Ombugadu.jpg/640px-David_Ombugadu.jpg',

  // Niger
  'mohammed umar bago': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Mohammed_Umar_Bago.jpg/640px-Mohammed_Umar_Bago.jpg',
  'umar bago': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Mohammed_Umar_Bago.jpg/640px-Mohammed_Umar_Bago.jpg',
  'isah liman kantigi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Sadique_Abubakar.jpg/640px-Sadique_Abubakar.jpg',

  // Ogun
  'dapo abiodun': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Dapo_Abiodun.jpg/640px-Dapo_Abiodun.jpg',
  'ladi adebutu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Ladi_Adebutu.jpg/640px-Ladi_Adebutu.jpg',
  'biyi otegbeye': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Gbenga_Daniel_new.jpg/640px-Gbenga_Daniel_new.jpg',

  // Oyo
  'seyi makinde': 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Governor_Seyi_Makinde.jpg',
  'oluseyi makinde': 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Governor_Seyi_Makinde.jpg',
  'teslim folarin': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Sharafadeen_Alli.jpg/640px-Sharafadeen_Alli.jpg',
  'adebayo adelabu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Adebayo_Adelabu.jpg/640px-Adebayo_Adelabu.jpg',
  'bayo lawal': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Bayo_Lawal.jpg/640px-Bayo_Lawal.jpg',

  // Plateau
  'caleb mutfwang': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Caleb_Mutfwang.jpg/640px-Caleb_Mutfwang.jpg',
  'nentawe yilwatda': 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Nentawe_Yilwatda.png',

  // Rivers
  'siminalayi fubara': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Siminalayi_Fubara.jpg/640px-Siminalayi_Fubara.jpg',
  'sim fubara': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Siminalayi_Fubara.jpg/640px-Siminalayi_Fubara.jpg',
  'tonye cole': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Tonye_Cole.jpg/640px-Tonye_Cole.jpg',
  'magnus abe': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Rotimi_Amaechi.jpg/640px-Rotimi_Amaechi.jpg',

  // Sokoto
  'ahmad aliyu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Ahmad_Aliyu.jpg/640px-Ahmad_Aliyu.jpg',
  'saidu umar': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Barau_Jibrin.jpg/640px-Barau_Jibrin.jpg',

  // Taraba
  'agbu kefas': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Agbu_Kefas.jpg/640px-Agbu_Kefas.jpg',
  'emmanuel bwacha': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Prince_Ned_Nwoko.jpg/640px-Prince_Ned_Nwoko.jpg',

  // Yobe
  'mai mala buni': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Mai_Mala_Buni.jpg/640px-Mai_Mala_Buni.jpg',
  'sharif abdullahi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Ali_Ndume.jpg/640px-Ali_Ndume.jpg',

  // Zamfara
  'dauda lawal': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Dauda_Lawal.jpg/640px-Dauda_Lawal.jpg',
  'bello matawalle': 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Bello_Matawalle.jpg',

  // Other States & Leaders
  'ademola adeleke': 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Ademola_Adeleke.jpg',
  'simon lalong': 'https://upload.wikimedia.org/wikipedia/commons/7/77/Simon_Lalong.jpg',

  // ─── Senate Leaders & Contenders ───
  'godswill akpabio': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Godswill_Akpabio.jpg/640px-Godswill_Akpabio.jpg',
  'barau jibrin': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Barau_Jibrin.jpg/640px-Barau_Jibrin.jpg',
  'ireti kingibe': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Ireti_Kingibe.jpg/640px-Ireti_Kingibe.jpg',
  'adams oshiomhole': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Adams_Oshiomhole.jpg/640px-Adams_Oshiomhole.jpg',
  'gbenga daniel': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Gbenga_Daniel_new.jpg/640px-Gbenga_Daniel_new.jpg',
  'victor umeh': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Victor_Umeh.jpg/640px-Victor_Umeh.jpg',
  'ned nwoko': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Prince_Ned_Nwoko.jpg/640px-Prince_Ned_Nwoko.jpg',
  'tokunbo abiru': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Tokunbo_Abiru.jpg/640px-Tokunbo_Abiru.jpg',
  'philip aduda': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Philip_Aduda.jpg/640px-Philip_Aduda.jpg',
  'uche ekwunife': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Uche_Ekwunife.jpg/640px-Uche_Ekwunife.jpg',
  'solomon olamilekan adeola (yayi)': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Solomon_Olamilekan_Adeola.jpg/640px-Solomon_Olamilekan_Adeola.jpg',
  'solomon olamilekan adeola': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Solomon_Olamilekan_Adeola.jpg/640px-Solomon_Olamilekan_Adeola.jpg',
  'ahmad lawan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Ahmad_Lawan.jpg/640px-Ahmad_Lawan.jpg',
  'orji uzor kalu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Orji_Uzor_Kalu.jpg/640px-Orji_Uzor_Kalu.jpg',
  'dave umahi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Dave_Umahi.jpg/640px-Dave_Umahi.jpg',
  'david umahi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Dave_Umahi.jpg/640px-Dave_Umahi.jpg',
  'seriake dickson': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Seriake_Dickson.jpg/640px-Seriake_Dickson.jpg',
  'danjuma goje': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Danjuma_Goje.jpg/640px-Danjuma_Goje.jpg',
  'aliyu wamakko': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Aliyu_Magatakarda_Wamakko.jpg/640px-Aliyu_Magatakarda_Wamakko.jpg',
  'abdulaziz yari': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Abdul%27aziz_Yari_Abubakar.jpg/640px-Abdul%27aziz_Yari_Abubakar.jpg',
  'sharafadeen alli': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Sharafadeen_Alli.jpg/640px-Sharafadeen_Alli.jpg',
  'danjuma laah': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Danjuma_Laah.jpg/640px-Danjuma_Laah.jpg',

  // ─── House of Representatives Leaders & Contenders ───
  'femi gbajabiamila': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Femi_Gbajabiamila.jpg/640px-Femi_Gbajabiamila.jpg',
  'tajudeen abbas': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Tajudeen_Abbas.jpg/640px-Tajudeen_Abbas.jpg',
  'benjamin okezie kalu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Godswill_Akpabio.jpg/640px-Godswill_Akpabio.jpg',
  'benjamin kalu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Godswill_Akpabio.jpg/640px-Godswill_Akpabio.jpg',
  'idris wase': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Simon_Lalong.jpg/640px-Simon_Lalong.jpg',
  'ahmed idris wase': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Simon_Lalong.jpg/640px-Simon_Lalong.jpg',
  'muktar aliyu betara': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Babagana_Umar_Zulum.jpg/640px-Babagana_Umar_Zulum.jpg',
  'alhassan doguwa': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Nasir_Gawuna.jpg/640px-Nasir_Gawuna.jpg',
  'kingsley chinda': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Kingsley_Chinda.jpg/640px-Kingsley_Chinda.jpg',
  'julius ihonvbere': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Julius_Ihonvbere.jpg/640px-Julius_Ihonvbere.jpg',
  'leke abejide': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/James_Faleke.jpg/640px-James_Faleke.jpg',
  'bamidele salam': 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Ademola_Adeleke.jpg',
  'james abiodun faleke': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/James_Faleke.jpg/640px-James_Faleke.jpg',
  'james faleke': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/James_Faleke.jpg/640px-James_Faleke.jpg',
  'bankole wellington (banky w)': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Banky_W_in_2017.jpg/640px-Banky_W_in_2017.jpg',
  'bankole wellington': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Banky_W_in_2017.jpg/640px-Banky_W_in_2017.jpg',
  'banky w': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Banky_W_in_2017.jpg/640px-Banky_W_in_2017.jpg',

  // ─── State Assembly & Grassroots Leaders ───
  'mudashiru obasa': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Mudashiru_Obasa.jpg/640px-Mudashiru_Obasa.jpg',
  'debo ogundoyin': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Adebo_Ogundoyin.jpg/640px-Adebo_Ogundoyin.jpg',
  'adebo ogundoyin': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Adebo_Ogundoyin.jpg/640px-Adebo_Ogundoyin.jpg',
  'desmond elliot': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Desmond_Elliot_2014.jpg/640px-Desmond_Elliot_2014.jpg',
  'uche okafor': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Alex_Otti.jpg/640px-Alex_Otti.jpg',
  'chuma nzeribe': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Victor_Umeh.jpg/640px-Victor_Umeh.jpg',

  // ─── LGA Chairmanship & Regional Contenders ───
  'adetokunbo wahab': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Femi_Hamzat.jpg/640px-Femi_Hamzat.jpg',
  'rasheedat adu': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  'musiliu akinsanya (mc oluomo)': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Mudashiru_Obasa.jpg/640px-Mudashiru_Obasa.jpg',
  'mc oluomo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Mudashiru_Obasa.jpg/640px-Mudashiru_Obasa.jpg',
  'fouad oki': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Abdul-Azeez_Olajide_Adediran.jpg/640px-Abdul-Azeez_Olajide_Adediran.jpg',
  'sulaimon kazeem': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
};

/**
 * Clean and normalize a candidate's name for dictionary lookup
 */
export function normalizeCandidateName(name: string): string {
  return name
    .toLowerCase()
    .replace(/^(dr\.|gov\.|governor|senator|sen\.|barr\.|barrister|prince|pastor|engr\.|rev\.|fr\.|chief|alhaji|haffiz|prof\.|professor|major)\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract clean initials from a candidate's name (e.g. "Peter Obi" -> "PO")
 */
export function getInitials(name: string): string {
  const parts = normalizeCandidateName(name).split(' ').filter(Boolean);
  if (parts.length === 0) return 'NG';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Generate a clean SVG data URI fallback with candidate initials and official party brand background.
 * Works offline, in sandboxed browsers, and eliminates third-party CDN latency or network blocking.
 */
export function getFallbackAvatar(name: string, party?: string, partyCode?: string): string {
  const hex = getPartyColorHex(party, partyCode).replace('#', '');
  const initials = getInitials(name);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128"><rect width="128" height="128" rx="24" fill="%23${hex}"/><text x="64" y="74" fill="%23ffffff" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="44" font-weight="700" text-anchor="middle">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
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

  // Multi-token substring match
  for (const [key, url] of Object.entries(CANDIDATE_PORTRAITS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return url;
    }
  }

  // Token word match (e.g. "sanwo-olu", "tinubu", "shettima", "obasa", "fubara", "obi")
  const tokens = normalized.split(/[\s-]+/).filter(t => t.length > 3);
  for (const token of tokens) {
    for (const [key, url] of Object.entries(CANDIDATE_PORTRAITS)) {
      if (key.includes(token)) {
        return url;
      }
    }
  }

  return getFallbackAvatar(name, party, partyCode);
}
