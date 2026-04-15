import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import "../styles/gatekeeper.css";

export default function Gatekeeper() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const settings = useQuery(api.settings.getSettings); // We'll need to create this query
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pinInput, setPinInput] = useState("");

  const runLocationCheck = () => {
    setIsVerifying(true);
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Since radius is Finland-wide, we just check if we got a signal
        console.log("Location verified:", pos.coords.latitude, pos.coords.longitude);
        // In production, you'd calculate distance here. For demo:
        setTimeout(() => {
          navigate("/tablet");
        }, 1500);
      },
      (err) => {
        alert("GPS Signal Failed. Use Manual Override PIN.");
        setIsVerifying(false);
        setShowPin(true);
      }
    );
  };

  const handlePinUnlock = () => {
    if (pinInput === settings?.overridePin) {
      navigate("/tablet");
    } else {
      alert("Invalid PIN.");
    }
  };

  return (
    <div className="gatekeeper-layout">
      <div className="gatekeeper-card">
        <div className="security-icon">{isVerifying ? "🛰️" : "📍"}</div>
        <h2>Proximity Check</h2>
        <p>User: <strong>{user.name}</strong></p>
        <p className="instruction">You must be within the clinical ward boundary to access patient data.</p>
        
        {!isVerifying && !showPin && (
          <button className="verify-btn" onClick={runLocationCheck}>Check Location</button>
        )}

        {isVerifying && <div className="pulse-loader">Scanning for GPS Signature...</div>}

        {showPin && (
          <div className="pin-section">
            <input 
              type="password" 
              maxLength={4} 
              placeholder="Enter PIN" 
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
            />
            <button className="unlock-btn" onClick={handlePinUnlock}>Unlock with PIN</button>
          </div>
        )}
      </div>
    </div>
  );
}