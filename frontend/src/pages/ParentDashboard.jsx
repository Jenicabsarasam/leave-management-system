// src/pages/ParentDashboard.jsx
import React, { useEffect, useState } from "react";
import "../assets/styles/styles.css";
import logo from "../assets/college-1.jpg";
import { getLeaves, parentApprove, confirmArrival } from "../api";

const ParentDashboard = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = await getLeaves(token);
      // Only show leaves where parent action is pending
      const pending = data.leaves?.filter(l => l.status === "pending") || [];
      setLeaves(pending);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleAction = async (leaveId, action) => {
    try {
      const res = await parentApprove(token, leaveId, action);
      alert(res.msg || `Leave ${action}`);
      fetchLeaves();
    } catch (err) {
      console.error(err);
      alert("Error processing request");
    }
  };

  const handleArrival = async (leaveId) => {
    try {
      const res = await confirmArrival(token, leaveId);
      alert(res.msg || "Arrival confirmed");
      fetchLeaves();
    } catch (err) {
      console.error(err);
      alert("Error confirming arrival");
    }
  };

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

        {loading ? (
          <p>Loading requests...</p>
        ) : leaves.length === 0 ? (
          <p>No pending requests.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Dates</th>
                <th>Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(leave => (
                <tr key={leave.id}>
                  <td>{leave.studentName || leave.name || "Student"}</td>
                  <td>{leave.startDate} → {leave.endDate}</td>
                  <td>{leave.type || "Normal"}</td>
                  <td>
                    {leave.status === "pending" && (
                      <>
                        <button className="btn btn-primary" onClick={() => handleAction(leave.id, "approve")}>Approve</button>
                        <button className="btn btn-outline" onClick={() => handleAction(leave.id, "decline")}>Decline</button>
                      </>
                    )}
                    {leave.status === "approved" && (
                      <button className="btn btn-primary" onClick={() => handleArrival(leave.id)}>Confirm Arrival</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{ marginTop: "12px" }} className="card">
          <h4 style={{ marginTop: 0 }}>SMS Authorization</h4>
          <p className="kv">Allow SMS alerts about leave status and arrival confirmation.</p>
          <label>
            <input type="checkbox" checked readOnly /> Enable SMS authorization
          </label>
        </div>
      </main>
    </div>
  );
};

export default ParentDashboard;
