// src/pages/AdminDashboard.jsx
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
  bulkImportUsers 
} from "../api";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [systemStats, setSystemStats] = useState({});
  const [systemLogs, setSystemLogs] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const token = localStorage.getItem("token");

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [statsData, usersData, leavesData, logsData] = await Promise.all([
        getAdminStats(token),
        getAllUsers(token),
        getAllLeaves(token),
        getSystemLogs(token)
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

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.roll_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = async (userData) => {
    try {
      await createUser(token, userData);
      alert("User created successfully!");
      setShowUserModal(false);
      fetchAdminData(); // Refresh data
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
      fetchAdminData(); // Refresh data
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Error updating user: " + err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await deleteUser(token, userId);
        alert("User deleted successfully!");
        fetchAdminData(); // Refresh data
      } catch (err) {
        console.error("Error deleting user:", err);
        alert("Error deleting user: " + err.message);
      }
    }
  };

  const handleBulkImport = async (formData) => {
    try {
      await bulkImportUsers(token, formData);
      alert("Users imported successfully!");
      setShowImportModal(false);
      fetchAdminData(); // Refresh data
    } catch (err) {
      console.error("Error importing users:", err);
      alert("Error importing users: " + err.message);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return '✅';
      case 'inactive': return '❌';
      case 'pending': return '⏳';
      default: return '📝';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'student': return '🎓';
      case 'advisor': return '📚';
      case 'warden': return '🏠';
      case 'parent': return '👨‍👩‍👧';
      case 'admin': return '⚙️';
      default: return '👤';
    }
  };

  const getLeaveStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'parent_approved': return '✅';
      case 'advisor_approved': return '📚';
      case 'warden_approved': return '🏠';
      case 'completed': return '🎉';
      case 'rejected': return '❌';
      default: return '📝';
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
            <h1>Admin Dashboard</h1>
            <p>Complete system management and oversight</p>
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
              <div className="stat-number">{systemStats.storageUsed || '0GB'}</div>
              <div className="stat-label">Storage Used</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
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
            onClick={() => setActiveTab("reports")}
          >
            📈 Reports & Analytics
          </button>
          <button 
            className={`tab-btn ${activeTab === "logs" ? "active" : ""}`}
            onClick={() => setActiveTab("logs")}
          >
            📝 System Logs
          </button>
        </div>

        <div className="dashboard-grid">
          {/* Main Content Area */}
          <div className="dashboard-column main-content">
            
            {/* System Overview Tab */}
            {activeTab === "overview" && (
              <div className="dashboard-card">
                <div className="card-header">
                  <h2>System Overview</h2>
                  <div className="card-badge system">Live</div>
                </div>

                {loading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading system data...</p>
                  </div>
                ) : (
                  <div className="overview-grid">
                    <div className="overview-card">
                      <h3>📈 Quick Actions</h3>
                      <div className="quick-actions">
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
                        <button className="btn btn-outline">
                          📊 Generate Report
                        </button>
                        <button className="btn btn-outline">
                          🔧 System Settings
                        </button>
                      </div>
                    </div>

                    <div className="overview-card">
                      <h3>🎯 Recent Activity</h3>
                      <div className="recent-activity">
                        {systemLogs.slice(0, 5).map((log, index) => (
                          <div key={index} className="activity-item">
                            <div className="activity-icon">📝</div>
                            <div className="activity-content">
                              <div className="activity-text">{log.action}</div>
                              <div className="activity-meta">
                                {new Date(log.timestamp).toLocaleString()} • {log.user_name}
                              </div>
                            </div>
                          </div>
                        ))}
                        {systemLogs.length === 0 && (
                          <div className="no-activity">No recent activity</div>
                        )}
                      </div>
                    </div>

                    <div className="overview-card">
                      <h3>🚨 System Health</h3>
                      <div className="health-stats">
                        <div className="health-item">
                          <span className="health-label">Uptime</span>
                          <span className="health-value success">{systemStats.systemUptime || '100%'}</span>
                        </div>
                        <div className="health-item">
                          <span className="health-label">Database</span>
                          <span className="health-value success">Connected</span>
                        </div>
                        <div className="health-item">
                          <span className="health-label">Storage</span>
                          <span className="health-value warning">{systemStats.storageUsed || '0GB'}</span>
                        </div>
                        <div className="health-item">
                          <span className="health-label">Active Users</span>
                          <span className="health-value info">{systemStats.activeUsers || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Management Tab */}
            {activeTab === "users" && (
              <div className="dashboard-card">
                <div className="card-header">
                  <h2>User Management</h2>
                  <div className="header-actions">
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowUserModal(true)}
                    >
                      👤 Add User
                    </button>
                    <button 
                      className="btn btn-success"
                      onClick={() => setShowImportModal(true)}
                    >
                      📥 Bulk Import
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="filters-section">
                  <input
                    type="text"
                    placeholder="🔍 Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <select 
                    value={selectedRole} 
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Roles</option>
                    <option value="student">Students</option>
                    <option value="advisor">Advisors</option>
                    <option value="warden">Wardens</option>
                    <option value="parent">Parents</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>

                {loading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading users...</p>
                  </div>
                ) : (
                  <div className="users-table-container">
                    <table className="users-table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Role</th>
                          <th>Contact</th>
                          <th>Branch/Division</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map(user => (
                          <tr key={user.id}>
                            <td>
                              <div className="user-info">
                                <div className="user-avatar">
                                  {getRoleIcon(user.role)}
                                </div>
                                <div className="user-details">
                                  <div className="user-name">{user.name}</div>
                                  {user.roll_number && (
                                    <div className="user-roll">Roll: {user.roll_number}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={`role-badge ${user.role}`}>
                                {getRoleIcon(user.role)} {user.role}
                              </span>
                            </td>
                            <td>
                              <div className="contact-info">
                                <div>{user.email}</div>
                                {user.phone && <div className="phone">{user.phone}</div>}
                              </div>
                            </td>
                            <td>
                              {user.branch_name && (
                                <div className="academic-info">
                                  <div>{user.branch_name}</div>
                                  {user.division && <div>Div: {user.division}</div>}
                                  {user.hostel_name && <div>🏠 {user.hostel_name}</div>}
                                </div>
                              )}
                            </td>
                            <td>
                              <span className={`status-badge ${user.status}`}>
                                {getStatusIcon(user.status)} {user.status}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button 
                                  className="btn btn-outline btn-small"
                                  onClick={() => setSelectedUser(user)}
                                >
                                  ✏️ Edit
                                </button>
                                <button 
                                  className="btn btn-danger btn-small"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                      <div className="empty-state">
                        <div className="empty-icon">👥</div>
                        <h3>No users found</h3>
                        <p>No users match your search criteria.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* All Leaves Tab */}
            {activeTab === "leaves" && (
              <div className="dashboard-card">
                <div className="card-header">
                  <h2>All Leave Requests</h2>
                  <div className="card-badge leaves">{leaves.length} Total</div>
                </div>

                {loading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading leaves...</p>
                  </div>
                ) : (
                  <div className="leaves-list">
                    {leaves.map(leave => (
                      <div key={leave.id} className="leave-card admin-leave-card">
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
                              {leave.type === 'emergency' ? '🚨 Emergency' : '📋 Normal'}
                            </span>
                            <span className={`status-badge ${leave.status}`}>
                              {getLeaveStatusIcon(leave.status)} {leave.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="leave-reason">
                          <strong>Reason:</strong> {leave.reason}
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
                          {leave.parent_name && (
                            <span className="meta-item">
                              👨‍👩‍👧 Parent: {leave.parent_name}
                            </span>
                          )}
                          {leave.advisor_name && (
                            <span className="meta-item">
                              📚 Advisor: {leave.advisor_name}
                            </span>
                          )}
                          {leave.warden_name && (
                            <span className="meta-item">
                              🏠 Warden: {leave.warden_name}
                            </span>
                          )}
                        </div>

                        {leave.proof_submitted && (
                          <div className="proof-info">
                            <span className={`proof-status ${leave.proof_verified ? 'verified' : 'pending'}`}>
                              📎 Proof {leave.proof_verified ? '✅ Verified' : '⏳ Pending Verification'}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                    {leaves.length === 0 && (
                      <div className="empty-state">
                        <div className="empty-icon">📝</div>
                        <h3>No leaves found</h3>
                        <p>No leave requests in the system.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === "reports" && (
              <div className="dashboard-card">
                <div className="card-header">
                  <h2>Reports & Analytics</h2>
                  <div className="card-badge reports">Advanced</div>
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
                    <div className="report-icon">👥</div>
                    <div className="report-content">
                      <h3>User Activity Report</h3>
                      <p>Detailed user engagement and activity patterns</p>
                      <button className="btn btn-outline btn-full">Generate Report</button>
                    </div>
                  </div>

                  <div className="report-card">
                    <div className="report-icon">🚨</div>
                    <div className="report-content">
                      <h3>Emergency Leave Analysis</h3>
                      <p>Emergency leave patterns and response times</p>
                      <button className="btn btn-outline btn-full">View Analysis</button>
                    </div>
                  </div>

                  <div className="report-card">
                    <div className="report-icon">📎</div>
                    <div className="report-content">
                      <h3>Proof Verification Report</h3>
                      <p>Proof submission and verification statistics</p>
                      <button className="btn btn-outline btn-full">Generate Report</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Logs Tab */}
            {activeTab === "logs" && (
              <div className="dashboard-card">
                <div className="card-header">
                  <h2>System Logs</h2>
                  <div className="card-badge logs">Real-time</div>
                </div>

                {loading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading system logs...</p>
                  </div>
                ) : (
                  <div className="logs-container">
                    <div className="logs-list">
                      {systemLogs.map((log, index) => (
                        <div key={index} className="log-item">
                          <div className="log-icon">📝</div>
                          <div className="log-content">
                            <div className="log-action">{log.action}</div>
                            <div className="log-meta">
                              <span className="log-user">{log.user_name}</span>
                              <span className="log-timestamp">
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                              <span className="log-ip">{log.ip_address}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {systemLogs.length === 0 && (
                        <div className="empty-state">
                          <div className="empty-icon">📝</div>
                          <h3>No logs available</h3>
                          <p>System logs will appear here as activities occur.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="dashboard-column sidebar">
            <div className="dashboard-card">
              <div className="card-header">
                <h3>System Status</h3>
              </div>
              <div className="system-status">
                <div className="status-item">
                  <span className="status-indicator online"></span>
                  <span className="status-label">Application</span>
                  <span className="status-value">Online</span>
                </div>
                <div className="status-item">
                  <span className="status-indicator online"></span>
                  <span className="status-label">Database</span>
                  <span className="status-value">Connected</span>
                </div>
                <div className="status-item">
                  <span className="status-indicator online"></span>
                  <span className="status-label">File System</span>
                  <span className="status-value">Healthy</span>
                </div>
                <div className="status-item">
                  <span className="status-indicator online"></span>
                  <span className="status-label">API</span>
                  <span className="status-value">Running</span>
                </div>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-header">
                <h3>Quick Statistics</h3>
              </div>
              <div className="quick-stats">
                <div className="quick-stat">
                  <div className="quick-stat-icon">🎓</div>
                  <div className="quick-stat-info">
                    <div className="quick-stat-value">{systemStats.activeStudents || 0}</div>
                    <div className="quick-stat-label">Students</div>
                  </div>
                </div>
                <div className="quick-stat">
                  <div className="quick-stat-icon">📚</div>
                  <div className="quick-stat-info">
                    <div className="quick-stat-value">{systemStats.activeAdvisors || 0}</div>
                    <div className="quick-stat-label">Advisors</div>
                  </div>
                </div>
                <div className="quick-stat">
                  <div className="quick-stat-icon">🏠</div>
                  <div className="quick-stat-info">
                    <div className="quick-stat-value">{systemStats.activeWardens || 0}</div>
                    <div className="quick-stat-label">Wardens</div>
                  </div>
                </div>
                <div className="quick-stat">
                  <div className="quick-stat-icon">📎</div>
                  <div className="quick-stat-info">
                    <div className="quick-stat-value">{systemStats.proofsSubmitted || 0}</div>
                    <div className="quick-stat-label">Proofs</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showUserModal && (
        <UserModal 
          user={selectedUser}
          onSave={selectedUser ? handleUpdateUser : handleCreateUser}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
        />
      )}

      {/* Bulk Import Modal */}
      {showImportModal && (
        <BulkImportModal 
          onImport={handleBulkImport}
          onClose={() => setShowImportModal(false)}
        />
      )}
    </div>
  );
};

// User Modal Component
const UserModal = ({ user, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'student',
    roll_number: user?.roll_number || '',
    branch_id: user?.branch_id || '',
    division: user?.division || '',
    hostel_id: user?.hostel_id || '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(user?.id, formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{user ? 'Edit User' : 'Add New User'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>Role *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              required
            >
              <option value="student">Student</option>
              <option value="advisor">Advisor</option>
              <option value="warden">Warden</option>
              <option value="parent">Parent</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {formData.role === 'student' && (
            <>
              <div className="form-group">
                <label>Roll Number</label>
                <input
                  type="text"
                  value={formData.roll_number}
                  onChange={(e) => setFormData({...formData, roll_number: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Division</label>
                <input
                  type="text"
                  value={formData.division}
                  onChange={(e) => setFormData({...formData, division: e.target.value})}
                />
              </div>
            </>
          )}

          {!user && (
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {user ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Bulk Import Modal Component
const BulkImportModal = ({ onImport, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (file) => {
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
    } else {
      alert("Please select a CSV file");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select a CSV file first");
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    onImport(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Bulk Import Users</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="import-form">
          <div className="form-group">
            <label>Select CSV File *</label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              required
            />
            <div className="form-hint">
              CSV format: name,email,phone,role,roll_number,division,branch_id,hostel_id
            </div>
          </div>

          {selectedFile && (
            <div className="file-selected">
              ✅ Selected: {selectedFile.name}
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success">
              📥 Import Users
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;