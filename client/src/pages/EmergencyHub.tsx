import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";
import type { Id } from "../../convex/_generated/dataModel";
import EmergencyResolveModal from "../components/ui/EmergencyResolveModal"; 
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
  const activeEmergencies = useQuery(api.emergencies.getActiveEmergencies) as EmergencyAlert[] | undefined;
  const resolve = useMutation(api.emergencies.resolveEmergency);

  // --- STATE ---
  const [now, setNow] = useState(() => Date.now());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyAlert | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (activeEmergencies && activeEmergencies.length > 0) {
      const alarm = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
      alarm.loop = true;
      alarm.play().catch(() => console.log("Audio waiting for interaction."));
      return () => {
        alarm.pause();
        alarm.currentTime = 0;
      };
    }
  }, [activeEmergencies]);

  // --- HANDLERS ---
  
  //  Opens the modal instead of window.prompt
  const handleResolveClick = (alert: EmergencyAlert) => {
    setSelectedEmergency(alert);
    setIsModalOpen(true);
  };

  //  Actually executes the mutation from the modal
  const handleConfirmResolve = async (notes: string) => {
    if (selectedEmergency) {
      await resolve({ 
        emergencyId: selectedEmergency._id, 
        notes: notes || "Resolved by Head Nurse" 
      });
      setIsModalOpen(false);
      setSelectedEmergency(null);
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
          <div className="empty-state"><p>Connecting to Sentryx Emergency Grid...</p></div>
        ) : activeEmergencies.length === 0 ? (
          <div className="empty-state">
            <div className="radar-circle"></div>
            <p>Scanning ward for distress signals...</p>
          </div>
        ) : (
          <div className="alerts-grid">
            {activeEmergencies.map((alert) => (
              <div key={alert._id} className="emergency-card">
                <div className="alert-top">
                  <span className="sos-label">🚨 SOS TRIGGERED</span>
                  <span className="alert-time">{Math.floor((now - alert._creationTime) / 1000)}s ago</span>
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
                  onClick={() => handleResolveClick(alert)} 
                  className="resolve-btn"
                >
                  ACKNOWLEDGE & RESOLVE
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/*  THE MODAL INSTANCE */}
      <EmergencyResolveModal 
        isOpen={isModalOpen}
        roomNumber={selectedEmergency?.roomNumber || ""}
        onConfirm={handleConfirmResolve}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
}