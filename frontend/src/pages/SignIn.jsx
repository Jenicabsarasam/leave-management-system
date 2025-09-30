// frontend/src/pages/SignIn.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";
import "../assets/styles/styles.css";
import logo from "../assets/college-logo.png";

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const roleIcons = {
    student: "🎓 Student",
    parent: "👨‍👩‍👧 Parent", 
    advisor: "📚 Advisor",
    warden: "🏠 Warden",
    admin: "⚙️ Admin"
  };

  const dashboardPaths = {
    student: "/student/dashboard",
    parent: "/parent/dashboard", 
    advisor: "/advisor/dashboard",
    warden: "/warden/dashboard",
    admin: "/admin/dashboard"
  };

  const roleDescriptions = {
    student: "Submit leave requests, track approvals, and manage your leave history",
    parent: "Approve your child's leave requests and confirm their safe return",
    advisor: "Review academic leaves and monitor student attendance patterns",
    warden: "Manage hostel leave approvals and ensure student safety protocols",
    admin: "Access system analytics and manage institutional settings"
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!formData.role) {
      alert("Please select your role");
      return;
    }

    setLoading(true);
    try {
      const credentials = {
        email: formData.email,
        password: formData.password
      };

      const response = await login(credentials);
      
      // Store token and user data
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      
      // Navigate to appropriate dashboard
      navigate(dashboardPaths[formData.role]);
    } catch (error) {
      alert(error.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card-wide">
        {/* Header Section */}
        <div className="auth-header">
          <div className="auth-brand">
            <div className="auth-logo">
              <img src={logo} alt="College Logo" />
            </div>
            <div className="auth-title">
              <h1>Welcome Back</h1>
              <p>Sign in to your Smart Leave System account</p>
            </div>
          </div>
          <nav className="auth-nav">
            <a href="/" className="nav-link">← Back to Home</a>
            <a href="/signup" className="nav-link">Create Account</a>
          </nav>
        </div>

        <form onSubmit={handleSignIn} className="auth-form-wide">
          <div className="form-columns">
            {/* Left Column - Login Form */}
            <div className="form-column">
              <div className="form-section">
                <h3>Sign In Details</h3>
                
                <div className="form-group">
                  <label className="form-label">
                    Email Address *
                  </label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required 
                    placeholder="Enter your email address" 
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Password *
                  </label>
                  <input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required 
                    placeholder="Enter your password" 
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Select Your Role *
                  </label>
                  <select
                    required
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="form-input role-select"
                  >
                    <option value="">Choose your role</option>
                    {Object.entries(roleIcons).map(([role, label]) => (
                      <option key={role} value={role}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-options">
                  <label className="checkbox-label">
                    <input type="checkbox" />
                    <span className="checkmark"></span>
                    Remember me
                  </label>
                  <a href="/forgot-password" className="forgot-link">
                    Forgot password?
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column - Role Information */}
            <div className="form-column">
              <div className="form-section">
                <h3>Role Information</h3>
                
                {/* Role-based Info */}
                {formData.role ? (
                  <div className="role-info-card">
                    <div className="role-info-header">
                      <span className="role-badge">
                        {roleIcons[formData.role]}
                      </span>
                    </div>
                    <div className="role-info-content">
                      <p>{roleDescriptions[formData.role]}</p>
                      
                      {formData.role === 'student' && (
                        <div className="role-features">
                          <div className="feature">✓ Submit leave requests</div>
                          <div className="feature">✓ Track approval status</div>
                          <div className="feature">✓ View leave history</div>
                          <div className="feature">✓ Emergency leave option</div>
                        </div>
                      )}
                      
                      {formData.role === 'parent' && (
                        <div className="role-features">
                          <div className="feature">✓ Approve/reject leaves</div>
                          <div className="feature">✓ Confirm safe arrival</div>
                          <div className="feature">✓ SMS notifications</div>
                          <div className="feature">✓ Emergency proof upload</div>
                        </div>
                      )}
                      
                      {formData.role === 'advisor' && (
                        <div className="role-features">
                          <div className="feature">✓ Academic approval</div>
                          <div className="feature">✓ Student analytics</div>
                          <div className="feature">✓ Proof verification</div>
                          <div className="feature">✓ Attendance monitoring</div>
                        </div>
                      )}
                      
                      {formData.role === 'warden' && (
                        <div className="role-features">
                          <div className="feature">✓ Hostel leave approval</div>
                          <div className="feature">✓ Emergency leave handling</div>
                          <div className="feature">✓ Meeting scheduling</div>
                          <div className="feature">✓ Safety protocols</div>
                        </div>
                      )}
                      
                      {formData.role === 'admin' && (
                        <div className="role-features">
                          <div className="feature">✓ System management</div>
                          <div className="feature">✓ Analytics & reports</div>
                          <div className="feature">✓ User management</div>
                          <div className="feature">✓ Institutional settings</div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="role-selection-prompt">
                    <div className="prompt-content">
                      <h4>Select Your Role</h4>
                      <p>Choose your role to see specific features and access your dedicated dashboard.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="auth-actions-wide">
            <button 
              className="btn btn-primary btn-large" 
              type="submit"
              disabled={loading || !formData.role}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Signing In...
                </>
              ) : (
                "Sign In to Dashboard"
              )}
            </button>
            
            <div className="auth-links">
              <span>Don't have an account?</span>
              <a href="/signup" className="auth-link">Create one here</a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;