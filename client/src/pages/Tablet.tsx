import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import "../styles/tablet.css";

export default function Tablet() {
  // 1. CONVEX HOOKS
  const patients = useQuery(api.patients.getActivePatients);
  const addVitalMutation = useMutation(api.vitals.addVitals);
  
  // 2. COMPONENT STATE
  const [selectedPatientId, setSelectedPatientId] = useState<Id<"patients"> | null>(null);
  const [vitalInput, setVitalInput] = useState({ hr: "", bp: "", spo2: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 3. AUTO-SELECT FIRST PATIENT
  useEffect(() => {
    if (patients && patients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0]._id);
    }
  }, [patients, selectedPatientId]);

  // Find the full patient object for the selected ID
  const selectedPatient = patients?.find(p => p._id === selectedPatientId);

  // 4. LOGIC: SAVE VITALS TO CONVEX
  const handleSaveVitals = async () => {
    if (!selectedPatientId) return;
    if (!vitalInput.hr && !vitalInput.bp && !vitalInput.spo2) {
      alert("Please enter at least one vital sign value.");
      return;
    }

    setIsSubmitting(true);
    const timestamp = Date.now();
    const nurseId = "SYSTEM"; // Placeholder until Auth is implemented

    try {
      // Create an array of promises to run mutations in parallel
      const mutations = [];

      if (vitalInput.hr) {
        mutations.push(addVitalMutation({ 
          patientId: selectedPatientId, 
          nurseId,
          type: "HR", 
          value: vitalInput.hr, 
          unit: "bpm",
          timestamp 
        }));
      }

      if (vitalInput.bp) {
        mutations.push(addVitalMutation({ 
          patientId: selectedPatientId, 
          nurseId,
          type: "BP", 
          value: vitalInput.bp, 
          unit: "mmHg",
          timestamp 
        }));
      }

      if (vitalInput.spo2) {
        mutations.push(addVitalMutation({ 
          patientId: selectedPatientId, 
          nurseId,
          type: "SpO2", 
          value: vitalInput.spo2, 
          unit: "%",
          timestamp 
        }));
      }

      await Promise.all(mutations);
      
      // Reset inputs and notify user
      setVitalInput({ hr: "", bp: "", spo2: "" });
      alert(`Observations for ${selectedPatient?.name} synchronized to Sentryx Cloud.`);
    } catch (err) {
      console.error("Submission Error:", err);
      alert("Error: Data does not match clinical schema. Check console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="tablet-container">
      {/* SIDEBAR: PATIENT LIST */}
      <aside className="tablet-sidebar">
        <div className="sidebar-header">
          <h2>Ward A1</h2>
          <span className="count">{patients?.length || 0} Patients</span>
        </div>
        <div className="tablet-patient-list">
          {patients?.map((p) => (
            <div 
              key={p._id} 
              className={`tablet-patient-card ${selectedPatientId === p._id ? 'active' : ''} ${p.status.toLowerCase()}`}
              onClick={() => setSelectedPatientId(p._id)}
            >
              <div className="card-indicator"></div>
              <div className="card-main">
                <span className="room-pill">Room {p.roomNumber}</span>
                <h3>{p.name}</h3>
                <p>{p.age}y/o • {p.status}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <main className="tablet-main">
        {selectedPatient ? (
          <div className="observation-deck">
            <header className="deck-header">
              <div className="patient-profile">
                <h1>{selectedPatient.name}</h1>
                <p className="medical-history">
                  <strong>Clinical History:</strong> {selectedPatient.medicalHistory}
                </p>
              </div>
              <button className="sos-btn" onClick={() => alert("SOS Triggered. Head Nurse notified.")}>
                TRIGGER SOS
              </button>
            </header>

            <div className="vitals-grid">
              <div className="vital-input-card">
                <label>Heart Rate (BPM)</label>
                <input 
                  type="number" 
                  value={vitalInput.hr} 
                  onChange={(e) => setVitalInput({...vitalInput, hr: e.target.value})} 
                  placeholder="--"
                />
              </div>
              <div className="vital-input-card">
                <label>Blood Pressure</label>
                <input 
                  type="text" 
                  value={vitalInput.bp} 
                  onChange={(e) => setVitalInput({...vitalInput, bp: e.target.value})} 
                  placeholder="0/0"
                />
              </div>
              <div className="vital-input-card">
                <label>Oxygen (SpO2 %)</label>
                <input 
                  type="number" 
                  value={vitalInput.spo2} 
                  onChange={(e) => setVitalInput({...vitalInput, spo2: e.target.value})} 
                  placeholder="--"
                />
              </div>
            </div>

            <button 
              className={`save-vitals-btn ${isSubmitting ? 'loading' : ''}`} 
              onClick={handleSaveVitals}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Synchronizing..." : "Submit Observations"}
            </button>
          </div>
        ) : (
          <div className="empty-deck">
            <div className="empty-state-content">
              <span className="empty-icon">📋</span>
              <p>Select a patient card from the ward list to begin clinical observations.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}