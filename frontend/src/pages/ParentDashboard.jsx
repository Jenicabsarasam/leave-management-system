// src/pages/ParentDashboard.jsx - Complete Updated Version
import React, { useEffect, useState } from "react";
import "../assets/styles/styles.css";
import logo from "../assets/college-1.jpg";
import { getLeaves, parentApprove, confirmArrival, uploadProof } from "../api";

const ParentDashboard = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProofFile, setSelectedProofFile] = useState(null);
  const [uploadingProof, setUploadingProof] = useState({});
  const token = localStorage.getItem("token");

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = await getLeaves(token);
      console.log("Parent leaves data:", data);
      
      // Show leaves that are pending parent approval OR approved but arrival not confirmed OR completed emergency leaves needing proof
      const parentLeaves = data.leaves?.filter(leave => 
        leave.status === "pending" || 
        (leave.status === "warden_approved" && !leave.arrival_timestamp) ||
        (leave.type === "emergency" && leave.status === "completed" && !leave.proof_submitted)
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

  const handleProofFileSelect = (leaveId, file) => {
    if (file && file.type === 'application/pdf') {
      setSelectedProofFile({ leaveId, file });
    } else {
      alert("Please select a PDF file");
    }
  };

  const handleProofUpload = async (leaveId) => {
    if (!selectedProofFile || selectedProofFile.leaveId !== leaveId) {
      alert("Please select a PDF file first");
      return;
    }

    try {
      setUploadingProof(prev => ({ ...prev, [leaveId]: true }));
      
      const formData = new FormData();
      formData.append('proof', selectedProofFile.file);
      
      const res = await uploadProof(token, leaveId, formData);
      alert(res.msg || "Proof uploaded successfully");
      
      setSelectedProofFile(null);
      fetchLeaves();
    } catch (err) {
      console.error(err);
      alert(err.message || "Error uploading proof");
    } finally {
      setUploadingProof(prev => ({ ...prev, [leaveId]: false }));
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: "Pending Parent Approval",
      parent_approved: "Approved by Parent",
      advisor_approved: "Approved by Advisor", 
      warden_approved: "Approved - Confirm Arrival",
      meeting_scheduled: "Meeting Scheduled with Warden",
      rejected: "Rejected",
      completed: "Completed"
    };
    return statusMap[status] || status;
  };

  const canUploadProof = (leave) => {
    return leave.type === "emergency" && 
           leave.status === "completed" && 
           leave.arrival_timestamp && 
           !leave.proof_submitted;
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
              <div key={leave.id} className="leave-item card" style={{ 
                marginBottom: "16px", 
                padding: "16px",
                borderLeft: leave.type === "emergency" ? "4px solid #dc3545" : "4px solid #007bff"
              }}>
                <div className="leave-header">
                  <div>
                    <strong>Student: {leave.student_name} (Roll No: {leave.student_rollno})</strong>
                    {leave.type === "emergency" && (
                      <div style={{ color: "#dc3545", fontWeight: "bold", marginTop: "4px" }}>
                        🚨 EMERGENCY LEAVE
                      </div>
                    )}
                  </div>
                  <span className={`status-badge ${leave.status}`}>
                    {getStatusBadge(leave.status)}
                  </span>
                </div>
                
                <div className="leave-details">
                  <p><strong>Reason:</strong> {leave.reason}</p>
                  <p><strong>Dates:</strong> {new Date(leave.start_date).toLocaleDateString()} to {new Date(leave.end_date).toLocaleDateString()}</p>
                  <p><strong>Type:</strong> {leave.type === "emergency" ? "🚨 Emergency" : "📝 Normal"}</p>
                  <p><strong>Applied on:</strong> {new Date(leave.created_at).toLocaleDateString()}</p>
                  
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
                  
                  {/* Show proof status */}
                  {leave.proof_submitted && (
                    <p style={{ color: "green", fontWeight: "bold" }}>
                      📎 Proof submitted on {new Date(leave.proof_submitted_at).toLocaleDateString()}
                      {leave.proof_verified && " ✅ Verified by Advisor"}
                    </p>
                  )}
                </div>

                <div className="leave-actions">
                  {leave.status === "pending" && (
                    <div>
                      <p style={{ marginBottom: "8px" }}>Approve this leave request?</p>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button 
                          className="btn btn-primary" 
                          onClick={() => handleAction(leave.id, "approve")}
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
                    <p style={{ color: "green", marginBottom: "8px" }}>
                      ✅ Arrival confirmed on {new Date(leave.arrival_timestamp).toLocaleString()}
                    </p>
                  )}

                  {/* Proof Upload Section for Emergency Leaves */}
                  {canUploadProof(leave) && (
                    <div style={{ marginTop: "12px", padding: "12px", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
                      <h4 style={{ margin: "0 0 8px 0", color: "#dc3545" }}>📎 Submit Emergency Leave Proof</h4>
                      <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#666" }}>
                        Please upload supporting documents (medical certificate, tickets, etc.) as PDF.
                      </p>
                      
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleProofFileSelect(leave.id, e.target.files[0])}
                          style={{ flex: "1", minWidth: "200px" }}
                        />
                        <button 
                          className="btn btn-primary" 
                          onClick={() => handleProofUpload(leave.id)}
                          disabled={!selectedProofFile || selectedProofFile.leaveId !== leave.id || uploadingProof[leave.id]}
                          style={{ backgroundColor: "#28a745" }}
                        >
                          {uploadingProof[leave.id] ? "Uploading..." : "📎 Upload Proof"}
                        </button>
                      </div>
                      
                      {selectedProofFile && selectedProofFile.leaveId === leave.id && (
                        <p style={{ margin: "8px 0 0 0", color: "green", fontSize: "12px" }}>
                          Selected: {selectedProofFile.file.name}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: "20px" }} className="card">
          <h4 style={{ marginTop: 0 }}>Summary</h4>
          <div className="kv">Pending actions: <strong>{leaves.length}</strong></div>
          <div className="kv">
            Normal leaves: <strong>{leaves.filter(l => l.type === "normal").length}</strong> | 
            Emergency leaves: <strong>{leaves.filter(l => l.type === "emergency").length}</strong>
          </div>
          <div className="kv">
            Awaiting approval: <strong>{leaves.filter(l => l.status === "pending").length}</strong> | 
            Awaiting arrival confirmation: <strong>{leaves.filter(l => l.status === "warden_approved" && !l.arrival_timestamp).length}</strong>
          </div>
          <div className="kv">
            Need proof upload: <strong>{leaves.filter(canUploadProof).length}</strong>
          </div>
        </div>

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