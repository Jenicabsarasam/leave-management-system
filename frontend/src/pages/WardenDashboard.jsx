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
  const [activeTab, setActiveTab] = useState("pending");
  const token = localStorage.getItem("token");

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = await getLeaves(token);
      console.log("Warden leaves data:", data);
      
      // Show ALL leaves from backend (both pending and history)
      setLeaves(data.leaves || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLeaves, 30000);
    
    return () => clearInterval(interval);
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

  // Filter leaves based on active tab - FIXED LOGIC
  const filteredLeaves = leaves.filter(leave => {
    if (activeTab === "pending") {
      // Show only leaves that need warden action
      return leave.status === "advisor_approved" || 
             leave.status === "parent_approved" || 
             leave.status === "emergency_pending" ||
             leave.status === "proof_requested" ||
             leave.status === "meeting_scheduled";
    }
    if (activeTab === "history") {
      // Show ALL processed leaves (any leave that has been acted upon by warden OR is completed)
      return leave.warden_id !== null || // Any leave processed by warden
             leave.status === "completed" || // Completed leaves
             leave.status === "rejected" || // Rejected leaves
             leave.status === "warden_approved"; // Approved leaves
    }
    if (activeTab === "emergency") {
      // Show ALL emergency type leaves (both pending and processed)
      return leave.type === "emergency";
    }
    if (activeTab === "normal") {
      // Show ALL normal type leaves (both pending and processed)
      return leave.type === "normal";
    }
    return true;
  });

  // Enhanced Statistics - Focus on actionable items
  const pendingLeaves = leaves.filter(l => 
    l.status === "advisor_approved" || 
    l.status === "parent_approved" || 
    l.status === "emergency_pending" ||
    l.status === "proof_requested" ||
    l.status === "meeting_scheduled"
  );

  const processedLeaves = leaves.filter(l => 
    l.warden_id !== null || l.status === "completed" || l.status === "rejected" || l.status === "warden_approved"
  );

  const stats = {
    pending: pendingLeaves.length,
    emergencyPending: pendingLeaves.filter(l => l.type === "emergency").length,
    normalPending: pendingLeaves.filter(l => l.type === "normal").length,
    meetingsScheduled: pendingLeaves.filter(l => l.status === "meeting_scheduled").length,
    
    // History stats
    totalProcessed: processedLeaves.length,
    totalApproved: leaves.filter(l => l.status === "warden_approved").length,
    totalRejected: leaves.filter(l => l.status === "rejected").length,
    completed: leaves.filter(l => l.status === "completed").length,
    awaitingArrival: leaves.filter(l => l.status === "warden_approved" && !l.arrival_timestamp).length,
    safeArrival: leaves.filter(l => l.arrival_timestamp).length,
    
    // Type-based counts for tabs
    totalEmergency: leaves.filter(l => l.type === "emergency").length,
    totalNormal: leaves.filter(l => l.type === "normal").length
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'parent_approved': return '👨‍👩‍👧';
      case 'advisor_approved': return '📚';
      case 'emergency_pending': return '🚨';
      case 'meeting_scheduled': return '📅';
      case 'proof_requested': return '🔍';
      case 'warden_approved': return '✅';
      case 'rejected': return '❌';
      case 'completed': return '🎉';
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
      completed: "Completed - Safe Arrival Confirmed"
    };
    return statusMap[status] || status;
  };

  const isEmergencyLeave = (leave) => leave.type === 'emergency';
  const isPendingLeave = (leave) => {
    return leave.status === "advisor_approved" || 
           leave.status === "parent_approved" || 
           leave.status === "emergency_pending" ||
           leave.status === "proof_requested" ||
           leave.status === "meeting_scheduled";
  };

  const isProcessedLeave = (leave) => {
    return leave.warden_id !== null || 
           leave.status === "completed" || 
           leave.status === "rejected" || 
           leave.status === "warden_approved";
  };

  const handleEmergencyDecision = (leaveId, action) => {
    if (action === "schedule_meeting") {
      setSelectedLeaveId(leaveId);
      setActionType('schedule_meeting');
    } else {
      handleDecision(leaveId, action);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not confirmed';
    return new Date(dateString).toLocaleString();
  };

  const getArrivalStatus = (leave) => {
    if (leave.status !== 'warden_approved' && leave.status !== 'completed') return null;
    
    if (leave.arrival_timestamp) {
      return { status: 'confirmed', text: `✅ Safe arrival confirmed on ${formatDateTime(leave.arrival_timestamp)}` };
    } else {
      return { status: 'pending', text: '⏳ Waiting for parent to confirm safe arrival' };
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
        {/* Simplified Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card priority">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <div className="stat-number">{stats.pending}</div>
              <div className="stat-label">Pending Action</div>
            </div>
          </div>
          <div className="stat-card emergency">
            <div className="stat-icon">🚨</div>
            <div className="stat-info">
              <div className="stat-number">{stats.emergencyPending}</div>
              <div className="stat-label">Emergency Pending</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <div className="stat-number">{stats.meetingsScheduled}</div>
              <div className="stat-label">Meetings</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <div className="stat-number">{stats.totalApproved}</div>
              <div className="stat-label">Total Approved</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎉</div>
            <div className="stat-info">
              <div className="stat-number">{stats.safeArrival}</div>
              <div className="stat-label">Safe Arrivals</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <div className="stat-number">{stats.awaitingArrival}</div>
              <div className="stat-label">Awaiting Arrival</div>
            </div>
          </div>
        </div>

        {/* Simplified Tab Navigation - FIXED COUNTS */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
            onClick={() => setActiveTab("pending")}
          >
            ⏳ Pending Action ({stats.pending})
          </button>
          <button 
            className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            📚 Leave History ({stats.totalProcessed})
          </button>
          <button 
            className={`tab-btn ${activeTab === "emergency" ? "active" : ""}`}
            onClick={() => setActiveTab("emergency")}
          >
            🚨 Emergency ({stats.totalEmergency})
          </button>
          <button 
            className={`tab-btn ${activeTab === "normal" ? "active" : ""}`}
            onClick={() => setActiveTab("normal")}
          >
            📝 Normal ({stats.totalNormal})
          </button>
        </div>

        <div className="dashboard-grid">
          {/* Left Column - Leave Requests */}
          <div className="dashboard-column">
            <div className="dashboard-card">
              <div className="card-header">
                <h2>
                  {activeTab === "pending" && "⏳ Leave Requests Awaiting Your Action"}
                  {activeTab === "history" && "📚 Leave History & Approvals"}
                  {activeTab === "emergency" && "🚨 All Emergency Leaves"}
                  {activeTab === "normal" && "📝 All Normal Leaves"}
                </h2>
                {activeTab === "pending" && (
                  <div className="card-badge pending">{stats.pending} Pending</div>
                )}
                {(activeTab === "emergency" || activeTab === "normal") && (
                  <div className="card-badge info">
                    {activeTab === "emergency" ? stats.totalEmergency : stats.totalNormal} Total
                  </div>
                )}
                {activeTab === "history" && (
                  <div className="card-badge history">{stats.totalProcessed} Processed</div>
                )}
              </div>

              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading leaves...</p>
                </div>
              ) : filteredLeaves.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    {activeTab === "pending" ? "✅" : 
                     activeTab === "history" ? "📚" : 
                     activeTab === "emergency" ? "🚨" : "📝"}
                  </div>
                  <h3>
                    {activeTab === "pending" ? "All caught up!" : 
                     activeTab === "history" ? "No history found" :
                     activeTab === "emergency" ? "No emergency leaves" : "No normal leaves"}
                  </h3>
                  <p>
                    {activeTab === "pending" 
                      ? "No leave requests pending your approval." 
                      : activeTab === "history"
                      ? "No processed leaves found in history."
                      : `No ${activeTab === "emergency" ? "emergency" : "normal"} leaves found.`
                    }
                  </p>
                </div>
              ) : (
                <div className="leaves-list">
                  {filteredLeaves.map(leave => (
                    <div key={leave.id} className={`leave-card ${isEmergencyLeave(leave) ? 'emergency' : 'normal'} ${isProcessedLeave(leave) ? 'processed' : ''}`}>
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
                        <strong>Reason:</strong> {leave.reason}
                      </div>
                      
                      <div className="leave-dates">
                        <span className="date-range">
                          📅 {new Date(leave.start_date).toLocaleDateString()} → {new Date(leave.end_date).toLocaleDateString()}
                        </span>
                        <span className="duration">
                          ({Math.ceil((new Date(leave.end_date) - new Date(leave.start_date)) / (1000 * 60 * 60 * 24)) + 1} days)
                        </span>
                      </div>
                      {/* Destination and Transport Info */}
                      <div className="leave-travel">
                        <p>🧭 <strong>Destination:</strong> {leave.destination || "—"}</p>
                        <p>
                          🚗 <strong>Transport Mode:</strong>{" "}
                          {leave.transport_mode
                            ? leave.transport_mode.charAt(0).toUpperCase() + leave.transport_mode.slice(1)
                            : "—"}
                        </p>
                      </div>

                      {/* Additional Information */}
                      <div className="leave-meta">
                        <span className="meta-item">
                          🕒 Applied: {new Date(leave.created_at).toLocaleDateString()}
                        </span>
                        
                        {/* Warden decision timestamp */}
                        {leave.warden_id && (
                          <span className="meta-item warden">
                            ✅ Warden Action: {formatDateTime(leave.updated_at)}
                            {leave.warden_name && ` by ${leave.warden_name}`}
                          </span>
                        )}
                        
                        {/* Show meeting details if scheduled */}
                        {leave.meeting_scheduled && leave.meeting_date && (
                          <span className="meta-item meeting">
                            📅 Meeting: {formatDateTime(leave.meeting_date)}
                          </span>
                        )}
                        
                        {/* Show warden comments if any */}
                        {leave.warden_comments && (
                          <span className="meta-item comments">
                            💬 Warden Notes: {leave.warden_comments}
                          </span>
                        )}
                        
                        {/* Arrival confirmation status */}
                        {(leave.status === "warden_approved" || leave.status === "completed") && (
                          <span className={`meta-item arrival ${getArrivalStatus(leave)?.status}`}>
                            {getArrivalStatus(leave)?.text}
                          </span>
                        )}
                        
                        {/* Show approval chain for normal leaves */}
                        {!isEmergencyLeave(leave) && (
                          <>
                            <span className="meta-item parent">
                              👨‍👩‍👧 Parent: {leave.parent_name || "Not approved"}
                            </span>
                            <span className="meta-item advisor">
                              📚 Advisor: {leave.advisor_name || "Not approved"}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Action Buttons - Only show for pending leaves */}
                      {isPendingLeave(leave) && (
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
                                  📅 Schedule Meeting
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
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
                <h3>📊 Quick Summary</h3>
              </div>
              <div className="summary-stats">
                <div className="summary-item">
                  <div className="summary-label">Pending Action</div>
                  <div className="summary-value pending">{stats.pending}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Emergency Pending</div>
                  <div className="summary-value emergency">{stats.emergencyPending}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Meetings Scheduled</div>
                  <div className="summary-value meetings">{stats.meetingsScheduled}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Total Approved</div>
                  <div className="summary-value approved">{stats.totalApproved}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Safe Arrivals</div>
                  <div className="summary-value safe">{stats.safeArrival}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Awaiting Arrival</div>
                  <div className="summary-value waiting">{stats.awaitingArrival}</div>
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