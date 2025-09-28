// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import "../assets/styles/styles.css";
import logo from "../assets/college-1.jpg";
//import api from "../api"; // Make sure api.js is in src/

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    parents: 0,
    advisors: 0,
    totalLeaves: 0,
    emergencyLeaves: 0,
  });

  // Fetch system stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/stats"); // backend endpoint for stats
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching admin stats:", err);
      }
    };
    fetchStats();
  }, []);

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

      <main className="grid-3">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Active users</h3>
          <div className="kv">Students: {stats.students}</div>
          <div className="kv">Parents: {stats.parents}</div>
          <div className="kv">Advisors/Wardens: {stats.advisors}</div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Monthly leaves</h3>
          <div className="kv">Total: {stats.totalLeaves}</div>
          <div className="kv">Emergency: {stats.emergencyLeaves}</div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>System</h3>
          <button className="btn btn-primary" onClick={handleExport}>Export logs</button>
          <button className="btn btn-outline" onClick={handleManageRoles} style={{ marginTop: "8px" }}>Manage roles</button>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
