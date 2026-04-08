import { Link } from "react-router-dom";
import "../styles/home.css";

export default function Home() {
  return (
    <div className="landing-page">
      {/* --- 1. HERO SECTION --- */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-text">
            <span className="project-badge">SentryX</span>
            <h1>Nursing Management System to Provide the Support You Deserve</h1>
            <p>
              Optimize nursing efficiency with Sentryx's integrated clinical software, 
              designed to eliminate data silos and improve patient-centric care.
            </p>
            <div className="hero-actions">
              <Link to="/manager" className="btn-main">Enter System</Link>
              <Link to="/tablet" className="btn-sub">Tablet View</Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="abstract-ui-card">
              <div className="ui-header">
                <div className="ui-dot red"></div>
                <div className="ui-dot yellow"></div>
                <div className="ui-dot green"></div>
              </div>
              <div className="ui-body">
                <div className="ui-line"></div>
                <div className="ui-line short"></div>
                <div className="ui-line"></div>
                <div className="ui-stat-box">
                  <span className="pulse-icon"></span>
                  Live Sync Active
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- 2. CORE CAPABILITIES (The 5-Card Row) --- */}
      <section className="capabilities">
        <div className="cap-grid">
          <div className="cap-card">
            <div className="cap-icon">📋</div>
            <p>Access patient records within a few clicks</p>
          </div>
          <div className="cap-card">
            <div className="cap-icon">📉</div>
            <p>Capture real-time inpatient vitals</p>
          </div>
          <div className="cap-card">
            <div className="cap-icon">✍️</div>
            <p>Document intake, output and nurse notes</p>
          </div>
          <div className="cap-card">
            <div className="cap-icon">🛏️</div>
            <p>Utilize Bed Occupancy Tracking</p>
          </div>
          <div className="cap-card">
            <div className="cap-icon">🛡️</div>
            <p>Secure Audit Ledger for compliance</p>
          </div>
        </div>
      </section>

      {/* --- 3. SYSTEM WORKFLOW (New "Something Else" Section) --- */}
      <section className="workflow-section">
        <div className="workflow-container">
          <h2>The Sentryx Clinical Journey</h2>
          <div className="workflow-steps">
            <div className="step">
              <div className="step-num">01</div>
              <h4>Digital Admission</h4>
              <p>Patients are triaged and admitted via the Manager interface, creating a secure cloud identity instantly.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-num">02</div>
              <h4>Bedside Monitoring</h4>
              <p>Nurses use the portable Tablet interface to sync vitals and observations directly from the point of care.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-num">03</div>
              <h4>Administrative Audit</h4>
              <p>Every clinical event is permanently logged in the Security Ledger for total ward accountability.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- 4. DETAILED MODULES --- */}
      <section className="module-details">
        <div className="module-header">
          <h2>Nursing Management System for Inpatient Care</h2>
          <p>Streamlining crucial responsibilities in high-pressure clinical environments.</p>
        </div>

        <div className="detailed-grid">
          <div className="detail-item">
            <div className="detail-icon">📅</div>
            <h3>Task Management</h3>
            <p>Automate clinical assignments and provide instant access to digitized medical history records.</p>
          </div>
          <div className="detail-item">
            <div className="detail-icon">👩‍⚕️</div>
            <h3>Nurse Support</h3>
            <p>Integrated triage support and medication tracking to reduce cognitive load on frontline staff.</p>
          </div>
          <div className="detail-item">
            <div className="detail-icon">🤝</div>
            <h3>Enhanced Patient Care</h3>
            <p>Real-time trend analysis allows for proactive interventions and improved patient outcomes.</p>
          </div>
        </div>
      </section>

      {/* --- 5. RESEARCH CONTEXT (Paper vs. Digital) --- */}
      <section className="comparison-section">
        <div className="section-container">
          <h2>The Digital Transformation</h2>
          <div className="comparison-grid">
            <div className="comp-box manual">
              <h4>Legacy Workflow</h4>
              <ul>
                <li>❌ Manual paper-based vitals</li>
                <li>❌ Delayed clinical handovers</li>
                <li>❌ Fragmented security logs</li>
              </ul>
            </div>
            <div className="comp-box sentryx">
              <h4>Sentryx Workflow</h4>
              <ul>
                <li>✅ Zero-latency Cloud sync</li>
                <li>✅ Real-time trend visualization</li>
                <li>✅ Immutable audit accountability</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}