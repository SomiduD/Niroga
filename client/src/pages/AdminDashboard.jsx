import { useState, useEffect } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { api } from "../utils/api";
import "./AdminDashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: "#8b9ab5",
        font: { family: "Inter", size: 12 },
      },
    },
  },
  scales: {
    x: {
      ticks: { color: "#8b9ab5" },
      grid: { color: "rgba(255,255,255,0.04)" },
    },
    y: {
      ticks: { color: "#8b9ab5" },
      grid: { color: "rgba(255,255,255,0.04)" },
    },
  },
};

const DONUT_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        color: "#8b9ab5",
        font: { family: "Inter", size: 11 },
        padding: 16,
      },
    },
  },
};

function StatCard({ icon, value, label, sub }) {
  return (
    <div className="stat-card-admin glass-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-body">
        <div className="stat-val">{value}</div>
        <div className="stat-lbl">{label}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all");

  useEffect(() => {
    loadStats(period);
  }, [period]);

  async function loadStats(p) {
    setLoading(true);
    try {
      const data = await api.stats(p);
      setStats(data);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }

  function handleExportCSV() {
    if (!stats) return;
    const rows = [
      ["District", "Patient Encounters"],
      ...Object.entries(stats.districtCounts || {}),
      [],
      ["Symptom Category", "Cases"],
      ...Object.entries(stats.symptomCounts || {}),
      [],
      ["Triage Level", "Volume"],
      ["Mild", stats.triageCounts?.MILD || 0],
      ["Moderate", stats.triageCounts?.MODERATE || 0],
      ["Urgent", stats.triageCounts?.URGENT || 0],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `niroga_surveillance_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (loading && !stats) {
    return (
      <div className="admin-page page">
        <div className="container admin-loading">
          <div className="spinner" style={{ width: 40, height: 40 }} />
          <p>Loading national health intelligence dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="admin-page page">
        <div className="container">
          <div className="error-msg">Failed to load statistics</div>
        </div>
      </div>
    );
  }

  const topDistricts = Object.entries(stats.districtCounts || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const symptoms = stats.symptomCounts || {};
  const triage = stats.triageCounts || {};

  const barData = {
    labels: topDistricts.map((d) => d[0]),
    datasets: [
      {
        label: "Encounters",
        data: topDistricts.map((d) => d[1]),
        backgroundColor: "rgba(0,212,170,0.6)",
        borderColor: "#00d4aa",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const donutData = {
    labels: Object.keys(symptoms),
    datasets: [
      {
        data: Object.values(symptoms),
        backgroundColor: [
          "#ff4d6d",
          "#f6c90e",
          "#ff6b6b",
          "#00d4aa",
          "#00a878",
          "#7c3aed",
          "#0ea5e9",
          "#6b7280",
        ],
        borderWidth: 0,
      },
    ],
  };

  const triageData = {
    labels: ["Mild", "Moderate", "Urgent"],
    datasets: [
      {
        data: [triage.MILD || 0, triage.MODERATE || 0, triage.URGENT || 0],
        backgroundColor: [
          "rgba(0,212,170,0.7)",
          "rgba(246,201,14,0.7)",
          "rgba(255,77,109,0.7)",
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="admin-page page">
      <div className="container">
        <div className="dashboard-top-bar">
          <div>
            <h1 style={{ fontSize: "1.8rem" }}>📊 Health Intelligence & Outbreak Surveillance</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              National triage trends and epidemiological tracking across Sri Lanka
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <div className="period-toggle-group">
              {[
                { id: "7d", label: "7 Days" },
                { id: "30d", label: "30 Days" },
                { id: "all", label: "All Time" },
              ].map((p) => (
                <button
                  key={p.id}
                  className={`period-btn ${period === p.id ? "active" : ""}`}
                  onClick={() => setPeriod(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button className="export-csv-btn" onClick={handleExportCSV}>
              📥 Export CSV
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="kpi-grid">
          <StatCard
            icon="🩺"
            value={stats.totalVisits?.toLocaleString()}
            label="Total Encounters"
            sub={`Period: ${period.toUpperCase()}`}
          />
          <StatCard
            icon="👥"
            value={stats.totalPatients?.toLocaleString()}
            label="Patients Screened"
          />
          <StatCard
            icon="📍"
            value={stats.districtsCovered}
            label="Districts Active"
            sub="Island-wide"
          />
          <StatCard
            icon="👩‍⚕️"
            value={stats.activeWorkers}
            label="Active Health Workers"
          />
        </div>

        {/* Outbreak Radar */}
        {stats.outbreakAlerts?.length > 0 && (
          <div className="outbreak-radar-section">
            <h3>🚨 Active Outbreak Surveillance Radar</h3>
            <div className="outbreak-grid">
              {stats.outbreakAlerts.map((o) => (
                <div key={o.id} className={`outbreak-card glass-card ${o.level.toLowerCase()}`}>
                  <div>
                    <div className="outbreak-card-header">
                      <h4>{o.disease}</h4>
                      <span
                        className={`protocol-badge ${
                          o.level === "HIGH"
                            ? "badge-red"
                            : o.level === "MODERATE"
                            ? "badge-yellow"
                            : "badge-green"
                        }`}
                      >
                        {o.level}
                      </span>
                    </div>
                    <p>{o.advice}</p>
                  </div>
                  <div className="outbreak-districts">
                    📍 Focus: {o.districts.join(", ")} • <strong>{o.trend}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts Row */}
        <div className="charts-row-2">
          <div className="chart-card glass-card">
            <h3>District Encounter Volume (Top 10)</h3>
            <div className="chart-wrap">
              <Bar
                data={barData}
                options={{
                  ...CHART_DEFAULTS,
                  indexAxis: "y",
                  plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } },
                }}
              />
            </div>
          </div>

          <div className="charts-col">
            <div className="chart-card glass-card">
              <h3>Symptom Category Breakdown</h3>
              <div className="chart-wrap chart-wrap-sm">
                <Doughnut data={donutData} options={DONUT_DEFAULTS} />
              </div>
            </div>
            <div className="chart-card glass-card">
              <h3>Triage Urgency Mix</h3>
              <div className="chart-wrap chart-wrap-sm">
                <Doughnut data={triageData} options={DONUT_DEFAULTS} />
              </div>
            </div>
          </div>
        </div>

        {/* District Density Table */}
        <div className="density-table-wrap glass-card">
          <h3>District Surveillance Summary Table</h3>
          <table className="density-table">
            <thead>
              <tr>
                <th>District</th>
                <th>Encounter Volume</th>
                <th>Prevalence Share</th>
                <th>Surveillance Status</th>
              </tr>
            </thead>
            <tbody>
              {topDistricts.map(([dist, count]) => {
                const share = ((count / (stats.totalVisits || 1)) * 100).toFixed(1);
                const isHigh = count >= 35;
                const isMed = count >= 20;
                return (
                  <tr key={dist}>
                    <td><strong>📍 {dist}</strong></td>
                    <td>{count} encounters</td>
                    <td>{share}%</td>
                    <td>
                      <span
                        className={`protocol-badge ${
                          isHigh ? "badge-red" : isMed ? "badge-yellow" : "badge-green"
                        }`}
                      >
                        {isHigh ? "Active Surveillance" : isMed ? "Moderate" : "Baseline"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Recent Encounters Activity Feed */}
        {stats.recentActivity?.length > 0 && (
          <div className="recent-section glass-card">
            <h3>Recent Clinical Encounters Log</h3>
            <div className="recent-list">
              {stats.recentActivity.map((v, i) => (
                <div key={i} className="recent-item">
                  <div className="recent-left">
                    <span className="recent-patient">Ref: {v.patientId}</span>
                    <span className="recent-symptoms">{v.symptoms?.substring(0, 70)}</span>
                  </div>
                  <div className="recent-right">
                    <div className={`badge badge-${(v.triage || "MILD").toLowerCase()}`}>
                      {v.triage === "MILD" ? "🟢" : v.triage === "MODERATE" ? "🟡" : "🔴"}{" "}
                      {v.triage}
                    </div>
                    <span className="recent-district">📍 {v.district}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Local AI Architecture Note */}
        <div className="ai-info-box glass-card">
          <div className="ai-info-icon" aria-hidden="true">🤖</div>
          <div>
            <h3>Privacy-Preserving Edge AI Intelligence</h3>
            <p>
              Niroga is powered by localized open-weight <strong>Llama 3.2</strong> backed by a deterministic clinical rule engine tailored to Sri Lankan Ministry of Health guidelines. All patient encounters and triage classifications are computed and stored on-premises with zero exposure to external public clouds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
