import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import ConfirmModal from "../components/ui/ConfirmModal";
import "../styles/tablet.css";

export default function Tablet() {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  // --- 1. DATA FETCHING ---
  const patients = useQuery(api.patients.getMyAssignedPatients, { nurseId: user?._id });
  const [selectedPatientId, setSelectedPatientId] = useState<Id<"patients"> | null>(null);
  
  const meds = useQuery(api.meds.getPatientMeds, selectedPatientId ? { patientId: selectedPatientId } : "skip");
  const latestEmergency = useQuery(api.emergencies.getLatestEmergencyForPatient, selectedPatientId ? { patientId: selectedPatientId } : "skip");
  const timeline = useQuery(api.history.getClinicalTimeline, selectedPatientId ? { patientId: selectedPatientId } : "skip");

  const addVital = useMutation(api.vitals.addVitals);
  const triggerSOS = useMutation(api.emergencies.triggerSOS);
  const administer = useMutation(api.meds.administerMed);
  const prescribeMed = useMutation(api.meds.addMedication);
  const updateHandover = useMutation(api.patients.updateHandoverNotes);

  // --- 2. COMPONENT STATE ---
  const [vitalInput, setVitalInput] = useState({ hr: "", bp: "", spo2: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddMed, setShowAddMed] = useState(false);
  const [newMed, setNewMed] = useState({ name: "", dosage: "", frequency: "1x daily", totalDoses: 1 });
  const [handoverNote, setHandoverNote] = useState("");
  
  // Modal States
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [pendingMed, setPendingMed] = useState<Doc<"medications"> | null>(null);

  const selectedPatient = patients?.find(p => p._id === selectedPatientId);

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
      alert("Handover updated for next shift! ");
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
    
    await prescribeMed({ 
      patientId: selectedPatientId, 
      name: newMed.name, 
      dosage: newMed.dosage, 
      frequency: newMed.frequency, 
      totalDoses: newMed.totalDoses 
    });
    
    setNewMed({ name: "", dosage: "", frequency: "1x daily", totalDoses: 1 });
    setShowAddMed(false);
  };

  // Logic to execute the SOS after confirmation
  const confirmSOS = async () => {
    if (!selectedPatient || !user) return;
    await triggerSOS({ patientId: selectedPatient._id, nurseId: user._id });
  };

  // Logic to open Med Modal
  const handleMedLogClick = (med: Doc<"medications">) => {
    setPendingMed(med);
    setIsMedModalOpen(true);
  };

  // Logic to execute Med Log after confirmation
  const confirmMedAdmin = async () => {
    if (!pendingMed || !user) return;
    await administer({ medId: pendingMed._id, nurseId: user._id });
  };

  const sortedMeds = meds ? [...meds].sort((a, b) => {
    if (a.status === "scheduled" && b.status === "administered") return -1;
    return 0;
  }) : [];

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
              <button className="sos-btn" onClick={() => setIsSosModalOpen(true)}>🚨 TRIGGER SOS</button>
            </header>

            {/* HEAD NURSE RESPONSE BANNER */}
            {latestEmergency?.status === "resolved" && latestEmergency.resolutionNotes && (
              <div className="emergency-response-banner">
                <div className="response-icon">💬</div>
                <div className="response-text">
                  <strong>Head Nurse Response:</strong>
                  <p>{latestEmergency.resolutionNotes}</p>
                </div>
              </div>
            )}

            {/* HANDOVER LOG SECTION */}
            <section className="handover-box">
              <div className="section-header">
                <h3>Shift Handover Notes</h3>
                <span className="info-tag">VISIBLE TO NEXT SHIFT</span>
              </div>
              <textarea 
                value={handoverNote}
                onChange={(e) => setHandoverNote(e.target.value)}
                placeholder="Describe current patient state for the incoming nurse..."
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

            {/* MEDICATION RECORD  SECTION */}
            <section className="meds-section">
              <div className="section-header">
                <h3>Medication (MAR)</h3>
                <button className="add-med-toggle-btn" onClick={() => setShowAddMed(!showAddMed)}>
                  {showAddMed ? "✕" : "+ New"}
                </button>
              </div>

              {showAddMed && (
                <div className="prescription-form-box">
                  <input 
                    placeholder="Name" 
                    value={newMed.name} 
                    onChange={e => setNewMed({...newMed, name: e.target.value})} 
                  />
                  <input 
                    placeholder="Dose (e.g. 500mg)" 
                    value={newMed.dosage} 
                    onChange={e => setNewMed({...newMed, dosage: e.target.value})} 
                  />
                  <input 
                    type="number"
                    min="1"
                    placeholder="Total Doses" 
                    value={newMed.totalDoses} 
                    onChange={e => setNewMed({...newMed, totalDoses: parseInt(e.target.value) || 1})} 
                  />
                  <button onClick={handlePrescribe}>Add</button>
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
                        {!isDone && <small className="dose-progress">{dosesGiven} / {total} doses administered</small>}
                      </div>
                      <div className="med-action-block">
                        {isDone ? (
                          <span className="given-tag">GIVEN</span>
                        ) : (
                          <button 
                            className="log-dose-btn" 
                            onClick={() => handleMedLogClick(med)}
                          >
                            Log Dose
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* CLINICAL TIMELINE */}
            <section className="vitals-history-section">
              <h3>Clinical Timeline</h3>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Event</th>
                    <th>Value</th>
                    <th>Staff</th>
                  </tr>
                </thead>
                <tbody>
                  {timeline?.map((event) => (
                    <tr key={event.id}>
                      <td>
                        {new Date(event.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td>
                        <span className={`type-tag ${(event.type || event.label || "").toLowerCase()}`}>
                          {event.type || event.label}
                        </span>
                      </td>
                      <td><strong>{event.value}</strong></td>
                      <td>
                        <code>{event.staff}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* --- MODAL INSTANCES --- */}
            <ConfirmModal 
              isOpen={isSosModalOpen}
              title="Confirm Emergency SOS"
              message={`This will trigger a ward-wide emergency alert for ${selectedPatient.name} in Room ${selectedPatient.roomNumber}. Proceed?`}
              confirmText="TRIGGER SOS"
              type="danger"
              onConfirm={confirmSOS}
              onCancel={() => setIsSosModalOpen(false)}
            />

            <ConfirmModal 
              isOpen={isMedModalOpen}
              title="Confirm Medication"
              message={`Are you sure you want to log a dose of ${pendingMed?.name} (${pendingMed?.dosage}) for ${selectedPatient.name}?`}
              confirmText="Log Dose"
              onConfirm={confirmMedAdmin}
              onCancel={() => setIsMedModalOpen(false)}
            />

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