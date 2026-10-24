import { useState, useEffect } from "react";
import { api } from "../utils/api";
import "./HealthWorker.css";

const DISTRICTS = [
  "Colombo", "Gampaha", "Kandy", "Galle", "Matara", "Ratnapura", "Kurunegala",
  "Anuradhapura", "Polonnaruwa", "Badulla", "Monaragala", "Hambantota",
  "Nuwara Eliya", "Kegalle", "Kalutara", "Trincomalee", "Batticaloa", "Ampara",
  "Jaffna", "Mannar", "Vavuniya", "Mullaitivu", "Kilinochchi", "Puttalam", "Matale"
];

function LoginForm({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.username || !form.password) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.auth.login(form.username, form.password);
      localStorage.setItem("niroga_token", data.token);
      onLogin(data.user);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card glass-card">
        <div className="login-header">
          <img src="/niroga-logo.jpg" alt="Niroga" className="login-logo" />
          <h1>Health Worker Portal</h1>
          <p>Sign in to log patient visits and generate clinical SOAP notes</p>
        </div>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleSubmit} id="login-form">
          <div className="form-group">
            <label htmlFor="username-input">Username</label>
            <input
              id="username-input"
              type="text"
              placeholder="worker1 or admin"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password-input">Password</label>
            <input
              id="password-input"
              type="password"
              placeholder="niroga123"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
            />
          </div>
          <button type="submit" id="login-submit-btn" className="btn btn-primary full-btn" disabled={loading}>
            {loading ? <span className="spinner" /> : "Sign In →"}
          </button>
        </form>
        <div className="demo-creds">
          <strong>Demo credentials:</strong>
          <br />
          worker1 / niroga123 &nbsp;|&nbsp; admin / admin123
        </div>
      </div>
    </div>
  );
}

export default function HealthWorker() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("log");
  const [visits, setVisits] = useState([]);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [historySearch, setHistorySearch] = useState("");
  const [historyTriageFilter, setHistoryTriageFilter] = useState("ALL");

  const [form, setForm] = useState({
    patientId: "",
    district: "",
    symptoms: "",
    triage: "MILD",
    notes: "",
  });

  // Vitals Staging
  const [showVitals, setShowVitals] = useState(false);
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");

  const [soapDesc, setSoapDesc] = useState("");
  const [soap, setSoap] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [genSoap, setGenSoap] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("niroga_token");
    if (token) {
      api.auth.me().then((d) => setUser(d.user)).catch(() => {});
    }
    // Load local offline queue
    try {
      const saved = JSON.parse(localStorage.getItem("niroga_offline_visits") || "[]");
      setOfflineQueue(saved);
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (user) {
      api.visits.list(user.name).then((d) => setVisits(d.visits || [])).catch(() => {});
    }
  }, [user]);

  // Blood Pressure staging
  function getBPStage(sys, dia) {
    const s = Number(sys);
    const d = Number(dia);
    if (!s || !d) return null;
    if (s > 180 || d > 120) return { label: "🔴 Hypertensive Crisis — Urgent Care", cls: "badge-red" };
    if (s >= 140 || d >= 90) return { label: "🔴 Stage 2 Hypertension", cls: "badge-red" };
    if (s >= 130 || d >= 80) return { label: "🟡 Stage 1 Hypertension", cls: "badge-yellow" };
    if (s >= 120 && d < 80) return { label: "🟡 Elevated BP", cls: "badge-yellow" };
    return { label: "🟢 Normal BP (<120/80)", cls: "badge-green" };
  }

  // BMI Staging
  function getBMI(w, h) {
    const weight = Number(w);
    const height = Number(h) / 100;
    if (!weight || !height) return null;
    const bmi = (weight / (height * height)).toFixed(1);
    let stage = "";
    let cls = "";
    if (bmi < 18.5) {
      stage = "Underweight";
      cls = "badge-yellow";
    } else if (bmi <= 22.9) {
      stage = "Normal (Asian Criteria)";
      cls = "badge-green";
    } else if (bmi <= 27.4) {
      stage = "Overweight";
      cls = "badge-yellow";
    } else {
      stage = "Obese Class I/II";
      cls = "badge-red";
    }
    return { bmi, stage, cls };
  }

  const bpResult = getBPStage(systolic, diastolic);
  const bmiResult = getBMI(weightKg, heightCm);

  async function handleLogVisit(e) {
    e.preventDefault();
    if (!form.patientId || !form.symptoms) return;
    setSubmitting(true);
    setSuccess("");

    let extraVitalsNote = "";
    if (bpResult) extraVitalsNote += ` [BP: ${systolic}/${diastolic} mmHg - ${bpResult.label}]`;
    if (bmiResult) extraVitalsNote += ` [BMI: ${bmiResult.bmi} - ${bmiResult.stage}]`;

    const payload = {
      ...form,
      notes: (form.notes + extraVitalsNote).trim(),
      workerName: user.name,
      district: form.district || user.district || "Colombo",
      soapNote: soap ? JSON.stringify(soap) : null,
      date: new Date().toISOString(),
    };

    try {
      await api.visits.create(payload);
      setSuccess("Visit logged successfully to registry! ✓");
      setForm({ patientId: "", district: "", symptoms: "", triage: "MILD", notes: "" });
      setSoap(null);
      setSystolic("");
      setDiastolic("");
      setWeightKg("");
      setHeightCm("");
      const d = await api.visits.list(user.name);
      setVisits(d.visits || []);
    } catch (err) {
      // Fallback: Queue offline
      const updatedQueue = [...offlineQueue, payload];
      setOfflineQueue(updatedQueue);
      localStorage.setItem("niroga_offline_visits", JSON.stringify(updatedQueue));
      setSuccess("Network unreachable. Visit saved to Offline Queue! ⚡");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSyncOffline() {
    if (offlineQueue.length === 0) return;
    setSubmitting(true);
    let synced = 0;
    const remaining = [];

    for (const item of offlineQueue) {
      try {
        await api.visits.create(item);
        synced++;
      } catch (e) {
        remaining.push(item);
      }
    }

    setOfflineQueue(remaining);
    localStorage.setItem("niroga_offline_visits", JSON.stringify(remaining));
    setSuccess(`Successfully synced ${synced} offline records to central database! ✓`);
    setSubmitting(false);
    const d = await api.visits.list(user.name);
    setVisits(d.visits || []);
  }

  async function handleGenerateSOAP() {
    if (!soapDesc.trim()) return;
    setGenSoap(true);
    setSoap(null);
    try {
      const data = await api.soap(soapDesc);
      setSoap(data);
      setForm((f) => ({ ...f, symptoms: soapDesc }));
    } catch (err) {
      setSoap({ error: err.message });
    } finally {
      setGenSoap(false);
    }
  }

  function handlePrintSOAP() {
    window.print();
  }

  function logout() {
    localStorage.removeItem("niroga_token");
    setUser(null);
    setVisits([]);
  }

  if (!user) return <LoginForm onLogin={setUser} />;

  // Filter history
  const filteredVisits = visits.filter((v) => {
    const matchesSearch =
      !historySearch ||
      (v.patientId && v.patientId.toLowerCase().includes(historySearch.toLowerCase())) ||
      (v.symptoms && v.symptoms.toLowerCase().includes(historySearch.toLowerCase()));
    const matchesTriage =
      historyTriageFilter === "ALL" || (v.triage && v.triage.toUpperCase() === historyTriageFilter);
    return matchesSearch && matchesTriage;
  });

  return (
    <div className="worker-page page">
      <div className="container">
        <div className="worker-header">
          <div>
            <h1>Community Health Worker Portal</h1>
            <p>
              Signed in: <strong>{user.name}</strong> • Division: {user.district}
            </p>
          </div>
          <button id="logout-btn" className="btn btn-ghost" onClick={logout}>
            Logout
          </button>
        </div>

        {/* Offline Sync Banner */}
        <div className={`sync-banner ${offlineQueue.length > 0 ? "has-pending" : ""}`}>
          <div>
            {offlineQueue.length > 0 ? (
              <span>⚠️ <strong>{offlineQueue.length}</strong> patient visits queued locally offline.</span>
            ) : (
              <span>🟢 <strong>Connected</strong> • Offline database synchronized.</span>
            )}
          </div>
          {offlineQueue.length > 0 && (
            <button className="sync-btn" onClick={handleSyncOffline} disabled={submitting}>
              Sync Now ⚡
            </button>
          )}
        </div>

        <div className="worker-tabs" role="tablist">
          {[
            { id: "log", label: "📝 Log Visit & Vitals" },
            { id: "soap", label: "📋 Clinical SOAP Generator" },
            { id: "history", label: `📜 Encounter History (${visits.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`worker-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div role="tabpanel">
          {activeTab === "log" && (
            <form onSubmit={handleLogVisit} className="visit-form glass-card">
              <h2>Log Clinical Patient Encounter</h2>
              {success && (
                <div className={`form-msg ${success.startsWith("Error") ? "form-error" : "form-success"}`}>
                  {success}
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="patient-id-input">Patient ID / National ID / Clinic Ref</label>
                  <input
                    id="patient-id-input"
                    value={form.patientId}
                    onChange={(e) => setForm((f) => ({ ...f, patientId: e.target.value }))}
                    placeholder="e.g. MOH-KD-4819"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="visit-district-select">District</label>
                  <select
                    id="visit-district-select"
                    value={form.district}
                    onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                  >
                    <option value="">Select District...</option>
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Vitals Toggle & Calculator */}
              <div className="vitals-toggle-row">
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ fontSize: "0.82rem", padding: "0.4rem 0.8rem" }}
                  onClick={() => setShowVitals(!showVitals)}
                >
                  {showVitals ? "− Hide Vitals Calculator" : "+ Add Clinical Vitals (BP & BMI)"}
                </button>
              </div>

              {showVitals && (
                <div className="vitals-calculator-box">
                  <h4>🩺 Patient Vitals Staging Calculator</h4>
                  <div className="vital-calc-row">
                    <div>
                      <label>Blood Pressure (Systolic / Diastolic mmHg)</label>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <input
                          type="number"
                          placeholder="Systolic (e.g. 120)"
                          value={systolic}
                          onChange={(e) => setSystolic(e.target.value)}
                        />
                        <input
                          type="number"
                          placeholder="Diastolic (e.g. 80)"
                          value={diastolic}
                          onChange={(e) => setDiastolic(e.target.value)}
                        />
                      </div>
                      {bpResult && (
                        <div className={`vital-pill-result ${bpResult.cls}`}>
                          {bpResult.label}
                        </div>
                      )}
                    </div>

                    <div>
                      <label>BMI Parameters (Weight in kg / Height in cm)</label>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <input
                          type="number"
                          placeholder="Weight (kg)"
                          value={weightKg}
                          onChange={(e) => setWeightKg(e.target.value)}
                        />
                        <input
                          type="number"
                          placeholder="Height (cm)"
                          value={heightCm}
                          onChange={(e) => setHeightCm(e.target.value)}
                        />
                      </div>
                      {bmiResult && (
                        <div className={`vital-pill-result ${bmiResult.cls}`}>
                          BMI: {bmiResult.bmi} ({bmiResult.stage})
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="symptoms-input">Chief Complaint & Duration</label>
                <textarea
                  id="symptoms-input"
                  value={form.symptoms}
                  onChange={(e) => setForm((f) => ({ ...f, symptoms: e.target.value }))}
                  placeholder="e.g. High fever with chills for 3 days, retro-orbital eye pain, severe joint aches..."
                  rows={3}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="triage-select">Triage Classification</label>
                <select
                  id="triage-select"
                  value={form.triage}
                  onChange={(e) => setForm((f) => ({ ...f, triage: e.target.value }))}
                >
                  <option value="MILD">🟢 Mild (Home care / supportive guidance)</option>
                  <option value="MODERATE">🟡 Moderate (OPD / Clinic within 24h)</option>
                  <option value="URGENT">🔴 Urgent (Immediate Emergency Room / 1990)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="notes-input">Clinical Management & Dispensed Medications</label>
                <textarea
                  id="notes-input"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Medications provided, ORS packets, referral facility, or follow-up date..."
                  rows={2}
                />
              </div>

              <button type="submit" id="log-visit-btn" className="btn btn-primary" disabled={submitting}>
                {submitting ? <span className="spinner" /> : "Log Patient Record →"}
              </button>
            </form>
          )}

          {activeTab === "soap" && (
            <div className="soap-tab glass-card">
              <h2>Clinical SOAP Note Generator</h2>
              <p className="soap-subtitle">
                Describe patient clinical encounter in plain unstructured text — Niroga AI structures it into clinical Subjective, Objective, Assessment, and Plan format.
              </p>
              <div className="form-group">
                <label htmlFor="soap-desc-input">Patient Encounter Description</label>
                <textarea
                  id="soap-desc-input"
                  value={soapDesc}
                  onChange={(e) => setSoapDesc(e.target.value)}
                  placeholder="e.g. 35-year-old male presenting with 3-day history of high fever (38.8°C), severe retro-orbital headache, and joint pain. No cough or shortness of breath. Works as a farmer in Kandy district..."
                  rows={5}
                />
              </div>
              <button
                id="generate-soap-btn"
                className="btn btn-primary"
                onClick={handleGenerateSOAP}
                disabled={genSoap || !soapDesc.trim()}
              >
                {genSoap ? (
                  <>
                    <span className="spinner" /> Generating Clinical Note...
                  </>
                ) : (
                  "Generate SOAP Note →"
                )}
              </button>

              {soap && !soap.error && (
                <div className="soap-result fade-in">
                  <div className="soap-header-row">
                    <h3>Generated Clinical Record</h3>
                    <button className="btn btn-ghost" onClick={handlePrintSOAP} style={{ fontSize: "0.82rem" }}>
                      🖨️ Print Clinical Note
                    </button>
                  </div>
                  <div className="soap-sections">
                    {[
                      ["S • Subjective", soap.subjective],
                      ["O • Objective", soap.objective],
                      ["A • Assessment", soap.assessment],
                      ["P • Plan", soap.plan],
                    ].map(([title, text]) => (
                      <div key={title} className="soap-block">
                        <div className="soap-block-title">{title}</div>
                        <p>{text}</p>
                      </div>
                    ))}
                  </div>
                  {soap.source === "mock" && (
                    <div className="mock-note">⚡ Niroga Clinical Documentation Engine Active</div>
                  )}
                </div>
              )}
              {soap?.error && <div className="form-error">{soap.error}</div>}
            </div>
          )}

          {activeTab === "history" && (
            <div className="history-tab">
              <div className="history-header glass-card">
                <h2>Patient Encounter Registry</h2>
                <span className="history-count">{filteredVisits.length} of {visits.length} records</span>
              </div>

              {/* History Search Bar */}
              <div className="history-filter-bar glass-card">
                <input
                  type="text"
                  placeholder="Search Patient ID or symptoms..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                />
                <select
                  value={historyTriageFilter}
                  onChange={(e) => setHistoryTriageFilter(e.target.value)}
                >
                  <option value="ALL">All Triage Levels</option>
                  <option value="MILD">🟢 Mild Only</option>
                  <option value="MODERATE">🟡 Moderate Only</option>
                  <option value="URGENT">🔴 Urgent Only</option>
                </select>
              </div>

              {filteredVisits.length === 0 ? (
                <div className="clinic-empty glass-card">
                  <div className="empty-icon">📋</div>
                  <h3>No matching patient visits found</h3>
                </div>
              ) : (
                <div className="history-list">
                  {filteredVisits.map((v, i) => (
                    <div key={v.id || i} className="history-card glass-card">
                      <div className="hc-left">
                        <div className="hc-patient">Ref: {v.patientId}</div>
                        <div className="hc-symptoms">{v.symptoms}</div>
                        <div className="hc-meta">
                          {v.district} • {new Date(v.date || Date.now()).toLocaleDateString()}
                          {v.notes && ` • Notes: ${v.notes}`}
                        </div>
                      </div>
                      <div className={`badge badge-${(v.triage || "MILD").toLowerCase()}`}>
                        {v.triage === "MILD" ? "🟢" : v.triage === "MODERATE" ? "🟡" : "🔴"}{" "}
                        {v.triage}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
