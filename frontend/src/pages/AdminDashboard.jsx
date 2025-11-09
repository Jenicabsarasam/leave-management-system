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
  getSystemLogs,
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
  const [systemLogs, setSystemLogs] = useState([]);

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
  const [monthlyStats, setMonthlyStats] = useState([]);          // [{ ym, total, approved, rejected, emergency }]
  const [roleDistribution, setRoleDistribution] = useState([]);  // [{ role, count }]
  const [branchLeaves, setBranchLeaves] = useState([]);          // [{ branch, leaves }]
  const [hostelMovement, setHostelMovement] = useState([]);      // [{ hostel, leaves }]
  const [activityAnalytics, setActivityAnalytics] = useState({   // { mostActiveAdvisors:[], avgApprovalHours:number }
    mostActiveAdvisors: [],
    avgApprovalHours: 0
  });
  const [compareFrom, setCompareFrom] = useState("");            // YYYY-MM
  const [compareTo, setCompareTo] = useState("");                // YYYY-MM
  const [compareResult, setCompareResult] = useState([]);        // [{period:'A'|'B', total, emergency, approved, rejected}]
  const [anomalies, setAnomalies] = useState([]);                // [{ id, name, leaves, z }]

  /* ------------------------------ Logs States ---------------------------- */
  const [logType, setLogType] = useState("");        // "", "auth", "leave", "user", etc (your backend 'type' values)
  const [logQuery, setLogQuery] = useState("");      // text search
  const [logLimit, setLogLimit] = useState(100);     // limit
  const [logsAISummary, setLogsAISummary] = useState({ total: 0, summary: "", breakdown: [] });

  /* ------------------------------ Auth Token ----------------------------- */
  const token = localStorage.getItem("token");

  /* ============================= Fetch All Data ========================== */
  const fetchAdminData = async () => {
    try {
      setLoading(true);

      const [
        statsData,
        usersData,
        leavesData,
        logsData
      ] = await Promise.all([
        getAdminStats(token),
        getAllUsers(token),
        getAllLeaves(token),
        getSystemLogs(token),
      ]);

      setSystemStats(statsData);
      setUsers(usersData.users || []);
      setLeaves(leavesData.leaves || []);
      setSystemLogs(logsData.logs || []);
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
    try {
      await createUser(token, userData);
      alert("User created successfully!");
      setShowUserModal(false);
      fetchAdminData();
    } catch (err) {
      console.error("Error creating user:", err);
      alert("Error creating user: " + err.message);
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

      const [
        rMonthly,
        rRoles,
        rBranches,
        rHostels,
        rActivity,
        rAnoms,
      ] = await Promise.all([
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

  /* ============================== System Logs ============================ */
  const refreshLogs = async () => {
    try {
      setLoading(true);

      // If filters/search applied, hit /logs/search
      if (logType || logQuery || logLimit !== 100) {
        const params = new URLSearchParams();
        if (logType) params.append("type", logType);
        if (logQuery) params.append("q", logQuery);
        if (logLimit) params.append("limit", String(logLimit));

        const res = await fetch(`${API_URL}/admin/logs/search?` + params.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setSystemLogs(data.logs || []);
      } else {
        // fallback to basic logs
        const res = await fetch(`${API_URL}/admin/logs`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setSystemLogs(data.logs || []);
      }

      // Always refresh AI log summary
      const sum = await fetch(`${API_URL}/admin/logs/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json());

      setLogsAISummary(sum || { total: 0, summary: "", breakdown: [] });
    } catch (e) {
      console.error("Logs load error:", e);
      alert("Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = () => {
    // just open the CSV endpoint in a new tab to download
    window.open(`${API_URL}/admin/logs/export`, "_blank");
  };

  /* =============================== Render ================================ */
  return (
    <div className="dashboard-container">
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
              <div className="stat-number">{systemStats.pendingLeaves || 0}</div>
              <div className="stat-label">Pending Leaves</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🚨</div>
            <div className="stat-info">
              <div className="stat-number">{systemStats.emergencyLeaves || 0}</div>
              <div className="stat-label">Emergency Leaves</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎓</div>
            <div className="stat-info">
              <div className="stat-number">{systemStats.activeStudents || 0}</div>
              <div className="stat-label">Active Students</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💾</div>
            <div className="stat-info">
              <div className="stat-number">{systemStats.storageUsed || "0GB"}</div>
              <div className="stat-label">Storage Used</div>
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

          <button
            className={`tab-btn ${activeTab === "logs" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("logs");
              refreshLogs();
            }}
          >
            📝 System Logs
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
      <b>AI Report Summary:</b><br />
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
                            API{" "}
                            <span className="status-green">Running</span>
                          </li>
                        </ul>
                      </div>

                      <div className="stats-card">
                        <h3>📊 Quick Statistics</h3>

                        <ul>
                          <li>
                            👥 Total Users: {systemStats.totalUsers || 0}
                          </li>
                          <li>
                            📋 Total Leaves: {systemStats.totalLeaves || 0}
                          </li>
                          <li>
                            ⏳ Pending Leaves: {systemStats.pendingLeaves || 0}
                          </li>
                          <li>
                            🚨 Emergency Leaves: {systemStats.emergencyLeaves || 0}
                          </li>
                          <li>
                            🎓 Active Students: {systemStats.activeStudents || 0}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================= User Management =========================== */}
            {/* ============================= User Management =========================== */}
{activeTab === "users" && (
  <div className="dashboard-card">
    <div className="card-header">
      <h2>User Management</h2>

      <div className="actions">
        <button
          className="btn btn-primary"
          onClick={() => setShowUserModal(true)}
        >
          👤 Add New User
        </button>

        <button
          className="btn btn-success"
          onClick={() => setShowImportModal(true)}
        >
          📥 Bulk Import Users
        </button>
      </div>

      <div className="filters">
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
          className="btn btn-outline"
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
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
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
                  {getRoleIcon(user.role)} {user.name}
                </td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.branch_name || "-"}</td>
                <td>{user.hostel_name || "-"}</td>
                <td>{getStatusIcon(user.status)}</td>
                <td>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    )}
  </div>
)}

            {/* ============================== All Leaves ============================== */}
            {activeTab === "leaves" && (
              <div className="dashboard-card">
                <div className="card-header">
                  <h2>All Leave Applications</h2>

                  <div className="filters">
                    <select
                      onChange={(e) =>
                        fetchFilteredLeaves("status", e.target.value)
                      }
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="emergency_pending">Emergency</option>
                    </select>
                  </div>
                </div>

                {loading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading leaves...</p>
                  </div>
                ) : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Branch</th>
                        <th>Hostel</th>
                        <th>From - To</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Proof</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {leaves.map((leave) => (
                        <tr
                          key={leave.id}
                          style={{
                            background:
                              leave.type === "emergency" ? "#fff1f2" : "transparent",
                          }}
                        >
                          <td>
                            {leave.student_name}
                            <br />
                            ({leave.student_rollno})
                          </td>
                          <td>{leave.branch_name}</td>
                          <td>{leave.hostel_name}</td>
                          <td>
                            {leave.start_date} - {leave.end_date}
                          </td>
                          <td>{leave.reason}</td>
                          <td>
                            <span className={`status-${leave.status}`}>
                              {leave.status}
                            </span>
                          </td>
                          <td>
                            {leave.proof_path ? (
                              <a
                                href={`${API_URL}/${leave.proof_path}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                View
                              </a>
                            ) : (
                              "No Proof"
                            )}

                            {leave.proof_path && !leave.proof_verified && (
                              <button
                                className="btn btn-small btn-outline"
                                onClick={() => handleVerifyProof(leave.id)}
                              >
                                ✅ Verify
                              </button>
                            )}
                          </td>

                          <td>
                            {leave.status === "pending" && (
                              <>
                                <button
                                  className="btn btn-small btn-success"
                                  onClick={() =>
                                    handleUpdateLeaveStatus(leave.id, "approved")
                                  }
                                >
                                  Approve
                                </button>

                                <button
                                  className="btn btn-small btn-danger"
                                  onClick={() =>
                                    handleUpdateLeaveStatus(leave.id, "rejected")
                                  }
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                <button
                  className="btn btn-outline"
                  onClick={() => exportLeavesToCSV(leaves)}
                >
                  📤 Export to CSV
                </button>
              </div>
            )}

            {/* ========================== Reports & Analytics ========================== */}
            {activeTab === "reports" && (
              <div className="dashboard-card">
                <div className="card-header">
                  <h2>Reports & Analytics</h2>

                  <div className="filters">
                    <button className="btn btn-outline" onClick={loadAnalytics}>
                      🔄 Refresh Analytics
                    </button>

                    <button className="btn btn-outline" onClick={handleGenerateReport}>
                      🧠 AI-Style Summary
                    </button>
                  </div>
                </div>

                {/* AI Summary Bubble */}
                {aiSummary && (
                  <div className="ai-summary-card" style={{ marginBottom: 16 }}>
                    <b>AI Summary:</b> {aiSummary}
                  </div>
                )}

                {/* Monthly Stats */}
                <section className="analytics-block">
                  <h3>📆 Monthly Leave Statistics</h3>
                  {monthlyStats.length === 0 ? (
                    <p>No monthly data available.</p>
                  ) : (
                    <table className="table">
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
                            <td>{m.ym}</td>
                            <td>{m.total}</td>
                            <td>{m.approved}</td>
                            <td>{m.rejected}</td>
                            <td>{m.emergency}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </section>

                {/* Role Distribution */}
                <section className="analytics-block">
                  <h3>🧩 Role Distribution</h3>
                  {roleDistribution.length === 0 ? (
                    <p>No role data available.</p>
                  ) : (
                    <ul className="list-grid">
                      {roleDistribution.map((r) => (
                        <li key={r.role} className="pill">
                          {r.role}: <b>{r.count}</b>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {/* Branch-wise Leave Ratio */}
                <section className="analytics-block">
                  <h3>🏫 Branch-wise Leave Ratio</h3>
                  {branchLeaves.length === 0 ? (
                    <p>No branch data available.</p>
                  ) : (
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Branch</th>
                          <th>Leaves</th>
                        </tr>
                      </thead>
                      <tbody>
                        {branchLeaves.map((b) => (
                          <tr key={b.branch}>
                            <td>{b.branch}</td>
                            <td>{b.leaves}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </section>

                {/* Hostel Movement */}
                <section className="analytics-block">
                  <h3>🏠 Hostel Movement</h3>
                  {hostelMovement.length === 0 ? (
                    <p>No hostel movement available.</p>
                  ) : (
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Hostel</th>
                          <th>Leaves</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hostelMovement.map((h) => (
                          <tr key={h.hostel}>
                            <td>{h.hostel}</td>
                            <td>{h.leaves}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </section>

                {/* User Activity */}
                <section className="analytics-block">
                  <h3>👤 User Activity Analytics</h3>
                  <p>
                    Average approval time:{" "}
                    <b>{activityAnalytics.avgApprovalHours}</b> hours
                  </p>

                  {activityAnalytics.mostActiveAdvisors.length === 0 ? (
                    <p>No advisor activity yet.</p>
                  ) : (
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Advisor</th>
                          <th>Approvals</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activityAnalytics.mostActiveAdvisors.map((a) => (
                          <tr key={a.id}>
                            <td>{a.name}</td>
                            <td>{a.approvals}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </section>

                {/* Compare Periods */}
                <section className="analytics-block">
                  <h3>🔁 Compare Periods</h3>

                  <div className="compare-row">
                    <div className="compare-col">
                      <label>From (YYYY-MM)</label>
                      <input
                        type="month"
                        value={compareFrom}
                        onChange={(e) => setCompareFrom(e.target.value)}
                      />
                    </div>

                    <div className="compare-col">
                      <label>To (YYYY-MM)</label>
                      <input
                        type="month"
                        value={compareTo}
                        onChange={(e) => setCompareTo(e.target.value)}
                      />
                    </div>

                    <div className="compare-col">
                      <button className="btn btn-outline" onClick={comparePeriodsRequest}>
                        Compare
                      </button>
                    </div>
                  </div>

                  {compareResult.length > 0 && (
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Period</th>
                          <th>Total</th>
                          <th>Approved</th>
                          <th>Rejected</th>
                          <th>Emergency</th>
                        </tr>
                      </thead>
                      <tbody>
                        {compareResult.map((c) => (
                          <tr key={c.period}>
                            <td>{c.period === "A" ? compareFrom : compareTo}</td>
                            <td>{c.total}</td>
                            <td>{c.approved}</td>
                            <td>{c.rejected}</td>
                            <td>{c.emergency}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </section>

                {/* Anomaly Detection */}
                <section className="analytics-block">
                  <h3>⚠️ Anomaly Detection (High Leave Frequency)</h3>

                  {anomalies.length === 0 ? (
                    <p>No anomalies flagged.</p>
                  ) : (
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Total Leaves</th>
                          <th>Z-Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {anomalies.map((z) => (
                          <tr key={z.id}>
                            <td>{z.name}</td>
                            <td>{z.leaves}</td>
                            <td>{Number(z.z).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </section>
              </div>
            )}

            {/* =============================== System Logs ============================ */}
            {activeTab === "logs" && (
              <div className="dashboard-card">
                <div className="card-header">
                  <h2>System Logs</h2>

                  <div className="filters">
                    <input
                      type="text"
                      placeholder="Search actions/users..."
                      value={logQuery}
                      onChange={(e) => setLogQuery(e.target.value)}
                      className="search-input"
                    />

                    <select
                      value={logType}
                      onChange={(e) => setLogType(e.target.value)}
                      className="role-select"
                    >
                      <option value="">All Types</option>
                      <option value="auth">Auth</option>
                      <option value="user">User</option>
                      <option value="leave">Leave</option>
                      <option value="admin">Admin</option>
                      <option value="system">System</option>
                    </select>

                    <select
                      value={logLimit}
                      onChange={(e) => setLogLimit(Number(e.target.value))}
                      className="role-select"
                    >
                      <option value={50}>Last 50</option>
                      <option value={100}>Last 100</option>
                      <option value={250}>Last 250</option>
                      <option value={500}>Last 500</option>
                    </select>

                    <button className="btn btn-outline" onClick={refreshLogs}>
                      🔍 Apply
                    </button>

                    <button className="btn btn-outline" onClick={exportLogs}>
                      📥 Export CSV
                    </button>
                  </div>
                </div>

                {/* AI Summary for Logs */}
                {logsAISummary?.summary && (
                  <div className="ai-summary-card" style={{ marginBottom: 16 }}>
                    <b>AI Log Summary:</b> {logsAISummary.summary} (Total: {logsAISummary.total})
                  </div>
                )}

                {loading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading logs...</p>
                  </div>
                ) : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Type</th>
                        <th>Action</th>
                        <th>User</th>
                        <th>IP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {systemLogs.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: "center", padding: 16 }}>
                            No logs found.
                          </td>
                        </tr>
                      ) : (
                        systemLogs.map((log) => (
                          <tr key={log.id || `${log.timestamp}-${log.action}`}>
                            <td>
                              {log.timestamp
                                ? new Date(log.timestamp).toLocaleString()
                                : "-"}
                            </td>
                            <td>{log.type || "general"}</td>
                            <td>{log.action}</td>
                            <td>{log.user_name || "-"}</td>
                            <td>{log.ip_address || "-"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
