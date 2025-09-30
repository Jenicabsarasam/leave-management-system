// src/pages/AdvisorDashboard.jsx - Complete Version
import React, { useEffect, useState } from "react";
import "../assets/styles/styles.css";
import logo from "../assets/college-1.jpg";
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
    <div className="container">
      <header className="header">
        <div className="brand">
          <img src={logo} alt="logo" />
          <h1>Advisor Dashboard</h1>
        </div>
        <nav className="nav">
          <a href="/">Home</a>
          <a href="/signin">Sign out</a>
        </nav>
      </header>

      {/* Tab Navigation */}
      <div className="tabs" style={{ marginBottom: "20px" }}>
        <button 
          className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          📋 Pending Reviews
        </button>
        <button 
          className={`tab-btn ${activeTab === "students" ? "active" : ""}`}
          onClick={() => setActiveTab("students")}
        >
          👥 Students Summary
        </button>
        <button 
          className={`tab-btn ${activeTab === "reports" ? "active" : ""}`}
          onClick={() => setActiveTab("reports")}
        >
          📊 Reports & Analytics
        </button>
      </div>

      <main className="card">
        {/* Pending Reviews Tab */}
        {activeTab === "pending" && (
          <>
            <h3 style={{ marginTop: 0 }}>Leave Requests Awaiting Your Review</h3>
            {loading ? (
              <p>Loading pending leaves...</p>
            ) : leaves.length === 0 ? (
              <p>No leave requests pending your review.</p>
            ) : (
              <div className="leaves-list">
                {leaves.map(leave => (
                  <div key={leave.id} className="leave-item card" style={{ marginBottom: "16px", padding: "16px" }}>
                    <div className="leave-header">
                      <strong>Student: {leave.student_name} (Roll No: {leave.student_rollno})</strong>
                      <span className={`status-badge ${leave.status}`}>
                        {getStatusBadge(leave.status)}
                      </span>
                    </div>
                    
                    <div className="leave-details">
                      <p><strong>Branch & Division:</strong> {leave.branch_name} - Division {leave.student_division}</p>
                      <p><strong>Hostel:</strong> {leave.hostel_name}</p>
                      <p><strong>Reason:</strong> {leave.reason}</p>
                      <p><strong>Dates:</strong> {new Date(leave.start_date).toLocaleDateString()} to {new Date(leave.end_date).toLocaleDateString()}</p>
                      <p><strong>Type:</strong> {leave.type === "emergency" ? "🚨 Emergency" : "📝 Normal"}</p>
                      <p><strong>Applied on:</strong> {new Date(leave.created_at).toLocaleDateString()}</p>
                    </div>

                    <div className="leave-actions">
                      {leave.status === "parent_approved" && (
                        <div>
                          <p style={{ marginBottom: "8px" }}>Review this leave request:</p>
                          <button 
                            className="btn btn-primary" 
                            onClick={() => handleDecision(leave.id, "approve")}
                            style={{ marginRight: "8px" }}
                          >
                            ✅ Approve
                          </button>
                          <button 
                            className="btn btn-outline" 
                            onClick={() => handleDecision(leave.id, "reject")}
                          >
                            ❌ Reject
                          </button>
                        </div>
                      )}
                      
                      {leave.status === "pending" && (
                        <p style={{ color: "orange" }}>
                          ⏳ Waiting for parent approval
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Students Summary Tab */}
        {activeTab === "students" && (
          <>
            <h3 style={{ marginTop: 0 }}>Students Summary & Analytics</h3>
            
            {/* Summary Cards */}
            <div className="summary-cards" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "20px" }}>
              <div className="card" style={{ textAlign: "center", padding: "16px" }}>
                <h4 style={{ margin: "0 0 8px 0", color: "#007bff" }}>{studentsSummary.length}</h4>
                <p style={{ margin: 0, color: "#666" }}>Total Students</p>
              </div>
              <div className="card" style={{ textAlign: "center", padding: "16px" }}>
                <h4 style={{ margin: "0 0 8px 0", color: "#28a745" }}>
                  {studentsSummary.reduce((sum, student) => sum + (student.completed_leaves || 0), 0)}
                </h4>
                <p style={{ margin: 0, color: "#666" }}>Completed Leaves</p>
              </div>
              <div className="card" style={{ textAlign: "center", padding: "16px" }}>
                <h4 style={{ margin: "0 0 8px 0", color: "#dc3545" }}>
                  {studentsSummary.reduce((sum, student) => sum + (student.emergency_leaves || 0), 0)}
                </h4>
                <p style={{ margin: 0, color: "#666" }}>Emergency Leaves</p>
              </div>
              <div className="card" style={{ textAlign: "center", padding: "16px" }}>
                <h4 style={{ margin: "0 0 8px 0", color: "#ffc107" }}>
                  {studentsSummary.reduce((sum, student) => sum + (student.proofs_submitted || 0), 0)}
                </h4>
                <p style={{ margin: 0, color: "#666" }}>Proofs Submitted</p>
              </div>
            </div>

            {/* Students List */}
            <div className="students-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
              {studentsSummary.map(student => (
                <div 
                  key={student.id} 
                  className="card student-card" 
                  style={{ padding: "16px", cursor: "pointer", borderLeft: "4px solid #007bff" }}
                  onClick={() => setSelectedStudent(student)}
                >
                  <h4 style={{ margin: "0 0 8px 0" }}>{student.name}</h4>
                  <p style={{ margin: "4px 0", color: "#666" }}>Roll No: {student.roll_number}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                    <span>Leaves: {student.total_leaves || 0}</span>
                    <span>Emergency: {student.emergency_leaves || 0}</span>
                  </div>
                  {student.proofs_submitted > 0 && (
                    <div style={{ marginTop: "8px", padding: "4px", backgroundColor: "#fff3cd", borderRadius: "4px" }}>
                      📎 {student.proofs_submitted || 0} proof(s) submitted
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Student Detail Modal */}
            {selectedStudent && (
              <div className="modal" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                <div className="card" style={{ width: "90%", maxWidth: "800px", maxHeight: "90vh", overflow: "auto" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ margin: 0 }}>{selectedStudent.name} - Leave History</h3>
                    <button onClick={() => setSelectedStudent(null)} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer" }}>×</button>
                  </div>
                  
                  <div className="student-details">
                    <p><strong>Roll Number:</strong> {selectedStudent.roll_number}</p>
                    <p><strong>Email:</strong> {selectedStudent.email}</p>
                    <p><strong>Phone:</strong> {selectedStudent.phone}</p>
                    <p><strong>Total Leaves:</strong> {selectedStudent.total_leaves || 0}</p>
                    <p><strong>Emergency Leaves:</strong> {selectedStudent.emergency_leaves || 0}</p>
                    <p><strong>Proofs Submitted:</strong> {selectedStudent.proofs_submitted || 0}</p>
                    <p><strong>Proofs Verified:</strong> {selectedStudent.proofs_verified || 0}</p>
                  </div>

                  <h4>Recent Leaves</h4>
                  <div className="recent-leaves">
                    {recentLeaves
                      .filter(leave => leave.student_name === selectedStudent.name)
                      .slice(0, 5)
                      .map(leave => (
                        <div key={leave.id} className="card" style={{ padding: "12px", marginBottom: "8px" }}>
                          <p><strong>Reason:</strong> {leave.reason}</p>
                          <p><strong>Dates:</strong> {new Date(leave.start_date).toLocaleDateString()} to {new Date(leave.end_date).toLocaleDateString()}</p>
                          <p><strong>Status:</strong> {getStatusBadge(leave.status)}</p>
                          {leave.proof_submitted && (
                            <p>
                              <strong>Proof:</strong> {leave.proof_verified ? "✅ Verified" : "⏳ Pending Verification"}
                              {!leave.proof_verified && (
                                <button 
                                  className="btn btn-primary" 
                                  onClick={() => handleVerifyProof(leave.id, true)}
                                  style={{ marginLeft: "8px", padding: "4px 8px" }}
                                >
                                  Verify
                                </button>
                              )}
                            </p>
                          )}
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <>
            <h3 style={{ marginTop: 0 }}>Reports & Analytics</h3>
            <div className="card">
              <h4>Generate Reports</h4>
              <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
                <button className="btn btn-primary">📊 Monthly Leave Report</button>
                <button className="btn btn-outline">🚨 Emergency Leave Analysis</button>
                <button className="btn btn-outline">📎 Proof Submission Report</button>
              </div>
              <p style={{ color: "#666", fontStyle: "italic" }}>
                AI-powered analytics and automated reporting features coming soon...
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdvisorDashboard;