import { useState, useEffect } from "react";
import "./EmergencyModal.css";

export default function EmergencyModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") setIsOpen(false);
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      <button
        className="emergency-fab"
        onClick={() => setIsOpen(true)}
        aria-label="Open Sri Lanka Emergency Services"
        id="emergency-fab-btn"
      >
        <span className="fab-pulse-dot" aria-hidden="true" />
        <span>🚨 Emergency / 1990</span>
      </button>

      {isOpen && (
        <div
          className="emergency-backdrop"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="emergency-modal-title"
        >
          <div
            className="emergency-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="emergency-modal-header">
              <div className="modal-title-group">
                <h2 id="emergency-modal-title">🚨 Emergency Response Helplines</h2>
                <p>24/7 Free National Services across Sri Lanka</p>
              </div>
              <button
                className="close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close emergency modal"
              >
                ✕
              </button>
            </div>

            {/* Primary 1990 Banner */}
            <div className="primary-emergency-banner">
              <div className="pe-left">
                <h3>🚑 1990 Suwa Seriya Ambulance</h3>
                <p>Free Pre-hospital Care & Emergency Transport across all 25 districts.</p>
              </div>
              <a href="tel:1990" className="call-1990-btn" id="modal-dial-1990">
                📞 Call 1990
              </a>
            </div>

            {/* Other Critical Helplines */}
            <div className="emergency-grid">
              <div className="emergency-contact-card">
                <div className="ecc-info">
                  <h4>📞 1959 Health Line</h4>
                  <p>National Ministry of Health consultation & hospital guidance.</p>
                </div>
                <a href="tel:1959" className="ecc-dial" id="modal-dial-1959">
                  Dial 1959 →
                </a>
              </div>

              <div className="emergency-contact-card">
                <div className="ecc-info">
                  <h4>🧠 1926 Mental Health</h4>
                  <p>National Institute of Mental Health 24/7 confidential crisis line.</p>
                </div>
                <a href="tel:1926" className="ecc-dial" id="modal-dial-1926">
                  Dial 1926 →
                </a>
              </div>

              <div className="emergency-contact-card">
                <div className="ecc-info">
                  <h4>👮 119 Police Emergency</h4>
                  <p>Accident, trauma reporting, and police assistance.</p>
                </div>
                <a href="tel:119" className="ecc-dial" id="modal-dial-119">
                  Dial 119 →
                </a>
              </div>

              <div className="emergency-contact-card">
                <div className="ecc-info">
                  <h4>🚒 110 Fire & Rescue</h4>
                  <p>Fire incidents, structural collapse, and flood rescue.</p>
                </div>
                <a href="tel:110" className="ecc-dial" id="modal-dial-110">
                  Dial 110 →
                </a>
              </div>
            </div>

            {/* Red Flags Checklist */}
            <div className="triage-red-flags">
              <h4>⚠️ When to Call 1990 Immediately:</h4>
              <ul>
                <li>Crushing chest pain radiating to arm/jaw</li>
                <li>Sudden facial drooping or arm weakness</li>
                <li>Severe breathing difficulty or gasping</li>
                <li>Snakebite or agrochemical poisoning</li>
                <li>Uncontrolled heavy bleeding</li>
                <li>Dengue bleeding gums or severe stomach pain</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
