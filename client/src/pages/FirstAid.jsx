import { useState } from "react";
import "./FirstAid.css";

const FIRST_AID_PROTOCOLS = [
  {
    id: "snakebite",
    type: "urgent",
    badge: "Life-Threatening Emergency",
    badgeCls: "badge-red",
    title: "🐍 Snakebite Protocol (Russell's Viper / Cobra / Krait)",
    subtitle: "Sri Lanka has high venomous snake incidence. Proper first aid saves limbs and lives.",
    steps: [
      { num: 1, text: "Keep victim completely calm and still. Movement accelerates venom absorption into lymphatic circulation." },
      { num: 2, text: "Immobilize the bitten limb below heart level using a rigid splint and broad bandage." },
      { num: 3, text: "Remove tight jewelry, rings, or tight footwear before swelling occurs." },
      { num: 4, text: "Call 1990 immediately or rush to the nearest Base/General Hospital with Anti-Snake Venom (ASV)." }
    ],
    warning: "⛔ STRICTLY FORBIDDEN: DO NOT cut the puncture, suck venom, wash with chemicals, or apply tight tourniquets (causes severe tissue necrosis and gangrene)."
  },
  {
    id: "dengue",
    type: "moderate",
    badge: "Clinical Monitoring Protocol",
    badgeCls: "badge-yellow",
    title: "🦟 Dengue Fever & Warning Signs Management",
    subtitle: "Critical guidance for Sri Lanka's endemic dengue seasons. Phase awareness is vital.",
    steps: [
      { num: 1, text: "Complete bed rest. Maintain strict oral fluid balance with electrolyte fluids (Thembili/King coconut water, kanji, ORS)." },
      { num: 2, text: "Take ONLY Paracetamol for fever (Max 1g every 6h for adults, weight-based for children)." },
      { num: 3, text: "Obtain Full Blood Count (FBC) with platelet count on Day 2 of fever, or earlier if lethargic." },
      { num: 4, text: "Watch for Critical Phase (Days 3-6 as fever drops): Check for severe abdominal pain, persistent vomiting, or mucosal bleeding." }
    ],
    warning: "⛔ CRITICAL WARNING: NEVER take Aspirin, Ibuprofen (Brufen), Diclofenac, or Mefenamic Acid (NSAIDs) — they trigger fatal internal bleeding!"
  },
  {
    id: "cpr",
    type: "urgent",
    badge: "Cardiac Arrest / 1990",
    badgeCls: "badge-red",
    title: "🫀 Hands-Only CPR for Unresponsive Adults",
    subtitle: "Immediate bystander chest compressions double the chance of survival.",
    steps: [
      { num: 1, text: "Check responsiveness: Shake shoulders gently and shout 'Are you okay?'" },
      { num: 2, text: "Call 1990 immediately (put phone on speaker while starting compressions)." },
      { num: 3, text: "Place heel of one hand in center of chest; interlock fingers of other hand on top." },
      { num: 4, text: "Push hard and fast (100–120 compressions per minute, 2 inches deep) to the beat of 'Stayin' Alive'." }
    ],
    warning: "💡 Continue compressions without interruption until 1990 Suwa Seriya paramedics arrive or patient shows signs of life."
  },
  {
    id: "rabies",
    type: "moderate",
    badge: "Post-Exposure Prophylaxis",
    badgeCls: "badge-yellow",
    title: "🐕 Animal Bite & Rabies Prevention (Dog / Cat / Monkey)",
    subtitle: "Immediate localized washing neutralizes a majority of inoculated rabies virus.",
    steps: [
      { num: 1, text: "Wash wound immediately under brisk running water with soap for at least 15 continuous minutes." },
      { num: 2, text: "Apply antiseptic (Povidone Iodine or surgical spirit) if available." },
      { num: 3, text: "Do not suture, bandage tightly, or apply chili/curry/herbal powders to the wound." },
      { num: 4, text: "Report to nearest government hospital outpatient department for Anti-Rabies Vaccine (ARV) and Tetanus toxoid." }
    ]
  },
  {
    id: "burns",
    type: "moderate",
    badge: "Thermal Trauma Care",
    badgeCls: "badge-yellow",
    title: "🔥 Burns & Scalds First Aid",
    subtitle: "Rapid cooling arrests deep thermal progression in epidermal and dermal layers.",
    steps: [
      { num: 1, text: "Cool the burn immediately under gentle cool running tap water for 20 minutes." },
      { num: 2, text: "Remove clothing or jewelry near the burn before tissue swells, unless stuck to the skin." },
      { num: 3, text: "Cover loosely with clean cling film or a sterile non-adherent dressing." },
      { num: 4, text: "Keep the patient warm to prevent hypothermia, especially children." }
    ],
    warning: "⛔ DO NOT apply ice, ice water, toothpaste, butter, or turmeric paste to fresh burns."
  },
  {
    id: "choking",
    type: "urgent",
    badge: "Airway Obstruction",
    badgeCls: "badge-red",
    title: "🗣️ Choking & Airway Relief (Heimlich Maneuver)",
    subtitle: "For conscious adults or children over 1 year unable to breathe, cough, or speak.",
    steps: [
      { num: 1, text: "Stand behind victim and wrap arms around their waist. Bend them slightly forward." },
      { num: 2, text: "Make a fist with one hand and place it just above the navel." },
      { num: 3, text: "Grasp fist with your other hand and deliver quick, inward and upward thrusts." },
      { num: 4, text: "Repeat until the foreign object is dislodged or call 1990 if victim becomes unresponsive." }
    ]
  }
];

const SRI_LANKA_REMEDIES = [
  {
    id: "koththamalli",
    type: "remedy",
    badge: "Traditional Supportive Care",
    badgeCls: "badge-green",
    title: "🌿 Koththamalli (Coriander & Ginger Tea)",
    subtitle: "Time-tested Sri Lankan herbal decoction for early viral colds, mild chills, and upper respiratory congestion.",
    steps: [
      { num: 1, text: "Ingredients: 2 tablespoons whole coriander seeds (Koththamalli) and 1 inch crushed fresh ginger (Inguru)." },
      { num: 2, text: "Preparation: Boil in 3 cups of water until reduced by half (1.5 cups)." },
      { num: 3, text: "Dosage: Drink warm, 1/2 cup 2–3 times daily. Can add a pinch of pepper for nasal clearance." },
      { num: 4, text: "Clinical Value: Contains antioxidant polyphenols and gingerols that soothe sore throats and promote mild diaphoresis." }
    ],
    warning: "⚠️ Note: Koththamalli is supportive home care for mild colds. If fever lasts >48 hours or exceeds 38.5°C, obtain medical review."
  },
  {
    id: "pas-panguwa",
    type: "remedy",
    badge: "Traditional Supportive Care",
    badgeCls: "badge-green",
    title: "🌱 Pas Panguwa Decoction",
    subtitle: "Classical five-herb formulation widely used across rural Sri Lanka for viral malaise and muscular aches.",
    steps: [
      { num: 1, text: "Formulation: Koththamalli (Coriander), Katuwelbatu (Solanum virginianum), Elabatu, Venivelgeta (Coscinium fenestratum), and Ginger." },
      { num: 2, text: "Preparation: Simmer herbal packet in 4 cups of water down to 1 cup." },
      { num: 3, text: "Dosage: Adults take half a cup twice daily while warm." },
      { num: 4, text: "Clinical Value: Aids natural pain threshold and anti-inflammatory pathways during mild uncomplicated viral episodes." }
    ]
  },
  {
    id: "thambili",
    type: "remedy",
    badge: "Hydration & Electrolytes",
    badgeCls: "badge-green",
    title: "🥥 Thambili (King Coconut Water)",
    subtitle: "Sri Lanka's native natural electrolyte fluid for oral rehydration and convalescence.",
    steps: [
      { num: 1, text: "Natural Composition: Rich in potassium, magnesium, and bio-available electrolytes." },
      { num: 2, text: "Indications: Mild dehydration from heat exhaustion, viral illness, or recovery phase of fevers." },
      { num: 3, text: "Usage: Sip fresh king coconut water slowly throughout the day. Safe for all ages." },
      { num: 4, text: "Clinical Value: Light on digestion and prevents clinical hypokalemia without artificial colorings." }
    ]
  },
  {
    id: "ranawara",
    type: "remedy",
    badge: "Traditional Herbal Tea",
    badgeCls: "badge-green",
    title: "🌼 Ranawara & Belimal Infusions",
    subtitle: "Gentle caffeine-free herbal beverages for internal cooling, digestion, and systemic hydration.",
    steps: [
      { num: 1, text: "Ranawara (Senna auriculata): Dried yellow flowers infused in boiling water; helps relieve body heat and promotes renal clearance." },
      { num: 2, text: "Belimal (Aegle marmelos): Dried bael flowers brewed as a soothing herbal tea for gastritis, indigestion, and gastrointestinal calm." },
      { num: 3, text: "Preparation: Steep 1 tablespoon dried flowers in 1 mug boiling water for 5 minutes. Best taken with small piece of kithul jaggery." }
    ]
  }
];

export default function FirstAid() {
  const [activeTab, setActiveTab] = useState("protocols");

  return (
    <div className="firstaid-page page">
      <div className="container">
        <div className="firstaid-header">
          <h1>🚨 First Aid Protocols & Sri Lankan Remedies</h1>
          <p>
            Evidence-based emergency procedures for life-saving pre-hospital response, alongside medically vetted traditional Sri Lankan supportive home care.
          </p>
        </div>

        <div className="firstaid-tabs" role="tablist">
          <button
            className={`fa-tab-btn ${activeTab === "protocols" ? "active" : ""}`}
            onClick={() => setActiveTab("protocols")}
            role="tab"
            aria-selected={activeTab === "protocols"}
          >
            🚨 Emergency First Aid Protocols
          </button>
          <button
            className={`fa-tab-btn ${activeTab === "remedies" ? "active" : ""}`}
            onClick={() => setActiveTab("remedies")}
            role="tab"
            aria-selected={activeTab === "remedies"}
          >
            🌿 Sri Lankan Supportive Remedies
          </button>
        </div>

        {activeTab === "protocols" ? (
          <div className="protocols-grid">
            {FIRST_AID_PROTOCOLS.map((p) => (
              <div key={p.id} className={`protocol-card glass-card ${p.type}`}>
                <div className="protocol-top">
                  <div className="protocol-badge-row">
                    <span className={`protocol-badge ${p.badgeCls}`}>{p.badge}</span>
                  </div>
                  <h2 className="protocol-title">{p.title}</h2>
                  <p className="protocol-subtitle">{p.subtitle}</p>
                  <ul className="protocol-steps">
                    {p.steps.map((s) => (
                      <li key={s.num}>
                        <span className="step-num">{s.num}</span>
                        <span>{s.text}</span>
                      </li>
                    ))}
                  </ul>
                  {p.warning && <div className="forbidden-box">{p.warning}</div>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="protocols-grid">
            {SRI_LANKA_REMEDIES.map((r) => (
              <div key={r.id} className={`protocol-card glass-card ${r.type}`}>
                <div className="protocol-top">
                  <div className="protocol-badge-row">
                    <span className={`protocol-badge ${r.badgeCls}`}>{r.badge}</span>
                  </div>
                  <h2 className="protocol-title">{r.title}</h2>
                  <p className="protocol-subtitle">{r.subtitle}</p>
                  <ul className="protocol-steps">
                    {r.steps.map((s) => (
                      <li key={s.num}>
                        <span className="step-num">{s.num}</span>
                        <span>{s.text}</span>
                      </li>
                    ))}
                  </ul>
                  {r.warning && <div className="forbidden-box">{r.warning}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="safety-card glass-card">
          <div className="safety-icon" aria-hidden="true">🛡️</div>
          <div className="safety-text">
            <h3>Clinical Safety & Integrative Health Standard</h3>
            <p>
              Traditional herbal decoctions are strictly intended for mild, uncomplicated symptoms as supportive home care. They do not replace hospital interventions for bacterial infections, snakebites, surgical emergencies, or acute viral hemorrhagic states. In any emergency, call <strong>1990 (Suwa Seriya)</strong> immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
