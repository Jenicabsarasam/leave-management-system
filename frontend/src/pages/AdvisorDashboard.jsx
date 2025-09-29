// src/pages/AdvisorDashboard.jsx
import React, { useEffect, useState } from "react";
import "../assets/styles/styles.css";
import logo from "../assets/college-1.jpg";
import { advisorReview, getLeaves } from "../api";

const AdvisorDashboard = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = await getLeaves(token);
      console.log("Advisor leaves data:", data); // Debug log
      
      // Show leaves that need advisor approval (parent_approved status)
      const advisorLeaves = (data.leaves || []).filter(l => 
        l.status === "parent_approved" || l.status === "pending"
      );
      setLeaves(advisorLeaves);
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
      const res = await advisorReview(token, leaveId, action);
      alert(res.msg || `Leave ${action}d`);
      fetchLeaves();
    } catch (err) {
      console.error(err);
      alert("Error processing request");
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: "Pending Parent Approval",
      parent_approved: "Approved by Parent - Ready for Review",
      advisor_approved: "Approved by Advisor",
      warden_approved: "Approved by Warden",
      rejected: "Rejected",
      completed: "Completed"
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

      <main className="card">
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

        <div style={{ marginTop: "20px" }} className="card">
          <h4 style={{ marginTop: 0 }}>Summary</h4>
          <div className="kv">Total leaves awaiting review: <strong>{leaves.length}</strong></div>
          <div className="kv">
            Ready for review: <strong>{leaves.filter(l => l.status === "parent_approved").length}</strong> | 
            Waiting for parents: <strong>{leaves.filter(l => l.status === "pending").length}</strong>
          </div>
          <div className="kv">
            Normal: {leaves.filter(l => l.type === "normal").length} | 
            Emergency: {leaves.filter(l => l.type === "emergency").length}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdvisorDashboard;