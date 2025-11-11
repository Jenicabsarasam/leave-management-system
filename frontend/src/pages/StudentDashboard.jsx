// src/pages/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import "../assets/styles/studentDashboard.css";
import logo from "../assets/college-logo.png";
import { applyLeave, getLeaves } from "../api";
import QRCode from "react-qr-code";

const StudentDashboard = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const token = localStorage.getItem("token");

  const today = new Date().toISOString().split("T")[0];

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

  const validateDates = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      alert("Cannot select past dates for leave request");
      return false;
    }
    if (endDate < startDate) {
      alert("End date must be after or equal to start date");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      reason: e.target.reason.value,
      startDate: e.target.from.value,
      endDate: e.target.to.value,
      type: e.target.leaveType.value,
    };

    if (!validateDates(formData.startDate, formData.endDate)) return;

    try {
      const res = await applyLeave(token, formData);
      alert(res.msg || "Leave applied successfully!");
      e.target.reset();
      setStartDate("");
      setEndDate("");
      fetchLeaves();
    } catch (err) {
      console.error(err);
      alert("Error applying leave");
    }
  };

  const filteredLeaves = leaves.filter((leave) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending")
      return (
        leave.status === "pending" ||
        leave.status === "parent_approved" ||
        leave.status === "advisor_approved" ||
        leave.status === "emergency_pending"
      );
    if (activeTab === "approved")
      return leave.status === "warden_approved" || leave.status === "completed";
    if (activeTab === "rejected") return leave.status === "rejected";
    return true;
  });

  const stats = {
    total: leaves.length,
    approved: leaves.filter(
      (l) => l.status === "warden_approved" || l.status === "completed"
    ).length,
    pending: leaves.filter(
      (l) =>
        l.status === "pending" ||
        l.status === "parent_approved" ||
        l.status === "advisor_approved" ||
        l.status === "emergency_pending"
    ).length,
    rejected: leaves.filter((l) => l.status === "rejected").length,
    emergency: leaves.filter((l) => l.type === "emergency").length,
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Invalid Date";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <div className="logo-container">
            <img src={logo} alt="College Logo" />
          </div>
          <div className="dashboard-title">
            <h1>Student Dashboard</h1>
            <p>Manage your leave requests and track approvals</p>
          </div>
        </div>
        <nav className="dashboard-nav">
          <a href="/" className="nav-link">
            🏠 Home
          </a>
          <a href="/signin" className="nav-link logout">
            🚪 Sign Out
          </a>
        </nav>
      </header>

      <div className="dashboard-content">
        {/* Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">📊</div>
            <div className="stat-info">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Requests</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon approved">✅</div>
            <div className="stat-info">
              <div className="stat-number">{stats.approved}</div>
              <div className="stat-label">Approved</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending">⏳</div>
            <div className="stat-info">
              <div className="stat-number">{stats.pending}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon used">🚨</div>
            <div className="stat-info">
              <div className="stat-number">{stats.emergency}</div>
              <div className="stat-label">Emergency</div>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Left column - Apply Leave */}
          <div className="dashboard-column">
            <div className="dashboard-card">
              <div className="card-header">
                <h2>Apply for Leave</h2>
                <div className="card-badge new">New Request</div>
              </div>

              <form onSubmit={handleSubmit} className="leave-form">
                <div className="form-group">
                  <label>Leave Reason *</label>
                  <input
                    name="reason"
                    type="text"
                    required
                    placeholder="Brief reason for your leave..."
                    className="form-input"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date *</label>
                    <input
                      name="from"
                      type="date"
                      required
                      className="form-input"
                      min={today}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date *</label>
                    <input
                      name="to"
                      type="date"
                      required
                      className="form-input"
                      min={startDate || today}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      disabled={!startDate}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Leave Type *</label>
                  <select name="leaveType" className="form-input">
                    <option value="normal">📋 Normal Leave</option>
                    <option value="emergency">🚨 Emergency Leave</option>
                  </select>
                </div>

                <button className="btn btn-primary btn-full" type="submit">
                  📨 Submit Request
                </button>
              </form>
            </div>
          </div>

          {/* Right column - Leave History */}
          <div className="dashboard-column">
            <div className="dashboard-card">
              <div className="card-header">
                <h2>Leave History</h2>
              </div>

              {loading ? (
                <div className="loading-state">
                  <p>Loading...</p>
                </div>
              ) : filteredLeaves.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h3>No leave requests</h3>
                </div>
              ) : (
                <div className="leaves-list">
                  {filteredLeaves.map((leave) => (
                    <div key={leave.id} className="leave-card">
                      <div className="leave-header">
                        <div>
                          <p>
                            🏷 <strong>Leave Type:</strong>{" "}
                            {leave.type === "emergency" ? "Emergency" : "Normal"}
                          </p>
                          <p>
                            📝 <strong>Reason:</strong> {leave.reason}
                          </p>
                          <p>
                            📅 <strong>Period:</strong> {formatDate(leave.start_date)} →{" "}
                            {formatDate(leave.end_date)}
                          </p>
                          {/* Show Meeting Info if Scheduled */}
                          {leave.meeting_scheduled && leave.meeting_date && (
                            <p style={{ color: "#007bff", marginTop: "4px" }}>
                              📅 <strong>Meeting:</strong>{" "}
                              {new Date(leave.meeting_date).toLocaleString()}
                            </p>
                          )}

                          {/* Show Warden Comments if Any */}
                          {leave.warden_comments && (
                            <p style={{ fontStyle: "italic", color: "#6c757d", marginTop: "2px" }}>
                              🗣️ <strong>Warden:</strong> {leave.warden_comments}
                            </p>
                          )}

                        </div>

                        {/* QR Code if Approved by Warden */}
                        {leave.status === "warden_approved" && (
                          <div className="qr-section">
                            <QRCode
                              value={JSON.stringify({
                                studentName: leave.student_name || "Unknown",
                                division: leave.division || "N/A",
                                hostel: leave.hostel_name || "N/A",
                                startDate: leave.start_date,
                                endDate: leave.end_date,
                                status: "Approved by Warden",
                              })}
                              size={80}
                            />
                            <p style={{ fontSize: "0.8rem", color: "#666" }}>
                              📱 Scan for details
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Status & Pending Info */}
                      <div className="leave-meta">
                        {leave.status === "warden_approved" ? (
                          <span className="status-badge warden_approved">
                            ✅ Approved by Warden
                          </span>
                        ) : leave.status === "advisor_approved" ? (
                          <span className="status-badge advisor_approved">
                            📚 Approved by Advisor
                          </span>
                        ) : leave.status === "parent_approved" ? (
                          <span className="status-badge parent_approved">
                            👨‍👩‍👧 Approved by Parent
                          </span>
                        ) : leave.status === "rejected" ? (
                          <span className="status-badge rejected">
                            ❌ Rejected
                          </span>
                        ) : (
                          <span className="status-badge pending">
                            ⏳ Pending
                          </span>
                        )}

                        {/* Pending with */}
                        {["pending", "parent_approved", "advisor_approved"].includes(
                          leave.status
                        ) && (
                          <span className="meta-item">
                            ⏰ Pending With:{" "}
                            {leave.status === "pending"
                              ? "Parent 👨‍👩‍👧"
                              : leave.status === "parent_approved"
                              ? "Advisor 📚"
                              : "Warden 🏢"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;