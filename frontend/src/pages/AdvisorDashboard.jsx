// src/pages/AdvisorDashboard.jsx
import React, { useEffect, useState } from "react";
import "../assets/styles/styles.css";
import logo from "../assets/college-1.jpg";
import { advisorReview, getLeaves } from "../api";

const AdvisorDashboard = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = await getLeaves(token); // You might filter server-side for advisor role
      const pendingLeaves = (data.leaves || []).filter(l => l.status === "pending"); 
      setLeaves(pendingLeaves);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleDecision = async (leaveId, action) => {
    try {
      const res = await advisorReview(token, leaveId, action);
      alert(res.msg || `Leave ${action}`);
      fetchLeaves();
    } catch (err) {
      console.error(err);
      alert("Error processing request");
    }
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

        {loading ? (
          <p>Loading pending leaves...</p>
        ) : leaves.length === 0 ? (
          <p>No pending requests.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Dates</th>
                <th>Type</th>
                <th>Parent status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave.id}>
                  <td>{leave.studentName || leave.studentId}</td>
                  <td>{leave.startDate} → {leave.endDate}</td>
                  <td>{leave.type.charAt(0).toUpperCase() + leave.type.slice(1)}</td>
                  <td>{leave.parentApproved ? "Approved" : "Pending"}</td>
                  <td>
                    <button className="btn btn-primary" onClick={() => handleDecision(leave.id, "accept")}>Accept</button>
                    <button className="btn btn-outline" onClick={() => handleDecision(leave.id, "reject")}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{ marginTop: "14px" }} className="card">
          <h4 style={{ marginTop: 0 }}>History & monthly summary</h4>
          <div className="kv">Total leaves this month: <strong>{leaves.length}</strong></div>
          <div className="kv">Normal: {leaves.filter(l => l.type === "normal").length} | Emergency: {leaves.filter(l => l.type === "emergency").length}</div>
        </div>
      </main>
    </div>
  );
};

export default AdvisorDashboard;
