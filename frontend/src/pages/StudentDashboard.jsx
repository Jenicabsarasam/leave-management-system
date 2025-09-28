// src/pages/StudentDashboard.jsx
import React from "react";
import "../assets/styles/styles.css";
import logo from "../assets/college-1.jpg";

const StudentDashboard = () => {
  const submitLeave = (e) => {
    e.preventDefault();
    const reason = e.target.reason.value;
    const from = e.target.from.value;
    const to = e.target.to.value;
    const type = e.target.leaveType.value;
    alert(`Leave submitted\n${reason}\n${from} → ${to}\nType: ${type}\n(Transport ticket attached if selected)`);
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
          <h3 style={{ marginTop: 0 }}>Current leave (most recent)</h3>

          <div className="leave-status" style={{ marginBottom: "12px" }}>
            <div>
              <strong>Leave: Family function</strong>
              <div className="kv">Dates: 2025-09-10 → 2025-09-12</div>
              <div className="kv">Type: <span className="badge emergency">Emergency</span></div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="kv">Status</div>
              <div className="badge pending" style={{ marginTop: "8px" }}>Pending</div>
            </div>
          </div>

          <h4 style={{ marginBottom: "8px" }}>Apply for a leave</h4>
          <form className="card" onSubmit={submitLeave}>
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
                <option value="emergency">Emergency (fast track)</option>
              </select>
            </div>

            <div style={{ marginTop: "8px" }}>
              <label className="kv">Transport ticket (upload)</label>
              <input name="ticket" type="file" accept="image/*,application/pdf" />
              <div className="kv" style={{ fontSize: "12px" }}>Attach boarding pass / ticket if leaving campus by train/bus/flight</div>
            </div>

            <div style={{ marginTop: "12px" }} className="row">
              <button className="btn btn-primary" type="submit">Submit leave request</button>
              <a className="btn btn-outline" href="/student_history">View history</a>
            </div>
          </form>
        </div>

        <aside>
          <div className="card">
            <h4 style={{ marginTop: 0 }}>Quick stats</h4>
            <div className="kv">Approved this semester: <strong>3</strong></div>
            <div className="kv">Pending: <strong>1</strong></div>
            <div className="kv">Emergency requests: <strong>0</strong></div>
          </div>

          <div className="card" style={{ marginTop: "12px" }}>
            <h4 style={{ marginTop: 0 }}>Next steps</h4>
            <ol style={{ paddingLeft: "18px", color: "var(--muted)" }}>
              <li>Await parent approval (normal requests)</li>
              <li>Advisor review after parent approval</li>
              <li>Warden final decision & QR e-pass on approval</li>
            </ol>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default StudentDashboard;
