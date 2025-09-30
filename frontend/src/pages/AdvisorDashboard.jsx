// src/pages/AdvisorDashboard.jsx
import React, { useEffect, useState } from "react";
import "../assets/styles/advisorDashboard.css";
import logo from "../assets/college-logo.png";
import { advisorReview, getLeaves, getStudentsSummary, verifyProof } from "../api";

const AdvisorDashboard = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [leaves, setLeaves] = useState([]);
  const [studentsSummary, setStudentsSummary] = useState([]);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch pending leaves
      const leavesData = await getLeaves(token);
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
      const res = await verifyProof(token, leaveId, { verified });
      alert(res.msg || `Proof ${verified ? 'verified' : 'rejected'}`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Error verifying proof");
    }
  };

  // Statistics
  const stats = {
    totalStudents: studentsSummary.length,
    totalLeaves: studentsSummary.reduce((sum, student) => sum + (student.total_leaves || 0), 0),
    emergencyLeaves: studentsSummary.reduce((sum, student) => sum + (student.emergency_leaves || 0), 0),
    pendingReviews: leaves.length,
    proofsSubmitted: studentsSummary.reduce((sum, student) => sum + (student.proofs_submitted || 0), 0),
    proofsVerified: studentsSummary.reduce((sum, student) => sum + (student.proofs_verified || 0), 0)
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'parent_approved': return '✅';
      case 'advisor_approved': return '📚';
      case 'warden_approved': return '🏠';
      case 'completed': return '🏁';
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
              <div className="stat-number">{stats.proofsSubmitted}</div>
              <div className="stat-label">Proofs Submitted</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
            onClick={() => setActiveTab("pending")}
          >
            📋 Pending Reviews ({stats.pendingReviews})
          </button>
          <button 
            className={`tab-btn ${activeTab === "students" ? "active" : ""}`}
            onClick={() => setActiveTab("students")}
          >
            👥 Students Summary ({stats.totalStudents})
          </button>
          <button 
            className={`tab-btn ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            📊 Reports & Analytics
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
                ) : leaves.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">✅</div>
                    <h3>All caught up!</h3>
                    <p>No leave requests pending your review.</p>
                  </div>
                ) : (
                  <div className="leaves-list">
                    {leaves.map(leave => (
                      <div key={leave.id} className="leave-card">
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
                              {getStatusIcon(leave.status)} {getStatusBadge(leave.status)}
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

                        <div className="leave-meta">
                          <span className="meta-item">
                            🕒 Applied: {new Date(leave.created_at).toLocaleDateString()}
                          </span>
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

            {/* Reports Tab */}
            {activeTab === "reports" && (
              <div className="dashboard-card">
                <div className="card-header">
                  <h2>Reports & Analytics</h2>
                  <div className="card-badge reports">AI Powered</div>
                </div>

                <div className="reports-grid">
                  <div className="report-card">
                    <div className="report-icon">📊</div>
                    <div className="report-content">
                      <h3>Monthly Leave Report</h3>
                      <p>Comprehensive analysis of all leave requests for the current month</p>
                      <button className="btn btn-primary btn-full">Generate Report</button>
                    </div>
                  </div>

                  <div className="report-card">
                    <div className="report-icon">🚨</div>
                    <div className="report-content">
                      <h3>Emergency Leave Analysis</h3>
                      <p>Detailed breakdown of emergency leave patterns and trends</p>
                      <button className="btn btn-outline btn-full">View Analysis</button>
                    </div>
                  </div>

                  <div className="report-card">
                    <div className="report-icon">📎</div>
                    <div className="report-content">
                      <h3>Proof Submission Report</h3>
                      <p>Track proof submission rates and verification status</p>
                      <button className="btn btn-outline btn-full">Generate Report</button>
                    </div>
                  </div>

                  <div className="report-card">
                    <div className="report-icon">👥</div>
                    <div className="report-content">
                      <h3>Student Attendance Analytics</h3>
                      <p>Academic impact analysis of student leaves</p>
                      <button className="btn btn-outline btn-full">View Analytics</button>
                    </div>
                  </div>
                </div>

                <div className="ai-note">
                  <div className="info-icon">🤖</div>
                  <div className="info-content">
                    <strong>AI-Powered Insights</strong>
                    <p>Advanced analytics and predictive insights coming soon to help you identify patterns and make data-driven decisions.</p>
                  </div>
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
                    <div className="quick-stat-value">{stats.proofsSubmitted}</div>
                    <div className="quick-stat-label">Proofs Submitted</div>
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
                        {leave.student_name} - {leave.reason}
                      </div>
                      <div className="activity-meta">
                        {new Date(leave.created_at).toLocaleDateString()} • {getStatusBadge(leave.status)}
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
                            {new Date(leave.start_date).toLocaleDateString()} → {new Date(leave.end_date).toLocaleDateString()}
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