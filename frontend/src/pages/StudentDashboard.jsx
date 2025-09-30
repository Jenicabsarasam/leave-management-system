// src/pages/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import "../assets/styles/styles.css";
import logo from "../assets/college-1.jpg";
import { applyLeave, getLeaves } from "../api";


const StudentDashboard = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = await getLeaves(token);
      setLeaves(data.leaves || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const leaveData = {
      reason: e.target.reason.value,
      startDate: e.target.from.value,
      endDate: e.target.to.value,
      type: e.target.leaveType.value
    };

    try {
      const res = await applyLeave(token, leaveData);
      alert(res.msg || "Leave applied");
      e.target.reset();
      fetchLeaves();
    } catch (err) {
      console.error(err);
      alert("Error applying leave");
    }
  };

  return (
    <div className="container">
      <header className="header">
        <div className="brand">
          <img src={logo} alt="logo" />
          <h1>Student Dashboard</h1>
        </div>
        <nav className="nav">
          <a href="/">Home</a>
          <a href="/signin">Sign out</a>
        </nav>
      </header>

      <section className="grid-2 card">
        <div>
          <h3 style={{ marginTop: 0 }}>Current / Recent Leaves</h3>
          {loading ? (
            <p>Loading leaves...</p>
          ) : leaves.length === 0 ? (
            <p>No leave history.</p>
          ) : (
            leaves.map((leave) => (
              <div key={leave.id} className="leave-status" style={{ marginBottom: "12px" }}>
                <div>
                  <strong>Leave: {leave.reason}</strong>
                  <div className="kv">Dates: {leave.startDate} → {leave.endDate}</div>
                  <div className="kv">Type: <span className="badge">{leave.type === "emergency" ? "Emergency" : "Normal"}</span></div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="kv">Status</div>
                  <div className={`badge ${leave.status}`.toLowerCase()} style={{ marginTop: "8px" }}>
                    {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                  </div>
                </div>
              </div>
            ))
          )}

          <h4 style={{ marginBottom: "8px" }}>Apply for a leave</h4>
          <form className="card" onSubmit={handleSubmit}>
            <label className="kv">Leave reason</label>
            <input name="reason" type="text" required placeholder="Reason for leave" />

            <div className="form-row" style={{ marginTop: "8px" }}>
              <div style={{ flex: 1 }}>
                <label className="kv">From</label>
                <input name="from" type="date" required />
              </div>
              <div style={{ flex: 1 }}>
                <label className="kv">To</label>
                <input name="to" type="date" required />
              </div>
            </div>

            <div style={{ marginTop: "8px" }}>
              <label className="kv">Leave type</label>
              <select name="leaveType">
                <option value="normal">Normal</option>
                <option value="emergency">🚨 Emergency (Direct warden approval)</option>
              </select>
              <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
                Emergency leaves bypass parent and advisor approval for urgent situations.
                You may be asked to provide proof later.
              </div>
            </div>
            <div style={{ marginTop: "12px" }} className="row">
              <button className="btn btn-primary" type="submit">Submit leave request</button>
            </div>
          </form>
        </div>

        <aside>
          <div className="card">
            <h4 style={{ marginTop: 0 }}>Quick stats</h4>
            <div className="kv">Approved this semester: <strong>{leaves.filter(l => l.status==="approved").length}</strong></div>
            <div className="kv">Pending: <strong>{leaves.filter(l => l.status==="pending").length}</strong></div>
            <div className="kv">Emergency requests: <strong>{leaves.filter(l => l.type==="emergency").length}</strong></div>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default StudentDashboard;
