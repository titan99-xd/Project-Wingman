import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api"; // 
import type { Doc, Id } from "../../convex/_generated/dataModel";
import ConfirmModal from "../components/ui/ConfirmModal"; 
import "../styles/settings.css";

// --- 1. SUB-COMPONENT: THE FORM ---
function SettingsForm({ initialData }: { initialData: Doc<"settings"> }) {
  const updateSettings = useMutation(api.settings.updateSettings);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [form, setForm] = useState({
    overridePin: initialData.overridePin || "",
    gpsRadius: initialData.gpsRadius || 50,
    wardName: initialData.wardName || "General Ward"
  });

  const executeUpdate = async () => {
    try {
      await updateSettings({
        id: initialData._id as Id<"settings">, 
        overridePin: form.overridePin,
        gpsRadius: form.gpsRadius,
        wardName: form.wardName,
      });
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  return (
    <div className="settings-grid">
      <section className="settings-card">
        <div className="card-header">
          <span className="icon">🛡️</span>
          <h2>Security Protocols</h2>
        </div>
        
        <div className="setting-item">
          <label>Master Override PIN</label>
          <input 
            type="password" 
            maxLength={4} 
            value={form.overridePin}
            onChange={(e) => setForm({...form, overridePin: e.target.value})}
          />
        </div>

        <div className="setting-item">
          <label>GPS Geofence Accuracy (Meters)</label>
          <input 
            type="number" 
            value={form.gpsRadius}
            onChange={(e) => setForm({...form, gpsRadius: parseInt(e.target.value) || 0})}
          />
        </div>
      </section>

      <section className="settings-card">
        <div className="card-header">
          <span className="icon">🏥</span>
          <h2>Ward Identity</h2>
        </div>
        
        <div className="setting-item">
          <label>Display Ward Name</label>
          <input 
            type="text" 
            value={form.wardName}
            onChange={(e) => setForm({...form, wardName: e.target.value})}
          />
        </div>
        
        {/* Trigger the Modal */}
        <button className="save-settings-btn" onClick={() => setIsConfirmModalOpen(true)}>
          Apply Changes
        </button>
      </section>

      {/* Confirm  Modal */}
      <ConfirmModal 
        isOpen={isConfirmModalOpen}
        title="Update Ward Configuration?"
        message="This will update security protocols hospital-wide. Proceed?"
        confirmText="Update Settings"
        onConfirm={executeUpdate}
        onCancel={() => setIsConfirmModalOpen(false)}
      />
    </div>
  );
}

// --- 2. MAIN COMPONENT ---
export default function Settings() {
  const settings = useQuery(api.settings.getSettings);

  return (
    <div className="settings-page">
      <header className="settings-header">
        <h1>Ward Configuration</h1>
        <p>Manage security protocols and ward identity.</p>
      </header>

      {settings === undefined ? (
        <div className="loading-state">Decrypting system protocols...</div>
      ) : settings === null ? (
        <div className="error-state">No settings found in database.</div>
      ) : (
        <SettingsForm initialData={settings as Doc<"settings">} />
      )}
    </div>
  );
}