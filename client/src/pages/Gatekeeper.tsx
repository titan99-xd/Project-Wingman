import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import "../styles/gatekeeper.css";

export default function Gatekeeper() {
  const navigate = useNavigate();
  // Get user from local storage (set during login)
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  // Convex Hooks
  const settings = useQuery(api.settings.getSettings); 
  const checkIn = useMutation(api.shifts.checkIn);
  
  // Local State
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pinInput, setPinInput] = useState("");

  const runLocationCheck = () => {
    setIsVerifying(true);
    
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      setIsVerifying(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        console.log("Location verified:", latitude, longitude);

        try {
          // --- MANDATORY: Update the database that this nurse is now active ---
          if (user._id) {
            await checkIn({ 
              nurseId: user._id, 
              lat: latitude, 
              lng: longitude 
            });
          }

          // Small delay for the "verified" feeling before navigating
          setTimeout(() => {
            navigate("/tablet");
          }, 1500);
        } catch (error) {
          console.error("Check-in failed:", error);
          setIsVerifying(false);
        }
      },
      (err: GeolocationPositionError) => { // Added Type to fix the red squiggle
        console.warn("GPS Error:", err.message);
        alert("GPS Signal Failed or Permission Denied. Please use the Manual PIN.");
        setIsVerifying(false);
        setShowPin(true);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handlePinUnlock = () => {
    if (pinInput === settings?.overridePin) {
      navigate("/tablet");
    } else {
      alert("Invalid PIN. Please ask the Head Nurse for the code.");
    }
  };

  return (
    <div className="gatekeeper-layout">
      <div className="gatekeeper-card">
        <div className="security-icon">{isVerifying ? "🛰️" : "📍"}</div>
        <h2>Proximity Check</h2>
        <p className="user-label">Logged in as: <strong>{user.name || "Unknown User"}</strong></p>
        <p className="instruction">
          Location-Based Access Control: You must verify your presence within the ward to view patient data.
        </p>
        
        {!isVerifying && !showPin && (
          <button className="verify-btn" onClick={runLocationCheck}>Verify Location</button>
        )}

        {isVerifying && (
          <div className="verifying-status">
            <div className="pulse-loader"></div>
            <p>Scanning GPS Signature...</p>
          </div>
        )}

        {showPin && (
          <div className="pin-section">
            <p className="pin-hint">Enter the 4-digit Emergency Override PIN:</p>
            <input 
              type="password" 
              maxLength={4} 
              placeholder="0000" 
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="pin-input-field"
            />
            <button className="unlock-btn" onClick={handlePinUnlock}>Unlock System</button>
            <button className="back-btn" onClick={() => setShowPin(false)}>Try GPS Again</button>
          </div>
        )}
      </div>
    </div>
  );
}