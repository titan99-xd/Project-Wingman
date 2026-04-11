import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import "../styles/emergency.css";

export default function EmergencyHub() {
  const activeEmergencies = useQuery(api.emergencies.getActiveEmergencies);
  const resolve = useMutation(api.emergencies.resolveEmergency);
  const [notes, setNotes] = useState("");

  const handleResolve = (id: any) => {
    const resolutionNotes = prompt("Enter resolution notes (e.g., 'Stabilized'):");
    if (resolutionNotes) {
      resolve({ emergencyId: id, notes: resolutionNotes });
    }
  };

  return (
    <div className="hub-wrapper">
      <header className="hub-header">
        <div className="header-brand">
          <span className="hub-tag">CRITICAL MONITORING</span>
          <h1>Ward Emergency Hub</h1>
        </div>
        <div className={`system-status ${activeEmergencies?.length ? 'danger' : 'secure'}`}>
          {activeEmergencies?.length ? '⚠️ INCIDENT IN PROGRESS' : '✅ ALL ROOMS SECURE'}
        </div>
      </header>

      <main className="hub-content">
        {activeEmergencies?.length === 0 ? (
          <div className="empty-state">
            <div className="radar-circle"></div>
            <p>Scanning ward for distress signals...</p>
          </div>
        ) : (
          <div className="alerts-grid">
            {activeEmergencies?.map((alert) => (
              <div key={alert._id} className="emergency-card">
                <div className="alert-header">
                  <span className="alert-type">SOS TRIGGERED</span>
                  <span className="alert-time">
                    {Math.floor((Date.now() - alert.triggeredAt) / 1000)}s ago
                  </span>
                </div>
                
                <div className="alert-body">
                  <h2>Room 102</h2> {/* We'll link names next! */}
                  <p>Nurse ID: {alert.nurseId.slice(-6)}</p>
                </div>

                <div className="alert-footer">
                  <button onClick={() => handleResolve(alert._id)} className="resolve-btn">
                    ACKNOWLEDGE & RESOLVE
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}