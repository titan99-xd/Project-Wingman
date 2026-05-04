import { useState } from "react";
import "../../styles/confirmmodal.css";

interface Props {
  isOpen: boolean;
  roomNumber: string;
  onConfirm: (notes: string) => void;
  onCancel: () => void;
}

export default function EmergencyResolveModal({ isOpen, roomNumber, onConfirm, onCancel }: Props) {
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card emergency-theme">
        <h3>Resolve Incident: Room {roomNumber}</h3>
        <p>Enter instructions or resolution notes for the floor staff:</p>
        
        <textarea 
          className="modal-textarea"
          placeholder="e.g., 'Stabilized. Nurse returning to station.'"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          autoFocus
        />

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onCancel}>Cancel</button>
          <button 
            className="confirm-btn resolve-action" 
            onClick={() => {
              onConfirm(notes);
              setNotes(""); 
            }}
          >
            Acknowledge & Resolve
          </button>
        </div>
      </div>
    </div>
  );
}