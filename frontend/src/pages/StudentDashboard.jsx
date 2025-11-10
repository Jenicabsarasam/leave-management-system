// src/pages/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import "../assets/styles/studentDashboard.css";
import logo from "../assets/college-logo.png";
import { applyLeave, getLeaves } from "../api";

const StudentDashboard = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const token = localStorage.getItem("token");

  // Get today's date in YYYY-MM-DD format for date input min attribute
  const today = new Date().toISOString().split('T')[0];

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = await getLeaves(token);
      console.log("Student leaves data:", data); // Debug log
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
    today.setHours(0, 0, 0, 0); // Reset time part for accurate date comparison

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
      type: e.target.leaveType.value
    };

    if (!validateDates(formData.startDate, formData.endDate)) {
      return;
    }

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

  // Filter leaves based on active tab - FIXED STATUS NAMES
  const filteredLeaves = leaves.filter(leave => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return leave.status === "pending" || leave.status === "parent_approved" || leave.status === "advisor_approved" || leave.status === "emergency_pending";
    if (activeTab === "approved") return leave.status === "warden_approved" || leave.status === "completed";
    if (activeTab === "rejected") return leave.status === "rejected";
    return true;
  });

  // Statistics - FIXED STATUS NAMES
  const stats = {
    total: leaves.length,
    approved: leaves.filter(l => l.status === "warden_approved" || l.status === "completed").length,
    pending: leaves.filter(l => l.status === "pending" || l.status === "parent_approved" || l.status === "advisor_approved" || l.status === "emergency_pending").length,
    rejected: leaves.filter(l => l.status === "rejected").length,
    emergency: leaves.filter(l => l.type === "emergency").length
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'warden_approved': return '✅';
      case 'completed': return '🎉';
      case 'pending': return '⏳';
      case 'parent_approved': return '👨‍👩‍👧';
      case 'advisor_approved': return '📚';
      case 'emergency_pending': return '🚨';
      case 'rejected': return '❌';
      default: return '📝';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Pending Parent Approval',
      'parent_approved': 'Approved by Parent',
      'advisor_approved': 'Approved by Advisor',
      'emergency_pending': 'Emergency - Pending Warden',
      'warden_approved': 'Approved by Warden',
      'completed': 'Completed - Safe Return',
      'rejected': 'Rejected'
    };
    return statusMap[status] || status;
  };

  const getTypeIcon = (type) => {
    return type === 'emergency' ? '🚨' : '📋';
  };

  // Format date properly
  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
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
                      min={today}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
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
                      min={startDate || today}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      disabled={!startDate}
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
                  <button 
                    className={`tab-btn ${activeTab === 'rejected' ? 'active' : ''}`}
                    onClick={() => setActiveTab('rejected')}
                  >
                    Rejected ({stats.rejected})
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
                          {getStatusIcon(leave.status)} {getStatusText(leave.status)}
                        </div>
                      </div>
                      
                      <div className="leave-reason">
                        {leave.reason}
                      </div>
                      
                      <div className="leave-dates">
                        <span className="date-range">
                          📅 {formatDate(leave.start_date)} → {formatDate(leave.end_date)}
                        </span>
                        <span className="duration">
                          {leave.start_date && leave.end_date ? (
                            `(${Math.ceil((new Date(leave.end_date) - new Date(leave.start_date)) / (1000 * 60 * 60 * 24)) + 1} days)`
                          ) : ''}
                        </span>
                      </div>

                      <div className="leave-meta">
                        <span className="meta-item">
                          🕒 Applied on: {formatDate(leave.created_at)}
                        </span>
                        
                        {/* Show arrival confirmation if completed */}
                        {leave.arrival_timestamp && (
                          <span className="meta-item arrival">
                            🎉 Return confirmed on: {formatDate(leave.arrival_timestamp)}
                          </span>
                        )}
                        
                        {/* Show warden comments if any */}
                        {leave.warden_comments && (
                          <span className="meta-item comments">
                            💬 Warden Notes: {leave.warden_comments}
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