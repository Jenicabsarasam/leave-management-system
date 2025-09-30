// src/pages/WardenDashboard.jsx - Complete Updated Version
import React, { useEffect, useState } from "react";
import "../assets/styles/styles.css";
import logo from "../assets/college-1.jpg";
import { wardenApprove, wardenEmergencyApprove, getLeaves } from "../api";

const WardenDashboard = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proofComments, setProofComments] = useState({});
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [meetingDate, setMeetingDate] = useState("");
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

  const getStatusBadge = (status, type) => {
    const statusMap = {
      pending: "Pending Parent Approval",
      parent_approved: "Approved by Parent",
      advisor_approved: "Approved by Advisor - Ready for Review",
      emergency_pending: "🚨 EMERGENCY - Needs Immediate Approval",
      proof_requested: "🔍 Proof Requested - Waiting for Student",
      meeting_scheduled: "📅 Meeting Scheduled",
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
        <h3 style={{ marginTop: 0 }}>Leave Requests Awaiting Your Approval</h3>

        {loading ? (
          <p>Loading pending leaves...</p>
        ) : leaves.length === 0 ? (
          <p>No leave requests pending your approval.</p>
        ) : (
          <div className="leaves-list">
            {leaves.map(leave => (
              <div key={leave.id} className="leave-item card" style={{ 
                marginBottom: "16px", 
                padding: "16px",
                borderLeft: isEmergencyLeave(leave) ? "4px solid #dc3545" : "4px solid #007bff"
              }}>
                <div className="leave-header">
                  <div>
                    <strong>Student: {leave.student_name} (Roll No: {leave.student_rollno})</strong>
                    {isEmergencyLeave(leave) && (
                      <div style={{ color: "#dc3545", fontWeight: "bold", marginTop: "4px" }}>
                        🚨 EMERGENCY LEAVE
                      </div>
                    )}
                  </div>
                  <span className={`status-badge ${leave.status}`}>
                    {getStatusBadge(leave.status, leave.type)}
                  </span>
                </div>
                
                <div className="leave-details">
                  <p><strong>Hostel:</strong> {leave.hostel_name}</p>
                  <p><strong>Branch & Division:</strong> {leave.branch_name} - Division {leave.student_division}</p>
                  <p><strong>Reason:</strong> {leave.reason}</p>
                  <p><strong>Dates:</strong> {new Date(leave.start_date).toLocaleDateString()} to {new Date(leave.end_date).toLocaleDateString()}</p>
                  <p><strong>Type:</strong> {leave.type === "emergency" ? "🚨 Emergency" : "📝 Normal"}</p>
                  
                  {/* Show meeting details if scheduled */}
                  {leave.meeting_scheduled && leave.meeting_date && (
                    <p style={{ color: "#007bff", fontWeight: "bold" }}>
                      📅 Meeting Scheduled: {new Date(leave.meeting_date).toLocaleString()}
                    </p>
                  )}
                  
                  {/* Show warden comments if any */}
                  {leave.warden_comments && (
                    <p style={{ color: "#666", fontStyle: "italic" }}>
                      <strong>Warden Notes:</strong> {leave.warden_comments}
                    </p>
                  )}
                  
                  {!isEmergencyLeave(leave) && (
                    <>
                      <p><strong>Parent Approval:</strong> {leave.parent_name || "Pending"}</p>
                      <p><strong>Advisor Approval:</strong> {leave.advisor_name || "Pending"}</p>
                    </>
                  )}
                </div>

                <div className="leave-actions">
                  {isEmergencyLeave(leave) ? (
                    <div>
                      <p style={{ marginBottom: "8px" }}>Process Emergency Leave:</p>
                      <div style={{ marginBottom: "8px" }}>
                        <textarea
                          placeholder="Add comments or meeting notes (optional)"
                          value={proofComments[leave.id] || ''}
                          onChange={(e) => handleProofCommentChange(leave.id, e.target.value)}
                          style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                          rows="2"
                        />
                      </div>
                      
                      {/* Schedule Meeting Section */}
                      {actionType === 'schedule_meeting' && leave.id === selectedLeaveId && (
                        <div style={{ marginBottom: "8px", padding: "8px", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
                          <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>Meeting Date & Time:</label>
                          <input
                            type="datetime-local"
                            value={meetingDate}
                            onChange={(e) => setMeetingDate(e.target.value)}
                            style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                          />
                        </div>
                      )}
                      
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        <button 
                          className="btn btn-primary" 
                          onClick={() => handleEmergencyDecision(leave.id, "approve")}
                          style={{ backgroundColor: "#28a745" }}
                        >
                          ✅ Approve Emergency
                        </button>
                        
                        <button 
                          className="btn btn-outline" 
                          onClick={() => handleEmergencyDecision(leave.id, "schedule_meeting")}
                          style={{ borderColor: "#007bff", color: "#007bff" }}
                        >
                          📅 Schedule Meeting
                        </button>
                        
                        <button 
                          className="btn btn-outline" 
                          onClick={() => handleEmergencyDecision(leave.id, "reject")}
                          style={{ borderColor: "#dc3545", color: "#dc3545" }}
                        >
                          ❌ Reject Emergency
                        </button>
                      </div>
                      
                      {/* Confirm Meeting Button */}
                      {actionType === 'schedule_meeting' && leave.id === selectedLeaveId && meetingDate && (
                        <button 
                          className="btn btn-primary" 
                          onClick={() => handleDecision(leave.id, "schedule_meeting")}
                          style={{ marginTop: "8px", backgroundColor: "#007bff", width: "100%" }}
                        >
                          ✅ Confirm Meeting Schedule
                        </button>
                      )}
                    </div>
                  ) : (
                    // Normal leave actions
                    (leave.status === "advisor_approved" || leave.status === "parent_approved") && (
                      <div>
                        <p style={{ marginBottom: "8px" }}>Approve this leave request:</p>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <button 
                            className="btn btn-primary" 
                            onClick={() => handleDecision(leave.id, "approve")}
                          >
                            ✅ Approve
                          </button>
                          <button 
                            className="btn btn-outline" 
                            onClick={() => handleDecision(leave.id, "reject")}
                          >
                            ❌ Reject
                          </button>
                          <button 
                            className="btn btn-outline" 
                            onClick={() => handleDecision(leave.id, "verify")}
                          >
                            🔍 Verify
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: "20px" }} className="card">
          <h4 style={{ marginTop: 0 }}>Summary</h4>
          <div className="kv">Total leaves awaiting approval: <strong>{leaves.length}</strong></div>
          <div className="kv">
            Normal leaves: <strong>{leaves.filter(l => l.type === "normal").length}</strong> | 
            Emergency leaves: <strong>{leaves.filter(l => l.type === "emergency").length}</strong>
          </div>
          <div className="kv">
            Emergency pending: <strong>{leaves.filter(l => l.status === "emergency_pending").length}</strong> | 
            Meetings scheduled: <strong>{leaves.filter(l => l.status === "meeting_scheduled").length}</strong>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WardenDashboard;