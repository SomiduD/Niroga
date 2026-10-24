import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../utils/api";
import "./ClinicFinder.css";

const DISTRICTS = [
  "Colombo", "Gampaha", "Kandy", "Galle", "Matara", "Ratnapura", "Kurunegala",
  "Anuradhapura", "Polonnaruwa", "Badulla", "Monaragala", "Hambantota",
  "Nuwara Eliya", "Kegalle", "Kalutara", "Trincomalee", "Batticaloa", "Ampara",
  "Jaffna", "Mannar", "Vavuniya", "Mullaitivu", "Kilinochchi", "Puttalam", "Matale"
];

const FACILITY_TYPES = [
  "All",
  "Teaching Hospital",
  "General Hospital",
  "District Hospital",
  "Base Hospital",
  "Clinic",
  "Private Hospital",
];

const TYPE_ICONS = {
  "Teaching Hospital": "🏥",
  "General Hospital": "🏥",
  "District Hospital": "🏥",
  "Base Hospital": "🏥",
  "Clinic": "🩺",
  "Private Hospital": "🏨",
};

export default function ClinicFinder() {
  const [district, setDistrict] = useState("Colombo");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const location = useLocation();

  // Load district from query param if available
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const d = params.get("district");
    if (d && DISTRICTS.includes(d)) {
      setDistrict(d);
      fetchClinics(d, searchQuery, selectedType);
    } else {
      fetchClinics(district, searchQuery, selectedType);
    }
  }, [location.search]);

  async function fetchClinics(d, q, type) {
    setLoading(true);
    setError("");
    setSelected(null);
    try {
      const data = await api.clinics(d, q, type);
      setClinics(data.clinics || []);
    } catch (err) {
      setError(err.message || "Failed to load facilities");
    } finally {
      setLoading(false);
    }
  }

  function handleDistrictChange(e) {
    const d = e.target.value;
    setDistrict(d);
    fetchClinics(d, searchQuery, selectedType);
  }

  function handleSearchChange(e) {
    const q = e.target.value;
    setSearchQuery(q);
    fetchClinics(district, q, selectedType);
  }

  function handleTypeFilter(t) {
    setSelectedType(t);
    fetchClinics(district, searchQuery, t);
  }

  function handleCopyInfo(c, i) {
    const text = `${c.name}\n${c.address}\nTel: ${c.phone}`;
    navigator.clipboard?.writeText(text);
    setCopiedId(i);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="clinic-page page">
      <div className="container">
        <div className="section-header">
          <h1>🏥 Hospital & Clinic Directory</h1>
          <p>
            Emergency Treatment Units (ETUs), teaching hospitals, and primary medical clinics across Sri Lanka.
          </p>
        </div>

        <div className="clinic-layout">
          {/* Controls Panel */}
          <aside className="clinic-controls glass-card" aria-label="Facility filters">
            <div>
              <label htmlFor="district-select">Select District</label>
              <select
                id="district-select"
                value={district}
                onChange={handleDistrictChange}
                aria-label="Select district"
              >
                <option value="">All Sri Lanka Districts</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Live Search Field */}
            <div>
              <label htmlFor="facility-search">Search Facility</label>
              <div className="search-field-wrap">
                <span className="search-icon" aria-hidden="true">🔍</span>
                <input
                  id="facility-search"
                  type="text"
                  placeholder="Hospital name or street..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            {/* Facility Type Filter Chips */}
            <div>
              <label>Filter by Type</label>
              <div className="filter-chips-row" role="group" aria-label="Facility type filters">
                {FACILITY_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`filter-chip ${selectedType === t ? "active" : ""}`}
                    onClick={() => handleTypeFilter(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {!loading && (
              <div className="clinics-count">
                Found <strong>{clinics.length}</strong> facilities
                {district ? ` in ${district}` : " nationwide"}
              </div>
            )}

            {/* Emergency Contacts Box */}
            <div className="emergency-box">
              <h3>🚨 Emergency Speed-Dial</h3>
              <div className="emergency-items">
                <div className="emergency-item">
                  <span>Suwa Seriya Ambulance</span>
                  <a href="tel:1990" id="emergency-suwa-seriya" className="emergency-num">
                    1990
                  </a>
                </div>
                <div className="emergency-item">
                  <span>MOH Health Line</span>
                  <a href="tel:1959" id="emergency-health-line" className="emergency-num">
                    1959
                  </a>
                </div>
                <div className="emergency-item">
                  <span>Police Emergency</span>
                  <a href="tel:119" id="emergency-police" className="emergency-num">
                    119
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Results Area */}
          <main className="clinic-results" aria-label="Clinic search results">
            {loading && (
              <div className="clinic-empty">
                <div className="spinner" style={{ width: 36, height: 36 }} />
                <p style={{ marginTop: "1rem" }}>Searching hospital registry...</p>
              </div>
            )}

            {error && <div className="error-msg">{error}</div>}

            {!loading && clinics.length === 0 && (
              <div className="clinic-empty glass-card">
                <div className="empty-icon">🏥</div>
                <h3>No facilities found matching your criteria</h3>
                <p>Try clearing your search keyword or switching facility type filter.</p>
              </div>
            )}

            {!loading && clinics.length > 0 && (
              <div className="clinics-grid">
                {clinics.map((c, i) => (
                  <div
                    key={i}
                    id={`clinic-card-${i}`}
                    className={`clinic-card glass-card ${selected === i ? "selected" : ""}`}
                    onClick={() => setSelected(selected === i ? null : i)}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setSelected(selected === i ? null : i)}
                    role="button"
                    aria-expanded={selected === i}
                    aria-label={`${c.name} - ${c.type}`}
                  >
                    <div className="clinic-type-icon" aria-hidden="true">
                      {TYPE_ICONS[c.type] || "🏥"}
                    </div>
                    <div className="clinic-info">
                      <h3>{c.name}</h3>

                      <div className="clinic-badges-row">
                        <span className="clinic-type-badge">{c.type}</span>
                        {c.district && <span className="facility-cap-badge">📍 {c.district}</span>}
                        {c.etu247 && <span className="facility-cap-badge cap-etu">🚨 24/7 ETU</span>}
                        {c.bloodBank && <span className="facility-cap-badge cap-blood">🩸 Blood Bank</span>}
                        {c.pediatric && <span className="facility-cap-badge">👶 Pediatric</span>}
                      </div>

                      <p className="clinic-address">📍 {c.address}</p>

                      {selected === i && (
                        <div className="clinic-details fade-in" onClick={(e) => e.stopPropagation()}>
                          <div className="clinic-actions-row">
                            <a href={`tel:${c.phone}`} className="clinic-phone-btn" id={`clinic-phone-${i}`}>
                              📞 Call {c.phone}
                            </a>
                            <a
                              href={`https://maps.google.com/?q=${c.lat},${c.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline clinic-map-btn"
                              id={`clinic-map-${i}`}
                            >
                              Open in Maps →
                            </a>
                            <button
                              type="button"
                              className="copy-info-btn"
                              onClick={() => handleCopyInfo(c, i)}
                            >
                              {copiedId === i ? "Copied! ✓" : "📋 Copy Details"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="clinic-expand-icon" aria-hidden="true">
                      {selected === i ? "−" : "+"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
