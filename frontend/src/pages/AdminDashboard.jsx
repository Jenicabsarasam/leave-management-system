// src/pages/AdminDashboard.jsx
import React from "react";
import "../assets/styles/styles.css";
import logo from "../assets/college-1.jpg";

const AdminDashboard = () => {
  const handleExport = () => alert("Demo: export logs");
  const handleManageRoles = () => alert("Demo: manage roles");

  return (
    <div className="container">
      <header className="header">
        <div className="brand">
          <img src={logo} alt="logo" />
          <h1>Admin Console</h1>
        </div>
        <nav className="nav">
          <a href="/">Home</a>
          <a href="/signin">Sign out</a>
        </nav>
      </header>

      <main className="card">
        <h3 style={{ marginTop: 0 }}>System control & overview</h3>

        <div className="grid-3">
          <div className="card">
            <h4 style={{ marginTop: 0 }}>Active users</h4>
            <div className="kv">Students: 1200</div>
            <div className="kv">Parents: 1100</div>
            <div className="kv">Advisors/Wardens: 40</div>
          </div>

          <div className="card">
            <h4 style={{ marginTop: 0 }}>Monthly leaves</h4>
            <div className="kv">Total: 240 | Emergency: 18</div>
          </div>

          <div className="card">
            <h4 style={{ marginTop: 0 }}>System</h4>
            <button className="btn btn-primary" onClick={handleExport}>Export logs</button>
            <button className="btn btn-outline" onClick={handleManageRoles}>Manage roles</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
