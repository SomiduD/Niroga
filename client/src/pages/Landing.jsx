import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Landing.css";

const features = [
  { icon: "🩺", title: "AI Symptom Triage", desc: "Describe symptoms in Sinhala, Tamil, or English and get immediate evidence-based clinical triage." },
  { icon: "🏥", title: "Clinic & Hospital Finder", desc: "Verified medical facilities across all 25 districts with direct phone lines and navigation." },
  { icon: "📋", title: "Clinical SOAP Generator", desc: "Instantly formats unorganized patient descriptions into standardized clinical notes." },
  { icon: "🚨", title: "First Aid & Remedy Guide", desc: "Protocols for snakebites, dengue fluid care, CPR, and traditional Sri Lankan herbal support." },
  { icon: "📊", title: "Epidemiological Surveillance", desc: "Surveillance dashboard highlighting regional case patterns and outbreak alerts." },
  { icon: "⚡", title: "Offline-Ready Architecture", desc: "Engineered for rural clinics and estate sectors with zero reliance on cloud servers." },
];

const stats = [
  { value: "25", label: "Districts Covered" },
  { value: "500+", label: "Clinics & Hospitals" },
  { value: "100%", label: "Privacy & Local Data" },
  { value: "3", label: "Languages Supported" },
];

const TOP_DISTRICTS = ["Colombo", "Kandy", "Galle", "Gampaha", "Kurunegala", "Jaffna", "Anuradhapura"];

export default function Landing() {
  const [quickSymptom, setQuickSymptom] = useState("");
  const navigate = useNavigate();

  function handleQuickCheck(e) {
    e.preventDefault();
    if (!quickSymptom.trim()) return;
    navigate(`/symptoms?q=${encodeURIComponent(quickSymptom.trim())}`);
  }

  return (
    <div className="landing">
      {/* Alert Ticker */}
      <div className="alert-ticker" role="region" aria-label="National Health Alert">
        <span className="alert-ticker-badge">Active Advisory</span>
        <span>
          🦟 <strong>National Dengue Surveillance Alert</strong>: Western & Central provinces reporting heightened seasonal density. FBC test advised on Day 2 of fever.
        </span>
        <Link to="/firstaid">Read Dengue Protocol →</Link>
      </div>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-bg">
          <div className="orb orb-1" aria-hidden="true" />
          <div className="orb orb-2" aria-hidden="true" />
          <div className="grid-lines" aria-hidden="true" />
        </div>
        <div className="container hero-content">
          <div className="hero-badge slide-up">
            <span>🛡️</span> Smart Healthcare Assistant for Sri Lanka
          </div>
          <h1 id="hero-title" className="hero-title slide-up">
            AI Healthcare for<br />
            <span className="gradient-text">Every Sri Lankan</span>
          </h1>
          <p className="hero-desc slide-up">
            Niroga is an intelligent medical platform delivering immediate clinical triage,
            hospital navigation, and documentation in Sinhala, Tamil, and English.
          </p>

          {/* Quick Symptom Bar */}
          <form onSubmit={handleQuickCheck} className="hero-quick-triage slide-up" id="hero-quick-form">
            <span className="hqt-icon" aria-hidden="true">🩺</span>
            <input
              type="text"
              placeholder="Describe symptoms (e.g. fever with vomiting, chest pressure, rash)..."
              value={quickSymptom}
              onChange={(e) => setQuickSymptom(e.target.value)}
              aria-label="Quick symptom search"
            />
            <button type="submit" className="btn btn-primary" id="hero-quick-btn">
              Check Triage →
            </button>
          </form>

          {/* Quick District Navigation */}
          <div className="district-quick-row slide-up">
            <span className="dqr-label">Find Hospitals in:</span>
            {TOP_DISTRICTS.map((d) => (
              <Link key={d} to={`/clinics?district=${d}`} className="district-chip">
                📍 {d}
              </Link>
            ))}
          </div>

          <div className="hero-actions slide-up">
            <Link to="/symptoms" className="btn btn-primary" id="hero-cta-symptoms">
              Full Symptom Checker
            </Link>
            <Link to="/firstaid" className="btn btn-outline" id="hero-cta-firstaid">
              🚨 First Aid & Remedies
            </Link>
          </div>

          <div className="hero-ai-badge slide-up">
            <span className="ai-dot" aria-hidden="true" />
            Powered by Clinical Intelligence & Llama 3.2 • Privacy-Preserving • 100% Offline-Capable
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section" aria-label="Niroga statistics">
        <div className="container stats-grid">
          {stats.map((s) => (
            <div key={s.label} className="stat-card glass-card">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section" aria-labelledby="features-title">
        <div className="container">
          <div className="section-header" style={{ textAlign: "center" }}>
            <h2 id="features-title">Integrated Clinical Solutions</h2>
            <p>Built specifically for primary healthcare workers, estate sectors, and rural communities across Sri Lanka</p>
          </div>
          <div className="features-grid">
            {features.map((f) => (
              <div key={f.title} className="feature-card glass-card" tabIndex={0}>
                <div className="feature-icon" aria-hidden="true">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Health Worker Spotlight */}
      <section className="spotlight-section">
        <div className="container">
          <div className="spotlight-card glass-card">
            <div className="spotlight-avatar" aria-hidden="true">👩‍⚕️</div>
            <div className="spotlight-content">
              <h3>Designed with Community Health Workers</h3>
              <div className="spotlight-role">Public Health Midwives & Field Medical Officers (MOH Offices)</div>
              <p className="spotlight-quote">
                "In rural divisional secretariats and tea estate dispensaries where connectivity drops and specialist doctors are miles away, having instant triage guidance and standardized SOAP notes in our native languages makes a life-saving difference."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" aria-labelledby="cta-title">
        <div className="container cta-inner glass-card">
          <h2 id="cta-title">Privacy-First. Offline-Ready. Built for Sri Lanka.</h2>
          <p>Niroga operates with local clinical intelligence — zero cloud lock-in, ensuring patient confidentiality.</p>
          <div className="cta-links">
            <Link to="/worker" className="btn btn-primary" id="cta-worker-btn">Health Worker Portal</Link>
            <Link to="/admin" className="btn btn-ghost" id="cta-admin-btn">Surveillance Dashboard</Link>
          </div>
        </div>
      </section>

      <footer className="footer" role="contentinfo">
        <div className="container footer-inner">
          <span>© 2026 Niroga • Community Healthcare Assistant for Sri Lanka</span>
          <span>Emergency Ambulance Service: 1990 (Suwa Seriya)</span>
        </div>
      </footer>
    </div>
  );
}