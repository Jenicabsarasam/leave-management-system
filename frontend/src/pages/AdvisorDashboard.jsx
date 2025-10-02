// src/pages/AdvisorDashboard.jsx
import React, { useEffect, useState } from "react";
import "../assets/styles/advisorDashboard.css";
import logo from "../assets/college-logo.png";
import { advisorReview, getLeaves, getStudentsSummary, verifyProof } from "../api";

const AdvisorDashboard = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [leaves, setLeaves] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]); // Store all leaves for filtering
  const [studentsSummary, setStudentsSummary] = useState([]);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [viewingProof, setViewingProof] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationComments, setVerificationComments] = useState({});
  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch ALL leaves for advisor (not just pending)
      const leavesData = await getLeaves(token);
      setAllLeaves(leavesData.leaves || []);
      
      // Filter pending leaves for the pending tab
      const pendingLeaves = (leavesData.leaves || []).filter(l => 
        l.status === "parent_approved" || l.status === "pending"
      );
      setLeaves(pendingLeaves);
      
      // Fetch students summary
      const summaryData = await getStudentsSummary(token);
      setStudentsSummary(summaryData.students || []);
      setRecentLeaves(summaryData.recentLeaves || []);
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDecision = async (leaveId, action) => {
    try {
      const res = await advisorReview(token, leaveId, action);
      alert(res.msg || `Leave ${action}d`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Error processing request");
    }
  };

  const handleVerifyProof = async (leaveId, verified) => {
    try {
      const comments = verificationComments[leaveId] || '';
      const res = await verifyProof(token, leaveId, { verified, comments });
      alert(res.msg || `Proof ${verified ? 'verified' : 'rejected'}`);
      setVerificationComments(prev => ({ ...prev, [leaveId]: '' }));
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Error verifying proof");
    }
  };

  const handleViewProof = (leave) => {
    if (leave.proof_file_path) {
      const proofUrl = `http://localhost:5000${leave.proof_file_path}`;
      setViewingProof({
        leaveId: leave.id,
        studentName: leave.student_name,
        fileName: leave.proof_file_path.split('/').pop(),
        url: proofUrl
      });
    }
  };

  // Enhanced Statistics
  const stats = {
    totalStudents: studentsSummary.length,
    totalLeaves: allLeaves.length,
    emergencyLeaves: allLeaves.filter(l => l.type === 'emergency').length,
    pendingReviews: leaves.length,
    proofsSubmitted: allLeaves.filter(l => l.proof_submitted).length,
    proofsVerified: allLeaves.filter(l => l.proof_verified).length,
    proofsPendingVerification: allLeaves.filter(l => l.proof_submitted && !l.proof_verified).length
  };

  // Enhanced filtering for different tabs
  const getFilteredLeaves = () => {
    switch (activeTab) {
      case "pending":
        return leaves; // Already filtered for pending reviews
      case "proofs":
        return allLeaves.filter(leave => leave.proof_submitted);
      case "emergency":
        return allLeaves.filter(leave => leave.type === 'emergency');
      case "all":
        return allLeaves;
      default:
        return allLeaves;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'parent_approved': return '✅';
      case 'advisor_approved': return '📚';
      case 'warden_approved': return '🏠';
      case 'completed': return '🏁';
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
      pending: "Pending Parent Approval",
      parent_approved: "Approved by Parent - Ready for Review",
      advisor_approved: "Approved by Advisor",
      warden_approved: "Approved by Warden",
      rejected: "Rejected",
      completed: "Completed",
      meeting_scheduled: "Meeting Scheduled",
      emergency_pending: "🚨 Emergency Pending"
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const filteredLeaves = getFilteredLeaves();

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <div className="logo-container">
            <img src={logo} alt="College Logo" />
          </div>
          <div className="dashboard-title">
            <h1>Advisor Dashboard</h1>
            <p>Academic oversight and student leave management</p>
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
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <div className="stat-number">{stats.totalStudents}</div>
              <div className="stat-label">Total Students</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <div className="stat-number">{stats.pendingReviews}</div>
              <div className="stat-label">Pending Reviews</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🚨</div>
            <div className="stat-info">
              <div className="stat-number">{stats.emergencyLeaves}</div>
              <div className="stat-label">Emergency Leaves</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📎</div>
            <div className="stat-info">
              <div className="stat-number">{stats.proofsPendingVerification}</div>
              <div className="stat-label">Proofs to Verify</div>
            </div>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
            onClick={() => setActiveTab("pending")}
          >
            📋 Pending Reviews ({stats.pendingReviews})
          </button>
          <button 
            className={`tab-btn ${activeTab === "proofs" ? "active" : ""}`}
            onClick={() => setActiveTab("proofs")}
          >
            📎 Proofs to Verify ({stats.proofsPendingVerification})
          </button>
          <button 
            className={`tab-btn ${activeTab === "emergency" ? "active" : ""}`}
            onClick={() => setActiveTab("emergency")}
          >
            🚨 Emergency Leaves ({stats.emergencyLeaves})
          </button>
          <button 
            className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            📊 All Leaves ({stats.totalLeaves})
          </button>
          <button 
            className={`tab-btn ${activeTab === "students" ? "active" : ""}`}
            onClick={() => setActiveTab("students")}
          >
            👥 Students ({stats.totalStudents})
          </button>
        </div>

        <div className="dashboard-grid">
          {/* Main Content Area */}
          <div className="dashboard-column main-content">
            {/* Pending Reviews Tab */}
            {activeTab === "pending" && (
              <div className="dashboard-card">
                <div className="card-header">
                  <h2>Leave Requests Awaiting Your Review</h2>
                  <div className="card-badge pending">{stats.pendingReviews} Pending</div>
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
                    <p>No leave requests pending your review.</p>
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
                            <div className="student-details">
                              Roll No: {leave.student_rollno} • {leave.branch_name} - Division {leave.student_division}
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
                            ({Math.ceil((new Date(leave.end_date) - new Date(leave.start_date)) / (1000 * 60 * 60 * 24)) + 1} days)
                          </span>
                        </div>

                        <div className="leave-meta">
                          <span className="meta-item">
                            🕒 Applied: {formatDate(leave.created_at)}
                          </span>
                          {leave.parent_name && (
                            <span className="meta-item">
                              👨‍👩‍👧 Parent: {leave.parent_name}
                            </span>
                          )}
                        </div>

                        <div className="leave-actions">
                          {leave.status === "parent_approved" && (
                            <div className="action-section">
                              <div className="action-prompt">Academic Review Required:</div>
                              <div className="action-buttons">
                                <button 
                                  className="btn btn-success" 
                                  onClick={() => handleDecision(leave.id, "approve")}
                                >
                                  ✅ Academic Approval
                                </button>
                                <button 
                                  className="btn btn-danger" 
                                  onClick={() => handleDecision(leave.id, "reject")}
                                >
                                  ❌ Academic Rejection
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {leave.status === "pending" && (
                            <div className="waiting-section">
                              <span className="waiting-text">
                                ⏳ Waiting for parent approval
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Proofs Tab */}
            {activeTab === "proofs" && (
              <div className="dashboard-card">
                <div className="card-header">
                  <h2>Proofs Awaiting Verification</h2>
                  <div className="card-badge proofs">{stats.proofsPendingVerification} to Verify</div>
                </div>

                {loading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading proofs...</p>
                  </div>
                ) : filteredLeaves.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">✅</div>
                    <h3>All proofs verified!</h3>
                    <p>No proofs pending verification.</p>
                  </div>
                ) : (
                  <div className="leaves-list">
                    {filteredLeaves
                      .filter(leave => leave.proof_submitted && !leave.proof_verified)
                      .map(leave => (
                      <div key={leave.id} className="leave-card proof-card">
                        <div className="leave-header">
                          <div className="student-info">
                            <div className="student-name">
                              👤 {leave.student_name}
                            </div>
                            <div className="student-details">
                              Roll No: {leave.student_rollno} • Emergency Leave
                            </div>
                          </div>
                          <div className="proof-status-badge">
                            <span className="badge proof-pending">📎 Proof Submitted</span>
                            <span className="badge proof-date">
                              {formatDate(leave.proof_submitted_at)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="leave-reason">
                          <strong>Leave Reason:</strong> {leave.reason}
                        </div>

                        <div className="proof-actions">
                          <div className="proof-view-section">
                            <button 
                              className="btn btn-outline"
                              onClick={() => handleViewProof(leave)}
                            >
                              👁️ View Proof PDF
                            </button>
                            <span className="file-info">
                              {leave.proof_file_path?.split('/').pop()}
                            </span>
                          </div>

                          <div className="verification-section">
                            <div className="verification-prompt">
                              <strong>Verify this proof:</strong>
                            </div>
                            <div className="comment-section">
                              <textarea
                                placeholder="Add verification comments (optional)..."
                                value={verificationComments[leave.id] || ''}
                                onChange={(e) => setVerificationComments(prev => ({
                                  ...prev,
                                  [leave.id]: e.target.value
                                }))}
                                className="form-input"
                                rows="2"
                              />
                            </div>
                            <div className="verification-buttons">
                              <button 
                                className="btn btn-success" 
                                onClick={() => handleVerifyProof(leave.id, true)}
                              >
                                ✅ Verify Proof
                              </button>
                              <button 
                                className="btn btn-danger" 
                                onClick={() => handleVerifyProof(leave.id, false)}
                              >
                                ❌ Reject Proof
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Emergency Leaves Tab */}
            {activeTab === "emergency" && (
              <div className="dashboard-card">
                <div className="card-header">
                  <h2>Emergency Leaves</h2>
                  <div className="card-badge emergency">{stats.emergencyLeaves} Total</div>
                </div>

                {loading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading emergency leaves...</p>
                  </div>
                ) : filteredLeaves.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🚨</div>
                    <h3>No emergency leaves</h3>
                    <p>No emergency leave requests found.</p>
                  </div>
                ) : (
                  <div className="leaves-list">
                    {filteredLeaves.map(leave => (
                      <div key={leave.id} className="leave-card emergency-card">
                        <div className="leave-header">
                          <div className="student-info">
                            <div className="student-name">
                              👤 {leave.student_name}
                            </div>
                            <div className="student-details">
                              Roll No: {leave.student_rollno} • {leave.branch_name}
                            </div>
                          </div>
                          <div className="leave-type-status">
                            <span className={`status-badge ${leave.status}`}>
                              {getStatusIcon(leave.status)} {getStatusBadge(leave.status)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="leave-reason">
                          <strong>Emergency Reason:</strong> {leave.reason}
                        </div>
                        
                        <div className="leave-dates">
                          <span className="date-range">
                            📅 {formatDate(leave.start_date)} → {formatDate(leave.end_date)}
                          </span>
                        </div>

                        <div className="leave-meta">
                          <span className="meta-item">
                            🕒 Applied: {formatDate(leave.created_at)}
                          </span>
                          {leave.warden_comments && (
                            <span className="meta-item comments">
                              💬 Warden: {leave.warden_comments}
                            </span>
                          )}
                          {leave.proof_submitted && (
                            <span className={`meta-item proof ${leave.proof_verified ? 'verified' : 'submitted'}`}>
                              📎 Proof {leave.proof_verified ? '✅ Verified' : '📤 Submitted'}
                              {leave.proof_submitted_at && ` on ${formatDate(leave.proof_submitted_at)}`}
                            </span>
                          )}
                        </div>

                        {leave.proof_submitted && !leave.proof_verified && (
                          <div className="proof-actions">
                            <button 
                              className="btn btn-outline btn-small"
                              onClick={() => handleViewProof(leave)}
                            >
                              👁️ View Proof
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* All Leaves Tab */}
            {activeTab === "all" && (
              <div className="dashboard-card">
                <div className="card-header">
                  <h2>All Leaves</h2>
                  <div className="card-badge all">{stats.totalLeaves} Total</div>
                </div>

                {loading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading all leaves...</p>
                  </div>
                ) : filteredLeaves.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📝</div>
                    <h3>No leaves found</h3>
                    <p>No leave requests in the system.</p>
                  </div>
                ) : (
                  <div className="leaves-list">
                    {filteredLeaves.map(leave => (
                      <div key={leave.id} className={`leave-card ${leave.type}-card`}>
                        <div className="leave-header">
                          <div className="student-info">
                            <div className="student-name">
                              👤 {leave.student_name}
                            </div>
                            <div className="student-details">
                              Roll No: {leave.student_rollno} • {leave.branch_name}
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
                        </div>

                        <div className="leave-meta">
                          <span className="meta-item">
                            🕒 Applied: {formatDate(leave.created_at)}
                          </span>
                          {leave.proof_submitted && (
                            <span className={`meta-item proof ${leave.proof_verified ? 'verified' : 'submitted'}`}>
                              📎 {leave.proof_verified ? '✅ Verified' : 'Proof Submitted'}
                            </span>
                          )}
                        </div>

                        {leave.proof_submitted && (
                          <div className="proof-actions">
                            <button 
                              className="btn btn-outline btn-small"
                              onClick={() => handleViewProof(leave)}
                            >
                              👁️ View Proof
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Students Summary Tab */}
            {activeTab === "students" && (
              <div className="dashboard-card">
                <div className="card-header">
                  <h2>Students Summary & Analytics</h2>
                  <div className="card-badge students">{stats.totalStudents} Students</div>
                </div>

                {/* Students Grid */}
                <div className="students-grid">
                  {studentsSummary.map(student => (
                    <div 
                      key={student.id} 
                      className="student-card"
                      onClick={() => setSelectedStudent(student)}
                    >
                      <div className="student-header">
                        <div className="student-avatar">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="student-info">
                          <div className="student-name">{student.name}</div>
                          <div className="student-roll">Roll No: {student.roll_number}</div>
                        </div>
                      </div>
                      
                      <div className="student-stats">
                        <div className="stat-item">
                          <span className="stat-label">Total Leaves</span>
                          <span className="stat-value">{student.total_leaves || 0}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Emergency</span>
                          <span className="stat-value emergency">{student.emergency_leaves || 0}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Proofs</span>
                          <span className="stat-value proof">{student.proofs_submitted || 0}</span>
                        </div>
                      </div>

                      {student.proofs_submitted > 0 && (
                        <div className="proof-indicator">
                          📎 {student.proofs_submitted || 0} proof(s) submitted
                          {student.proofs_verified > 0 && (
                            <span className="verified-count"> • {student.proofs_verified} verified</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Quick Stats */}
          <div className="dashboard-column sidebar">
            <div className="dashboard-card">
              <div className="card-header">
                <h3>Quick Overview</h3>
              </div>
              <div className="quick-stats">
                <div className="quick-stat">
                  <div className="quick-stat-icon">📚</div>
                  <div className="quick-stat-info">
                    <div className="quick-stat-value">{stats.totalStudents}</div>
                    <div className="quick-stat-label">Students</div>
                  </div>
                </div>
                <div className="quick-stat">
                  <div className="quick-stat-icon">⏳</div>
                  <div className="quick-stat-info">
                    <div className="quick-stat-value">{stats.pendingReviews}</div>
                    <div className="quick-stat-label">Pending Reviews</div>
                  </div>
                </div>
                <div className="quick-stat">
                  <div className="quick-stat-icon">🚨</div>
                  <div className="quick-stat-info">
                    <div className="quick-stat-value">{stats.emergencyLeaves}</div>
                    <div className="quick-stat-label">Emergency Leaves</div>
                  </div>
                </div>
                <div className="quick-stat">
                  <div className="quick-stat-icon">📎</div>
                  <div className="quick-stat-info">
                    <div className="quick-stat-value">{stats.proofsPendingVerification}</div>
                    <div className="quick-stat-label">Proofs to Verify</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-header">
                <h3>Recent Activity</h3>
              </div>
              <div className="recent-activity">
                {recentLeaves.slice(0, 5).map(leave => (
                  <div key={leave.id} className="activity-item">
                    <div className="activity-icon">
                      {getTypeIcon(leave.type)}
                    </div>
                    <div className="activity-content">
                      <div className="activity-text">
                        {leave.student_name} - {leave.reason.substring(0, 30)}...
                      </div>
                      <div className="activity-meta">
                        {formatDate(leave.created_at)} • {getStatusBadge(leave.status)}
                      </div>
                    </div>
                  </div>
                ))}
                {recentLeaves.length === 0 && (
                  <div className="no-activity">
                    No recent activity to display
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Proof Viewer Modal */}
      {viewingProof && (
        <div className="modal-overlay">
          <div className="modal-content large-modal">
            <div className="modal-header">
              <h2>Proof Document - {viewingProof.studentName}</h2>
              <button className="modal-close" onClick={() => setViewingProof(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="proof-viewer">
                <div className="proof-info">
                  <p><strong>File:</strong> {viewingProof.fileName}</p>
                  <p><strong>Student:</strong> {viewingProof.studentName}</p>
                </div>
                
                <div className="pdf-viewer">
                  <iframe 
                    src={viewingProof.url} 
                    width="100%" 
                    height="600px"
                    title="Proof Document"
                    style={{ border: '1px solid #ddd', borderRadius: '8px' }}
                  />
                </div>
                
                <div className="proof-actions-modal">
                  <a 
                    href={viewingProof.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    📥 Download PDF
                  </a>
                  <button 
                    className="btn btn-outline"
                    onClick={() => setViewingProof(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedStudent.name} - Student Details</h2>
              <button className="modal-close" onClick={() => setSelectedStudent(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="student-profile">
                <div className="profile-header">
                  <div className="profile-avatar">
                    {selectedStudent.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="profile-info">
                    <h3>{selectedStudent.name}</h3>
                    <p>Roll No: {selectedStudent.roll_number}</p>
                  </div>
                </div>

                <div className="profile-stats">
                  <div className="profile-stat">
                    <span className="stat-label">Email</span>
                    <span className="stat-value">{selectedStudent.email}</span>
                  </div>
                  <div className="profile-stat">
                    <span className="stat-label">Phone</span>
                    <span className="stat-value">{selectedStudent.phone}</span>
                  </div>
                  <div className="profile-stat">
                    <span className="stat-label">Total Leaves</span>
                    <span className="stat-value">{selectedStudent.total_leaves || 0}</span>
                  </div>
                  <div className="profile-stat">
                    <span className="stat-label">Emergency Leaves</span>
                    <span className="stat-value emergency">{selectedStudent.emergency_leaves || 0}</span>
                  </div>
                  <div className="profile-stat">
                    <span className="stat-label">Proofs Submitted</span>
                    <span className="stat-value proof">{selectedStudent.proofs_submitted || 0}</span>
                  </div>
                  <div className="profile-stat">
                    <span className="stat-label">Proofs Verified</span>
                    <span className="stat-value verified">{selectedStudent.proofs_verified || 0}</span>
                  </div>
                </div>
              </div>

              <div className="recent-leaves-section">
                <h4>Recent Leave History</h4>
                <div className="recent-leaves">
                  {recentLeaves
                    .filter(leave => leave.student_name === selectedStudent.name)
                    .slice(0, 5)
                    .map(leave => (
                      <div key={leave.id} className="recent-leave-card">
                        <div className="leave-summary">
                          <div className="leave-reason">{leave.reason}</div>
                          <div className="leave-dates">
                            {formatDate(leave.start_date)} → {formatDate(leave.end_date)}
                          </div>
                        </div>
                        <div className="leave-status">
                          <span className={`status-badge ${leave.status}`}>
                            {getStatusBadge(leave.status)}
                          </span>
                          {leave.proof_submitted && (
                            <span className={`proof-status ${leave.proof_verified ? 'verified' : 'pending'}`}>
                              {leave.proof_verified ? '✅ Verified' : '📎 Pending Verification'}
                              {!leave.proof_verified && (
                                <button 
                                  className="btn btn-success btn-small" 
                                  onClick={() => handleVerifyProof(leave.id, true)}
                                >
                                  Verify
                                </button>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvisorDashboard;