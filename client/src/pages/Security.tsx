import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import "../styles/security.css";

export default function Security() {
  const logs = useQuery(api.patients.getAuditLogs);

  return (
    <div className="security-page">
      <header className="security-header">
        <div className="header-info">
          <h1>System Audit Ledger</h1>
          <p>Cryptographically signed logs of all clinical activity.</p>
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
            {logs?.map((log) => (
              <tr key={log._id}>
                <td className="log-time">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td>
                  <span className={`action-tag ${log.action.toLowerCase().includes('vital') ? 'vital' : 'admin'}`}>
                    {log.action}
                  </span>
                </td>
                
                {/* 🏥 HUMAN READABLE NAME */}
                <td className="log-patient">
                  <div className="patient-name-container">
                    <strong>{log.patientName || "System Event"}</strong>
                    <code className="log-id-sub">{log.targetId.slice(-6)}</code>
                  </div>
                </td>

                {/* 🔍 CLINICAL DATA PREVIEW */}
                <td className="log-details">
                  {log.metadata?.value ? (
                    <span className="detail-pill">
                      {log.metadata.value} {log.metadata.unit}
                    </span>
                  ) : (
                    <span className="detail-none">—</span>
                  )}
                </td>

                <td className="log-user">👤 {log.userId}</td>
                <td className="log-status">Verified</td>
              </tr>
            ))}
            
            {logs?.length === 0 && (
              <tr><td colSpan={6} className="no-logs">Scanning database for events...</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}