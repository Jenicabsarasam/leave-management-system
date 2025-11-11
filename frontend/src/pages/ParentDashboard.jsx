// src/pages/ParentDashboard.jsx
import React, { useEffect, useState } from "react";
import "../assets/styles/parentDashboard.css";
import logo from "../assets/college-logo.png";
import { getLeaves, parentApprove, confirmArrival, uploadProof } from "../api";

const ParentDashboard = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProofFile, setSelectedProofFile] = useState(null);
  const [uploadingProof, setUploadingProof] = useState({});
  const [activeTab, setActiveTab] = useState("all");
  const token = localStorage.getItem("token");

  // Define canUploadProof function BEFORE it's used
  const canUploadProof = (leave) => {
    return leave.type === "emergency" && 
           leave.status === "completed" && 
           leave.arrival_timestamp && 
           !leave.proof_submitted;
  };

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = await getLeaves(token);
      console.log("Parent leaves data:", data);
      
      // FIXED: Show ALL leaves relevant to parent (not just pending ones)
      // Parents should see all leaves of their children, including history
      const parentLeaves = data.leaves || [];
      
      setLeaves(parentLeaves);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching leaves:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleAction = async (leaveId, action) => {
    try {
      const res = await parentApprove(token, leaveId, action);
      alert(res.msg || `Leave ${action}d`);
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

  const handleProofFileSelect = (leaveId, file) => {
    if (file) {
      if (file.type === 'application/pdf') {
        setSelectedProofFile({ leaveId, file });
      } else {
        alert("Please select a PDF file only");
      }
    }
  };

  // FIXED: PDF Upload function with proper error handling
  const handleProofUpload = async (leaveId) => {
    if (!selectedProofFile || selectedProofFile.leaveId !== leaveId) {
      alert("Please select a PDF file first");
      return;
    }

    try {
      setUploadingProof(prev => ({ ...prev, [leaveId]: true }));
      
      const formData = new FormData();
      formData.append('proof', selectedProofFile.file);
      
      console.log("Uploading proof for leave:", leaveId);
      const res = await uploadProof(token, leaveId, formData);
      
      alert(res.msg || "Proof uploaded successfully");
      
      // Reset file selection
      setSelectedProofFile(null);
      // Refresh leaves list
      fetchLeaves();
    } catch (err) {
      console.error("Proof upload error:", err);
      // Handle different types of error responses
      if (err.response && err.response.data) {
        alert(err.response.data.msg || "Error uploading proof");
      } else if (err.message) {
        alert(err.message);
      } else {
        alert("Error uploading proof. Please try again.");
      }
    } finally {
      setUploadingProof(prev => ({ ...prev, [leaveId]: false }));
    }
  };

  // FIXED: Filter leaves based on active tab - Enhanced filtering
  const filteredLeaves = leaves.filter(leave => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return leave.status === "pending";
    if (activeTab === "arrival") return leave.status === "warden_approved" && !leave.arrival_timestamp;
    if (activeTab === "proof") return canUploadProof(leave);
    if (activeTab === "approved") return leave.status === "parent_approved" || leave.status === "advisor_approved" || leave.status === "warden_approved";
    if (activeTab === "completed") return leave.status === "completed";
    if (activeTab === "rejected") return leave.status === "rejected";
    return true;
  });

  // FIXED: Enhanced Statistics
  const stats = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === "pending").length,
    arrival: leaves.filter(l => l.status === "warden_approved" && !l.arrival_timestamp).length,
    proof: leaves.filter(canUploadProof).length,
    emergency: leaves.filter(l => l.type === "emergency").length,
    normal: leaves.filter(l => l.type === "normal").length,
    approved: leaves.filter(l => l.status === "parent_approved" || l.status === "advisor_approved" || l.status === "warden_approved").length,
    completed: leaves.filter(l => l.status === "completed").length,
    rejected: leaves.filter(l => l.status === "rejected").length
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'parent_approved': return '✅';
      case 'advisor_approved': return '📚';
      case 'warden_approved': return '🏠';
      case 'completed': return '🎉';
      case 'rejected': return '❌';
      case 'emergency_pending': return '🚨';
      default: return '📝';
    }
  };

  const getTypeIcon = (type) => {
    return type === 'emergency' ? '🚨' : '📋';
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: "Pending Your Approval",
      parent_approved: "Approved by You",
      advisor_approved: "With Advisor", 
      warden_approved: "Approved - Confirm Arrival",
      emergency_pending: "Emergency - With Warden",
      meeting_scheduled: "Meeting Scheduled",
      rejected: "Rejected",
      completed: "Completed"
    };
    return statusMap[status] || status;
  };

  // Safe date formatting
  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      return new Date(dateString).toLocaleString();
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
            <h1>Parent Dashboard</h1>
            <p>Manage your child's leave requests and approvals</p>
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
            <div className="stat-icon total">👨‍👩‍👧</div>
            <div className="stat-info">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Requests</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending">⏳</div>
            <div className="stat-info">
              <div className="stat-number">{stats.pending}</div>
              <div className="stat-label">Pending Approval</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon arrival">✅</div>
            <div className="stat-info">
              <div className="stat-number">{stats.arrival}</div>
              <div className="stat-label">Awaiting Arrival</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon proof">📎</div>
            <div className="stat-info">
              <div className="stat-number">{stats.proof}</div>
              <div className="stat-label">Need Proof</div>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Left Column - Leave Requests */}
          <div className="dashboard-column">
            <div className="dashboard-card">
              <div className="card-header">
                <h2>Leave Requests</h2>
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
                    className={`tab-btn ${activeTab === 'arrival' ? 'active' : ''}`}
                    onClick={() => setActiveTab('arrival')}
                  >
                    Arrival ({stats.arrival})
                  </button>
                  <button 
                    className={`tab-btn ${activeTab === 'proof' ? 'active' : ''}`}
                    onClick={() => setActiveTab('proof')}
                  >
                    Proof ({stats.proof})
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
                  <p>Loading leave requests...</p>
                </div>
              ) : filteredLeaves.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h3>No leave requests</h3>
                  <p>{
                    activeTab === 'all' 
                      ? "No leave requests from your child."
                      : `No ${activeTab} leave requests found.`
                  }</p>
                </div>
              ) : (
                <div className="leaves-list">
                  {filteredLeaves.map(leave => (
                    <div key={leave.id} className="leave-card">
                      <div className="leave-header">
                        <div className="student-info">
                          <div className="student-name">
                            👤 {leave.student_name}
                          </div>
                          <div className="student-roll">
                            Roll No: {leave.student_rollno}
                          </div>
                          <div className="student-details">
                            {leave.branch_name} - Division {leave.student_division}
                          </div>
                        </div>
                        <div className="leave-type-status">
                          <span className={`type-badge ${leave.type}`}>
                            {getTypeIcon(leave.type)} {leave.type === 'emergency' ? 'Emergency' : 'Normal'}
                          </span>
                          <span className={`status-badge ${leave.status}`}>
                            {getStatusIcon(leave.status)} {getStatusBadge(leave.status)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="leave-reason">
                        <strong>Reason:</strong> {leave.reason}
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
                          🕒 Applied: {formatDate(leave.created_at)}
                        </span>
                        
                        {/* Show arrival timestamp if available */}
                        {leave.arrival_timestamp && (
                          <span className="meta-item arrival">
                            🎉 Arrival confirmed: {formatDateTime(leave.arrival_timestamp)}
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
                            💬 Warden: {leave.warden_comments}
                          </span>
                        )}
                        
                        {/* Show proof status */}
                        {leave.proof_submitted && (
                          <span className={`meta-item proof ${leave.proof_verified ? 'verified' : 'submitted'}`}>
                            📎 Proof {leave.proof_verified ? '✅ Verified' : '📤 Submitted'}
                            {leave.proof_verified_at && ` on ${formatDate(leave.proof_verified_at)}`}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="leave-actions">
                        {leave.status === "pending" && (
                          <div className="action-section">
                            <div className="action-prompt">Approve this leave request?</div>
                            <div className="action-buttons">
                              <button 
                                className="btn btn-success" 
                                onClick={() => handleAction(leave.id, "approve")}
                              >
                                ✅ Approve
                              </button>
                              <button 
                                className="btn btn-danger" 
                                onClick={() => handleAction(leave.id, "reject")}
                              >
                                ❌ Reject
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {leave.status === "warden_approved" && !leave.arrival_timestamp && (
                          <div className="action-section">
                            <div className="action-prompt">Your child has returned from leave:</div>
                            <button 
                              className="btn btn-primary" 
                              onClick={() => handleArrival(leave.id)}
                            >
                              ✅ Confirm Safe Arrival
                            </button>
                          </div>
                        )}

                        {leave.arrival_timestamp && (
                          <div className="action-completed">
                            <span className="success-text">
                              ✅ Arrival confirmed on {formatDateTime(leave.arrival_timestamp)}
                            </span>
                          </div>
                        )}

                        {/* Proof Upload Section for Emergency Leaves */}
                        {canUploadProof(leave) && (
                          <div className="proof-upload-section">
                            <div className="proof-header">
                              <h4>📎 Submit Emergency Leave Proof</h4>
                              <p>Please upload supporting documents (medical certificate, tickets, etc.) as PDF.</p>
                            </div>
                            
                            <div className="proof-upload-controls">
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => handleProofFileSelect(leave.id, e.target.files[0])}
                                className="file-input"
                                id={`proof-file-${leave.id}`}
                              />
                              <button 
                                className="btn btn-success" 
                                onClick={() => handleProofUpload(leave.id)}
                                disabled={!selectedProofFile || selectedProofFile.leaveId !== leave.id || uploadingProof[leave.id]}
                              >
                                {uploadingProof[leave.id] ? "📤 Uploading..." : "📎 Upload Proof"}
                              </button>
                            </div>
                            
                            {selectedProofFile && selectedProofFile.leaveId === leave.id && (
                              <div className="file-selected">
                                ✅ Selected: {selectedProofFile.file.name}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Summary & Settings */}
          <div className="dashboard-column">
            <div className="dashboard-card">
              <div className="card-header">
                <h2>Quick Summary</h2>
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
                  <div className="summary-label">Awaiting Your Approval</div>
                  <div className="summary-value pending">{stats.pending}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Awaiting Arrival Confirmation</div>
                  <div className="summary-value arrival">{stats.arrival}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Need Proof Upload</div>
                  <div className="summary-value proof">{stats.proof}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Completed Leaves</div>
                  <div className="summary-value completed">{stats.completed}</div>
                </div>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-header">
                <h2>📱 SMS Notifications</h2>
              </div>
              <div className="notification-note">
                <div className="info-icon">💡</div>
                <div className="info-content">
                  <strong>Real-time Updates</strong>
                  <p>You'll receive SMS alerts for all important updates about your child's leave status.</p>
                </div>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-header">
                <h2>ℹ️ Leave Status Guide</h2>
              </div>
              <div className="status-guide">
                <div className="guide-item">
                  <span className="guide-icon">⏳</span>
                  <span className="guide-text">Pending - Needs your approval</span>
                </div>
                <div className="guide-item">
                  <span className="guide-icon">✅</span>
                  <span className="guide-text">Approved - Confirm arrival when child returns</span>
                </div>
                <div className="guide-item">
                  <span className="guide-icon">📎</span>
                  <span className="guide-text">Proof Required - Upload emergency leave documents</span>
                </div>
                <div className="guide-item">
                  <span className="guide-icon">🎉</span>
                  <span className="guide-text">Completed - Leave process finished</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;