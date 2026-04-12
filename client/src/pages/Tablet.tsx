import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import "../styles/tablet.css";

export default function Tablet() {
  // --- 1. CONVEX HOOKS ---
  const patients = useQuery(api.patients.getActivePatients);
  
  // State
  const [selectedPatientId, setSelectedPatientId] = useState<Id<"patients"> | null>(null);
  const [vitalInput, setVitalInput] = useState({ hr: "", bp: "", spo2: "" });
  const [showAddMed, setShowAddMed] = useState(false);
  const [newMed, setNewMed] = useState({ name: "", dosage: "", frequency: "1x daily" });

  // Queries
  const vitalsHistory = useQuery(api.vitals.getPatientVitals, 
    selectedPatientId ? { patientId: selectedPatientId } : "skip"
  );
  const meds = useQuery(api.meds.getPatientMeds, 
    selectedPatientId ? { patientId: selectedPatientId } : "skip"
  );
  const latestEmergency = useQuery(api.emergencies.getLatestEmergencyForPatient, 
    selectedPatientId ? { patientId: selectedPatientId } : "skip"
  );

  // Mutations
  const addVital = useMutation(api.vitals.addVitals);
  const triggerSOS = useMutation(api.emergencies.triggerSOS);
  const administer = useMutation(api.meds.administerMed);
  const prescribeMed = useMutation(api.meds.addMedication);

  // --- 2. LOGIC: AUTO-SELECT PATIENT ---
  // We use a specific check to ensure we only set this once when patients load
  useEffect(() => {
    if (patients && patients.length > 0 && selectedPatientId === null) {
      setSelectedPatientId(patients[0]._id);
    }
  }, [patients, selectedPatientId]);

  const selectedPatient = patients?.find(p => p._id === selectedPatientId);

  // --- 3. HANDLERS ---
  const handlePrescribe = async () => {
    if (!newMed.name || !newMed.dosage || !selectedPatientId) return;

    // Convert frequency string (e.g., "3x daily") to number 3
    const doseCount = parseInt(newMed.frequency.split('x')[0]) || 1;

    try {
      await prescribeMed({ 
        patientId: selectedPatientId, 
        name: newMed.name, 
        dosage: newMed.dosage, 
        frequency: newMed.frequency,
        totalDoses: doseCount 
      });
      
      setNewMed({ name: "", dosage: "", frequency: "1x daily" });
      setShowAddMed(false);
    } catch (err) {
      console.error("Prescription Error:", err);
    }
  };

  const handleSOS = async () => {
    if (!selectedPatientId) return;
    if (window.confirm(`Trigger Emergency SOS?`)) {
      await triggerSOS({ patientId: selectedPatientId, nurseId: "TABLET_PRO_01" });
    }
  };

  return (
    <div className="tablet-container">
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

      <main className="tablet-main">
        {selectedPatient ? (
          <div className="observation-deck">
            <header className="deck-header">
              <div className="patient-profile">
                <h1>{selectedPatient.name}</h1>
                <p className="medical-history"><strong>History:</strong> {selectedPatient.medicalHistory}</p>
              </div>
              <button className="sos-btn" onClick={handleSOS}>TRIGGER SOS</button>
            </header>

            {/* Emergency Response Banner */}
            {latestEmergency?.status === "resolved" && (
              <div className="emergency-response-banner">
                <div className="response-icon">💬</div>
                <div className="response-text">
                  <strong>Head Nurse Response:</strong>
                  <p>{latestEmergency.resolutionNotes || "On my way."}</p>
                </div>
              </div>
            )}

            {/* 💊 MEDICATION RECORD (MAR) */}
            <section className="meds-section">
              <div className="section-header">
                <h3>Medication Record (MAR)</h3>
                <button className="add-med-toggle" onClick={() => setShowAddMed(!showAddMed)}>
                  {showAddMed ? "✕ Cancel" : "+ Prescribe"}
                </button>
              </div>

              {showAddMed && (
                <div className="add-med-form">
                  <input placeholder="Med Name" value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})} />
                  <input placeholder="Dosage" value={newMed.dosage} onChange={e => setNewMed({...newMed, dosage: e.target.value})} />
                  <select className="freq-select" value={newMed.frequency} onChange={e => setNewMed({...newMed, frequency: e.target.value})}>
                    <option value="1x daily">1x daily</option>
                    <option value="2x daily">2x daily</option>
                    <option value="3x daily">3x daily</option>
                    <option value="4x daily">4x daily</option>
                    <option value="5x daily">5x daily</option>
                    <option value="6x daily">6x daily</option>
                    <option value="7x daily">7x daily</option>
                    <option value="8x daily">8x daily</option>

                  </select>
                  <button className="save-med-btn" onClick={handlePrescribe}>Save</button>
                </div>
              )}

              <div className="meds-list-vertical">
                {meds?.map((med) => {
                  const dosesGiven = med.dosesGiven || 0;
                  const total = med.totalDoses || 1;
                  const isDone = dosesGiven >= total;
                  return (
                    <div key={med._id} className={`med-row ${isDone ? 'complete' : ''}`}>
                      <div className="med-identity">
                        <h4>{med.name}</h4>
                        <p>{med.dosage} • {med.frequency}</p>
                      </div>
                      <div className="dose-tracker">
                        <span className="dose-label">Dose {dosesGiven} / {total}</span>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${(dosesGiven/total)*100}%` }}></div>
                        </div>
                      </div>
                      <div className="med-action">
                        {isDone ? <span className="check-tag">✅ COMPLETE</span> : 
                        <button className="administer-btn-outline" onClick={() => administer({ medId: med._id, nurseId: "NURSE_01" })}>Log Dose</button>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Vitals Grid */}
            <div className="vitals-grid">
              <div className="vital-input-card"><label>HR</label><input type="number" value={vitalInput.hr} onChange={e => setVitalInput({...vitalInput, hr: e.target.value})} placeholder="--" /></div>
              <div className="vital-input-card"><label>BP</label><input type="text" value={vitalInput.bp} onChange={e => setVitalInput({...vitalInput, bp: e.target.value})} placeholder="0/0" /></div>
              <div className="vital-input-card"><label>SpO2</label><input type="number" value={vitalInput.spo2} onChange={e => setVitalInput({...vitalInput, spo2: e.target.value})} placeholder="--" /></div>
            </div>
            
            <button className="save-vitals-btn">Submit Observations</button>
          </div>
        ) : (
          <div className="empty-deck">Select a patient to begin.</div>
        )}
      </main>
    </div>
  );
}