import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import "../styles/gatekeeper.css";

export default function Gatekeeper() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  // Convex Hooks
  const settings = useQuery(api.settings.getSettings); 
  const checkIn = useMutation(api.shifts.checkIn);
  
  // Local State
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pinInput, setPinInput] = useState("");

  // --- NEW: Logout Function (Since Header is gone) ---
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  /**
   * Helper function to update the local session state.
   * This is CRITICAL so the App.tsx ProtectedRoute knows you are verified.
   */
  const finalizeCheckIn = () => {
    const updatedUser = { ...user, isCheckIn: true };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    navigate("/tablet");
  };

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
          if (user._id) {
            await checkIn({ 
              nurseId: user._id, 
              lat: latitude, 
              lng: longitude 
            });
          }

          // Update memory and move forward
          finalizeCheckIn();
          
        } catch (error) {
          console.error("Check-in failed:", error);
          setIsVerifying(false);
        }
      },
      (err: GeolocationPositionError) => { 
        console.warn("Geolocation Error Detail:", err.message); 
        alert("GPS Signal Failed. Please use the Manual PIN.");
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
      alert("Invalid PIN. Please ask the Head Nurse for the code.");
    }
  };

  return (
    <div className="gatekeeper-layout">
      <button className="gatekeeper-logout-btn" onClick={handleLogout}>
        ← Logout & Switch Account
      </button>

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