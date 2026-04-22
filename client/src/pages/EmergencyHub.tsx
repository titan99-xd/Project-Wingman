import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";
import type { Id } from "../../convex/_generated/dataModel";
import "../styles/emergency.css";

interface EmergencyAlert {
  _id: Id<"emergencies">;
  _creationTime: number;
  nurseId: Id<"users">;
  patientId: Id<"patients">;
  status: "active" | "resolved";
  triggeredAt: number;
  nurseName: string;
  roomNumber: string;
}

export default function EmergencyHub() {
  // 1. Fetch Active SOS Signals
  const activeEmergencies = useQuery(api.emergencies.getActiveEmergencies) as EmergencyAlert[] | undefined;
  const resolve = useMutation(api.emergencies.resolveEmergency);

  // 2. ⏱️ REAL-TIME CLOCK STATE
  const [now, setNow] = useState(() => Date.now());

  // 3. Update 'now' every second to make the timers tick up live
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 4. AUDIO ALERT LOGIC
  useEffect(() => {
    if (activeEmergencies && activeEmergencies.length > 0) {
      const alarm = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
      alarm.loop = true;
      alarm.play().catch(() => {
        console.log("Audio waiting for user interaction to enable.");
      });
      
      return () => {
        alarm.pause();
        alarm.currentTime = 0;
      };
    }
  }, [activeEmergencies]);

  // 5.  RESOLUTION HANDLER
  const handleResolve = async (id: Id<"emergencies">) => {
    const notes = window.prompt("Resolution Notes (e.g., 'Stabilized'):");
    if (notes) {
      await resolve({ emergencyId: id, notes });
    }
  };

  return (
    <div className="hub-wrapper">
      <header className="hub-header">
        <div className="header-left">
          <span className="hub-tag">CRITICAL MONITORING</span>
          <h1>Ward Emergency Hub</h1>
        </div>
        
        <div className={`system-status ${activeEmergencies?.length ? 'danger' : 'secure'}`}>
          <span className="status-indicator-dot"></span>
          {activeEmergencies?.length 
            ? `${activeEmergencies.length} ACTIVE INCIDENT${activeEmergencies.length > 1 ? 'S' : ''}` 
            : 'ALL SYSTEMS SECURE'}
        </div>
      </header>

      <main className="hub-content">
        {!activeEmergencies ? (
          <div className="empty-state">
            <p>Connecting to Sentryx Emergency Grid...</p>
          </div>
        ) : activeEmergencies.length === 0 ? (
          <div className="empty-state">
            <div className="radar-circle"></div>
            <p>Scanning ward for distress signals...</p>
            <span className="last-scan">System: Nominal</span>
          </div>
        ) : (
          <div className="alerts-grid">
            {activeEmergencies.map((alert) => (
              <div key={alert._id} className="emergency-card">
                <div className="alert-top">
                  <span className="sos-label">🚨 SOS TRIGGERED</span>
                  <span className="alert-time">
                    {Math.floor((now - alert._creationTime) / 1000)}s ago
                  </span>
                </div>
                
                <div className="alert-main">
                  <div className="data-group">
                    <label>LOCATION</label>
                    <h2 className="room-display">{alert.roomNumber}</h2>
                  </div>
                  
                  <div className="data-group">
                    <label>REQUESTING STAFF</label>
                    <p className="nurse-display">{alert.nurseName}</p>
                  </div>
                </div>

                <button 
                  onClick={() => handleResolve(alert._id)} 
                  className="resolve-btn"
                >
                  ACKNOWLEDGE & RESOLVE
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}