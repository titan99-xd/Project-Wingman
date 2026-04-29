import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import type { Id } from "../../convex/_generated/dataModel"; 
import "../styles/gatekeeper.css";

// ---  (Haversine Formula) ---
// Calculates distance between two points in meters
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

export default function Gatekeeper() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  
  const settings = useQuery(api.settings.getSettings); 
  const checkIn = useMutation(api.shifts.checkIn);
  const todayShift = useQuery(api.staffing.getTodayShift, user?._id ? { nurseId: user._id } : "skip"); 
  const schedule = useQuery(api.staffing.getNurseSchedule, user?._id ? { nurseId: user._id } : "skip");
  const reportSick = useMutation(api.staffing.reportSick);

  const [isVerifying, setIsVerifying] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [selectedShifts, setSelectedShifts] = useState<Id<"shifts">[]>([]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const finalizeCheckIn = () => {
    const updatedUser = { ...user, isCheckIn: true };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    navigate("/tablet");
  };

  const runLocationCheck = () => {
    if (!settings) return alert("System settings not loaded.");
    setIsVerifying(true);

    if (!navigator.geolocation) {
      alert("Geolocation not supported.");
      setIsVerifying(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        
        // 🛰️ CALCULATE LIVE DISTANCE
        const distance = getDistance(
          latitude, 
          longitude, 
          settings.hospitalLat, 
          settings.hospitalLong
        );

        //  VERIFY AGAINST SETTINGS RADIUS
        if (distance <= settings.gpsRadius) {
          try {
            if (user?._id && todayShift) {
              await checkIn({ 
                nurseId: user._id, 
                shiftId: todayShift._id, 
                lat: latitude, 
                lng: longitude 
              });
            }
            finalizeCheckIn();
          } catch (error) {
            console.error("Mutation failed:", error);
            setIsVerifying(false);
          }
        } else {
          // OUT OF BOUNDS - Trigger PIN Override
          alert(`Out of Bounds: You are ${Math.round(distance)}m from the ward. Master PIN required.`);
          setIsVerifying(false);
          setShowPin(true);
        }
      },
      () => { 
        alert("GPS Signal Failed. Using Manual PIN.");
        setIsVerifying(false);
        setShowPin(true);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handlePinUnlock = () => {
    if (pinInput === settings?.overridePin) {
      finalizeCheckIn();
    } else {
      alert("Invalid Security PIN.");
    }
  };

  const toggleShiftSelection = (shiftId: Id<"shifts">, status: string) => {
    if (status === "flagged") return;
    if (selectedShifts.includes(shiftId)) {
      setSelectedShifts(selectedShifts.filter(id => id !== shiftId));
    } else {
      setSelectedShifts([...selectedShifts, shiftId]);
    }
  };

  const handleSickLeave = async () => {
    if (selectedShifts.length === 0) return alert("Select shifts first.");
    const reason = window.prompt(`Reporting ${selectedShifts.length} absences. Reason:`);
    if (reason) {
      await reportSick({ shiftIds: selectedShifts, nurseId: user._id, reason });
      alert("Reported. Head Nurse notified.");
      setSelectedShifts([]);
      handleLogout();
    }
  };

  if (!user || !user._id) {
    return (
      <div className="gatekeeper-layout">
        <div className="gatekeeper-card error-card">
          <div className="security-icon">🔒</div>
          <h2>Access Restricted</h2>
          <button className="verify-btn" onClick={() => navigate("/login")}>Return to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="gatekeeper-layout">
      <button className="gatekeeper-logout-btn" onClick={handleLogout}>← Logout</button>

      <div className="gatekeeper-container">
        <div className="logistics-card">
          <div className="card-header">
            <h3>My 15-Day Schedule</h3>
            <span className="staff-role-tag">Staff: {user.name}</span>
          </div>
          
          <div className="schedule-list">
            {!schedule ? (
              <div className="loading-shimmer">Loading schedule...</div>
            ) : schedule.length === 0 ? (
              <p className="no-shift">No upcoming shifts assigned.</p>
            ) : (
              schedule.map((shift) => {
                const isToday = shift.date === new Date().toISOString().split("T")[0];
                const isSelected = selectedShifts.includes(shift._id);
                return (
                  <div 
                    key={shift._id} 
                    className={`schedule-item ${isToday ? 'is-today' : ''} ${isSelected ? 'selected' : ''} status-${shift.status}`}
                    onClick={() => toggleShiftSelection(shift._id, shift.status)}
                  >
                    <div className="selection-dot">
                      {isSelected ? "✅" : (shift.status === 'flagged' ? "🤒" : "○")}
                    </div>
                    <div className="item-date">
                      <span className="day-name">{new Date(shift.date).toLocaleDateString([], { weekday: 'short' })}</span>
                      <span className="day-num">{new Date(shift.date).toLocaleDateString([], { day: 'numeric' })}</span>
                    </div>
                    <div className="item-info">
                      <p className="floor-label">Floor {shift.floorNumber || "TBD"}</p>
                      <p className="shift-type-label">{shift.shiftType}</p>
                    </div>
                    {isToday && <span className="today-badge">Active</span>}
                  </div>
                );
              })
            )}
          </div>

          <button 
            className={`sick-leave-btn ${selectedShifts.length > 0 ? 'active' : ''}`} 
            onClick={handleSickLeave}
          >
            🤒 Report {selectedShifts.length > 0 ? `${selectedShifts.length} Absences` : "Emergency Absence"}
          </button>
        </div>

        <div className="gatekeeper-card">
          <div className="security-icon">{isVerifying ? "🛰️" : "🛡️"}</div>
          {/*  DYNAMIC WARD NAME */}
          <h2>{settings?.wardName || "Ward"} Access</h2>
          <p className="user-label">Logged in as: <strong>{user.name}</strong></p>
          <p className="gatekeeper-subtext">
            Radius: {settings?.gpsRadius}m | Geofence active for {settings?.wardName}.
          </p>
          
          {!isVerifying && !showPin && (
            <button className="verify-btn" onClick={runLocationCheck}>
              <span>Unlock Ward Data</span>
            </button>
          )}

          {isVerifying && (
            <div className="verifying-status">
              <div className="pulse-loader"></div>
              <p>Calculating Proximity...</p>
            </div>
          )}

          {showPin && (
            <div className="pin-section">
              <p className="pin-note">Enter Master Override</p>
              <input 
                type="password" maxLength={4} placeholder="PIN" 
                value={pinInput} onChange={(e) => setPinInput(e.target.value)}
                className="pin-input-field"
              />
              <button className="unlock-btn" onClick={handlePinUnlock}>Verify PIN</button>
              <button className="back-btn" onClick={() => setShowPin(false)}>Retry GPS Scan</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}