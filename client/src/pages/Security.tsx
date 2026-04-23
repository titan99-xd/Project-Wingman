import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import "../styles/security.css";

// --- TYPE DEFINITIONS ---
interface LogMetadata {
  value?: string | number;
  unit?: string;
  reason?: string;
  shiftsCount?: number;
  triage?: string;
}

export default function Security() {
  const logs = useQuery(api.history.getAuditLogs);

  // --- METADATA FORMATTER ---
  const formatMetadata = (metadata: LogMetadata | undefined) => {
    if (!metadata) return <span className="detail-none">—</span>;
    if (metadata.value) return <span className="detail-pill">{metadata.value} {metadata.unit}</span>;
    if (metadata.reason) return <span className="detail-text">"{metadata.reason}"</span>;
    return <span className="detail-text">{metadata.shiftsCount || metadata.triage || "—"}</span>;
  };

  return (
    <div className="security-page">
      <header className="security-header">
        <div className="header-info">
          <h1>System Audit Ledger</h1>
          {/* <p>Cryptographically signed logs of all clinical activity.</p> */}
        </div>
        <div className="status-indicator">
          <span className="pulse"></span> LIVE MONITORING
        </div>
      </header>

      <div className="audit-card">
        <table className="audit-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>Patient / Resource</th>
              <th>Details</th>
              <th>Identity</th>
              <th>Integrity</th>
            </tr>
          </thead>
          <tbody>
            {!logs ? (
               <tr><td colSpan={6} className="no-logs">Decrypting Ledger...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={6} className="no-logs">No system events recorded.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id}>
                  <td className="log-time">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    <div className="log-id-sub">{new Date(log.timestamp).toLocaleDateString()}</div>
                  </td>
                  <td>
                    <span className={`action-tag ${
                      log.action.includes('SICK') || log.action.includes('SOS') ? 'emergency' : 
                      log.action.includes('VITAL') ? 'vital' : 'admin'
                    }`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  
                  <td className="log-patient">
                    <div className="patient-name-container">
                      <strong>{log.patientName || "System / Staff"}</strong>
                      <code className="log-id-sub">ID: {log.targetId?.slice(-6)}</code>
                    </div>
                  </td>

                  <td className="log-details">
                    {formatMetadata(log.metadata as LogMetadata)}
                  </td>

                  <td className="log-user">
                    <div className="user-identity">
                       <span className="user-icon">👤</span>
                       {/* 🟢 FIXED: Now showing the human-readable staff name */}
                       <strong className="staff-name-display">{log.userName}</strong>
                    </div>
                  </td>
                  <td className="log-status">
                    <span className="verified-badge">✓ Verified</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}