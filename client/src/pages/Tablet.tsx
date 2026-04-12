import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import "../styles/tablet.css";

export default function Tablet() {
  // --- 1. CONVEX HOOKS ---
  const patients = useQuery(api.patients.getActivePatients);
  const [selectedPatientId, setSelectedPatientId] = useState<Id<"patients"> | null>(null);
  
  // Queries
  const meds = useQuery(api.meds.getPatientMeds, 
    selectedPatientId ? { patientId: selectedPatientId } : "skip"
  );
  const latestEmergency = useQuery(api.emergencies.getLatestEmergencyForPatient, 
    selectedPatientId ? { patientId: selectedPatientId } : "skip"
  );
  const timeline = useQuery(api.history.getClinicalTimeline,
    selectedPatientId ? { patientId: selectedPatientId } : "skip"
  );

  // Mutations
  const addVital = useMutation(api.vitals.addVitals);
  const triggerSOS = useMutation(api.emergencies.triggerSOS);
  const administer = useMutation(api.meds.administerMed);
  const prescribeMed = useMutation(api.meds.addMedication);

  // --- 2. COMPONENT STATE ---
  const [vitalInput, setVitalInput] = useState({ hr: "", bp: "", spo2: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddMed, setShowAddMed] = useState(false);
  const [newMed, setNewMed] = useState({ name: "", dosage: "", frequency: "1x daily" });

  // --- 3. AUTO-SELECT PATIENT ---
  useEffect(() => {
    if (patients && patients.length > 0 && selectedPatientId === null) {
      setSelectedPatientId(patients[0]._id);
    }
  }, [patients, selectedPatientId]);

  const selectedPatient = patients?.find(p => p._id === selectedPatientId);

  // --- 4. LOGIC: MEDICATION SORTING ---
  const sortedMeds = meds ? [...meds].sort((a, b) => {
    if (a.status === "scheduled" && b.status === "administered") return -1;
    if (a.status === "administered" && b.status === "scheduled") return 1;
    return 0;
  }) : [];

  // --- 5. HANDLERS ---
  const handleSaveVitals = async () => {
    if (!selectedPatientId) return;
    setIsSubmitting(true);
    try {
      const ts = Date.now();
      const nId = "TABLET_PRO_01";
      
      if (vitalInput.hr) await addVital({ patientId: selectedPatientId, nurseId: nId, type: "HR", value: vitalInput.hr, unit: "bpm", timestamp: ts });
      if (vitalInput.bp) await addVital({ patientId: selectedPatientId, nurseId: nId, type: "BP", value: vitalInput.bp, unit: "mmHg", timestamp: ts });
      if (vitalInput.spo2) await addVital({ patientId: selectedPatientId, nurseId: nId, type: "SpO2", value: vitalInput.spo2, unit: "%", timestamp: ts });
      
      setVitalInput({ hr: "", bp: "", spo2: "" });
      alert("Observations Recorded ✅");
    } catch (err) {
      console.error("Vitals Sync Error:", err);
      alert("Sync failed. Check connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrescribe = async () => {
    if (!newMed.name || !newMed.dosage || !selectedPatientId) return;
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
                <p className="medical-history"><strong>Clinical History:</strong> {selectedPatient.medicalHistory}</p>
              </div>
              <button className="sos-btn" onClick={handleSOS}>TRIGGER SOS</button>
            </header>

            {/* 💬 HEAD NURSE BANNER */}
            {latestEmergency?.status === "resolved" && latestEmergency.resolutionNotes && (
              <div className="emergency-response-banner">
                <div className="response-icon">💬</div>
                <div className="response-text">
                  <strong>Head Nurse Response:</strong>
                  <p>{latestEmergency.resolutionNotes}</p>
                </div>
              </div>
            )}

            {/* 📊 VITALS GRID (Moved to Top) */}
            <section className="vitals-input-section">
              <div className="section-header">
                <h3>Current Observations</h3>
                <span className="live-sync-indicator">ACTIVE MONITORING</span>
              </div>
              <div className="vitals-grid">
                <div className="vital-input-card"><label>HR (BPM)</label><input type="number" value={vitalInput.hr} onChange={e => setVitalInput({...vitalInput, hr: e.target.value})} placeholder="--" /></div>
                <div className="vital-input-card"><label>BP (mmHg)</label><input type="text" value={vitalInput.bp} onChange={e => setVitalInput({...vitalInput, bp: e.target.value})} placeholder="0/0" /></div>
                <div className="vital-input-card"><label>SpO2 %</label><input type="number" value={vitalInput.spo2} onChange={e => setVitalInput({...vitalInput, spo2: e.target.value})} placeholder="--" /></div>
              </div>
              
              <button 
                className={`save-vitals-btn ${isSubmitting ? 'loading' : ''}`} 
                onClick={handleSaveVitals}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Synchronizing..." : "Submit Observations"}
              </button>
            </section>

            {/* 💊 MEDICATION RECORD (MAR) */}
            <section className="meds-section">
              <div className="section-header">
                <h3>Medication Record (MAR)</h3>
                <button className="add-med-toggle-btn" onClick={() => setShowAddMed(!showAddMed)}>
                  {showAddMed ? "✕ Cancel" : "+ Prescribe"}
                </button>
              </div>

              {showAddMed && (
                <div className="prescription-form-box">
                  <input placeholder="Med Name" value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})} />
                  <input placeholder="Dose (mg)" value={newMed.dosage} onChange={e => setNewMed({...newMed, dosage: e.target.value})} />
                  <select value={newMed.frequency} onChange={e => setNewMed({...newMed, frequency: e.target.value})}>
                    <option value="1x daily">1x daily</option>
                    <option value="2x daily">2x daily</option>
                    <option value="3x daily">3x daily</option>
                    <option value="4x daily">4x daily</option>
                  </select>
                  <button className="prescribe-submit-btn" onClick={handlePrescribe}>Add to MAR</button>
                </div>
              )}

              <div className="meds-list-vertical">
                {sortedMeds.map((med) => {
                  const dosesGiven = med.dosesGiven || 0;
                  const total = med.totalDoses || 1;
                  const isDone = dosesGiven >= total;
                  return (
                    <div key={med._id} className={`med-list-item ${isDone ? 'complete' : ''}`}>
                      <div className="med-info-block">
                        <h4>{med.name}</h4>
                        <p>{med.dosage} • {med.frequency}</p>
                      </div>
                      <div className="dose-progress-block">
                        <span className="dose-status">Dose {dosesGiven} / {total}</span>
                        <div className="progress-track">
                          <div className="progress-bar" style={{ width: `${(dosesGiven/total)*100}%` }}></div>
                        </div>
                      </div>
                      <div className="med-action-block">
                        {isDone ? <span className="given-tag">DONE</span> : 
                        <button className="log-dose-btn" onClick={() => administer({ medId: med._id, nurseId: "NURSE_01" })}>Log Dose</button>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 🕒 UNIFIED CLINICAL TIMELINE */}
            <section className="vitals-history-section">
              <div className="section-header">
                <h3>Clinical Timeline</h3>
                <span className="live-sync-indicator">RECORD HISTORY</span>
              </div>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Event</th>
                    <th>Details</th>
                    <th>Staff</th>
                  </tr>
                </thead>
                <tbody>
                  {timeline?.map((event) => (
                    <tr key={event.id}>
                      <td className="time-cell">{new Date(event.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>
                        <span className={`type-tag ${event.type.toLowerCase()} ${event.label.toLowerCase()}`}>
                          {event.label}
                        </span>
                      </td>
                      <td className="value-cell"><strong>{event.value}</strong></td>
                      <td className="nurse-id"><code>{event.staff}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        ) : (
          <div className="empty-deck">Select a patient to begin clinical session.</div>
        )}
      </main>
    </div>
  );
}