import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import "../styles/tablet.css";

export default function Tablet() {
  // --- 1. CONVEX HOOKS ---
  const patients = useQuery(api.patients.getActivePatients);
  const addVitalMutation = useMutation(api.vitals.addVitals);
  
  // New Hook: Fetches the last 10 readings for the selected patient
  const [selectedPatientId, setSelectedPatientId] = useState<Id<"patients"> | null>(null);
  const vitalsHistory = useQuery(api.vitals.getPatientVitals, 
    selectedPatientId ? { patientId: selectedPatientId } : "skip"
  );

  // --- 2. COMPONENT STATE ---
  const [vitalInput, setVitalInput] = useState({ hr: "", bp: "", spo2: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 3. AUTO-SELECT FIRST PATIENT ---
  useEffect(() => {
    if (patients && patients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0]._id);
    }
  }, [patients, selectedPatientId]);

  const selectedPatient = patients?.find(p => p._id === selectedPatientId);

  // --- 4. LOGIC: SAVE VITALS TO CONVEX ---
  const handleSaveVitals = async () => {
    if (!selectedPatientId) return;
    if (!vitalInput.hr && !vitalInput.bp && !vitalInput.spo2) {
      alert("Please enter at least one vital sign value.");
      return;
    }

    setIsSubmitting(true);
    const timestamp = Date.now();
    const nurseId = "SYSTEM"; 

    try {
      const mutations = [];

      if (vitalInput.hr) {
        mutations.push(addVitalMutation({ 
          patientId: selectedPatientId, nurseId, type: "HR", 
          value: vitalInput.hr, unit: "bpm", timestamp 
        }));
      }
      if (vitalInput.bp) {
        mutations.push(addVitalMutation({ 
          patientId: selectedPatientId, nurseId, type: "BP", 
          value: vitalInput.bp, unit: "mmHg", timestamp 
        }));
      }
      if (vitalInput.spo2) {
        mutations.push(addVitalMutation({ 
          patientId: selectedPatientId, nurseId, type: "SpO2", 
          value: vitalInput.spo2, unit: "%", timestamp 
        }));
      }

      await Promise.all(mutations);
      setVitalInput({ hr: "", bp: "", spo2: "" });
      // No alert here makes the UX smoother for real-time history updates
    } catch (err) {
      console.error("Submission Error:", err);
      alert("Error: Data mismatch. Check schema.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="tablet-container">
      {/* SIDEBAR: PATIENT LIST */}
      <aside className="tablet-sidebar">
        <div className="sidebar-header">
          <h2>Ward</h2>
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
              <button className="sos-btn" onClick={() => alert("SOS Triggered. Security notified.")}>
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

            {/* --- NEW: VITALS HISTORY TABLE --- */}
            <section className="vitals-history-section">
              <div className="section-header">
                <h3>Recent Observations</h3>
                <span className="live-sync-indicator">LIVE SYNC</span>
              </div>
              <div className="history-table-wrapper">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Type</th>
                      <th>Reading</th>
                      <th>Staff</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vitalsHistory?.map((v) => (
                      <tr key={v._id}>
                        <td className="time-cell">
                          {new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td><span className={`type-tag ${v.type.toLowerCase()}`}>{v.type}</span></td>
                        <td className="value-cell">
                          <strong>{v.value}</strong> <span className="unit">{v.unit}</span>
                        </td>
                        <td className="nurse-id"><code>{v.nurseId}</code></td>
                      </tr>
                    ))}
                    {vitalsHistory?.length === 0 && (
                      <tr><td colSpan={4} className="empty-history">No history found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : (
          <div className="empty-deck">
            <div className="empty-state-content">
              <span className="empty-icon">📋</span>
              <p>Select a patient card to begin clinical observations.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}