import React, { useState } from 'react';
import '../styles/manager.css';

export default function Manager() {
  return (
    <div className="manager-container">
      <header className="page-header">
        <h1>Ward Management</h1>
        <p>Admit patients and monitor ward status in real-time.</p>
      </header>

      <div className="manager-grid">
        {/* Admittance Form */}
        <section className="admission-card">
          <h2>Patient Intake</h2>
          <form className="intake-form">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="e.g. John Doe" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Room #</label>
                <input type="text" placeholder="101" />
              </div>
              <div className="form-group">
                <label>Age</label>
                <input type="number" placeholder="65" />
              </div>
            </div>
            <div className="form-group">
              <label>Initial Condition</label>
              <textarea placeholder="Reason for admission..."></textarea>
            </div>
            <button type="submit" className="admit-btn">Admit to Sentryx</button>
          </form>
        </section>

        {/* Live Directory */}
        <section className="directory-card">
          <h2>Active Ward Directory</h2>
          <div className="patient-list">
            {/* We will map through Convex data here later */}
            <p className="empty-state">No patients currently admitted.</p>
          </div>
        </section>
      </div>
    </div>
  );
}