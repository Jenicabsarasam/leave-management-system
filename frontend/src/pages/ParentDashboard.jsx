// src/pages/ParentDashboard.jsx
import React, { useState } from "react";
import "../assets/styles/styles.css";
import logo from "../assets/college-1.jpg";

const ParentDashboard = () => {
  const respond = (action) => alert('Parent action: ' + action + '. (Demo only.)');
  const [smsEnabled, setSmsEnabled] = useState(true);

  return (
    <div className="container">
      <header className="header">
        <div className="brand">
          <img src={logo} alt="logo" />
          <h1>Parent Dashboard</h1>
        </div>
        <nav className="nav">
          <a href="/">Home</a>
          <a href="/signin">Sign out</a>
        </nav>
      </header>

      <main className="card">
        <h3 style={{ marginTop: 0 }}>Requests from your ward</h3>

        <table className="table">
          <thead><tr><th>Student</th><th>Dates</th><th>Type</th><th>Action</th></tr></thead>
          <tbody>
            <tr>
              <td>R. Sharma</td>
              <td>2025-09-10 → 2025-09-12</td>
              <td>Emergency</td>
              <td>
                <button className="btn btn-primary" onClick={() => respond('approve')}>Approve</button>
                <button className="btn btn-outline" onClick={() => respond('decline')}>Decline</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: "12px" }} className="card">
          <h4 style={{ marginTop: 0 }}>SMS Authorization</h4>
          <p className="kv">Allow SMS alerts about leave status and arrival confirmation.</p>
          <label>
            <input type="checkbox" checked={smsEnabled} onChange={e => setSmsEnabled(e.target.checked)} /> Enable SMS authorization
          </label>
        </div>

        <div style={{ marginTop: "12px" }} className="card">
          <h4 style={{ marginTop: 0 }}>Arrival verification</h4>
          <p className="kv">On the expected arrival date, you will receive a prompt to confirm the student has reached home safely.</p>
        </div>
      </main>
    </div>
  );
};

export default ParentDashboard;
