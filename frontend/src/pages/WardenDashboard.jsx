// src/pages/WardenDashboard.jsx
import React, { useEffect, useState } from "react";
import "../assets/styles/styles.css";
import logo from "../assets/college-1.jpg";
import { wardenApprove, getLeaves } from "../api";

const WardenDashboard = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = await getLeaves(token); 
      // Show leaves that have parent & advisor approved but pending warden decision
      const pendingLeaves = (data.leaves || []).filter(
        l => l.status === "advisorApproved" || l.status === "pendingWarden"
      );
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
      const res = await wardenApprove(token, leaveId, action);
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
          <h1>Warden Dashboard</h1>
        </div>
        <nav className="nav">
          <a href="/">Home</a>
          <a href="/signin">Sign out</a>
        </nav>
      </header>

      <main className="card">
        <h3 style={{ marginTop: 0 }}>Requests needing final decision</h3>

        {loading ? (
          <p>Loading requests...</p>
        ) : leaves.length === 0 ? (
          <p>No pending requests for your review.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Dates</th>
                <th>Chain</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave.id}>
                  <td>{leave.studentName || leave.studentId}</td>
                  <td>{leave.startDate} → {leave.endDate}</td>
                  <td>
                    Parent {leave.parentApproved ? "✅" : "❌"} | 
                    Advisor {leave.advisorApproved ? "✅" : "❌"}
                  </td>
                  <td>
                    <button className="btn btn-primary" onClick={() => handleDecision(leave.id, "accept")}>Accept</button>
                    <button className="btn btn-outline" onClick={() => handleDecision(leave.id, "decline")}>Decline</button>
                    <button className="btn" style={{ background: "var(--accent)", fontWeight: 800 }} onClick={() => handleDecision(leave.id, "verify")}>Extra verification</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{ marginTop: "12px" }} className="card">
          <h4 style={{ marginTop: 0 }}>History</h4>
          <div className="kv">Track all past leaves & scheduled verifications</div>
        </div>
      </main>
    </div>
  );
};

export default WardenDashboard;
