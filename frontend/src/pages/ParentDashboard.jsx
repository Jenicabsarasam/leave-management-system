// src/pages/ParentDashboard.jsx
import React, { useEffect, useState } from "react";
import "../assets/styles/styles.css";
import logo from "../assets/college-1.jpg";
import { getLeaves, parentApprove, confirmArrival } from "../api";

const ParentDashboard = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = await getLeaves(token);
      console.log("Parent leaves data:", data); // Debug log
      
      // Show leaves that are pending parent approval OR approved but arrival not confirmed
      const parentLeaves = data.leaves?.filter(leave => 
        leave.status === "pending" || 
        (leave.status === "warden_approved" && !leave.arrival_timestamp)
      ) || [];
      
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

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: "Pending Parent Approval",
      parent_approved: "Approved by Parent",
      advisor_approved: "Approved by Advisor", 
      warden_approved: "Approved - Confirm Arrival",
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
          <h1>Parent Dashboard</h1>
        </div>
        <nav className="nav">
          <a href="/">Home</a>
          <a href="/signin">Sign out</a>
        </nav>
      </header>

      <main className="card">
        <h3 style={{ marginTop: 0 }}>Your Child's Leave Requests</h3>

        {loading ? (
          <p>Loading requests...</p>
        ) : leaves.length === 0 ? (
          <p>No pending requests from your child.</p>
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
                  <p><strong>Reason:</strong> {leave.reason}</p>
                  <p><strong>Dates:</strong> {new Date(leave.start_date).toLocaleDateString()} to {new Date(leave.end_date).toLocaleDateString()}</p>
                  <p><strong>Type:</strong> {leave.type === "emergency" ? "🚨 Emergency" : "📝 Normal"}</p>
                  <p><strong>Applied on:</strong> {new Date(leave.created_at).toLocaleDateString()}</p>
                </div>

                <div className="leave-actions">
                  {leave.status === "pending" && (
                    <div>
                      <p style={{ marginBottom: "8px" }}>Approve this leave request?</p>
                      <button 
                        className="btn btn-primary" 
                        onClick={() => handleAction(leave.id, "approve")}
                        style={{ marginRight: "8px" }}
                      >
                        ✅ Approve
                      </button>
                      <button 
                        className="btn btn-outline" 
                        onClick={() => handleAction(leave.id, "reject")}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}
                  
                  {leave.status === "warden_approved" && !leave.arrival_timestamp && (
                    <div>
                      <p style={{ marginBottom: "8px" }}>Your child has returned from leave:</p>
                      <button 
                        className="btn btn-primary" 
                        onClick={() => handleArrival(leave.id)}
                      >
                        ✅ Confirm Safe Arrival
                      </button>
                    </div>
                  )}

                  {leave.arrival_timestamp && (
                    <p style={{ color: "green" }}>
                      ✅ Arrival confirmed on {new Date(leave.arrival_timestamp).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: "20px" }} className="card">
          <h4 style={{ marginTop: 0 }}>SMS Authorization</h4>
          <p className="kv">You will receive SMS alerts about leave status and arrival confirmation.</p>
          <label>
            <input type="checkbox" checked readOnly /> Enable SMS notifications
          </label>
        </div>
      </main>
    </div>
  );
};

export default ParentDashboard;