import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import "../styles/oversight.css";

interface WardPatient {
  _id: string;
  name: string;
  status: string;
  roomNumber: string;
  nurseName: string;
}

export default function Oversight() {
  // 2. Fetch Backend Data
  const staff = useQuery(api.manager.getStaffOverview);
  const patients = useQuery(api.manager.getWardStatus);

  // 3. Grouping Logic: Categorize 98 patients into horizontal nurse "lanes"
  const groupedPatients = (patients as WardPatient[] | undefined)?.reduce((acc, patient) => {
    const nurse = patient.nurseName || "Unassigned";
    if (!acc[nurse]) acc[nurse] = [];
    acc[nurse].push(patient);
    return acc;
  }, {} as Record<string, WardPatient[]>);

  // 4. Stats Calculations
  const criticalCount = patients?.filter(p => p.status === "Critical").length || 0;
  const onDutyCount = staff?.filter(s => s.isCheckIn).length || 0;

  return (
    <div className="oversight-page">
      {/* --- HEADER SECTION --- */}
      <header className="oversight-header">
        <div className="title-group">
          <h1>Ward Oversight</h1>
          <div className="live-tag">LIVE FEED</div>
        </div>
        
        <div className="quick-stats">
          <div className="stat-box">
            <span className="s-label">ON-DUTY</span>
            <span className="s-value">{onDutyCount}/14</span>
          </div>
          <div className="stat-box critical">
            <span className="s-label">CRITICAL</span>
            <span className="s-value">{criticalCount}</span>
          </div>
        </div>
      </header>

      <div className="oversight-layout">
        
        {/* --- LEFT SIDEBAR: PERSONNEL STATUS BOARD --- */}
        <aside className="personnel-status-section">
          <h2>Clinical Staff</h2>
          <div className="staff-status-board">
            {!staff ? (
              <p className="loading-text">Syncing Staff...</p>
            ) : (
              staff.map(nurse => (
                <div key={nurse._id} className="staff-status-row">
                  <div className={`status-led ${nurse.isCheckIn ? 'on' : 'off'}`}></div>
                  <span className="nurse-display-name">{nurse.name}</span>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* ---  PATIENT DISTRIBUTION HEATMAP --- */}
        <main className="heatmap-section">
          <h2>Ward Distribution Heatmap</h2>
          <div className="nurse-lanes">
            {!groupedPatients ? (
              <p className="loading-text">Mapping Ward Data...</p>
            ) : (
              Object.entries(groupedPatients).map(([nurseName, nursePatients]) => (
                <div key={nurseName} className="nurse-lane">
                  <div className="lane-header">
                    <span className="lane-nurse-name">{nurseName}</span>
                    <span className="lane-count">{nursePatients.length} Patients</span>
                  </div>
                  
                  <div className="lane-cells">
                    {nursePatients.map(patient => (
                      <div 
                        key={patient._id} 
                        className={`cell ${patient.status.toLowerCase()}`}
                        title={`${patient.name} - ${patient.status}`}
                      >
                        <span className="cell-room">
                          {patient.roomNumber.replace('S-', '')}
                        </span>
                        
                        {/* Warning icon for Critical status */}
                        {patient.status === "Critical" && (
                          <div className="cell-warning">!</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}