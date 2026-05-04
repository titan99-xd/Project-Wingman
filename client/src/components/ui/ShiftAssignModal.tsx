import { useState } from "react";
import "../../styles/confirmmodal.css";

interface Props {
  isOpen: boolean;
  nurseName: string;
  date: string;
  onConfirm: (floor: number, type: string) => void;
  onCancel: () => void;
}

export default function ShiftAssignModal({ isOpen, nurseName, date, onConfirm, onCancel }: Props) {
  const [floor, setFloor] = useState(1);
  const [type, setType] = useState("Morning");

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Assign Shift</h3>
        <p>Staff: <strong>{nurseName}</strong><br/>Date: {date}</p>
        
        <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>Ward Floor (1-14)</label>
          <input 
            type="number" 
            min="1" max="14" 
            value={floor} 
            onChange={e => setFloor(parseInt(e.target.value))}
            style={{ width: '100%', padding: '8px', marginBottom: '1rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />

          <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>Shift Schedule</label>
          <select 
            value={type} 
            onChange={e => setType(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          >
            <option value="Morning">Morning (07:00 - 15:00)</option>
            <option value="Evening">Evening (15:00 - 23:00)</option>
            <option value="Night">Night (23:00 - 07:00)</option>
          </select>
        </div>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onCancel}>Cancel</button>
          <button className="confirm-btn" onClick={() => { onConfirm(floor, type); onCancel(); }}>
            Assign Shift
          </button>
        </div>
      </div>
    </div>
  );
}