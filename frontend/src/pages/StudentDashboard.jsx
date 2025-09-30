// src/pages/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import "../assets/styles/studentDashboard.css";
import logo from "../assets/college-logo.png";
import { applyLeave, getLeaves } from "../api";

const StudentDashboard = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
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
      alert(res.msg || "Leave applied successfully!");
      e.target.reset();
      fetchLeaves();
    } catch (err) {
      console.error(err);
      alert("Error applying leave");
    }
  };

  // Filter leaves based on active tab
  const filteredLeaves = leaves.filter(leave => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return leave.status === "pending";
    if (activeTab === "approved") return leave.status === "approved";
    if (activeTab === "rejected") return leave.status === "rejected";
    return true;
  });

  // Statistics
  const stats = {
    total: leaves.length,
    approved: leaves.filter(l => l.status === "approved").length,
    pending: leaves.filter(l => l.status === "pending").length,
    rejected: leaves.filter(l => l.status === "rejected").length,
    emergency: leaves.filter(l => l.type === "emergency").length
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return '✅';
      case 'pending': return '⏳';
      case 'rejected': return '❌';
      default: return '📝';
    }
  };

  const getTypeIcon = (type) => {
    return type === 'emergency' ? '🚨' : '📋';
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
          <a href="/" className="nav-link">🏠 Home</a>
          <a href="/signin" className="nav-link logout">🚪 Sign Out</a>
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
            <div className="stat-icon emergency">🚨</div>
            <div className="stat-info">
              <div className="stat-number">{stats.emergency}</div>
              <div className="stat-label">Emergency</div>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Left Column - Leave Application */}
          <div className="dashboard-column">
            <div className="dashboard-card">
              <div className="card-header">
                <h2>Apply for Leave</h2>
                <div className="card-badge new">New Request</div>
              </div>
              <form onSubmit={handleSubmit} className="leave-form">
                <div className="form-group">
                  <label className="form-label">
                    Leave Reason *
                  </label>
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
                    <label className="form-label">
                      Start Date *
                    </label>
                    <input 
                      name="from" 
                      type="date" 
                      required 
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      End Date *
                    </label>
                    <input 
                      name="to" 
                      type="date" 
                      required 
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Leave Type *
                  </label>
                  <select name="leaveType" className="form-input">
                    <option value="normal">📋 Normal Leave</option>
                    <option value="emergency">🚨 Emergency Leave</option>
                  </select>
                  <div className="form-hint">
                    <strong>Emergency leaves:</strong> Bypass parent and advisor approval for urgent situations. Proof may be required later.
                  </div>
                </div>

                <button className="btn btn-primary btn-large btn-full" type="submit">
                  📨 Submit Leave Request
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Leave History */}
          <div className="dashboard-column">
            <div className="dashboard-card">
              <div className="card-header">
                <h2>Leave History</h2>
                <div className="tabs">
                  <button 
                    className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                  >
                    All ({stats.total})
                  </button>
                  <button 
                    className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                  >
                    Pending ({stats.pending})
                  </button>
                  <button 
                    className={`tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
                    onClick={() => setActiveTab('approved')}
                  >
                    Approved ({stats.approved})
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading your leave requests...</p>
                </div>
              ) : filteredLeaves.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h3>No leave requests</h3>
                  <p>{
                    activeTab === 'all' 
                      ? "You haven't applied for any leaves yet."
                      : `No ${activeTab} leave requests found.`
                  }</p>
                </div>
              ) : (
                <div className="leaves-list">
                  {filteredLeaves.map((leave) => (
                    <div key={leave.id} className="leave-card">
                      <div className="leave-header">
                        <div className="leave-type">
                          <span className={`type-badge ${leave.type}`}>
                            {getTypeIcon(leave.type)} {leave.type === 'emergency' ? 'Emergency' : 'Normal'}
                          </span>
                        </div>
                        <div className={`status-badge ${leave.status}`}>
                          {getStatusIcon(leave.status)} {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </div>
                      </div>
                      
                      <div className="leave-reason">
                        {leave.reason}
                      </div>
                      
                      <div className="leave-dates">
                        <span className="date-range">
                          📅 {leave.startDate} → {leave.endDate}
                        </span>
                        <span className="duration">
                          ({Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1} days)
                        </span>
                      </div>

                      <div className="leave-meta">
                        <span className="meta-item">
                          🕒 Applied on: {new Date(leave.createdAt).toLocaleDateString()}
                        </span>
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