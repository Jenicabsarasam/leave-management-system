// src/pages/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import logo from "../assets/college-logo.png";
import { applyLeave, getLeaves } from "../api";
import QRCode from "react-qr-code";

const StudentDashboard = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const token = localStorage.getItem("token");

  const today = new Date().toISOString().split("T")[0];

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = await getLeaves(token);
      setLeaves(data.leaves || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const validateDates = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      alert("Cannot select past dates for leave request");
      return false;
    }

    if (endDate < startDate) {
      alert("End date must be after or equal to start date");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      reason: e.target.reason.value,
      startDate: e.target.from.value,
      endDate: e.target.to.value,
      type: e.target.leaveType.value,
    };

    if (!validateDates(formData.startDate, formData.endDate)) return;

    try {
      const res = await applyLeave(token, formData);
      alert(res.msg || "Leave applied successfully!");
      e.target.reset();
      setStartDate("");
      setEndDate("");
      fetchLeaves();
    } catch (err) {
      console.error(err);
      alert("Error applying leave");
    }
  };

  const filteredLeaves = leaves.filter((leave) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending")
      return (
        leave.status === "pending" ||
        leave.status === "parent_approved" ||
        leave.status === "advisor_approved" ||
        leave.status === "emergency_pending"
      );
    if (activeTab === "approved")
      return leave.status === "warden_approved" || leave.status === "completed";
    if (activeTab === "rejected") return leave.status === "rejected";
    return true;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "Invalid Date";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <div
      style={{
        fontFamily: "Poppins, sans-serif",
        backgroundColor: "#fff7f7",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid #eee",
          paddingBottom: "10px",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <img src={logo} alt="College Logo" style={{ height: "60px" }} />
          <div>
            <h1 style={{ margin: 0, color: "#c81d25" }}>Student Dashboard</h1>
            <p style={{ margin: 0, color: "#666" }}>
              Manage your leave requests and track approvals
            </p>
          </div>
        </div>
        <nav>
          <a href="/" style={{ marginRight: "15px", color: "#333" }}>
            🏠 Home
          </a>
          <a href="/signin" style={{ color: "#c81d25" }}>
            🚪 Sign Out
          </a>
        </nav>
      </header>

      {/* Two-column layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
        }}
      >
        {/* Left column - Apply Leave */}
        <div
          style={{
            background: "#fff",
            borderRadius: "10px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
          }}
        >
          <h2>Apply for Leave</h2>
          <form onSubmit={handleSubmit}>
            <label>Leave Reason *</label>
            <input
              name="reason"
              type="text"
              required
              placeholder="Brief reason..."
              style={inputStyle}
            />

            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ flex: 1 }}>
                <label>Start Date *</label>
                <input
                  name="from"
                  type="date"
                  required
                  min={today}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>End Date *</label>
                <input
                  name="to"
                  type="date"
                  required
                  min={startDate || today}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={!startDate}
                  style={inputStyle}
                />
              </div>
            </div>

            <label>Leave Type *</label>
            <select name="leaveType" style={inputStyle}>
              <option value="normal">📋 Normal Leave</option>
              <option value="emergency">🚨 Emergency Leave</option>
            </select>

            <button type="submit" style={buttonStyle}>
              📨 Submit Request
            </button>
          </form>
        </div>

        {/* Right column - Leave History */}
        <div
          style={{
            background: "#fff",
            borderRadius: "10px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
          }}
        >
          <h2>Leave History</h2>
          {loading ? (
            <p>Loading...</p>
          ) : filteredLeaves.length === 0 ? (
            <p>No leave requests yet.</p>
          ) : (
            filteredLeaves.map((leave) => (
              <div
                key={leave.id}
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "15px 20px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                  marginBottom: "15px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <p>
                      🏷️ <strong>Leave Type:</strong>{" "}
                      {leave.type === "emergency" ? "Emergency" : "Normal"}
                    </p>
                    <p>
                      📝 <strong>Reason:</strong> {leave.reason}
                    </p>
                    <p>
                      📅 <strong>Period:</strong> {formatDate(leave.start_date)} →{" "}
                      {formatDate(leave.end_date)}
                    </p>
                    <p>
                      🕒 <strong>Applied on:</strong>{" "}
                      {formatDate(leave.created_at)}
                    </p>
                  </div>

                  {/* QR shown only if approved */}
                  {leave.status === "warden_approved" && (
                    <div
                      style={{
                        textAlign: "center",
                        background: "#f9fafb",
                        padding: "10px",
                        borderRadius: "10px",
                      }}
                    >
                      <QRCode
                        value={JSON.stringify({
                          studentName: leave.student_name || "Unknown",
                          division: leave.division || "N/A",
                          hostel: leave.hostel_name || "N/A",
                          startDate: leave.start_date,
                          endDate: leave.end_date,
                          status: "Approved by Warden",
                        })}
                        size={90}
                      />
                      <p style={{ fontSize: "0.8rem", color: "#666" }}>
                        📱 Scan for details
                      </p>
                    </div>
                  )}
                </div>

                {/* Status line */}
                <div style={{ marginTop: "10px" }}>
                  {leave.status === "warden_approved" ? (
                    <span style={statusStyle("#e6f4ea", "#137333")}>
                      ✅ Status: Approved by Warden
                    </span>
                  ) : leave.status === "advisor_approved" ? (
                    <span style={statusStyle("#fff8e5", "#b45309")}>
                      📚 Status: Approved by Advisor
                    </span>
                  ) : leave.status === "parent_approved" ? (
                    <span style={statusStyle("#fff8e5", "#b45309")}>
                      👨‍👩‍👧 Status: Approved by Parent
                    </span>
                  ) : leave.status === "rejected" ? (
                    <span style={statusStyle("#fde7e9", "#b91c1c")}>
                      ❌ Status: Rejected
                    </span>
                  ) : (
                    <span style={statusStyle("#fff4e5", "#b45309")}>
                      ⏳ Status: Pending
                    </span>
                  )}
                </div>

                {/* Pending With */}
                {["pending", "parent_approved", "advisor_approved"].includes(
                  leave.status
                ) && (
                  <p style={{ color: "#b45309", fontWeight: 600, marginTop: 5 }}>
                    ⏰ <strong>Pending With:</strong>{" "}
                    {leave.status === "pending"
                      ? "Parent 👨‍👩‍👧"
                      : leave.status === "parent_approved"
                      ? "Advisor 📚"
                      : "Warden 🏢"}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

/* Inline styles */
const inputStyle = {
  width: "100%",
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  marginBottom: "10px",
};

const buttonStyle = {
  marginTop: "10px",
  backgroundColor: "#1a73e8",
  color: "white",
  border: "none",
  padding: "10px",
  borderRadius: "8px",
  cursor: "pointer",
  width: "100%",
};

const statusStyle = (bg, color) => ({
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: "6px",
  fontWeight: 600,
  backgroundColor: bg,
  color,
});

export default StudentDashboard;
