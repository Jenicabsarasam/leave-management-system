// src/pages/WardenDashboard.jsx
import React from "react";
import "../assets/styles/styles.css";
import logo from "../assets/college-1.jpg";

const WardenDashboard = () => {
  const decide = (action) => alert('Warden: ' + action + ' (demo).');

  return (
    <div className="container">
      <header className="header">
        <div className="brand">
          <img src={logo} alt="logo" />
          <h1>Warden Dashboard</h1>
        </div>
        <nav className="nav">
          <a href="/">Home</a>
          <a href="/signin">Sign out</a>
        </nav>
      </header>

      <main className="card">
        <h3 style={{ marginTop: 0 }}>Requests needing final decision</h3>

        <table className="table">
          <thead><tr><th>Student</th><th>Dates</th><th>Chain</th><th>Action</th></tr></thead>
          <tbody>
            <tr>
              <td>R. Sharma</td>
              <td>2025-09-10 → 2025-09-12</td>
              <td>Parent ✅ Advisor ✅</td>
              <td>
                <button className="btn btn-primary" onClick={() => decide('accept')}>Accept</button>
                <button className="btn btn-outline" onClick={() => decide('decline')}>Decline</button>
                <button className="btn" style={{ background: "var(--accent)", fontWeight: 800 }} onClick={() => decide('verify')}>Extra verification (meeting)</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: "12px" }} className="card">
          <h4 style={{ marginTop: 0 }}>History</h4>
          <div className="kv">Track all past leaves & scheduled verifications</div>
        </div>
      </main>
    </div>
  );
};

export default WardenDashboard;
