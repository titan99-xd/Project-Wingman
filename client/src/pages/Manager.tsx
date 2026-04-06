import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import "./../styles/manager.css";

export default function Manager() {
  // 1. Backend Hooks
  const admitPatient = useMutation(api.patients.admitPatient);
  const dischargePatient = useMutation(api.patients.dischargePatient);
  const activePatients = useQuery(api.patients.getActivePatients);

  // 2. Form State
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    sex: "Male" as "Male" | "Female" | "Other",
    roomNumber: "",
    medicalHistory: "",
    status: "Stable", // New Triage Status
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 3. Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await admitPatient({
        name: formData.name,
        age: Number(formData.age),
        sex: formData.sex as "Male" | "Female" | "Other",
        roomNumber: formData.roomNumber,
        medicalHistory: formData.medicalHistory,
        status: formData.status as "Stable" | "Unstable" | "Critical", 
      });

      // Reset form
      setFormData({ name: "", age: "", sex: "Male", roomNumber: "", medicalHistory: "", status: "Stable" });
    } catch (err) {
      console.error("Admission Error:", err);
      alert("Failed to admit patient. Check console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDischarge = async (id: Id<"patients">) => {
  if (window.confirm("Confirm patient discharge? This will archive their record.")) {
    await dischargePatient({ patientId: id }); 
  }
};

  return (
    <div className="manager-page">
      <header className="page-header">
        <h1>Ward Management</h1>
        <p>Monitor patient status and manage active admissions.</p>
      </header>

      <div className="manager-grid">
        {/* LEFT: INTAKE FORM */}
        <section className="card admission-card">
          <div className="card-header">
            <span className="icon">📋</span>
            <h2>Patient Intake</h2>
          </div>

          <form onSubmit={handleSubmit} className="intake-form">
            <div className="form-group">
              <label>Full Name</label>
              <input 
                required 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Patient's legal name"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Age</label>
                <input 
                  required 
                  type="number" 
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Sex</label>
                <select 
                  value={formData.sex}
                  onChange={(e) => setFormData({...formData, sex: e.target.value as "Male" | "Female" | "Other"})}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Room #</label>
                <input 
                  required 
                  type="text" 
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                  placeholder="e.g. B-204"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Admission Status (Triage)</label>
              <select 
                className={`status-select-input ${formData.status.toLowerCase()}`}
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="Stable">Stable</option>
                <option value="Unstable">Unstable</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="form-group">
              <label>Medical History / Initial Notes</label>
              <textarea 
                value={formData.medicalHistory}
                onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})}
                placeholder="Known allergies, recent surgeries, or symptoms..."
              ></textarea>
            </div>

            <button type="submit" className="admit-btn" disabled={isSubmitting}>
              {isSubmitting ? "Syncing..." : "Admit to Sentryx"}
            </button>
          </form>
        </section>

        {/* RIGHT: LIVE DIRECTORY */}
        <section className="card directory-card">
          <div className="card-header">
            <span className="icon">🏥</span>
            <h2>Active Ward Directory</h2>
            <div className="live-indicator">LIVE SYNC</div>
          </div>

          <div className="patient-list">
            {!activePatients ? (
              <p className="loading">Connecting to Sentryx Cloud...</p>
            ) : activePatients.length === 0 ? (
              <div className="empty-state">No active patients in the ward.</div>
            ) : (
              activePatients.map((patient) => (
                <div key={patient._id} className="patient-item">
                  <div className="patient-info">
                    <span className="patient-name">{patient.name}</span>
                    <span className="patient-meta">
                      Room {patient.roomNumber} • {patient.age}y/o • {patient.sex}
                    </span>
                  </div>
                  
                  <div className="patient-actions">
                    <div className={`status-badge ${patient.status.toLowerCase()}`}>
                      {patient.status}
                    </div>
                    <button 
                      className="discharge-btn"
                      onClick={() => handleDischarge(patient._id)}
                      title="Discharge Patient"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}