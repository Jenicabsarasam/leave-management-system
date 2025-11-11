import React, { useEffect, useState } from "react";
import "../assets/styles/adminDashboard.css";
import logo from "../assets/college-logo.png";

import {
  getAdminStats,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllLeaves,
  bulkImportUsers,
} from "../api";

const API_URL = "http://localhost:5050";

const AdminDashboard = () => {
  /* ------------------------------ Tab State ------------------------------ */
  const [activeTab, setActiveTab] = useState("overview");

  /* ---------------------------- Loading State ---------------------------- */
  const [loading, setLoading] = useState(false);

  /* ----------------------------- Core Datasets --------------------------- */
  const [users, setUsers] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [systemStats, setSystemStats] = useState({});

  /* ----------------------------- UI Controls ----------------------------- */
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  /* ------------------------- Filters: Users & Leaves ---------------------- */
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");

  /* -------------------------- AI Report Summary --------------------------- */
  const [aiSummary, setAiSummary] = useState("");

  /* ---------------------------- Reports States --------------------------- */
  const [monthlyStats, setMonthlyStats] = useState([]); // [{ ym, total, approved, rejected, emergency }]
  const [roleDistribution, setRoleDistribution] = useState([]); // [{ role, count }]
  const [branchLeaves, setBranchLeaves] = useState([]); // [{ branch, leaves }]
  const [hostelMovement, setHostelMovement] = useState([]); // [{ hostel, leaves }]
  const [activityAnalytics, setActivityAnalytics] = useState({
    // { mostActiveAdvisors:[], avgApprovalHours:number }
    mostActiveAdvisors: [],
    avgApprovalHours: 0,
  });
  const [compareFrom, setCompareFrom] = useState(""); // YYYY-MM
  const [compareTo, setCompareTo] = useState(""); // YYYY-MM
  const [compareResult, setCompareResult] = useState([]); // [{period:'A'|'B', total, emergency, approved, rejected}]
  const [anomalies, setAnomalies] = useState([]); // [{ id, name, leaves, z }]

  /* ------------------------------ Auth Token ----------------------------- */
  const token = localStorage.getItem("token");

  /* ============================= Fetch All Data ========================== */
  const fetchAdminData = async () => {
    try {
      setLoading(true);

      const [statsData, usersData, leavesData] = await Promise.all([
        getAdminStats(token),
        getAllUsers(token),
        getAllLeaves(token),
      ]);

      setSystemStats(statsData);
      setUsers(usersData.users || []);
      setLeaves(leavesData.leaves || []);
    } catch (err) {
      console.error("Error fetching admin data:", err);
      alert("Error loading admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  /* ============================ Generate AI Report ======================= */
  const handleGenerateReport = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/admin/generate-report`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.aiSummary) {
        setAiSummary(data.aiSummary);
        alert("✅ Report generated successfully!");
      } else {
        alert("No report data available.");
      }
    } catch (err) {
      console.error("Error generating report:", err);
      alert("Error generating report: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  /* =============================== Users Filter ========================== */
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.roll_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = selectedRole === "all" || user.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  /* ================================ Users CRUD =========================== */
 const handleCreateUser = async (userData) => {
  console.log("Creating user with data:", userData);
  
  try {
    const response = await createUser(token, userData);
    console.log("User creation response:", response);
    
    alert("✅ User created successfully!");
    setShowUserModal(false);
    fetchAdminData();
  } catch (err) {
    console.error("Error creating user:", err);
    console.error("Error details:", err.response);
    
    // Show specific error message from backend
    const errorMessage = err.message || "Failed to create user. Please check the console for details.";
    alert(`❌ Error: ${errorMessage}`);
  }
};

  const handleUpdateUser = async (userId, userData) => {
    try {
      await updateUser(token, userId, userData);
      alert("User updated successfully!");
      setSelectedUser(null);
      fetchAdminData();
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Error updating user: " + err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    const sure = window.confirm(
      "Are you sure you want to delete this user? This action cannot be undone."
    );

    if (!sure) return;

    try {
      await deleteUser(token, userId);
      alert("User deleted successfully!");
      fetchAdminData();
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Error deleting user: " + err.message);
    }
  };

  const handleBulkImport = async (formData) => {
    try {
      await bulkImportUsers(token, formData);
      alert("Users imported successfully!");
      setShowImportModal(false);
      fetchAdminData();
    } catch (err) {
      console.error("Error importing users:", err);
      alert("Error importing users: " + err.message);
    }
  };

  const exportUsersToCSV = (rows) => {
    const csvData = [
      [
        "Name",
        "Email",
        "Role",
        "Branch",
        "Hostel",
        "Status",
        "Roll Number",
        "Division",
      ],
      ...rows.map((u) => [
        (u.name || "").replace(/,/g, " "),
        (u.email || "").replace(/,/g, " "),
        u.role || "",
        u.branch_name || "",
        u.hostel_name || "",
        u.status || "",
        u.roll_number || "",
        u.division || "",
      ]),
    ]
      .map((r) => r.join(","))
      .join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ============================== Leaves Mgmt ============================ */
  const fetchFilteredLeaves = async (type, value) => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/admin/leaves?${type}=${encodeURIComponent(value)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setLeaves(data.leaves || []);
    } catch (err) {
      console.error("Error filtering leaves:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLeaveStatus = async (id, status) => {
    try {
      await fetch(`${API_URL}/admin/leaves/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      alert(`Leave ${status} successfully.`);
      fetchAdminData();
    } catch (err) {
      console.error("Error updating leave status:", err);
    }
  };

  const handleVerifyProof = async (id) => {
    try {
      await fetch(`${API_URL}/admin/leaves/${id}/verify-proof`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Proof verified successfully!");
      fetchAdminData();
    } catch (err) {
      console.error("Error verifying proof:", err);
    }
  };

  const exportLeavesToCSV = (rows) => {
    const csvData = [
      ["Student", "Branch", "Hostel", "From", "To", "Reason", "Status"],
      ...rows.map((l) => [
        (l.student_name || "").replace(/,/g, " "),
        l.branch_name || "",
        l.hostel_name || "",
        l.start_date || "",
        l.end_date || "",
        (l.reason || "").replace(/,/g, " "),
        l.status || "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "leaves_report.csv";
    link.click();
  };

  /* ============================== Icon Helpers =========================== */
  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return "✅";
      case "inactive":
        return "❌";
      case "pending":
        return "⏳";
      default:
        return "📝";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "student":
        return "🎓";
      case "advisor":
        return "📚";
      case "warden":
        return "🏠";
      case "parent":
        return "👨‍👩‍👧";
      case "admin":
        return "⚙️";
      default:
        return "👤";
    }
  };

  const getLeaveStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "approved":
        return "✅";
      case "rejected":
        return "❌";
      default:
        return "📝";
    }
  };

  /* ========================= Reports & Analytics ========================= */
  const loadAnalytics = async () => {
    try {
      setLoading(true);

      const [rMonthly, rRoles, rBranches, rHostels, rActivity, rAnoms] =
        await Promise.all([
          fetch(`${API_URL}/admin/analytics/monthly`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json()),
          fetch(`${API_URL}/admin/analytics/roles`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json()),
          fetch(`${API_URL}/admin/analytics/branches`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json()),
          fetch(`${API_URL}/admin/analytics/hostels`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json()),
          fetch(`${API_URL}/admin/analytics/activity`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json()),
          fetch(`${API_URL}/admin/analytics/anomalies`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json()),
        ]);

      setMonthlyStats(rMonthly.months || []);
      setRoleDistribution(rRoles.roles || []);
      setBranchLeaves(rBranches.branches || []);
      setHostelMovement(rHostels.hostels || []);
      setActivityAnalytics({
        mostActiveAdvisors: rActivity.mostActiveAdvisors || [],
        avgApprovalHours: rActivity.avgApprovalHours || 0,
      });
      setAnomalies(rAnoms.anomalies || []);
    } catch (e) {
      console.error("Analytics load error:", e);
      alert("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const comparePeriodsRequest = async () => {
    if (!compareFrom || !compareTo) {
      alert("Please choose both months to compare.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/admin/analytics/compare?from=${compareFrom}-01&to=${compareTo}-01`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();
      setCompareResult(data.compare || []);
    } catch (e) {
      console.error(e);
      alert("Comparison failed");
    } finally {
      setLoading(false);
    }
  };

  /* =============================== Render ================================ */
  return (
    <div className="dashboard-container admin-dashboard">
      {/* ================================ Header ================================ */}
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <div className="logo-container">
            <img src={logo} alt="College Logo" />
          </div>

          <div className="dashboard-title">
            <h1>Admin Dashboard</h1>
            <p>Complete system management and oversight</p>
          </div>
        </div>

        <nav className="dashboard-nav">
          <a href="/" className="nav-link">
            🏠 Home
          </a>

          <a href="/signin" className="nav-link logout">
            🚪 Sign Out
          </a>
        </nav>
      </header>

      {/* ============================== Top Stats ============================== */}
      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <div className="stat-number">{systemStats.totalUsers || 0}</div>
              <div className="stat-label">Total Users</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <div className="stat-number">{systemStats.totalLeaves || 0}</div>
              <div className="stat-label">Total Leaves</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <div className="stat-number">
                {systemStats.pendingLeaves || 0}
              </div>
              <div className="stat-label">Pending Leaves</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🚨</div>
            <div className="stat-info">
              <div className="stat-number">
                {systemStats.emergencyLeaves || 0}
              </div>
              <div className="stat-label">Emergency Leaves</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎓</div>
            <div className="stat-info">
              <div className="stat-number">
                {systemStats.activeStudents || 0}
              </div>
              <div className="stat-label">Active Students</div>
            </div>
          </div>
        </div>

        {/* ================================ Tabs ================================= */}
        <div className="dashboard-tabs">
          <button
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            📊 System Overview
          </button>

          <button
            className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            👥 User Management
          </button>

          <button
            className={`tab-btn ${activeTab === "leaves" ? "active" : ""}`}
            onClick={() => setActiveTab("leaves")}
          >
            📋 All Leaves
          </button>

          <button
            className={`tab-btn ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("reports");
              loadAnalytics();
            }}
          >
            📈 Reports & Analytics
          </button>
        </div>

        {/* ============================== Grid Columns =========================== */}
        <div className="dashboard-grid">
          <div className="dashboard-column main-content">
            {/* ============================= Overview Tab ============================== */}
            {activeTab === "overview" && (
              <div className="dashboard-card">
                <div className="card-header">
                  <h2>System Overview</h2>
                </div>

                {loading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading system data...</p>
                  </div>
                ) : (
                  <div className="overview-layout">
                    <div className="overview-left">
                      <h3>📈 System Insights</h3>

                      <button
                        className="btn btn-outline"
                        onClick={handleGenerateReport}
                      >
                        📊 Generate Report
                      </button>

                      {aiSummary && (
                        <div className="ai-summary-card">
                          <b>Report Summary:</b>
                          <br />
                          {aiSummary}
                        </div>
                      )}
                    </div>

                    <div className="overview-right">
                      <div className="status-card">
                        <h3>🖥️ System Status</h3>

                        <ul>
                          <li>
                            Application{" "}
                            <span className="status-green">Online</span>
                          </li>
                          <li>
                            Database{" "}
                            <span className="status-green">Connected</span>
                          </li>
                          <li>
                            File System{" "}
                            <span className="status-green">Healthy</span>
                          </li>
                          <li>
                            API <span className="status-green">Running</span>
                          </li>
                        </ul>
                      </div>

                      <div className="stats-card">
                        <h3>📊 Quick Statistics</h3>

                        <ul>
                          <li>👥 Total Users: {systemStats.totalUsers || 0}</li>
                          <li>
                            📋 Total Leaves: {systemStats.totalLeaves || 0}
                          </li>
                          <li>
                            ⏳ Pending Leaves: {systemStats.pendingLeaves || 0}
                          </li>
                          <li>
                            🚨 Emergency Leaves:{" "}
                            {systemStats.emergencyLeaves || 0}
                          </li>
                          <li>
                            🎓 Active Students:{" "}
                            {systemStats.activeStudents || 0}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================= User Management =========================== */}
            {activeTab === "users" && (
              <div className="user-table-container">
                <div className="card-header">
                  <h2>User Management</h2>

                  <div className="actions">
                    <button
                      className="add-user-btn"
                      onClick={() => setShowUserModal(true)}
                    >
                      👤 Add New User
                    </button>
                  </div>

                  <div className="user-filters">
                    <input
                      type="text"
                      placeholder="Search by name, email, or roll number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />

                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="role-select"
                    >
                      <option value="all">All Roles</option>
                      <option value="student">Student</option>
                      <option value="advisor">Advisor</option>
                      <option value="warden">Warden</option>
                      <option value="parent">Parent</option>
                      <option value="admin">Admin</option>
                    </select>

                    <button
                      className="export-btn"
                      onClick={() => exportUsersToCSV(filteredUsers)}
                    >
                      📤 Export CSV
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading users...</p>
                  </div>
                ) : (
                  <table className="user-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Branch</th>
                        <th>Hostel</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <tr key={user.id}>
                            <td>
                              <div className="user-info">
                                <div className="user-name">{user.name}</div>
                                <div className="user-email">{user.email}</div>
                                {user.roll_number && (
                                  <div
                                    style={{
                                      fontSize: "0.8rem",
                                      color: "#666",
                                      marginTop: "2px",
                                    }}
                                  >
                                    Roll No: {user.roll_number}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="user-role">
                                {getRoleIcon(user.role)}
                                {user.role?.charAt(0).toUpperCase() +
                                  user.role?.slice(1)}
                              </div>
                            </td>
                            <td>{user.branch_name || "–"}</td>
                            <td>{user.hostel_name || "–"}</td>
                            <td>
                              <div className="action-buttons">
                                <button
                                  className="btn-danger"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="6"
                            style={{ textAlign: "center", padding: "3rem" }}
                          >
                            <div style={{ color: "#666", fontSize: "1rem" }}>
                              👥 No users found
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* ============================== All Leaves Tab ============================== */}
            {activeTab === "leaves" && (
              <div className="leave-table-container">
                <h2>All Leave Applications</h2>

                <div className="leave-filters">
                  <select
                    onChange={(e) =>
                      fetchFilteredLeaves("status", e.target.value)
                    }
                    defaultValue="All"
                  >
                    <option value="All">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  <button
                    className="export-btn"
                    onClick={() => exportLeavesToCSV(leaves)}
                  >
                    📤 Export to CSV
                  </button>
                </div>

                {loading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading leaves...</p>
                  </div>
                ) : (
                  <>
                    <table className="leave-table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Branch</th>
                          <th>Hostel</th>
                          <th>From - To</th>
                          <th>Reason</th>
                          <th>Status</th>
                          <th>Proof</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaves.length > 0 ? (
                          leaves.map((leave, index) => {
                            // Safe date parsing function
                            const parseDate = (dateString) => {
                              if (!dateString) return null;
                              const date = new Date(dateString);
                              return isNaN(date.getTime()) ? null : date;
                            };

                            const fromDate = parseDate(
                              leave.from_date || leave.start_date
                            );
                            const toDate = parseDate(
                              leave.to_date || leave.end_date
                            );

                            // Calculate days difference safely
                            let daysDiff = "–";
                            if (fromDate && toDate) {
                              const diffTime = Math.abs(toDate - fromDate);
                              daysDiff =
                                Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
                            }

                            return (
                              <tr key={index}>
                                <td>
                                  <strong>{leave.student_name}</strong>
                                  {leave.student_rollno && (
                                    <div
                                      style={{
                                        fontSize: "0.8rem",
                                        color: "#666",
                                        marginTop: "2px",
                                      }}
                                    >
                                      Roll No: {leave.student_rollno}
                                    </div>
                                  )}
                                </td>
                                <td>{leave.branch_name || "–"}</td>
                                <td>{leave.hostel_name || "–"}</td>
                                <td>
                                  <div style={{ fontWeight: "500" }}>
                                    {fromDate
                                      ? fromDate.toLocaleDateString("en-GB", {
                                          day: "numeric",
                                          month: "short",
                                        })
                                      : "–"}{" "}
                                    -{" "}
                                    {toDate
                                      ? toDate.toLocaleDateString("en-GB", {
                                          day: "numeric",
                                          month: "short",
                                        })
                                      : "–"}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "0.8rem",
                                      color: "#666",
                                      marginTop: "2px",
                                    }}
                                  >
                                    {daysDiff} {daysDiff === 1 ? "day" : "days"}
                                  </div>
                                </td>
                                <td>
                                  <div style={{ maxWidth: "200px" }}>
                                    {leave.reason || "–"}
                                  </div>
                                </td>
                                <td>
                                  <span
                                    className={
                                      leave.status === "approved"
                                        ? "status-green"
                                        : leave.status === "pending"
                                        ? "status-yellow"
                                        : "status-red"
                                    }
                                  >
                                    {leave.status?.charAt(0).toUpperCase() +
                                      leave.status?.slice(1)}
                                  </span>
                                </td>
                                <td>
                                  <span
                                    className={`proof-badge ${
                                      leave.proof_submitted ? "" : "no-proof"
                                    }`}
                                  >
                                    {leave.proof_submitted
                                      ? "📎 Submitted"
                                      : "No Proof"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td
                              colSpan="7"
                              style={{ textAlign: "center", padding: "3rem" }}
                            >
                              <div style={{ color: "#666", fontSize: "1rem" }}>
                                📝 No leave applications found
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            )}
            {/* ========================== Reports & Analytics ========================== */}
            {activeTab === "reports" && (
              <div className="reports-container">
                <div className="reports-header">
                  <h2>Reports & Analytics</h2>
                  <div className="reports-actions">
                    <button className="btn btn-outline" onClick={loadAnalytics}>
                      🔄 Refresh Analytics
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={handleGenerateReport}
                    >
                      🧠 Generate Summary
                    </button>
                  </div>
                </div>

                {/* AI Summary Bubble */}
                {aiSummary && (
                  <div className="ai-summary-card">
                    <b>📊Report Summary</b>
                    {aiSummary}
                  </div>
                )}

                {/* Monthly Stats */}
                <section className="analytics-block">
                  <h3>📆 Monthly Leave Statistics</h3>
                  {monthlyStats.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "2rem",
                        color: "#666",
                      }}
                    >
                      No monthly data available
                    </div>
                  ) : (
                    <table className="analytics-table">
                      <thead>
                        <tr>
                          <th>Month</th>
                          <th>Total</th>
                          <th>Approved</th>
                          <th>Rejected</th>
                          <th>Emergency</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyStats.map((m) => (
                          <tr key={m.ym}>
                            <td>
                              <strong>{m.ym}</strong>
                            </td>
                            <td>{m.total}</td>
                            <td>
                              <span
                                style={{ color: "#27ae60", fontWeight: "600" }}
                              >
                                {m.approved}
                              </span>
                            </td>
                            <td>
                              <span
                                style={{ color: "#e74c3c", fontWeight: "600" }}
                              >
                                {m.rejected}
                              </span>
                            </td>
                            <td>
                              <span
                                style={{ color: "#f39c12", fontWeight: "600" }}
                              >
                                {m.emergency}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </section>

                {/* Anomaly Detection */}
                <section className="analytics-block">
                  <h3>🚨 High Leave Frequency</h3>
                  {anomalies.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "2rem",
                        color: "#666",
                      }}
                    >
                      No anomalies flagged
                    </div>
                  ) : (
                    <table className="analytics-table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Total Leaves</th>
                        </tr>
                      </thead>
                      <tbody>
                        {anomalies.map((z) => (
                          <tr key={z.id}>
                            <td>
                              <strong>{z.name}</strong>
                            </td>
                            <td>
                              <span
                                style={{ color: "#e74c3c", fontWeight: "600" }}
                              >
                                {z.leaves}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </section>
              </div>
            )}
          </div>
        </div>
      </div>

      {showUserModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add New User</h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const newUser = {
                  name: formData.get("name"),
                  email: formData.get("email"),
                  phone: formData.get("phone"),
                  role: formData.get("role"),
                  roll_number: formData.get("roll_number"),
                  division: formData.get("division"),
                  branch_name: formData.get("branch_name"),
                  hostel_name: formData.get("hostel_name"),
                  password: formData.get("password"),
                };
                handleCreateUser(newUser);
              }}
            >
              <div className="form-grid">
                <input name="name" placeholder="Full Name *" required />
                <input
                  name="email"
                  type="email"
                  placeholder="Email Address *"
                  required
                />
                <input name="phone" placeholder="Phone Number" />
                <select name="role" required>
                  <option value="">Select Role *</option>
                  <option value="student">Student</option>
                  <option value="advisor">Advisor</option>
                  <option value="warden">Warden</option>
                  <option value="parent">Parent</option>
                  <option value="admin">Admin</option>
                </select>
                <input name="roll_number" placeholder="Roll Number" />
                <input name="division" placeholder="Division" />
                <input name="branch_id" placeholder="Branch ID" />
                <input name="hostel_id" placeholder="Hostel ID" />

                <input
                  name="password"
                  type="password"
                  placeholder="Password *"
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  ✅ Create User
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowUserModal(false)}
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
