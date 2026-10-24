import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import EmergencyModal from "./components/EmergencyModal";
import Landing from "./pages/Landing";
import SymptomChecker from "./pages/SymptomChecker";
import ClinicFinder from "./pages/ClinicFinder";
import FirstAid from "./pages/FirstAid";
import HealthWorker from "./pages/HealthWorker";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="page-content">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/symptoms" element={<SymptomChecker />} />
          <Route path="/clinics" element={<ClinicFinder />} />
          <Route path="/firstaid" element={<FirstAid />} />
          <Route path="/worker" element={<HealthWorker />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
      <EmergencyModal />
    </BrowserRouter>
  );
}
