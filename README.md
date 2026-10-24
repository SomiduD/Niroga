# 🌿 Niroga - Intelligent AI Healthcare Platform for Sri Lanka

**Niroga** (නිරෝගා — meaning "free from disease" in Sinhala) is an open-source, privacy-first AI healthcare assistant designed for community health workers and patients across Sri Lanka. It provides triage guidance in Sinhala, Tamil, and English, and is fully capable of running offline.

---

## 🚀 Key Features

| Feature | Description |
|---------|-------------|
| 🩺 **Symptom Checker** | Multi-lingual clinical AI triage in Sinhala, Tamil & English with triage severity ratings (🟢 Mild, 🟡 Moderate, 🔴 Urgent) |
| 🏥 **Clinic Finder** | Verified hospitals, base hospitals, and primary clinics across all 25 districts of Sri Lanka with direct emergency contacts |
| 📋 **SOAP Note Generator** | Auto-generates structured clinical SOAP notes (Subjective, Objective, Assessment, Plan) from patient encounter descriptions |
| 👩‍⚕️ **Health Worker Portal** | Field-ready patient visit logging, history tracking, and offline medical documentation |
| 📊 **Surveillance Dashboard** | District analytics, symptom distribution charts, and clinical triage tracking |

---

## 🧠 Clinical AI Architecture

- **Primary Engine**: Local open-weight LLM using **Ollama** running **Llama 3.2** (3B parameters) for privacy-preserving medical assistance.
- **Fail-Safe Clinical Knowledge Engine**: Built-in comprehensive Sri Lankan medical triage knowledge base (covering dengue red flags, acute coronary syndrome, stroke, animal bites, snakebites, and respiratory conditions) that guarantees safe, instant guidance even when completely offline.
- **Emergency Integration**: Direct escalation to Sri Lanka's **1990 Suwa Seriya** free ambulance service for critical triage cases.

---

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- *(Optional)* [Ollama](https://ollama.ai/) for running local Llama 3.2:
  ```bash
  ollama pull llama3.2
  ollama serve
  ```

### 1. Backend Setup

```bash
cd server
npm install
node seed.js    # Seed clinic data and demo users
npm run dev     # Runs on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev     # Runs on http://localhost:3000
```

### Demo Logins

| Role | Username | Password |
|------|----------|----------|
| Health Worker | `worker1` | `niroga123` |
| Administrator | `admin` | `admin123` |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Clinical symptom assessment & multi-lingual triage |
| `POST` | `/api/soap` | Structured SOAP note generation |
| `GET`  | `/api/clinics/:district` | Hospitals & clinics for a district |
| `POST` | `/api/visits` | Log patient visit (Health workers) |
| `GET`  | `/api/visits` | Retrieve logged visits |
| `GET`  | `/api/stats` | Analytics data for the dashboard |
| `POST` | `/api/auth/login` | Authentication for staff |

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
