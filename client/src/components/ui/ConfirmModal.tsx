import "../../styles/confirmmodal.css";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "danger" | "primary"; // Optional: to change button color
}

export default function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel", 
  onConfirm, 
  onCancel,
  type = "primary"
}: ConfirmModalProps) {
  
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      {/* stopPropagation prevents clicking the white card from closing the modal */}
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="cancel-btn" onClick={onCancel}>
            {cancelText}
          </button>
          <button 
            className={`confirm-btn ${type === "danger" ? "bg-red" : ""}`} 
            style={type === "danger" ? { backgroundColor: "#ef4444" } : {}}
            onClick={() => {
              onConfirm();
              onCancel();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}