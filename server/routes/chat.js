const express = require('express');
const router = express.Router();
const axios = require('axios');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

// Comprehensive Clinical Knowledge Base for Sri Lankan healthcare
const CLINICAL_KNOWLEDGE = [
  // --- URGENT (RED) EMERGENCIES ---
  {
    id: 'chest_pain',
    level: 'URGENT',
    triggers: [
      'chest pain', 'chest tightness', 'heart attack', 'pain in chest', 'left arm pain', 'pressure in chest',
      'angina', 'crushing chest', 'පපුවේ කැක්කුම', 'පපුව රිදෙනවා', 'හෘදයාබාධ', 'papuwe kakkuma', 'papuwa ridenawa',
      'நெஞ்சு வலி', 'மாரடைப்பு', 'nenju vali', 'maradaippu'
    ],
    en: {
      assessment: 'Symptoms suggest possible acute coronary syndrome (cardiac emergency/heart attack) or serious pulmonary condition. Immediate emergency medical intervention is required.',
      advice: 'Stop all physical activity immediately. Sit comfortably with back supported. Loosen tight clothing. Do not drive yourself. If prescribed sublingual nitroglycerin, use as directed.',
      when: 'Call 1990 (Suwa Seriya Free Ambulance) immediately or have someone rush you to the nearest hospital emergency room (ETU) without any delay.'
    },
    si: {
      assessment: 'ඔබේ රෝග ලක්ෂණ හදිසි හෘදයාබාධයක් හෝ බරපතල පෙනහළු තත්ත්වයක් පෙන්නුම් කළ හැක. ක්ෂණික හදිසි ප්‍රතිකාර අත්‍යවශ්‍ය වේ.',
      advice: 'වහාම සියලු ක්‍රියාකාරකම් නවතා සුවපහසුව හිඳගන්න. තද ඇඳුම් ලිහිල් කරන්න. ඔබ විසින්ම වාහන පැදවීමෙන් වළකින්න.',
      when: 'වහාම 1990 (සුවසැරිය ගිලන්රථ සේවය) අමතන්න හෝ ළඟම ඇති රජයේ රෝහලේ හදිසි ප්‍රතිකාර ඒකකයට (ETU) පිටත්වන්න.'
    },
    ta: {
      assessment: 'உங்கள் அறிகுறிகள் கடுமையான இதய பிரச்சினை அல்லது தீவிர நுரையீரல் பாதிப்பை குறிக்கலாம். உடனடி அவசர சிகிச்சை தேவைப்படுகிறது.',
      advice: 'அனைத்து வேலைகளையும் உடனடியாக நிறுத்திவிட்டு அமைதியாக அமரவும். இறுக்கமான ஆடைகளை தளர்த்தவும்.',
      when: 'உடனடியாக 1990 (சுவ செரிய அவசர ஊர்தி) அழையுங்கள் அல்லது அருகிலுள்ள மருத்துவமனை அவசர சிகிச்சைப் பிரிவுக்கு செல்லுங்கள்.'
    }
  },
  {
    id: 'stroke',
    level: 'URGENT',
    triggers: [
      'stroke', 'face drooping', 'arm weakness', 'slurred speech', 'cant speak', 'numbness one side',
      'sudden paralysis', 'අංශභාගය', 'කතා කරන්න අමාරුයි', 'මුහුණ පැත්තක්', 'ඇස් පෙනීම නැතිවීම', 'anshabhagaya',
      'பக்கவாதம்', 'பேச முடியவில்லை', 'முகம் கோணுதல்', 'pakkavatham'
    ],
    en: {
      assessment: 'Critical signs consistent with acute stroke (FAST: Face, Arms, Speech, Time). Brain tissue is at risk and immediate clot-busting or acute stroke care is vital.',
      advice: 'Keep the patient lying flat on their side (recovery position) if dizzy or drowsy. Do not give any food, water, or oral medications as swallowing may be compromised.',
      when: 'Call 1990 immediately! Rush to a tertiary hospital with CT scan and stroke unit within the 4.5-hour golden window.'
    },
    si: {
      assessment: 'අංශභාග (Stroke) තත්ත්වයක ලක්ෂණ පෙන්නුම් කරයි. මොළයේ රුධිර නාලයක අවහිරයක් හෝ ලේ ගැලීමක් විය හැක. ක්ෂණික ප්‍රතිකාර අතිශය තීරණාත්මකයි.',
      advice: 'රෝගියා එක පැත්තකට හරවා සුවපහසුව තබන්න. කෑම හෝ වතුර කිසිවක් නොදෙන්න.',
      when: 'වහාම 1990 සුවසැරිය අමතන්න! පැය 3-4ක් ඇතුළත CT ස්කෑන් පහසුකම් සහිත ප්‍රධාන රෝහලකට රෝගියා ඇතුළත් කරන්න.'
    },
    ta: {
      assessment: 'பக்கவாதத்தின் (Stroke) தீவிர அறிகுறிகள். மூளைக்கு செல்லும் இரத்த ஓட்டத்தில் பாதிப்பு ஏற்பட்டுள்ளது. உடனடி சிகிச்சை மிக முக்கியம்.',
      advice: 'நோயாளியை ஒருபுறமாக சாய்த்து படுக்க வைக்கவும். வாய்வழியாக உணவோ தண்ணீரோ கொடுக்க வேண்டாம்.',
      when: 'உடனடியாக 1990 எண்ணை அழையுங்கள்! சிடி ஸ்கேன் (CT Scan) வசதி கொண்ட பெரிய மருத்துவமனைக்கு உடனடியாக செல்லுங்கள்.'
    }
  },
  {
    id: 'snake_bite',
    level: 'URGENT',
    triggers: [
      'snake bite', 'snake', 'viper', 'cobra', 'krait', 'poisonous bite', 'poison', 'insect sting allergic',
      'සර්පයෙක් කෑවා', 'නයෙක්', 'පොළඟෙක්', 'විෂ', 'sarpa bite', 'sarpayek kawa',
      'பாம்பு கடி', 'விஷம்', 'pambu kadi'
    ],
    en: {
      assessment: 'Suspected venomous snake bite or acute poisoning. High risk of neurotoxicity, coagulopathy (bleeding), or renal failure.',
      advice: 'Keep the victim calm and completely still. Immobilize the bitten limb below heart level using a splint. DO NOT cut the wound, suck venom, apply a tight tourniquet, or apply ice.',
      when: 'Rush to the nearest Base or General Hospital with Anti-Snake Venom (ASV) and Intensive Care capacity immediately. Call 1990.'
    },
    si: {
      assessment: 'විෂ සර්ප දෂ්ඨනයක් හෝ විෂවීමක් විය හැක. රුධිරය කැටිගැසීම, වකුගඩු හෝ ස්නායු පද්ධතියට හානි විය හැකි බැවින් ක්ෂණික ප්‍රතිකාර අවශ්‍යයි.',
      advice: 'රෝගියා නොසෙල්වා සන්සුන්ව තබන්න. දෂ්ඨ කළ ස්ථානය නොසෙල්වෙන සේ ලෑලි පතුරක් තබා බඳින්න. තුවාලය කැපීම, ලේ ඉරීම හෝ තදින් ගැට ගැසීම (tourniquet) කිසිසේත් නොකරන්න.',
      when: 'ප්‍රතිවිෂ (Anti-Snake Venom) ඇති ළඟම ඇති ප්‍රධාන රජයේ රෝහලට වහාම රෝගියා ගෙන යන්න. 1990 අමතන්න.'
    },
    ta: {
      assessment: 'பாம்பு கடி அல்லது தீவிர நச்சு பாதிப்பு. நரம்பு மண்டலம் மற்றும் இரத்தத்தில் நச்சு பரவும் ஆபத்து உள்ளது.',
      advice: 'கடிபட்டவரை அசையாமல் அமைதியாக வைக்கவும். கடிபட்ட பகுதியை இதய மட்டத்திற்கு கீழே வைக்கவும். காயத்தை வெட்டவோ அல்லது கயிறுகளால் இறுக்கி கட்டவோ கூடாது.',
      when: 'உடனடியாக 1990 அழைத்து நச்சு முறிவு மருந்து (Anti-venom) உள்ள மருத்துவமனைக்கு விரைந்து செல்லுங்கள்.'
    }
  },
  {
    id: 'severe_respiratory',
    level: 'URGENT',
    triggers: [
      'difficulty breathing', 'cannot breathe', 'severe breathlessness', 'gasping', 'blue lips', 'severe asthma attack',
      'suffocating', 'හුස්ම ගන්න අමාරුයි', 'හුස්ම හිරවෙනවා', 'ඇදුම වැඩිවෙලා', 'husma ganna amarui', 'husma hira wenawa',
      'மூச்சுத் திணறல்', 'சுவாசிக்க முடியவில்லை', 'muchu thinartal'
    ],
    en: {
      assessment: 'Acute respiratory distress or life-threatening asthma exacerbation. Severe oxygen deprivation risk.',
      advice: 'Sit upright leaning slightly forward. If the patient has a prescribed reliever inhaler (Salbutamol) with spacer, administer 2-4 puffs immediately.',
      when: 'Call 1990 immediately or proceed to the nearest Emergency Treatment Unit (ETU) for oxygen and nebulization.'
    },
    si: {
      assessment: 'දැඩි ශ්වසන අපහසුතාවයක් හෝ උග්‍ර ඇදුම තත්ත්වයක්. ශරීරයට ඔක්සිජන් ලැබීම අඩුවීමේ දැඩි අවදානමක් ඇත.',
      advice: 'රෝගියා කෙළින් හිඳුවා ඉදිරියට මදක් නැමෙන්නට හරින්න. සල්බියුටමෝල් (Salbutamol) ඉන්හේලරයක් ඇත්නම් වහාම පෆ් 2-4ක් ලබා දෙන්න.',
      when: 'වහාම 1990 අමතන්න හෝ ඔක්සිජන් සහ නෙබියුලයිසර් පහසුකම් ඇති ළඟම ඇති රෝහල වෙත යන්න.'
    },
    ta: {
      assessment: 'தீவிர சுவாசக் கோளாறு அல்லது ஆஸ்துமா தாக்குதல். இரத்தத்தில் ஆக்ஸிஜன் குறையும் ஆபத்து உள்ளது.',
      advice: 'நேராக உட்கார வைக்கவும். இன்ஹேலர் (Inhaler) இருந்தால் உடனடியாக 2 முதல் 4 முறைகள் உள்ளிழுக்கச் செய்யவும்.',
      when: 'உடனடியாக 1990 அழையுங்கள் அல்லது ஆக்ஸிஜன் வசதி உள்ள அவசர சிகிச்சைப் பிரிவுக்கு செல்லுங்கள்.'
    }
  },
  {
    id: 'dengue_warning',
    level: 'URGENT',
    triggers: [
      'dengue bleeding', 'fever with bleeding', 'bleeding gums', 'black stool', 'severe stomach pain with fever',
      'persistent vomiting fever', 'extreme drowsiness fever', 'ඩෙංගු ලේ ගැලීම', 'විදුරුමහෙන් ලේ', 'තද බඩේ කැක්කුම උණ',
      'dengue le galima', 'dengue warning', 'டெங்கு இரத்தக்கசிவு'
    ],
    en: {
      assessment: 'Critical Dengue Warning Signs detected. Potential progression to Dengue Hemorrhagic Fever (DHF) or Dengue Shock Syndrome.',
      advice: 'DO NOT take Aspirin, Ibuprofen, Diclofenac, or Mefenamic Acid (NSAIDs) — they cause catastrophic internal bleeding. Take only Paracetamol for fever. Give oral fluids like king coconut water or rice soup.',
      when: 'Hospital admission is urgently required! Go to the nearest General or District hospital emergency department immediately.'
    },
    si: {
      assessment: 'ඩෙංගු රක්තපාත තත්ත්වයේ (DHF) අවදානම් ලක්ෂණ පවතී. රුධිර පට්ටිකා ශීඝ්‍රයෙන් අඩුවීම හා අභ්‍යන්තර ලේ ගැලීමේ අවදානමක් ඇත.',
      advice: 'ඇස්ප්‍රින්, ඉබියුප්‍රොෆෙන් (Brufen), මෙෆෙනමික් හෝ ඩයික්ලොෆෙනැක් වැනි වේදනා නාශක කිසිසේත් නොගන්න (ලේ ගැලීම වැඩි වේ). පැරසිටමෝල් පමණක් භාවිතා කරන්න. තැඹිලි වතුර, කැඳ ලබා දෙන්න.',
      when: 'වහාම ප්‍රධාන රජයේ රෝහලක හදිසි ප්‍රතිකාර ඒකකයට ඇතුළත් වන්න. රුධිර පරීක්ෂණ (FBC) සිදුකිරීම අත්‍යවශ්‍ය වේ.'
    },
    ta: {
      assessment: 'டெங்கு இரத்தப்போக்கு அல்லது அதிர்ச்சி நிலையின் எச்சரிக்கை அறிகுறிகள். உடனடி மருத்துவ கண்காணிப்பு அவசியம்.',
      advice: 'ஆஸ்பிரின், இபுப்ரோஃபென் போன்ற வலி நிவாரணிகளை கண்டிப்பாக எடுக்க வேண்டாம். பாராசிட்டமால் மட்டுமே பயன்படுத்தவும்.',
      when: 'உடனடியாக பெரிய அரசு மருத்துவமனையில் அனுமதிக்கப்பட வேண்டும்.'
    }
  },

  // --- MODERATE (YELLOW) CLINICAL CONDITIONS ---
  {
    id: 'dengue_fever',
    level: 'MODERATE',
    triggers: [
      'fever', 'high temperature', 'shivering', 'chills', 'body ache', 'pain behind eyes', 'retro orbital',
      'joint pain', 'dengue', 'viral fever', 'උණ', 'තද උණ', 'ඇඟ කැක්කුම', 'ඇස් පිටුපස වේදනාව', 'una',
      'kakkuma', 'anga kakkuma', 'dengue fever', 'காய்ச்சல்', 'உடல் வலி', 'kaichal', 'udal vali'
    ],
    en: {
      assessment: 'Acute febrile illness consistent with probable Dengue, Viral Fever, or bacterial infection.',
      advice: 'Complete bed rest and plenty of fluids (King coconut water, electrolyte solutions, kanji/soup). Take Paracetamol (1g every 6 hours for adults, weight-based for children). Strictly avoid NSAIDs (Brufen/Ibuprofen/Aspirin).',
      when: 'Perform a Full Blood Count (FBC) on Day 2 or 3 of fever. Visit a doctor or OPD within 12-24 hours. Seek immediate emergency care if persistent vomiting, abdominal pain, or bleeding occurs.'
    },
    si: {
      assessment: 'ඩෙංගු හෝ වෙනත් වෛරස් උණ රෝගී තත්ත්වයක ලක්ෂණ පවතී. ශ්‍රී ලංකාවේ වර්තමාන තත්ත්වය අනුව ඩෙංගු පිළිබඳව අවධානයෙන් සිටීම වැදගත්ය.',
      advice: 'පූර්ණ විවේකය ගන්න. තැඹිලි වතුර, කැඳ, ජීවනී වැනි දියර වර්ග බහුලව පානය කරන්න. උණට පැරසිටමෝල් පමණක් නියමිත මාත්‍රාවෙන් ගන්න. බෲෆන්/ඇස්ප්‍රින් කිසිසේත් නොගන්න.',
      when: 'උණ වැළඳී 2 වන හෝ 3 වන දිනයේදී සම්පූර්ණ රුධිර පරීක්ෂාවක් (Full Blood Count - FBC) සිදුකර ළඟම ඇති වෛද්‍යවරයා වෙත පෙන්වන්න.'
    },
    ta: {
      assessment: 'டெங்கு அல்லது தீவிர வைரஸ் காய்ச்சலின் அறிகுறிகள். போதிய நீரேற்றம் அவசியம்.',
      advice: 'முழுமையான ஓய்வு எடுக்கவும். இளநீர், கஞ்சி போன்ற திரவ உணவுகளை அதிகம் அருந்தவும். பாராசிட்டமால் மாத்திரை மட்டும் எடுக்கவும்.',
      when: 'காய்ச்சல் தொடங்கிய 2-3 நாட்களில் முழு இரத்தப் பரிசோதனை (FBC) செய்து மருத்துவரிடம் ஆலோசிக்கவும்.'
    }
  },
  {
    id: 'gastroenteritis',
    level: 'MODERATE',
    triggers: [
      'stomach pain', 'vomiting', 'diarrhea', 'loose motion', 'food poisoning', 'nausea', 'cramps',
      'බඩේ කැක්කුම', 'වමනය', 'බඩ බුරුල්', 'පාචනය', 'කෑම විසවීම', 'bade kakkuma', 'wamanaya', 'badaburula',
      'வயிற்று வலி', 'வாந்தி', 'வயிற்றுப்போக்கு', 'vayiru vali', 'vanthi', 'vayitrupokku'
    ],
    en: {
      assessment: 'Symptoms indicate Acute Gastroenteritis, food poisoning, or bacterial bowel infection with dehydration risk.',
      advice: 'Prevent dehydration using Oral Rehydration Salts (Jeevani/ORS). Sip fluids slowly. Eat bland foods (boiled rice, bananas, toast). Avoid dairy and spicy or fatty foods.',
      when: 'Visit an OPD or clinic if diarrhea lasts more than 24-48 hours, high fever develops, blood is seen in stool, or unable to retain fluids.'
    },
    si: {
      assessment: 'ආමාශගත ආසාදනයක් (Gastroenteritis), කෑම විසවීමක් හෝ අතීසාර තත්ත්වයක් විය හැක. විජලනය වැළැක්වීම ප්‍රමුඛ වේ.',
      advice: 'ජීවනී (ORS) හෝ ලුණු කැඳ නිතර ස්වල්ප වශයෙන් පානය කරන්න. තෙල්, මිරිස් අධික ආහාර වලින් වළකින්න. බත්, කෙසෙල් වැනි සැහැල්ලු ආහාර ගන්න.',
      when: 'පැය 24කට වඩා වමනය හෝ පාචනය පවතී නම්, මලපහ සමඟ ලේ පිටවේ නම් හෝ ක්ලාන්තය ඇතිවේ නම් වහාම වෛද්‍යවරයකු හමුවන්න.'
    },
    ta: {
      assessment: 'வயிற்றுப்போக்கு அல்லது உணவு நஞ்சாதல் (Food Poisoning). நீர்ச்சத்து குறைபாட்டைத் தடுப்பது அவசியம்.',
      advice: 'ORS (ஜீவனி) கரைசலை அடிக்கடி குடிக்கவும். காரமான, எண்ணெய் உணவுகளைத் தவிர்க்கவும்.',
      when: '24 மணி நேரத்திற்கு மேல் வாந்தி அல்லது வயிற்றுப்போக்கு நீடித்தால் மருத்துவரை அணுகவும்.'
    }
  },
  {
    id: 'respiratory_infection',
    level: 'MODERATE',
    triggers: [
      'cough', 'phlegm', 'persistent cough', 'chest congestion', 'bronchitis', 'wheezing', 'yellow sputum',
      'කැස්ස', 'සෙම', 'පපුවේ සෙම', 'හුස්ම හිරවීම', 'kassa', 'sema', 'papuwe sema',
      'இருமல்', 'சளி', 'மார்புச் சளி', 'irumal', 'sali'
    ],
    en: {
      assessment: 'Signs of lower respiratory tract infection, acute bronchitis, or asthma flare-up requiring medical evaluation.',
      advice: 'Warm water hydration, steam inhalation, and honey with warm water for throat soothing. Avoid cold drinks, dust, and smoke exposure.',
      when: 'Visit a primary care clinic or OPD if cough persists beyond 2 weeks (rule out Tuberculosis), produces dark/bloody sputum, or fever rises above 38.5°C.'
    },
    si: {
      assessment: 'ශ්වසන නාල ආසාදනයක්, බ්‍රොන්කයිටිස් හෝ පපුවේ සෙම තත්ත්වයක් පෙන්නුම් කරයි.',
      advice: 'උණුසුම් ජලය පානය කරන්න. කොත්තමල්ලි, ඉඟුරු තේ හෝ වාෂ්ප ඇල්ලීම (steam inhalation) මගින් සහනයක් ලබාගත හැක. දුම් සහ දූවිල්ලෙන් වළකින්න.',
      when: 'කැස්ස සති 2කට වඩා පවතී නම් (ක්ෂය රෝගය පරීක්ෂා කිරීමට), සෙම සමඟ ලේ පිටවේ නම් හෝ තද උණ ඇතිවේ නම් රෝහල් සායනයකට යන්න.'
    },
    ta: {
      assessment: 'நுரையீரல் அல்லது சுவாசப்பாதை தொற்று (Bronchitis/Chest Infection) அறிகுறிகள்.',
      advice: 'சூடான நீர் குடிக்கவும், ஆவி பிடிக்கவும். குளிர்ச்சியான பானங்கள் மற்றும் தூசியை தவிர்க்கவும்.',
      when: 'இருமல் 2 வாரங்களுக்கு மேல் நீடித்தால் அல்லது காய்ச்சல் அதிகமானால் மருத்துவரை அணுகவும்.'
    }
  },
  {
    id: 'urinary_tract',
    level: 'MODERATE',
    triggers: [
      'burning urination', 'pain urinating', 'urine infection', 'blood in urine', 'frequent urination', 'uti',
      'මුත්රා දැවිල්ල', 'චූ කරනකොට රිදෙනවා', 'මුත්රා ආසාදන', 'mutra dawilla', 'mutra asadana',
      'சிறுநீர் எரிச்சல்', 'சிறுநீர் தொற்று', 'siruneer erichal'
    ],
    en: {
      assessment: 'Clinical presentation aligns with a suspected Urinary Tract Infection (UTI) or renal calculi (kidney stone).',
      advice: 'Drink 2.5 to 3 liters of boiled, cooled water daily. Do not hold urine. Avoid caffeine and excessive sugary drinks.',
      when: 'Visit a clinic within 24 hours for a Urine Full Report (UFR). Antibiotics may be required under medical prescription.'
    },
    si: {
      assessment: 'මුත්රා මාර්ගයේ ආසාදනයක් (UTI) හෝ වකුගඩු ආශ්‍රිත ගැටලුවක් විය හැක.',
      advice: 'දිනකට උණුකර නිවාගත් ජලය ලීටර් 2.5 - 3ක් පානය කරන්න. මුත්‍රා රඳවා තබා ගැනීමෙන් වළකින්න.',
      when: 'පැය 24ක් ඇතුළත වෛද්‍යවරයකු හමුවී මුත්‍රා පරීක්ෂණයක් (UFR) සිදුකර ප්‍රතිජීවක ඖෂධ අවශ්‍යදැයි තීරණය කරන්න.'
    },
    ta: {
      assessment: 'சிறுநீர்ப் பாதை தொற்று (UTI) அல்லது சிறுநீரகக் கல் அறிகுறிகள்.',
      advice: 'தினமும் 3 லிட்டர் வரை தண்ணீர் குடிக்கவும். சிறுநீரை அடக்கி வைக்க வேண்டாம்.',
      when: 'சிறுநீர் பரிசோதனை (UFR) மேற்கொள்ள மருத்துவரை 24 மணி நேரத்திற்குள் அணுகவும்.'
    }
  },
  {
    id: 'animal_bite',
    level: 'MODERATE',
    triggers: [
      'dog bite', 'cat bite', 'monkey bite', 'rabies', 'animal scratch', 'බල්ලෙක් කෑවා', 'පූසෙක් කෑවා',
      'බල්ලා හැපුවා', 'ballek kawa', 'pusek kawa', 'ballek hapuwa',
      'நாய் கடி', 'பூனை கடி', 'nay kadi', 'poonai kadi'
    ],
    en: {
      assessment: 'Animal bite/scratch with potential risk of Rabies and secondary bacterial infection.',
      advice: 'Wash the wound vigorously under running water and soap for at least 15 minutes immediately! Apply antiseptic if available. Do not bandage tightly or apply herbal pastes.',
      when: 'Proceed to the nearest government hospital immediately for Anti-Rabies Vaccination (ARV) and tetanus toxoid.'
    },
    si: {
      assessment: 'සත්ව සපාකෑමක් (ජලභීතිකා - Rabies අවදානමක් සහිතයි). කඩිනම් පියවර අත්‍යවශ්‍ය වේ.',
      advice: 'තුවාලය ගලායන ජලයෙන් සහ සබන් යොදා විනාඩි 15ක් පමණ හොඳින් සෝදන්න. කිසිඳු ආලේපන හෝ කොළ වර්ග නොතබන්න.',
      when: 'ජලභීතිකා මර්දන එන්නත (ARV) ලබාගැනීම සඳහා ළඟම ඇති රජයේ රෝහලට අදම යන්න.'
    },
    ta: {
      assessment: 'விலங்கு கடி / வெறிநாய் நோய் (Rabies) ஆபத்து உள்ளது.',
      advice: 'காயத்தை சோப் மற்றும் ஓடும் நீரில் குறைந்தது 15 நிமிடங்கள் நன்றாகக் கழுவவும்.',
      when: 'ரேபிஸ் தடுப்பூசி (Anti-Rabies Vaccine) போட உடனடியாக அரசு மருத்துவமனைக்கு செல்லவும்.'
    }
  },

  // --- MILD (GREEN) CONDITIONS ---
  {
    id: 'common_cold',
    level: 'MILD',
    triggers: [
      'cold', 'runny nose', 'sneezing', 'sore throat', 'mild headache', 'nasal congestion', 'catarrh',
      'හෙම්බිරිස්සාව', 'සෙම්ප්‍රතිශ්‍යාව', 'කිවිසුම්', 'උගුරේ කැක්කුම', 'hembirissawa', 'ugure kakkuma',
      'சளி', 'தொண்டை வலி', 'தும்மல்', 'sali', 'thonidai vali'
    ],
    en: {
      assessment: 'Symptoms typical of Upper Respiratory Tract Infection (Common Cold) or mild allergic rhinitis.',
      advice: 'Rest adequately. Drink warm water, coriander (koththamalli) and ginger tea. Steam inhalation provides nasal relief. Gargle with warm salt water for sore throat. Use Paracetamol if headache is bothersome.',
      when: 'Self-monitoring at home is appropriate. Visit a primary clinic if fever exceeds 38.5°C, breathing becomes labored, or symptoms worsen after 5-7 days.'
    },
    si: {
      assessment: 'සාමාන්‍ය සෙම්ප්‍රතිශ්‍යාව (Common Cold) හෝ මෘදු අසාත්මිකතා තත්ත්වයක්.',
      advice: 'විවේක ගන්න. උණුසුම් කොත්තමල්ලි, ඉඟුරු තේ පානය කරන්න. වාෂ්ප ඇල්ලීම සහ ලුණු වතුරෙන් උගුර සේදීම සුදුසුය. හිසරදයට අවශ්‍ය නම් පැරසිටමෝල් පෙති 1-2ක් ගන්න.',
      when: 'දින 5-7කින් සුව නොවන්නේ නම් හෝ තද උණ ඇතිවුවහොත් සායනයක් වෙත යන්න.'
    },
    ta: {
      assessment: 'சாதாரண சளி அல்லது தொண்டை தொற்று.',
      advice: 'சூடான தண்ணீர், கொத்தமல்லி மற்றும் இஞ்சி தேநீர் பருகவும். உப்பு நீரில் தொண்டையை கொப்பளிக்கவும்.',
      when: 'காய்ச்சல் அதிகமானால் அல்லது 5 நாட்களுக்கு மேல் நீடித்தால் மருத்துவரை அணுகவும்.'
    }
  },
  {
    id: 'tension_headache',
    level: 'MILD',
    triggers: [
      'headache', 'mild headache', 'stress headache', 'forehead pain', 'tired eyes', 'හිසරදය', 'ඔළුව කැක්කුම',
      'oluwa kakkuma', 'oluwe kakkuma', 'தலைவலி', 'thalaivali'
    ],
    en: {
      assessment: 'Likely tension-type headache, eye strain, or dehydration-related discomfort.',
      advice: 'Drink 2-3 glasses of water. Rest in a dark, quiet room. Gentle neck and temple massage. Paracetamol (500mg - 1000mg for adults) as needed.',
      when: 'Seek urgent care if headache is sudden and extraordinarily severe (worst of life), accompanied by stiff neck, high fever, or vision loss.'
    },
    si: {
      assessment: 'මානසික ආතතිය, විජලනය හෝ පරිගණක/දුරකථන තිර දෙස බැලීම නිසා ඇතිවූ සාමාන්‍ය හිසරදයක් විය හැක.',
      advice: 'වතුර වීදුරු 2-3ක් බොන්න. නිස්කලංක ස්ථානයක මදක් නිදාගන්න. අවශ්‍ය නම් පැරසිටමෝල් 500mg පෙති 1-2ක් ගන්න.',
      when: 'හිසරදය අසාමාන්‍ය ලෙස තදින් ඇතිවුවහොත්, බෙල්ල තදවීම හෝ ඇස් නොපෙනී යාමක් සමඟ පැමිණියහොත් වහාම රෝහල්ගත වන්න.'
    },
    ta: {
      assessment: 'மன அழுத்தம் அல்லது நீர்ச்சத்து குறைவால் ஏற்பட்ட தலைவலி.',
      advice: 'நிறைய தண்ணீர் குடிக்கவும், அமைதியான இருண்ட அறையில் ஓய்வெடுக்கவும்.',
      when: 'தலைவலி மிகக் கடுமையாக இருந்தாலோ அல்லது கழுத்து விறைப்பு ஏற்பட்டாலோ உடனடியாக மருத்துவமனைக்கு செல்லவும்.'
    }
  },
  {
    id: 'rash_allergy',
    level: 'MILD',
    triggers: [
      'rash', 'itching', 'skin allergy', 'mosquito bite', 'hives', 'පලු', 'සමේ කැසීම', 'කැසිල්ල',
      'kasiyilla', 'palu', 'தோல் அரிப்பு', 'தடிப்பு', 'thol arippu'
    ],
    en: {
      assessment: 'Mild localized skin reaction, contact dermatitis, or mild urticaria.',
      advice: 'Apply calamine lotion or cool compress. Avoid scratching. Wear loose cotton clothes. Mild anti-histamine (Cetirizine / Chlorpheniramine) may provide relief.',
      when: 'Seek urgent emergency medical help immediately if rash spreads rapidly with facial, lip, or tongue swelling, or difficulty breathing (Anaphylaxis).'
    },
    si: {
      assessment: 'මෘදු සමේ ආසාත්මිකතාවක් හෝ කෘමි දෂ්ඨනයක්.',
      advice: 'කැසීමෙන් වළකින්න. කැළමයින් (Calamine) ආලේප කරන්න. සිසිල් වතුරෙන් සෝදන්න. අවශ්‍ය නම් ඇන්ටිහිස්ටමින් (Cetirizine) පෙත්තක් ගන්න.',
      when: 'තොල්, දිව ඉදිමීම හෝ හුස්ම ගැනීමේ අපහසුවක් ඇති වුවහොත් (Anaphylaxis) වහාම 1990 අමතන්න.'
    },
    ta: {
      assessment: 'லேசான தோல் ஒவ்வாமை அல்லது பூச்சிக்கடி.',
      advice: 'கலமைன் (Calamine) லோஷன் தடவலாம். சொறிவதைத் தவிர்க்கவும்.',
      when: 'உதடு அல்லது முகம் வீங்கினாலோ, மூச்சுத் திணறல் ஏற்பட்டாலோ உடனடியாக மருத்துவமனைக்கு செல்லவும்.'
    }
  }
];

function detectClinicalMatch(message) {
  const lower = message.toLowerCase();
  for (const item of CLINICAL_KNOWLEDGE) {
    if (item.triggers.some(t => lower.includes(t.toLowerCase()))) {
      return item;
    }
  }
  return null;
}

function getClinicalResponse(message, language = 'English') {
  const match = detectClinicalMatch(message);
  const langKey = language === 'Sinhala' ? 'si' : language === 'Tamil' ? 'ta' : 'en';

  if (match) {
    const localized = match[langKey] || match.en;
    return {
      triage: match.level,
      assessment: localized.assessment,
      advice: localized.advice,
      when: localized.when,
      matchedId: match.id
    };
  }

  // Smart fallback when no specific trigger matches
  if (language === 'Sinhala') {
    return {
      triage: 'MILD',
      assessment: 'ඔබ සඳහන් කළ රෝග ලක්ෂණ අනුව මෙය මූලික අවදානම් තත්ත්වයක් ලෙස නොපෙනේ. එහෙත් සිරුරේ වෙනස්කම් පිළිබඳව විමසිලිමත් වන්න.',
      advice: 'ප්‍රමාණවත් තරම් විවේක ගන්න. උණුසුම් ජලය හෝ දියර වර්ග බහුලව පානය කරන්න. පෝෂ්‍යදායී ආහාර ගන්න.',
      when: 'රෝග ලක්ෂණ දින 2-3කට වඩා පවතී නම්, දැඩි උණ, තද කැක්කුම හෝ හුස්ම ගැනීමේ අපහසුවක් ඇතිවේ නම් වහාම ළඟම ඇති වෛද්‍යවරයා හමුවන්න.'
    };
  }

  if (language === 'Tamil') {
    return {
      triage: 'MILD',
      assessment: 'நீங்கள் விவரித்த அறிகுறிகளின் அடிப்படையில், இது ஆரம்பத்தில் லேசான நிலையாகத் தெரிகிறது. எனினும் விழிப்புடன் இருக்கவும்.',
      advice: 'போதுமான ஓய்வு எடுக்கவும். நிறைய தண்ணீர் மற்றும் திரவ உணவுகளை உட்கொள்ளவும்.',
      when: 'அறிகுறிகள் 2-3 நாட்களுக்கு மேல் நீடித்தால் அல்லது காய்ச்சல், தீவிர வலி ஏற்பட்டால் உடனடியாக மருத்துவரை அணுகவும்.'
    };
  }

  return {
    triage: 'MILD',
    assessment: 'Based on the clinical description provided, your symptoms appear currently mild without overt red flag emergency markers.',
    advice: 'Prioritize adequate hydration, balanced nutrition, and restorative rest. Avoid heavy physical exertion and self-medicating with strong drugs.',
    when: 'If symptoms persist beyond 2-3 days, worsen progressively, or new warning signs (high fever, severe localized pain, breathlessness) emerge, consult a registered doctor at your nearest clinic.'
  };
}

router.post('/', async (req, res) => {
  const { message, language = 'English', history = [] } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  // 1. Safety first: check safety-critical triggers in our clinical engine
  const clinicalFallback = getClinicalResponse(message, language);

  // 2. Try LLM (Ollama) if available, with safety guardrails
  const systemPrompt = `You are Niroga, an expert AI medical triage assistant for Sri Lanka.
Language: Respond strictly in ${language}.
Your role:
1. Assess symptom severity: Assign TRIAGE: MILD, MODERATE, or URGENT.
2. Provide concise clinical assessment, action advice, and when to seek care.
3. In Sri Lanka, 1990 is the free emergency ambulance (Suwa Seriya).
4. For suspected Dengue, warn strictly against NSAIDs/Brufen/Aspirin (only Paracetamol allowed).
5. For mild symptoms, suggest safe home supportive care (hydration, koththamalli/ginger, rest).

Format strictly:
TRIAGE: [MILD/MODERATE/URGENT]
ASSESSMENT: [Clinical assessment in ${language}]
ADVICE: [Actionable advice in ${language}]
WHEN_TO_SEEK_CARE: [When and where to seek healthcare in ${language}]`;

  const conversationHistory = history
    .slice(-4)
    .map(h => `${h.role === 'user' ? 'Patient' : 'Niroga'}: ${h.content}`)
    .join('\n');

  const prompt = `${systemPrompt}\n\nRecent History:\n${conversationHistory}\n\nPatient (${language}): ${message}\n\nNiroga:`;

  try {
    const ollamaRes = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      {
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: { temperature: 0.2, num_predict: 450 }
      },
      { timeout: 8000 }
    );

    const raw = ollamaRes.data.response || '';
    const triageMatch = raw.match(/TRIAGE:\s*(MILD|MODERATE|URGENT)/i);
    const assessMatch = raw.match(/ASSESSMENT:\s*(.+?)(?=\nADVICE:|$)/is);
    const adviceMatch = raw.match(/ADVICE:\s*(.+?)(?=\nWHEN_TO_SEEK_CARE:|$)/is);
    const whenMatch = raw.match(/WHEN_TO_SEEK_CARE:\s*(.+?)$/is);

    let triageLevel = triageMatch ? triageMatch[1].toUpperCase() : clinicalFallback.triage;

    // Safety Override: If our clinical engine classified it as URGENT, never allow an LLM to downgrade it!
    if (clinicalFallback.triage === 'URGENT') {
      triageLevel = 'URGENT';
    }

    return res.json({
      triage: triageLevel,
      assessment: assessMatch ? assessMatch[1].trim() : clinicalFallback.assessment,
      advice: adviceMatch ? adviceMatch[1].trim() : clinicalFallback.advice,
      when: whenMatch ? whenMatch[1].trim() : clinicalFallback.when,
      raw,
      source: 'ollama'
    });
  } catch (err) {
    // If Ollama is offline or times out, return our clinically accurate engine response
    return res.json({
      ...clinicalFallback,
      source: 'mock',
      engine: 'Niroga Clinical Triage Engine v2.0'
    });
  }
});

module.exports = router;
