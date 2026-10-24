import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../utils/api";
import "./SymptomChecker.css";

const LANGUAGES = [
  { id: "English", label: "English", speechCode: "en-US" },
  { id: "Sinhala", label: "සිංහල (Sinhala)", speechCode: "si-LK" },
  { id: "Tamil", label: "தமிழ் (Tamil)", speechCode: "ta-LK" },
];

const TRIAGE_CONFIG = {
  MILD: { emoji: "🟢", label: "Mild Triage", cls: "mild" },
  MODERATE: { emoji: "🟡", label: "Moderate Triage — Medical Review", cls: "moderate" },
  URGENT: { emoji: "🔴", label: "Urgent — Immediate Emergency Care", cls: "urgent" },
};

const QUICK_SYMPTOMS_BY_LANG = {
  English: ["High Fever & Chills", "Chest Pain / Pressure", "Severe Stomach Pain", "Persistent Cough", "Dizziness & Weakness", "Skin Rash"],
  Sinhala: ["තද උණ සහ වෙව්ලීම", "පපුවේ තද කැක්කුම", "දැඩි බඩේ කැක්කුම", "කැස්ස සහ සෙම", "කලන්තය සහ ක්ලාන්තය", "සමේ පලු / කැසීම"],
  Tamil: ["கடுமையான காய்ச்சல்", "நெஞ்சு வலி", "வயிற்று வலி", "இருமல் மற்றும் சளி", "மயக்கம்", "தோல் தடிப்பு"],
};

export default function SymptomChecker() {
  const [language, setLanguage] = useState("English");
  const [messages, setMessages] = useState([
    {
      id: 0,
      role: "assistant",
      content: "Hello! I am Niroga, your AI clinical health assistant. Please describe your symptoms in detail and I will provide an immediate evidence-based triage assessment. You can speak or type in English, Sinhala, or Tamil.",
      triage: null,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [showDengueCalc, setShowDengueCalc] = useState(false);
  const [printCard, setPrintCard] = useState(null);

  // Dengue Calculator state
  const [dengueDay, setDengueDay] = useState(2);
  const [patientWeight, setPatientWeight] = useState(60);
  const [warningFlags, setWarningFlags] = useState({
    vomiting: false,
    abdominalPain: false,
    bleeding: false,
    lethargy: false,
  });

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle incoming query param ?q=... from Landing page
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q");
    if (q) {
      sendMessage(q);
    }
  }, [location.search]);

  function handleLanguageChange(langId) {
    setLanguage(langId);
    let greeting = "";
    if (langId === "Sinhala") {
      greeting = "ආයුබෝවන්! මම නිරෝගා (Niroga), ඔබේ AI සායනික සෞඛ්‍ය සහායකයා. කරුණාකර ඔබේ රෝග ලක්ෂණ විස්තර කරන්න. මම ඔබට මූලික වෛද්‍ය උපදෙස් ලබා දෙන්නෙමි.";
    } else if (langId === "Tamil") {
      greeting = "வணக்கம்! நான் நிரோகா (Niroga), உங்கள் AI சுகாதார உதவியாளர். தயவுசெய்து உங்கள் அறிகுறிகளை விவரிக்கவும். நான் உங்களுக்கு உடனடி மருத்துவ ஆலோசனைகளை வழங்குவேன்.";
    } else {
      greeting = "Hello! I am Niroga, your AI clinical health assistant. Please describe your symptoms and I will provide an immediate evidence-based triage assessment.";
    }
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: "assistant",
        content: greeting,
        triage: null,
      },
    ]);
  }

  // Voice Input via Web Speech API
  function toggleSpeech() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }

    const currentLangObj = LANGUAGES.find((l) => l.id === language);
    const recognition = new SpeechRecognition();
    recognition.lang = currentLangObj?.speechCode || "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setRecording(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onerror = () => setRecording(false);
    recognition.onend = () => setRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
  }

  async function sendMessage(text) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg = { id: Date.now(), role: "user", content: msg };
    const history = messages
      .filter((m) => m.role !== "assistant" || m.id !== 0)
      .map((m) => ({ role: m.role, content: m.content || m.assessment }));
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const data = await api.chat(msg, language, history);
      const aiMsg = {
        id: Date.now() + 1,
        role: "assistant",
        triage: data.triage || "MILD",
        content: data.content || null,
        assessment: data.assessment,
        advice: data.advice,
        when: data.when,
        source: data.source,
        userQuery: msg,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "Sorry, I could not connect to the triage service. Please check your connection and try again.",
          triage: null,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function handlePrintTriage(msg) {
    setPrintCard(msg);
    setTimeout(() => {
      window.print();
    }, 200);
  }

  // Calculate Dengue Fluid Target
  const targetHourlyRate = Math.round(patientWeight * 1.5);
  const target24hVolume = targetHourlyRate * 24;
  const hasWarningSign = Object.values(warningFlags).some(Boolean);

  const quickSymptoms = QUICK_SYMPTOMS_BY_LANG[language] || QUICK_SYMPTOMS_BY_LANG.English;

  return (
    <div className="symptom-page page">
      <div className="container">
        <div className="symptom-layout">
          {/* Sidebar */}
          <aside className="symptom-sidebar glass-card" aria-label="Symptom checker settings">
            <div className="sidebar-section">
              <h3>Language / භාෂාව / மொழி</h3>
              <div className="lang-buttons" role="group" aria-label="Select language">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.id}
                    id={`lang-${l.id.toLowerCase()}`}
                    className={`lang-btn ${language === l.id ? "active" : ""}`}
                    onClick={() => handleLanguageChange(l.id)}
                    aria-pressed={language === l.id}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-section">
              <h3>Quick Symptoms</h3>
              <div className="quick-symptoms">
                {quickSymptoms.map((s) => (
                  <button
                    key={s}
                    className="quick-btn"
                    onClick={() => sendMessage(s)}
                    id={`quick-${s.toLowerCase().replace(/\W+/g, "-")}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-section">
              <h3>Clinical Tools</h3>
              <button
                className="calc-launcher-btn"
                onClick={() => setShowDengueCalc(true)}
                id="open-dengue-calc-btn"
              >
                🦟 Dengue Risk & Fluid Target
              </button>
            </div>

            <div className="sidebar-section">
              <div className="disclaimer glass-card">
                <p>
                  ⚠️ <strong>Medical Disclaimer:</strong> Niroga provides initial AI triage and guidance only. It is not a replacement for clinical evaluation. Always consult a qualified medical doctor.
                </p>
              </div>
            </div>

            <div className="sidebar-section">
              <p className="emergency-note">
                🚨 <strong>Medical Emergency?</strong>
                <br />
                Call <a href="tel:1990" className="emergency-link">1990</a> (Suwa Seriya Free Ambulance)
              </p>
            </div>
          </aside>

          {/* Chat Window */}
          <div className="chat-container glass-card">
            <div className="chat-header">
              <div className="chat-header-left">
                <div className="ai-status-dot" aria-hidden="true" />
                <div>
                  <div className="chat-title">Niroga Clinical Triage AI</div>
                  <div className="chat-subtitle">Medical Assessment • {language}</div>
                </div>
              </div>
              <button
                className="btn btn-ghost"
                id="clear-chat-btn"
                onClick={() =>
                  setMessages([
                    {
                      id: 0,
                      role: "assistant",
                      content: "Chat cleared. Please describe your symptoms.",
                      triage: null,
                    },
                  ])
                }
              >
                Clear
              </button>
            </div>

            <div className="chat-messages" role="log" aria-live="polite" aria-label="Conversation">
              {messages.map((msg) => (
                <div key={msg.id} className={`chat-msg ${msg.role}`}>
                  {msg.role === "user" ? (
                    <div className="msg-bubble user-bubble">{msg.content}</div>
                  ) : (
                    <div className="msg-bubble ai-bubble">
                      {msg.triage && (
                        <div className="triage-header-row">
                          <div className={`triage-header triage-${TRIAGE_CONFIG[msg.triage]?.cls || "mild"}`}>
                            {TRIAGE_CONFIG[msg.triage]?.emoji} {TRIAGE_CONFIG[msg.triage]?.label}
                          </div>
                          <button
                            className="export-card-btn"
                            onClick={() => handlePrintTriage(msg)}
                            title="Print or export clinical triage card"
                          >
                            🖨️ Export Report
                          </button>
                        </div>
                      )}

                      {msg.content && <p>{msg.content}</p>}

                      {msg.assessment && (
                        <div className="soap-section">
                          <strong>Clinical Assessment</strong>
                          <p>{msg.assessment}</p>
                        </div>
                      )}

                      {msg.advice && (
                        <div className="soap-section">
                          <strong>Actionable Advice</strong>
                          <p>{msg.advice}</p>
                        </div>
                      )}

                      {msg.when && (
                        <div className="soap-section">
                          <strong>When to Seek Immediate Care</strong>
                          <p>{msg.when}</p>
                        </div>
                      )}

                      {/* Immediate Clinic Link for Moderate / Urgent Cases */}
                      {msg.triage && msg.triage !== "MILD" && (
                        <div className="triage-actions-row">
                          <Link to="/clinics" className="triage-action-link">
                            🏥 Find Nearest Emergency Hospital →
                          </Link>
                          <Link to="/firstaid" className="triage-action-link">
                            🚨 Emergency First Aid Protocol →
                          </Link>
                        </div>
                      )}

                      {msg.source === "mock" && (
                        <div className="mock-note">⚡ Niroga Clinical Knowledge Engine v2.0 Active</div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="chat-msg assistant">
                  <div className="msg-bubble ai-bubble typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="chat-input-area">
              <textarea
                ref={inputRef}
                id="symptom-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={`Describe symptoms in ${language}... (Type or use mic)`}
                rows={2}
                aria-label="Symptom description input"
                disabled={loading}
              />
              <button
                type="button"
                className={`mic-btn ${recording ? "recording" : ""}`}
                onClick={toggleSpeech}
                title={recording ? "Listening... Click to stop" : "Speak your symptoms"}
                id="voice-input-btn"
              >
                {recording ? "🔴" : "🎙️"}
              </button>
              <button
                id="send-message-btn"
                className="btn btn-primary send-btn"
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                aria-label="Send message"
              >
                {loading ? <span className="spinner" /> : "Send →"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dengue Risk & Fluid Target Calculator Modal */}
      {showDengueCalc && (
        <div className="calc-backdrop" onClick={() => setShowDengueCalc(false)}>
          <div className="calc-modal glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="calc-modal-header">
              <div>
                <h3>🦟 Sri Lanka Dengue Fluid & Risk Target</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                  Clinical maintenance fluid estimator based on national Dengue guidelines.
                </p>
              </div>
              <button className="close-btn" onClick={() => setShowDengueCalc(false)}>✕</button>
            </div>

            <div className="calc-form-group">
              <label>Day of Fever: Day {dengueDay}</label>
              <input
                type="range"
                min="1"
                max="7"
                value={dengueDay}
                onChange={(e) => setDengueDay(Number(e.target.value))}
              />
              <small style={{ color: dengueDay >= 3 && dengueDay <= 5 ? "#ff4d6d" : "var(--text-muted)" }}>
                {dengueDay >= 3 && dengueDay <= 5
                  ? "⚠️ CRITICAL PHASE (Days 3-5): Highest risk of plasma leakage and dengue shock!"
                  : dengueDay < 3
                  ? "Febrile Phase: High fever, body aches. FBC test recommended on Day 2."
                  : "Convalescent Phase: Resolution of fever and return of appetite."}
              </small>
            </div>

            <div className="calc-form-group">
              <label htmlFor="patient-weight-input">Patient Weight (kg): {patientWeight} kg</label>
              <input
                id="patient-weight-input"
                type="number"
                min="10"
                max="140"
                value={patientWeight}
                onChange={(e) => setPatientWeight(Number(e.target.value) || 50)}
              />
            </div>

            <div className="calc-form-group">
              <label>Warning Signs Checklist:</label>
              <div className="warning-checklist">
                <label className="check-item">
                  <input
                    type="checkbox"
                    checked={warningFlags.vomiting}
                    onChange={(e) => setWarningFlags({ ...warningFlags, vomiting: e.target.checked })}
                  />
                  <span>Persistent vomiting (unable to retain fluids)</span>
                </label>
                <label className="check-item">
                  <input
                    type="checkbox"
                    checked={warningFlags.abdominalPain}
                    onChange={(e) => setWarningFlags({ ...warningFlags, abdominalPain: e.target.checked })}
                  />
                  <span>Severe localized abdominal pain</span>
                </label>
                <label className="check-item">
                  <input
                    type="checkbox"
                    checked={warningFlags.bleeding}
                    onChange={(e) => setWarningFlags({ ...warningFlags, bleeding: e.target.checked })}
                  />
                  <span>Mucosal bleeding (bleeding gums or nose)</span>
                </label>
                <label className="check-item">
                  <input
                    type="checkbox"
                    checked={warningFlags.lethargy}
                    onChange={(e) => setWarningFlags({ ...warningFlags, lethargy: e.target.checked })}
                  />
                  <span>Extreme lethargy, restlessness, or sudden dizziness</span>
                </label>
              </div>
            </div>

            <div className="calc-results-box">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Target Oral Maintenance Fluid
                  </div>
                  <div className="calc-rate">{targetHourlyRate} ml / hour</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    Approx. {target24hVolume} ml over 24 hours
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    className={`protocol-badge ${hasWarningSign ? "badge-red" : "badge-yellow"}`}
                  >
                    {hasWarningSign ? "🔴 ADMIT TO HOSPITAL NOW" : "🟡 OPD Monitoring"}
                  </span>
                </div>
              </div>

              {hasWarningSign && (
                <p style={{ color: "#ff4d6d", fontSize: "0.85rem", marginTop: "0.75rem", fontWeight: 600 }}>
                  🚨 Warning sign detected! Do not rely solely on home fluids. Proceed immediately to a hospital emergency room (ETU).
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden Printable Triage Report Layout */}
      {printCard && (
        <div className="print-triage-card">
          <div style={{ borderBottom: "2px solid #000", paddingBottom: "10px", marginBottom: "15px" }}>
            <h1 style={{ margin: 0, fontSize: "20px" }}>🌿 Niroga Clinical Triage Report</h1>
            <p style={{ margin: "4px 0", fontSize: "12px", color: "#555" }}>
              Date & Time: {new Date().toLocaleString()} | Reference: NTR-{printCard.id}
            </p>
          </div>
          <div style={{ marginBottom: "15px" }}>
            <h3 style={{ margin: "0 0 5px 0" }}>Patient Reported Symptoms:</h3>
            <p style={{ margin: 0, fontSize: "14px" }}>{printCard.userQuery}</p>
          </div>
          <div style={{ marginBottom: "15px", padding: "10px", border: "1px solid #000", background: "#f9f9f9" }}>
            <h3 style={{ margin: "0 0 5px 0" }}>Triage Severity Level: {printCard.triage}</h3>
            <p style={{ margin: "0 0 8px 0" }}><strong>Clinical Assessment:</strong> {printCard.assessment}</p>
            <p style={{ margin: "0 0 8px 0" }}><strong>Recommended Action:</strong> {printCard.advice}</p>
            <p style={{ margin: 0 }}><strong>When to Seek Immediate Care:</strong> {printCard.when}</p>
          </div>
          <p style={{ fontSize: "11px", color: "#666", marginTop: "20px" }}>
            Emergency Ambulance: 1990 (Suwa Seriya) • Health Line: 1959 • Niroga Community AI Platform
          </p>
        </div>
      )}
    </div>
  );
}
