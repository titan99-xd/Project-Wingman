import { useState } from "react";
import "../../styles/confirmmodal.css";

interface Props {
  isOpen: boolean;
  roomNumber: string;
  onConfirm: (notes: string) => void;
  onCancel: () => void;
}

export default function SickLeaveModal({ isOpen, onConfirm, onCancel }: Props) {
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card emergency-theme">
        <h3>Absense Report</h3>
        <p></p>
        
        <textarea 
          className="modal-textarea"
          placeholder="Enter reason for absence..."
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
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}