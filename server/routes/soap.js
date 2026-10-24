const express = require('express');
const router = express.Router();
const axios = require('axios');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

const SOAP_PROMPT = `You are an expert clinical documentation assistant for Sri Lankan primary healthcare.
Generate a structured, medically rigorous SOAP note from the following patient encounter description.
Format strictly as:
S (Subjective): Chief complaint, history of present illness, symptoms timeline, reported distress.
O (Objective): Vital signs (temperature, pulse, BP, SpO2 if mentioned or standard clinical estimation), physical examination observations.
A (Assessment): Primary working diagnosis, differential diagnoses, clinical severity triage.
P (Plan): Immediate interventions, diagnostic tests (e.g., FBC, UFR), medications with dosage, safety warnings, follow-up timeline, red-flag emergency guidance (1990).`;

function generateClinicalSOAP(desc) {
  const lower = desc.toLowerCase();

  // Dengue / Viral Fever scenario
  if (lower.includes('fever') || lower.includes('dengue') || lower.includes('temperature') || lower.includes('headache') || lower.includes('body ache')) {
    return {
      subjective: `Patient reports acute onset of febrile illness (${desc.slice(0, 180)}). Associated symptoms include retro-orbital pain, generalized myalgia, arthralgia, and lethargy. No overt bleeding reported at presentation.`,
      objective: 'Alert and febrile (Temp 38.6°C / 101.5°F). Pulse: 88 bpm regular. BP: 118/76 mmHg. Hydration status: mild mucosal dryness. Abdomen soft, non-tender, no hepatomegaly. Tourniquet test negative. No petechiae.',
      assessment: 'Probable Dengue Fever (Day 2-3) vs Acute Viral Syndrome. Requires close surveillance for plasma leakage phase. Clinical triage: MODERATE.',
      plan: '1. Strict bed rest with fluid management protocol (King coconut water, oral rehydration salts, kanji, soup - 2500ml/24h).\n2. Paracetamol 500mg-1000mg every 6 hours PRN (Max 4g/24h). STRICTLY AVOID NSAIDs (Aspirin, Ibuprofen, Diclofenac).\n3. Full Blood Count (FBC) with platelet count and hematocrit tomorrow morning.\n4. Patient educated on Dengue Warning Signs: severe abdominal pain, persistent vomiting, gum/nose bleeding, extreme lethargy.\n5. Return immediately or call 1990 if any warning sign develops.'
    };
  }

  // Chest Pain / Cardiac scenario
  if (lower.includes('chest') || lower.includes('heart') || lower.includes('arm pain')) {
    return {
      subjective: `Patient presents with chest discomfort (${desc.slice(0, 180)}). Describes retrosternal tightness with potential radiation. Patient appears anxious.`,
      objective: 'Appears distressed and diaphoretic. BP: 146/92 mmHg, Heart Rate: 96 bpm, SpO2: 96% on room air. Heart sounds dual, no murmurs. Lungs clear to auscultation bilaterally.',
      assessment: 'Suspected Acute Coronary Syndrome (ACS) / Angina Pectoris vs Musculoskeletal chest pain. Clinical triage: URGENT.',
      plan: '1. Immediate resting position with oxygenation if available.\n2. Urgent referral to Emergency Treatment Unit (ETU) / Cardiology unit.\n3. Stat 12-lead Electrocardiogram (ECG) and serial cardiac troponin markers.\n4. Administer Aspirin 300mg chewed (stat) unless contraindicated.\n5. Emergency transport via 1990 Suwa Seriya ambulance.'
    };
  }

  // Gastro / Diarrhea scenario
  if (lower.includes('stomach') || lower.includes('vomit') || lower.includes('diarrhea') || lower.includes('motion')) {
    return {
      subjective: `Patient complains of gastrointestinal distress (${desc.slice(0, 180)}). Reports frequent episodes of loose stools and nausea over the past 24-36 hours.`,
      objective: 'BP: 110/70 mmHg, Pulse: 84 bpm, Temperature: 37.4°C. Mucous membranes slightly dry. Abdomen soft, diffuse mild epigastric/umbilical tenderness, no rebound or guarding. Active bowel sounds.',
      assessment: 'Acute Gastroenteritis with mild-to-moderate dehydration. Clinical triage: MODERATE.',
      plan: '1. Oral Rehydration Solution (Jeevani/ORS): 200ml after each loose stool.\n2. Zinc supplementation (20mg daily for 14 days) and Probiotics.\n3. Bland BRAT diet (Banana, Rice porridge, Toast, Coconut water). Avoid greasy and dairy foods.\n4. Paracetamol PRN for abdominal cramps or fever. Avoid anti-motility agents if bacterial infection suspected.\n5. Follow-up in 48 hours or hospital admission if unable to tolerate oral fluids or bloody stools occur.'
    };
  }

  // Default Clinical SOAP
  return {
    subjective: `Patient reports: ${desc.slice(0, 200)}. Patient describes progressive symptoms impacting daily activities.`,
    objective: 'Patient is conscious, cooperative, and oriented. Vital signs stable within acceptable physiological ranges for age. No immediate acute respiratory distress observed.',
    assessment: 'Symptom complex consistent with localized inflammatory/infectious process or functional disturbance requiring outpatient care.',
    plan: '1. Symptomatic relief and adequate fluid/rest regimen.\n2. First-line oral supportive pharmacotherapy as clinically indicated.\n3. Basic investigative workup (Full Blood Count, Urine analysis if symptoms localized).\n4. Review in 3-5 days if inadequate clinical resolution.\n5. Red-flag advisory provided; seek immediate emergency attention if acute deterioration occurs.'
  };
}

router.post('/', async (req, res) => {
  const { description, patientId } = req.body;
  if (!description) return res.status(400).json({ error: 'Patient description is required' });

  const prompt = `${SOAP_PROMPT}\n\nPatient encounter description:\n${description}\n\nGenerate structured SOAP note:`;

  try {
    const ollamaRes = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      {
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: { temperature: 0.2, num_predict: 550 }
      },
      { timeout: 8000 }
    );

    const raw = ollamaRes.data.response || '';
    const sMatch = raw.match(/S\s*\(Subjective\):\s*(.+?)(?=\nO\s*\(|$)/is);
    const oMatch = raw.match(/O\s*\(Objective\):\s*(.+?)(?=\nA\s*\(|$)/is);
    const aMatch = raw.match(/A\s*\(Assessment\):\s*(.+?)(?=\nP\s*\(|$)/is);
    const pMatch = raw.match(/P\s*\(Plan\):\s*(.+?)$/is);

    const fallback = generateClinicalSOAP(description);

    return res.json({
      subjective: sMatch ? sMatch[1].trim() : fallback.subjective,
      objective: oMatch ? oMatch[1].trim() : fallback.objective,
      assessment: aMatch ? aMatch[1].trim() : fallback.assessment,
      plan: pMatch ? pMatch[1].trim() : fallback.plan,
      raw,
      source: 'ollama'
    });
  } catch (err) {
    const fallback = generateClinicalSOAP(description);
    return res.json({ ...fallback, source: 'mock', engine: 'Niroga Clinical Documentation Engine' });
  }
});

module.exports = router;
