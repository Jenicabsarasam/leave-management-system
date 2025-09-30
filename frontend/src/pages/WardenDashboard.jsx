// src/pages/WardenDashboard.jsx
import React, { useEffect, useState } from "react";
import "../assets/styles/wardenDashboard.css";
import logo from "../assets/college-logo.png";
import { wardenApprove, wardenEmergencyApprove, getLeaves } from "../api";

const WardenDashboard = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proofComments, setProofComments] = useState({});
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [meetingDate, setMeetingDate] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const token = localStorage.getItem("token");

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = await getLeaves(token);
      console.log("Warden leaves data:", data);
      
      // Show leaves that need warden approval
      const wardenLeaves = (data.leaves || []).filter(l => 
        l.status === "advisor_approved" || 
        l.status === "parent_approved" || 
        l.status === "emergency_pending" ||
        l.status === "proof_requested" ||
        l.status === "meeting_scheduled"
      );
      setLeaves(wardenLeaves);
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
      console.log('🔄 Warden action:', { leaveId, action });
      
      let res;
      const leave = leaves.find(l => l.id === leaveId);
      
      if (!leave) {
        alert('Leave not found');
        return;
      }

      if (leave.type === 'emergency') {
        console.log('🚨 Processing emergency leave');
        let comments = proofComments[leaveId];
        
        // For meeting scheduling, include meeting date
        if (action === "schedule_meeting") {
          if (!meetingDate) {
            alert("Please select meeting date and time");
            return;
          }
          comments = comments ? `${comments} | Meeting: ${meetingDate}` : `Meeting scheduled: ${meetingDate}`;
        }
        
        res = await wardenEmergencyApprove(token, leaveId, action, comments, meetingDate);
      } else {
        console.log('📝 Processing normal leave');
        res = await wardenApprove(token, leaveId, action);
      }
      
      console.log('✅ Warden action successful:', res);
      alert(res.msg || `Leave ${action === "schedule_meeting" ? "meeting scheduled" : action + "d"}`);
      
      // Clear states
      setProofComments(prev => ({ ...prev, [leaveId]: '' }));
      setSelectedLeaveId(null);
      setActionType(null);
      setMeetingDate("");
      
      // Refresh the leaves list
      fetchLeaves();
    } catch (err) {
      console.error('❌ Warden action failed:', err);
      alert(err.message || "Error processing request");
    }
  };

  const handleProofCommentChange = (leaveId, comment) => {
    setProofComments(prev => ({
      ...prev,
      [leaveId]: comment
    }));
  };

  // Filter leaves based on active tab
  const filteredLeaves = leaves.filter(leave => {
    if (activeTab === "all") return true;
    if (activeTab === "normal") return leave.type === "normal";
    if (activeTab === "emergency") return leave.type === "emergency";
    if (activeTab === "meetings") return leave.status === "meeting_scheduled";
    return true;
  });

  // Statistics
  const stats = {
    total: leaves.length,
    normal: leaves.filter(l => l.type === "normal").length,
    emergency: leaves.filter(l => l.type === "emergency").length,
    emergencyPending: leaves.filter(l => l.status === "emergency_pending").length,
    meetings: leaves.filter(l => l.status === "meeting_scheduled").length,
    advisorApproved: leaves.filter(l => l.status === "advisor_approved").length,
    parentApproved: leaves.filter(l => l.status === "parent_approved").length
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'parent_approved': return '👨‍👩‍👧';
      case 'advisor_approved': return '📚';
      case 'emergency_pending': return '🚨';
      case 'meeting_scheduled': return '📅';
      case 'proof_requested': return '🔍';
      default: return '📝';
    }
  };

  const getTypeIcon = (type) => {
    return type === 'emergency' ? '🚨' : '📋';
  };

  const getStatusBadge = (status, type) => {
    const statusMap = {
      pending: "Pending Parent Approval",
      parent_approved: "Approved by Parent",
      advisor_approved: "Approved by Advisor - Ready for Review",
      emergency_pending: "EMERGENCY - Needs Immediate Action",
      proof_requested: "Proof Requested - Waiting for Student",
      meeting_scheduled: "Meeting Scheduled",
      warden_approved: "Approved by Warden",
      rejected: "Rejected",
      completed: "Completed"
    };
    return statusMap[status] || status;
  };

  const isEmergencyLeave = (leave) => leave.type === 'emergency';

  const handleEmergencyDecision = (leaveId, action) => {
    if (action === "schedule_meeting") {
      setSelectedLeaveId(leaveId);
      setActionType('schedule_meeting');
    } else {
      handleDecision(leaveId, action);
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
            <h1>Warden Dashboard</h1>
            <p>Hostel leave management and student safety oversight</p>
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
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Pending</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🚨</div>
            <div className="stat-info">
              <div className="stat-number">{stats.emergency}</div>
              <div className="stat-label">Emergency</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-info">
              <div className="stat-number">{stats.normal}</div>
              <div className="stat-label">Normal</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <div className="stat-number">{stats.meetings}</div>
              <div className="stat-label">Meetings</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            📋 All Leaves ({stats.total})
          </button>
          <button 
            className={`tab-btn ${activeTab === "normal" ? "active" : ""}`}
            onClick={() => setActiveTab("normal")}
          >
            📝 Normal ({stats.normal})
          </button>
          <button 
            className={`tab-btn ${activeTab === "emergency" ? "active" : ""}`}
            onClick={() => setActiveTab("emergency")}
          >
            🚨 Emergency ({stats.emergency})
          </button>
          <button 
            className={`tab-btn ${activeTab === "meetings" ? "active" : ""}`}
            onClick={() => setActiveTab("meetings")}
          >
            📅 Meetings ({stats.meetings})
          </button>
        </div>

        <div className="dashboard-grid">
          {/* Left Column - Leave Requests */}
          <div className="dashboard-column">
            <div className="dashboard-card">
              <div className="card-header">
                <h2>Leave Requests Awaiting Approval</h2>
                <div className="card-badge pending">{stats.total} Pending</div>
              </div>

              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading pending leaves...</p>
                </div>
              ) : filteredLeaves.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">✅</div>
                  <h3>All caught up!</h3>
                  <p>No leave requests pending your approval.</p>
                </div>
              ) : (
                <div className="leaves-list">
                  {filteredLeaves.map(leave => (
                    <div key={leave.id} className={`leave-card ${isEmergencyLeave(leave) ? 'emergency' : 'normal'}`}>
                      <div className="leave-header">
                        <div className="student-info">
                          <div className="student-name">
                            👤 {leave.student_name}
                          </div>
                          <div className="student-details">
                            Roll No: {leave.student_rollno} • {leave.branch_name} - Division {leave.student_division}
                          </div>
                          <div className="student-hostel">
                            🏠 {leave.hostel_name}
                          </div>
                        </div>
                        <div className="leave-type-status">
                          <span className={`type-badge ${leave.type}`}>
                            {getTypeIcon(leave.type)} {leave.type === 'emergency' ? 'Emergency' : 'Normal'}
                          </span>
                          <span className={`status-badge ${leave.status}`}>
                            {getStatusIcon(leave.status)} {getStatusBadge(leave.status, leave.type)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="leave-reason">
                        {leave.reason}
                      </div>
                      
                      <div className="leave-dates">
                        <span className="date-range">
                          📅 {new Date(leave.start_date).toLocaleDateString()} → {new Date(leave.end_date).toLocaleDateString()}
                        </span>
                        <span className="duration">
                          ({Math.ceil((new Date(leave.end_date) - new Date(leave.start_date)) / (1000 * 60 * 60 * 24)) + 1} days)
                        </span>
                      </div>

                      {/* Additional Information */}
                      <div className="leave-meta">
                        <span className="meta-item">
                          🕒 Applied: {new Date(leave.created_at).toLocaleDateString()}
                        </span>
                        
                        {/* Show meeting details if scheduled */}
                        {leave.meeting_scheduled && leave.meeting_date && (
                          <span className="meta-item meeting">
                            📅 Meeting: {new Date(leave.meeting_date).toLocaleString()}
                          </span>
                        )}
                        
                        {/* Show warden comments if any */}
                        {leave.warden_comments && (
                          <span className="meta-item comments">
                            💬 Your Notes: {leave.warden_comments}
                          </span>
                        )}
                        
                        {/* Show approval chain for normal leaves */}
                        {!isEmergencyLeave(leave) && (
                          <>
                            <span className="meta-item parent">
                              👨‍👩‍👧 Parent: {leave.parent_name || "Pending"}
                            </span>
                            <span className="meta-item advisor">
                              📚 Advisor: {leave.advisor_name || "Pending"}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="leave-actions">
                        {isEmergencyLeave(leave) ? (
                          <div className="emergency-actions">
                            <div className="action-section">
                              <div className="action-prompt emergency-prompt">
                                🚨 Emergency Leave - Requires Immediate Action
                              </div>
                              
                              <div className="comment-section">
                                <label className="form-label">Additional Comments (Optional)</label>
                                <textarea
                                  placeholder="Add meeting notes, verification comments, or special instructions..."
                                  value={proofComments[leave.id] || ''}
                                  onChange={(e) => handleProofCommentChange(leave.id, e.target.value)}
                                  className="form-input"
                                  rows="3"
                                />
                              </div>
                              
                              {/* Schedule Meeting Section */}
                              {actionType === 'schedule_meeting' && leave.id === selectedLeaveId && (
                                <div className="meeting-scheduler">
                                  <label className="form-label">Schedule Meeting Date & Time</label>
                                  <input
                                    type="datetime-local"
                                    value={meetingDate}
                                    onChange={(e) => setMeetingDate(e.target.value)}
                                    className="form-input"
                                  />
                                </div>
                              )}
                              
                              <div className="action-buttons emergency-buttons">
                                <button 
                                  className="btn btn-success" 
                                  onClick={() => handleEmergencyDecision(leave.id, "approve")}
                                >
                                  ✅ Approve Emergency
                                </button>
                                
                                <button 
                                  className="btn btn-primary" 
                                  onClick={() => handleEmergencyDecision(leave.id, "schedule_meeting")}
                                >
                                  📅 Schedule Meeting
                                </button>
                                
                                <button 
                                  className="btn btn-danger" 
                                  onClick={() => handleEmergencyDecision(leave.id, "reject")}
                                >
                                  ❌ Reject Emergency
                                </button>
                              </div>
                              
                              {/* Confirm Meeting Button */}
                              {actionType === 'schedule_meeting' && leave.id === selectedLeaveId && meetingDate && (
                                <button 
                                  className="btn btn-primary btn-full" 
                                  onClick={() => handleDecision(leave.id, "schedule_meeting")}
                                >
                                  ✅ Confirm Meeting Schedule
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          // Normal leave actions
                          (leave.status === "advisor_approved" || leave.status === "parent_approved") && (
                            <div className="normal-actions">
                              <div className="action-section">
                                <div className="action-prompt">Hostel Leave Approval Required:</div>
                                <div className="action-buttons">
                                  <button 
                                    className="btn btn-success" 
                                    onClick={() => handleDecision(leave.id, "approve")}
                                  >
                                    ✅ Grant Hostel Leave
                                  </button>
                                  <button 
                                    className="btn btn-danger" 
                                    onClick={() => handleDecision(leave.id, "reject")}
                                  >
                                    ❌ Deny Leave
                                  </button>
                                  <button 
                                    className="btn btn-outline" 
                                    onClick={() => handleDecision(leave.id, "verify")}
                                  >
                                    🔍 Verify Details
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Summary & Quick Actions */}
          <div className="dashboard-column">
            <div className="dashboard-card">
              <div className="card-header">
                <h3>Quick Summary</h3>
              </div>
              <div className="summary-stats">
                <div className="summary-item">
                  <div className="summary-label">Normal Leaves</div>
                  <div className="summary-value">{stats.normal}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Emergency Leaves</div>
                  <div className="summary-value emergency">{stats.emergency}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Emergency Pending</div>
                  <div className="summary-value emergency-pending">{stats.emergencyPending}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Meetings Scheduled</div>
                  <div className="summary-value meetings">{stats.meetings}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Advisor Approved</div>
                  <div className="summary-value advisor">{stats.advisorApproved}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Parent Approved</div>
                  <div className="summary-value parent">{stats.parentApproved}</div>
                </div>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-header">
                <h3>🚨 Emergency Protocol</h3>
              </div>
              <div className="protocol-steps">
                <div className="protocol-step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <strong>Immediate Review</strong>
                    <p>Emergency leaves bypass normal approval chain</p>
                  </div>
                </div>
                <div className="protocol-step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <strong>Safety First</strong>
                    <p>Verify student safety and urgency</p>
                  </div>
                </div>
                <div className="protocol-step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <strong>Meeting Option</strong>
                    <p>Schedule meeting for complex cases</p>
                  </div>
                </div>
                <div className="protocol-step">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <strong>Documentation</strong>
                    <p>Add comments for record keeping</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-header">
                <h3>📞 Quick Contacts</h3>
              </div>
              <div className="quick-contacts">
                <div className="contact-item">
                  <div className="contact-icon">🏥</div>
                  <div className="contact-info">
                    <strong>Medical Emergency</strong>
                    <div>College Hospital: 1234567890</div>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon">🚓</div>
                  <div className="contact-info">
                    <strong>Security</strong>
                    <div>Campus Security: 0987654321</div>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon">👨‍⚕️</div>
                  <div className="contact-info">
                    <strong>Counsellor</strong>
                    <div>Student Support: 1122334455</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WardenDashboard;