import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import "./../styles/manager.css";

export default function Manager() {
  // --- 1. TABS & UI STATE ---
  const [activeTab, setActiveTab] = useState<"admissions" | "roster">("admissions");

  // --- 2. BACKEND HOOKS ---
  const admitPatient = useMutation(api.patients.admitPatient);
  const dischargePatient = useMutation(api.patients.dischargePatient);
  const activePatients = useQuery(api.patients.getActivePatients);

  const nurses = useQuery(api.users.listNurses); 
  const roster = useQuery(api.staffing.getFifteenDayRoster);
  const assignShift = useMutation(api.staffing.assignShift);
  const removeShift = useMutation(api.staffing.removeShift); // 🟢 NEW

  // 🚨 Monitor real-time sick leave reports for today
  const emergencyAbsences = useQuery(api.staffing.getEmergencyAbsences);

  // --- 3. FORM STATE ---
  const [formData, setFormData] = useState({
    name: "", age: "", sex: "Male" as const, roomNumber: "", medicalHistory: "", status: "Stable", 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 4. DATE GENERATION (15 Days) ---
  const dates = Array.from({ length: 15 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  const getAssignment = (nurseId: Id<"users">, date: string) => {
    return roster?.find(s => s.nurseId === nurseId && s.date === date);
  };

  // --- 5. HANDLERS ---
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
      alert("Patient successfully admitted.");
    } finally { setIsSubmitting(false); }
  };

  const handleShiftAssign = async (nurseId: Id<"users">, date: string) => {
    const floor = window.prompt("Assign to Floor (1-14):", "1");
    if (!floor) return;
    const typeCode = window.prompt("Shift Type: (M)orning, (E)vening, (N)ight", "M");
    if (!typeCode) return;

    const typeMap: Record<string, string> = { M: "Morning", m: "Morning", E: "Evening", e: "Evening", N: "Night", n: "Night" };
    await assignShift({ nurseId, date, floorNumber: parseInt(floor), shiftType: typeMap[typeCode] || "Morning" });
  };

  const handleRemoveShift = async (shiftId: Id<"shifts">) => {
    if (window.confirm("Are you sure you want to clear this shift assignment?")) {
      try {
        await removeShift({ shiftId });
      } catch (err) {
        console.error("Failed to remove shift:", err);
      }
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

      {/* 🚨 EMERGENCY STAFFING BANNER */}
      {emergencyAbsences && emergencyAbsences.length > 0 && (
        <div className="emergency-staffing-banner">
          <div className="banner-content">
            <span className="emergency-icon">🚨</span>
            <div className="emergency-text">
              <strong>STAFFING ALERT:</strong>
              <ul className="absence-list">
                {emergencyAbsences.map((abs) => (
                  <li key={abs._id}>
                    {abs.nurseName} — Floor {abs.floorNumber} ({abs.shiftType})
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <button onClick={() => setActiveTab("roster")} className="fix-roster-btn">
            Fix Coverage
          </button>
        </div>
      )}

      {activeTab === "admissions" ? (
        <div className="manager-grid">
          {/* LEFT: PATIENT INTAKE */}
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
                  <select value={formData.sex} onChange={(e) => setFormData({...formData, sex: e.target.value as any})}>
                    <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group"><label>Room #</label><input required type="text" value={formData.roomNumber} onChange={(e) => setFormData({...formData, roomNumber: e.target.value})} placeholder="e.g. 101" /></div>
              </div>
              <div className="form-group full-width">
                <label>Medical History / Initial Notes</label>
                <textarea className="history-textarea" value={formData.medicalHistory} onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})} placeholder="Known allergies, recent surgeries..."></textarea>
              </div>
              <button type="submit" className="admit-btn" disabled={isSubmitting}>{isSubmitting ? "Syncing..." : "Admit to Sentryx"}</button>
            </form>
          </section>

          {/* RIGHT: LIVE DIRECTORY */}
          <section className="card directory-card">
            <div className="card-header"><span className="icon">🏥</span><h2>Live Directory</h2><div className="live-indicator">LIVE</div></div>
            <div className="patient-list">
              {!activePatients ? <p>Loading...</p> : activePatients.length === 0 ? <p>No active admissions.</p> : 
                activePatients.map((patient) => (
                  <div key={patient._id} className="patient-item">
                    <div className="patient-info"><span className="patient-name">{patient.name}</span><span className="patient-meta">Room {patient.roomNumber}</span></div>
                    <div className="patient-actions">
                      <div className={`status-badge ${patient.status.toLowerCase()}`}>{patient.status}</div>
                      <button className="discharge-btn" onClick={() => dischargePatient({ patientId: patient._id })}>✕</button>
                    </div>
                  </div>
                ))
              }
            </div>
          </section>
        </div>
      ) : (
        /* MASTER ROSTER VIEW */
        <section className="card roster-card">
          <div className="card-header">
            <span className="icon">📅</span><h2>Master Roster</h2>
            <div className="legend">
              <span className="legend-item"><span className="dot morning"></span> M</span>
              <span className="legend-item"><span className="dot evening"></span> E</span>
              <span className="dot night"></span> N
            </div>
          </div>
          <div className="roster-scroll-container">
            <table className="roster-table">
              <thead>
                <tr>
                  <th className="sticky-col">Staff</th>
                  {dates.map(d => {
                    const dateObj = new Date(d);
                    return (
                      <th key={d}>
                        <div>{dateObj.toLocaleDateString([], { month: 'short' })}</div>
                        <div style={{ fontSize: '1.1rem', color: '#1e293b' }}>{dateObj.toLocaleDateString([], { day: 'numeric' })}</div>
                      </th>
                    );
                  })}
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
                          className={`shift-cell ${shift ? 'assigned' : 'empty'} ${shift?.shiftType?.toLowerCase()} ${shift?.status === 'flagged' ? 'crisis' : ''}`} 
                          onClick={() => handleShiftAssign(nurse._id, date)}
                        >
                          {shift ? (
                            <div className="shift-display">
                              {/* 🗑️ REMOVE SHIFT BUTTON */}
                              <button 
                                className="remove-shift-btn" 
                                onClick={(e) => {
                                  e.stopPropagation(); 
                                  handleRemoveShift(shift._id);
                                }}
                              >
                                ✕
                              </button>
                              <span className="shift-letter">{shift.shiftType[0]}</span>
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
    </div>
  );
}