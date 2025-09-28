// src/pages/AdvisorDashboard.jsx
import React from "react";
import "../assets/styles/styles.css";
import logo from "../assets/college-1.jpg";

const AdvisorDashboard = () => {
  const decide = (action, student) => {
    if(action==='accept') alert('Accepted leave for ' + student);
    else alert('Rejected leave for ' + student);
  };

  return (
    <div className="container">
      <header className="header">
        <div className="brand">
          <img src={logo} alt="logo" />
          <h1>Advisor Dashboard</h1>
        </div>
        <nav className="nav">
          <a href="/">Home</a>
          <a href="/signin">Sign out</a>
        </nav>
      </header>

      <main className="card">
        <h3 style={{ marginTop: 0 }}>Pending requests (awaiting your review)</h3>

        <table className="table">
          <thead>
            <tr><th>Student</th><th>Dates</th><th>Type</th><th>Parent status</th><th>Action</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>R. Sharma</td>
              <td>2025-09-10 → 2025-09-12</td>
              <td>Emergency</td>
              <td>Approved</td>
              <td>
                <button className="btn btn-primary" onClick={() => decide('accept','R. Sharma')}>Accept</button>
                <button className="btn btn-outline" onClick={() => decide('reject','R. Sharma')}>Reject</button>
              </td>
            </tr>
            <tr>
              <td>A. Kumar</td>
              <td>2025-09-20 → 2025-09-22</td>
              <td>Normal</td>
              <td>Pending</td>
              <td>
                <button className="btn btn-primary" onClick={() => decide('accept','A. Kumar')}>Accept</button>
                <button className="btn btn-outline" onClick={() => decide('reject','A. Kumar')}>Reject</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: "14px" }} className="card">
          <h4 style={{ marginTop: 0 }}>Notifications</h4>
          <div className="kv">Emergency request: R. Sharma — check now.</div>
        </div>

        <div style={{ marginTop: "14px" }} className="card">
          <h4 style={{ marginTop: 0 }}>History & monthly summary</h4>
          <div className="kv">Total leaves this month: <strong>23</strong></div>
          <div className="kv">Normal: 18 | Emergency: 5</div>
          <a className="btn btn-outline" href="/advisor_history" style={{ marginTop: "8px", display: "inline-block" }}>View full history</a>
        </div>
      </main>
    </div>
  );
};

export default AdvisorDashboard;
