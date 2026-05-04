import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import ConfirmModal from "../components/ui/ConfirmModal";
import EmergencyResolveModal from "../components/ui/EmergencyResolveModal";
import "../styles/oversight.css";

export default function Oversight() {
  const activeEmergencies = useQuery(api.emergencies.getActiveEmergencies);
  const resolveEmergency = useMutation(api.emergencies.resolveEmergency);
  const emergencyAbsences = useQuery(api.staffing.getEmergencyAbsences);
  const activePatients = useQuery(api.patients.getActivePatients);
  const roster = useQuery(api.staffing.getFifteenDayRoster);
  const nurses = useQuery(api.users.listNurses);

  const [selectedEmergency, setSelectedEmergency] = useState<{ id: Id<"emergencies">; room: string } | null>(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // 📈 LIVE CALCULATION: 14 Floors
  const floorData = useMemo(() => {
    if (!activePatients || !nurses) return [];
    
    const floors = Array.from({ length: 14 }, (_, i) => i + 1);
    const MAX_CAPACITY = 8; // Adjust for visual scale
    const today = new Date().toISOString().split("T")[0];

    return floors.map((f) => {
      // Robust floor filtering for 1-14
      const onFloor = activePatients.filter(p => {
        const r = p.roomNumber.toString();
        return f >= 10 ? r.startsWith(f.toString()) : (r.startsWith(f.toString()) && r.length === 3);
      }).length;

      const shift = roster?.find(r => Number(r.floorNumber) === f && r.date === today);
      const nurse = nurses.find(n => n._id === shift?.nurseId);

      return {
        num: f,
        count: onFloor,
        pct: (onFloor / MAX_CAPACITY) * 100,
        nurse: nurse?.name || "Unassigned",
        status: onFloor > 6 ? "critical" : onFloor > 4 ? "heavy" : "stable"
      };
    });
  }, [activePatients, roster, nurses]);

  const handleResolve = async (notes: string) => {
    if (!selectedEmergency) return;
    try {
      await resolveEmergency({ emergencyId: selectedEmergency.id, notes });
      setSelectedEmergency(null);
      setIsSuccessOpen(true);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="oversight-page">
      <header className="ov-header">
        <div className="ov-title">
          <h1>Ward Oversight</h1>
          <div className="ov-status"><span className="ov-pulse"></span> MISSION CONTROL ACTIVE</div>
        </div>
      </header>

      {/* 📊 TOP ANALYTICS BAR */}
      <section className="ov-stats-bar">
        <div className="ov-stat-card">
          <label>Admissions</label>
          <div className="ov-stat-val">{activePatients?.length || 0}</div>
        </div>
        <div className="ov-stat-card stable">
          <label>Stable</label>
          <div className="ov-stat-val">{activePatients?.filter(p => p.status === "Stable").length || 0}</div>
        </div>
        <div className="ov-stat-card warning">
          <label>Unstable</label>
          <div className="ov-stat-val">{activePatients?.filter(p => p.status === "Unstable").length || 0}</div>
        </div>
        <div className="ov-stat-card danger">
          <label>Critical</label>
          <div className="ov-stat-val">{activePatients?.filter(p => p.status === "Critical").length || 0}</div>
        </div>
      </section>

      <div className="ov-main-content">
        {/* 🚨 LEFT: SOS FEED */}
        <section className="ov-feed">
          <div className="ov-deficit-section">
            <h2 className="ov-section-title">Staffing Deficit</h2>
            <div className="ov-deficit-list">
              {emergencyAbsences?.map(abs => (
                <div key={abs._id} className="ov-deficit-pill">
                  <strong>{abs.nurseName}</strong> <span>F{abs.floorNumber} • {abs.shiftType}</span>
                </div>
              )) || <p className="ov-no-deficit">No reported absences.</p>}
            </div>
          </div>
          <h2 className="ov-section-title">Active SOS Alerts</h2>
          <div className="ov-feed-scroll">
            {activeEmergencies?.length === 0 ? (
              <div className="ov-empty-feed">🛡️ All Sectors Secure</div>
            ) : (
              activeEmergencies?.map(alert => (
                <div key={alert._id} className="ov-alert-card">
                  <div className="ov-alert-head">
                    <span className="ov-room">Room {alert.roomNumber}</span>
                    <span className="ov-time">{new Date(alert._creationTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <button className="ov-resolve-btn" onClick={() => setSelectedEmergency({ id: alert._id, room: alert.roomNumber })}>
                    Resolve SOS
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 📋 RIGHT: HEATMAP */}
        <section className="ov-heatmap-sidebar">
          <h2 className="ov-section-title">Floor Load (1-14)</h2>
          <div className="ov-heatmap-scroll">
            {floorData.map(f => (
              <div key={f.num} className={`ov-heat-row ${f.status}`}>
                <div className="ov-heat-label">
                  <span className="ov-f-num">F{f.num}</span>
                  <span className="ov-f-nurse">{f.nurse}</span>
                </div>
                <div className="ov-bar-bg">
                  <div className="ov-bar-fill" style={{ width: `${Math.min(f.pct, 100)}%` }}>
                    {f.count > 0 && <span className="ov-count">{f.count}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <EmergencyResolveModal 
        isOpen={!!selectedEmergency} roomNumber={selectedEmergency?.room || ""}
        onConfirm={handleResolve} onCancel={() => setSelectedEmergency(null)}
      />
      <ConfirmModal 
        isOpen={isSuccessOpen} title="Alert Archived" message="Emergency resolved and logged."
        onConfirm={() => setIsSuccessOpen(false)} onCancel={() => setIsSuccessOpen(false)}
      />
    </div>
  );
}