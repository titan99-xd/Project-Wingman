import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import ConfirmModal from "../components/ui/ConfirmModal";
import ShiftAssignModal from "../components/ui/ShiftAssignModal"; 
import "./../styles/manager.css";

export default function Manager() {
  const [activeTab, setActiveTab] = useState<"admissions" | "roster">("admissions");

  // --- BACKEND HOOKS ---
  const admitPatient = useMutation(api.patients.admitPatient);
  const dischargePatient = useMutation(api.patients.dischargePatient);
  const activePatients = useQuery(api.patients.getActivePatients);
  const nurses = useQuery(api.users.listNurses); 
  const roster = useQuery(api.staffing.getFifteenDayRoster);
  const assignShift = useMutation(api.staffing.assignShift);
  const removeShift = useMutation(api.staffing.removeShift);
  const emergencyAbsences = useQuery(api.staffing.getEmergencyAbsences);

  // --- MODAL STATES ---
  const [modalState, setModalState] = useState<{
    discharge: { isOpen: boolean; patientId: Id<"patients"> | null; name: string };
    removeShift: { isOpen: boolean; shiftId: Id<"shifts"> | null };
    assignShift: { isOpen: boolean; nurseId: Id<"users"> | null; date: string; nurseName: string };
    success: { isOpen: boolean; message: string };
  }>({
    discharge: { isOpen: false, patientId: null, name: "" },
    removeShift: { isOpen: false, shiftId: null },
    assignShift: { isOpen: false, nurseId: null, date: "", nurseName: "" },
    success: { isOpen: false, message: "" },
  });

  const [formData, setFormData] = useState({
    name: "", age: "", sex: "Male" as "Male" | "Female" | "Other", roomNumber: "", medicalHistory: "", status: "Stable" as "Stable" | "Unstable" | "Critical", 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dates = Array.from({ length: 15 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  const getAssignment = (nurseId: Id<"users">, date: string) => {
    return roster?.find(s => s.nurseId === nurseId && s.date === date);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await admitPatient({
        name: formData.name, age: Number(formData.age), sex: formData.sex,
        roomNumber: formData.roomNumber, medicalHistory: formData.medicalHistory,
        status: formData.status, 
      });
      setFormData({ name: "", age: "", sex: "Male", roomNumber: "", medicalHistory: "", status: "Stable" });
      setModalState(prev => ({ ...prev, success: { isOpen: true, message: "Patient successfully admitted to the ward." } }));
    } finally { setIsSubmitting(false); }
  };

  const executeDischarge = async () => {
    if (modalState.discharge.patientId) {
      await dischargePatient({ patientId: modalState.discharge.patientId });
      setModalState(prev => ({...prev, discharge: { ...prev.discharge, isOpen: false }}));
    }
  };

  const executeRemoveShift = async () => {
    if (modalState.removeShift.shiftId) {
      await removeShift({ shiftId: modalState.removeShift.shiftId });
      setModalState(prev => ({...prev, removeShift: { isOpen: false, shiftId: null }}));
    }
  };

  const executeAssignShift = async (floor: number, type: string) => {
    if (modalState.assignShift.nurseId) {
      await assignShift({ 
        nurseId: modalState.assignShift.nurseId, 
        date: modalState.assignShift.date, 
        floorNumber: floor, 
        shiftType: type 
      });
    }
  };

  return (
    <div className="manager-page">
      <header className="page-header">
        <h1>Ward Command</h1>
        <nav className="tab-nav">
          <button className={activeTab === "admissions" ? "active" : ""} onClick={() => setActiveTab("admissions")}>Admissions</button>
          <button className={activeTab === "roster" ? "active" : ""} onClick={() => setActiveTab("roster")}>15-Day Roster</button>
        </nav>
      </header>

      {/* EMERGENCY BANNER - Fixed and Restored */}
      {emergencyAbsences && emergencyAbsences.length > 0 && (
        <div className="emergency-staffing-banner">
          <div className="banner-content">
            <div className="emergency-text-container">
              <strong>🚨 Staffing Alert 🚨</strong>
              {/* <ul className="absence-list">
                {emergencyAbsences.map((abs) => (
                  <li key={abs._id}>
                    <span className="absent-nurse-name">{abs.nurseName}</span>
                    <span className="absent-details">Floor {abs.floorNumber} • {abs.shiftType}</span>
                  </li>
                ))}
              </ul> */}
            </div>
            {/* <button className="fix-coverage-btn" onClick={() => setActiveTab("roster")}>
              Reassign Now
            </button> */}
          </div>
        </div>
      )}

      {activeTab === "admissions" ? (
        <div className="manager-grid">
          <section className="card admission-card">
            <div className="card-header"><span className="icon">📋</span><h2>Patient Intake</h2></div>
            <form onSubmit={handleSubmit} className="intake-form">
              <div className="form-group">
                <label>Full Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Patient's legal name" />
              </div>
              <div className="form-row">
                <div className="form-group"><label>Age</label><input required type="number" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} /></div>
                <div className="form-group"><label>Sex</label>
                  <select value={formData.sex} onChange={(e) => setFormData({...formData, sex: e.target.value as "Male" | "Female" | "Other"})}>
                    <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                  </select>
                </div>
                 <div className="form-group"><label>Condition</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as "Stable" | "Unstable" | "Critical"})}>
                    <option value="Stable">Stable</option><option value="Unstable">Unstable</option><option value="Critical">Critical</option>
                  </select>
                </div>
                <div className="form-group"><label>Room #</label><input required type="text" value={formData.roomNumber} onChange={(e) => setFormData({...formData, roomNumber: e.target.value})} /></div>
              </div>
              <div className="form-group full-width">
                <label>Medical History</label>
                <textarea className="history-textarea" value={formData.medicalHistory} onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})}></textarea>
              </div>
              <button type="submit" className="admit-btn" disabled={isSubmitting}>{isSubmitting ? "Syncing..." : "Admit to Sentryx"}</button>
            </form>
          </section>

          <section className="card directory-card">
            <div className="card-header"><span className="icon">🏥</span><h2>Live Directory</h2></div>
            <div className="patient-list">
              {!activePatients ? <p>Loading...</p> : activePatients.map((patient) => (
                <div key={patient._id} className="patient-item">
                  <div className="patient-info"><strong>{patient.name}</strong><br/>Room {patient.roomNumber}</div>
                  <div className="patient-actions">
                    <div className={`status-badge ${patient.status.toLowerCase()}`}>{patient.status}</div>
                    <button className="discharge-btn" onClick={() => setModalState(prev => ({...prev, discharge: { isOpen: true, patientId: patient._id, name: patient.name }}))}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <section className="card roster-card">
          <div className="roster-scroll-container">
            <table className="roster-table">
              <thead>
                <tr>
                  <th className="sticky-col">Staff</th>
                  {dates.map(d => <th key={d}>{new Date(d).getDate()}</th>)}
                </tr>
              </thead>
              <tbody>
                {nurses?.map(nurse => (
                  <tr key={nurse._id}>
                    <td className="sticky-col nurse-name-cell">{nurse.name}</td>
                    {dates.map(date => {
                      const shift = getAssignment(nurse._id, date);
                      return (
                        <td 
                          key={date} 
                          className={`shift-cell 
                            ${shift ? 'assigned' : 'empty'} 
                            ${shift?.shiftType?.toLowerCase()} 
                            ${shift?.leaveRequested ? 'sick-leave-highlight' : ''}` // 🚨 HIGHLIGHT ADDED HERE
                          } 
                          onClick={() => !shift && setModalState(prev => ({...prev, assignShift: { isOpen: true, nurseId: nurse._id, date, nurseName: nurse.name }}))}
                        >
                          {shift ? (
                            <div className="shift-display">
                              <button className="remove-shift-btn" onClick={(e) => {
                                e.stopPropagation();
                                setModalState(prev => ({...prev, removeShift: { isOpen: true, shiftId: shift._id }}));
                              }}>✕</button>
                              <span className="shift-letter">{shift?.shiftType ? shift.shiftType[0] : "?"}</span>
                              <span className="floor-badge">F{shift.floorNumber}</span>
                            </div>
                          ) : '+'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* --- MODAL INSTANCES --- */}
      <ConfirmModal 
        isOpen={modalState.discharge.isOpen}
        title="Confirm Discharge"
        message={`Are you sure you want to discharge ${modalState.discharge.name}? This will archive their clinical records.`}
        confirmText="Discharge Patient"
        type="danger"
        onConfirm={executeDischarge}
        onCancel={() => setModalState(prev => ({...prev, discharge: {...prev.discharge, isOpen: false}}))}
      />

      <ConfirmModal 
        isOpen={modalState.removeShift.isOpen}
        title="Clear Assignment"
        message="Remove this nurse from the selected time slot?"
        confirmText="Remove Shift"
        type="danger"
        onConfirm={executeRemoveShift}
        onCancel={() => setModalState(prev => ({...prev, removeShift: { isOpen: false, shiftId: null }}))}
      />

      <ShiftAssignModal 
        isOpen={modalState.assignShift.isOpen}
        nurseName={modalState.assignShift.nurseName}
        date={modalState.assignShift.date}
        onConfirm={executeAssignShift}
        onCancel={() => setModalState(prev => ({...prev, assignShift: {...prev.assignShift, isOpen: false}}))}
      />

      <ConfirmModal 
        isOpen={modalState.success.isOpen}
        title="Success"
        message={modalState.success.message}
        confirmText="Done"
        onConfirm={() => setModalState(prev => ({...prev, success: {...prev.success, isOpen: false}}))}
        onCancel={() => setModalState(prev => ({...prev, success: {...prev.success, isOpen: false}}))}
      />
    </div>
  );
}