import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import "../styles/tablet.css";

export default function Tablet() {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  // --- 1. UPDATED CONVEX HOOKS ---
  const patients = useQuery(api.patients.getMyAssignedPatients, { nurseId: user?._id });
  const [selectedPatientId, setSelectedPatientId] = useState<Id<"patients"> | null>(null);
  
  const meds = useQuery(api.meds.getPatientMeds, selectedPatientId ? { patientId: selectedPatientId } : "skip");
  const latestEmergency = useQuery(api.emergencies.getLatestEmergencyForPatient, selectedPatientId ? { patientId: selectedPatientId } : "skip");
  const timeline = useQuery(api.history.getClinicalTimeline, selectedPatientId ? { patientId: selectedPatientId } : "skip");

  const addVital = useMutation(api.vitals.addVitals);
  const triggerSOS = useMutation(api.emergencies.triggerSOS);
  const administer = useMutation(api.meds.administerMed);
  const prescribeMed = useMutation(api.meds.addMedication);
  
  // 🟢 NEW: Handover mutation
  const updateHandover = useMutation(api.patients.updateHandoverNotes);

  // --- 2. COMPONENT STATE ---
  const [vitalInput, setVitalInput] = useState({ hr: "", bp: "", spo2: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddMed, setShowAddMed] = useState(false);
  const [newMed, setNewMed] = useState({ name: "", dosage: "", frequency: "1x daily" });
  
  // 🟢 NEW: Local state for handover text
  const [handoverNote, setHandoverNote] = useState("");

  const selectedPatient = patients?.find(p => p._id === selectedPatientId);

  // Sync handover note when patient changes
  useEffect(() => {
    if (selectedPatient) {
      setHandoverNote(selectedPatient.handoverNotes || "");
    }
  }, [selectedPatientId, selectedPatient]);

  useEffect(() => {
    if (patients && patients.length > 0 && selectedPatientId === null) {
      setSelectedPatientId(patients[0]._id);
    }
  }, [patients, selectedPatientId]);

  // --- 3. HANDLERS ---
  const handleSaveHandover = async () => {
    if (!selectedPatientId || !user) return;
    try {
      await updateHandover({
        patientId: selectedPatientId,
        notes: handoverNote,
        nurseId: user._id
      });
      alert("Handover updated for next shift! 📝");
    } catch (err) {
      console.error("Handover update failed", err);
    }
  };

  const handleSaveVitals = async () => {
    if (!selectedPatientId || !user) return;
    setIsSubmitting(true);
    try {
      const ts = Date.now();
      const nId = user._id; 
      if (vitalInput.hr) await addVital({ patientId: selectedPatientId, nurseId: nId, type: "HR", value: vitalInput.hr, unit: "bpm", timestamp: ts });
      if (vitalInput.bp) await addVital({ patientId: selectedPatientId, nurseId: nId, type: "BP", value: vitalInput.bp, unit: "mmHg", timestamp: ts });
      if (vitalInput.spo2) await addVital({ patientId: selectedPatientId, nurseId: nId, type: "SpO2", value: vitalInput.spo2, unit: "%", timestamp: ts });
      setVitalInput({ hr: "", bp: "", spo2: "" });
      alert("Observations Recorded ");
    } finally { setIsSubmitting(false); }
  };

  const handlePrescribe = async () => {
    if (!newMed.name || !newMed.dosage || !selectedPatientId) return;
    const doseCount = parseInt(newMed.frequency.split('x')[0]) || 1;
    await prescribeMed({ patientId: selectedPatientId, name: newMed.name, dosage: newMed.dosage, frequency: newMed.frequency, totalDoses: doseCount });
    setNewMed({ name: "", dosage: "", frequency: "1x daily" });
    setShowAddMed(false);
  };

  const handleSOS = async () => {
    if (!selectedPatient || !user) return;
    if (window.confirm(`Trigger SOS for Room ${selectedPatient.roomNumber}?`)) {
      await triggerSOS({ patientId: selectedPatient._id, nurseId: user._id });
      alert("SOS Signal Broadcasted! 🚨");
    }
  };

  const sortedMeds = meds ? [...meds].sort((a, b) => a.status === "scheduled" ? -1 : 1) : [];

  return (
    <div className="tablet-container">
      <aside className="tablet-sidebar">
        <div className="sidebar-header">
          <h2>My Ward</h2>
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
              <button className="sos-btn" onClick={handleSOS}>🚨 TRIGGER SOS</button>
            </header>

            {/* 🟢 NEW: HANDOVER LOG SECTION */}
            <section className="handover-box">
              <div className="section-header">
                <h3>Shift Handover Notes</h3>
                <span className="info-tag">VISIBLE TO NEXT SHIFT</span>
              </div>
              <textarea 
                value={handoverNote}
                onChange={(e) => setHandoverNote(e.target.value)}
                placeholder="Describe current patient state, recent interventions, or specific risks for the incoming nurse..."
              />
              <button className="save-handover-btn" onClick={handleSaveHandover}>
                Update Handover
              </button>
            </section>

            {/* VITALS INPUT */}
            <section className="vitals-input-section">
              <div className="section-header"><h3>Observations</h3></div>
              <div className="vitals-grid">
                <div className="vital-input-card"><label>HR</label><input type="number" value={vitalInput.hr} onChange={e => setVitalInput({...vitalInput, hr: e.target.value})} placeholder="bpm" /></div>
                <div className="vital-input-card"><label>BP</label><input type="text" value={vitalInput.bp} onChange={e => setVitalInput({...vitalInput, bp: e.target.value})} placeholder="0/0" /></div>
                <div className="vital-input-card"><label>SpO2</label><input type="number" value={vitalInput.spo2} onChange={e => setVitalInput({...vitalInput, spo2: e.target.value})} placeholder="%" /></div>
              </div>
              <button className="save-vitals-btn" onClick={handleSaveVitals} disabled={isSubmitting}>
                {isSubmitting ? "Syncing..." : "Submit Observations"}
              </button>
            </section>

            {/* MEDICATION RECORD (MAR) */}
            <section className="meds-section">
              <div className="section-header">
                <h3>Medication (MAR)</h3>
                <button className="add-med-toggle-btn" onClick={() => setShowAddMed(!showAddMed)}>{showAddMed ? "✕" : "+ New"}</button>
              </div>
              {showAddMed && (
                <div className="prescription-form-box">
                  <input placeholder="Name" value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})} />
                  <input placeholder="Dose" value={newMed.dosage} onChange={e => setNewMed({...newMed, dosage: e.target.value})} />
                  <button onClick={handlePrescribe}>Add to MAR</button>
                </div>
              )}
              <div className="meds-list-vertical">
                {sortedMeds.map((med) => (
                  <div key={med._id} className={`med-list-item ${med.dosesGiven >= med.totalDoses ? 'complete' : ''}`}>
                    <div className="med-info-block"><h4>{med.name}</h4><p>{med.dosage} • {med.frequency}</p></div>
                    <div className="med-action-block">
                      {med.dosesGiven >= med.totalDoses ? <span className="given-tag">GIVEN</span> : 
                      <button className="log-dose-btn" onClick={() => administer({ medId: med._id, nurseId: user._id })}>Log Dose</button>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="empty-deck">
            <h2>Select a patient to begin clinical session</h2>
            <p>If the list is empty, ensure you have checked in at the Ward Gatekeeper.</p>
          </div>
        )}
      </main>
    </div>
  );
}