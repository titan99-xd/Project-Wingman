import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import "../styles/tablet.css";

export default function Tablet() {
  const patients = useQuery(api.patients.getActivePatients);
  const addVitalMutation = useMutation(api.vitals.addVitals);
  
  const [selectedPatientId, setSelectedPatientId] = useState<any>(null);
  const [vitalInput, setVitalInput] = useState({ hr: "", bp: "", spo2: "" });

  const selectedPatient = patients?.find(p => p._id === selectedPatientId);

  const handleSaveVitals = async () => {
    if (!selectedPatientId) return;
    
    try {
      if (vitalInput.hr) await addVitalMutation({ patientId: selectedPatientId, type: "HR", value: vitalInput.hr, unit: "bpm" });
      if (vitalInput.bp) await addVitalMutation({ patientId: selectedPatientId, type: "BP", value: vitalInput.bp, unit: "mmHg" });
      if (vitalInput.spo2) await addVitalMutation({ patientId: selectedPatientId, type: "SpO2", value: vitalInput.spo2, unit: "%" });
      
      setVitalInput({ hr: "", bp: "", spo2: "" });
      alert("Vitals synchronized to Sentryx Cloud");
    } catch (err) {
      console.error(err);
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
                <p>History: {selectedPatient.medicalHistory}</p>
              </div>
              <button className="sos-btn">TRIGGER SOS</button>
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
                  placeholder="120/80"
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

            <button className="save-vitals-btn" onClick={handleSaveVitals}>
              Submit Observations
            </button>
          </div>
        ) : (
          <div className="empty-deck">
            <p>Select a patient card to begin observations</p>
          </div>
        )}
      </main>
    </div>
  );
}