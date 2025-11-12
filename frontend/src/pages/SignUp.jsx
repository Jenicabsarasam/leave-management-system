// src/pages/SignUp.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../api";
import "../assets/styles/styles.css";
import logo from "../assets/college-logo.png";
import { IoArrowBackOutline } from "react-icons/io5";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    phone: "",
    studentRollNo: "",
    branch: "",
    division: "",
    hostel: "",
    room_no: "",
  });

  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState(""); // ✅ Added
  const navigate = useNavigate();

  // Predefined options
  const branches = [
    { id: "CSE", name: "Computer Science Engineering" },
    { id: "AI", name: "Artificial Intelligence" },
    { id: "EEE", name: "Electrical and Electronics Engineering" },
    { id: "MECH", name: "Mechanical Engineering" },
    { id: "CIVIL", name: "Civil Engineering" }
  ];

  const divisions = ["A", "B", "C", "D", "E"];

  const hostels = [
    { id: "NILA", name: "Nila" },
    { id: "KAVERI", name: "Kaveri" },
    { id: "GANGA", name: "Ganga" },
    { id: "YAMUNA", name: "Yamuna" },
    { id: "SARASWATI", name: "Saraswati" }
  ];

  const roleIcons = {
    student: "🎓 Student",
    parent: "👨‍👩‍👧 Parent",
    advisor: "📚 Advisor",
    warden: "🏠 Warden",
    admin: "⚙ Admin"
  };

  // ✅ Handle input + validations
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Phone validation: +91 optional + 10 digits
    if (name === "phone") {
      const phoneRegex = /^(\+91[-\s]?)?[6-9]\d{9}$/;
      if (value === "" || phoneRegex.test(value)) {
        setPhoneError("");
      } else {
        setPhoneError("Please enter a valid 10-digit phone number (with optional +91)");
      }
    }

    // Password validation: ≥6 chars, 1 number, 1 special char
    if (name === "password") {
      const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*]).{6,}$/;

      if (value === "" || passwordRegex.test(value)) {
        setPasswordError("");
      } else {
        setPasswordError(
          "Password must be at least 6 characters long and include 1 digit and 1 special character"
        );
      }
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  // ✅ Handle form submit
  const handleSignUp = async (e) => {
  e.preventDefault();

  if (phoneError) {
    alert("Please correct the phone number before continuing.");
    return;
  }

  if (passwordError) {
    alert("Please correct the password before continuing.");
    return;
  }

  setLoading(true);
  try {
    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      phone: formData.phone,
      studentRollNo: formData.studentRollNo,
      branch: formData.branch,
      division: formData.division,
      hostel: formData.hostel,
      room_no: formData.room_no || null, // ✅ safer
    };

    console.log("Submitting signup:", userData);

    const response = await signup(userData);
    alert(response.msg || "Account created successfully!");
    navigate("/signin");
  } catch (error) {
    alert(error.message || "Signup failed");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="auth-container">
      <div className="auth-card-wide">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-brand">
            <div className="auth-logo">
              <img src={logo} alt="College Logo" />
            </div>
            <div className="auth-title">
              <h1>Create Your Account</h1>
              <p>Join the Hostel Leave Management System</p>
            </div>
          </div>
          <nav className="auth-nav">
            <a href="/" className="nav-link">
              <IoArrowBackOutline style={{ paddingTop: "5px" }} /> Back to Home
            </a>
            <a href="/signin" className="nav-link">Sign In</a>
          </nav>
        </div>

        {/* Form */}
        <form onSubmit={handleSignUp} className="auth-form-wide">
          <div className="form-columns">
            {/* Left Column */}
            <div className="form-column">
              <div className="form-section">
                <h3>Basic Information</h3>

                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@college.edu"
                    className="form-input"
                  />
                </div>

                {/* ✅ Password Validation */}
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Create a strong password"
                    className={`form-input ${passwordError ? "input-error" : ""}`}
                    pattern="^(?=.*[0-9])(?=.*[!@#$%^&*]).{6,}$"

                  />
                  {passwordError && <div className="form-error">{passwordError}</div>}
                </div>

                {/* ✅ Phone Validation */}
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    className={`form-input ${phoneError ? "input-error" : ""}`}
                    pattern="^(\+91[-\s]?)?[6-9]\d{9}$"
                    required
                  />
                  {phoneError && <div className="form-error">{phoneError}</div>}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="form-column">
              <div className="form-section">
                <h3>Role & Additional Information</h3>

                {/* Role Selection */}
                <div className="form-group">
                  <label className="form-label">Select Your Role *</label>
                  <select
                    required
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="form-input role-select"
                  >
                    <option value="">Choose your role</option>
                    {Object.entries(roleIcons).map(([role, label]) => (
                      <option key={role} value={role}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Student Fields */}
                {formData.role === "student" && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Roll Number *</label>
                      <input
                        type="text"
                        name="studentRollNo"
                        value={formData.studentRollNo}
                        onChange={handleChange}
                        required
                        placeholder="Enter your roll number"
                        className="form-input"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Branch *</label>
                        <select
                          name="branch"
                          value={formData.branch}
                          onChange={handleChange}
                          required
                          className="form-input"
                        >
                          <option value="">Select Branch</option>
                          {branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>{branch.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Division *</label>
                        <select
                          name="division"
                          value={formData.division}
                          onChange={handleChange}
                          required
                          className="form-input"
                        >
                          <option value="">Select Division</option>
                          {divisions.map((div) => (
                            <option key={div} value={div}>Div {div}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Hostel *</label>
                      <select
                        name="hostel"
                        value={formData.hostel}
                        onChange={handleChange}
                        required
                        className="form-input"
                      >
                        <option value="">Select Hostel</option>
                        {hostels.map((hostel) => (
                          <option key={hostel.id} value={hostel.id}>{hostel.name} Hostel</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Room Number *</label>
                      <input
                        type="text"
                        name="room_no"
                        required
                        placeholder="Enter your hostel room number"
                        className="form-input"
                      />
                    </div>

                  </>
                )}

                {/* Parent */}
                {formData.role === "parent" && (
                  <div className="form-group">
                    <label className="form-label">Your Child's Roll Number *</label>
                    <input
                      type="text"
                      name="studentRollNo"
                      value={formData.studentRollNo}
                      onChange={handleChange}
                      required
                      placeholder="Enter student roll number"
                      className="form-input"
                    />
                    <div className="form-hint">This links you to your child's leave requests.</div>
                  </div>
                )}

                {/* Advisor */}
                {formData.role === "advisor" && (
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Assigned Branch *</label>
                      <select
                        name="branch"
                        value={formData.branch}
                        onChange={handleChange}
                        required
                        className="form-input"
                      >
                        <option value="">Select Branch</option>
                        {branches.map((branch) => (
                          <option key={branch.id} value={branch.id}>{branch.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Division *</label>
                      <select
                        name="division"
                        value={formData.division}
                        onChange={handleChange}
                        required
                        className="form-input"
                      >
                        <option value="">Select Division</option>
                        {divisions.map((div) => (
                          <option key={div} value={div}>Div {div}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Warden */}
                {formData.role === "warden" && (
                  <div className="form-group">
                    <label className="form-label">Assigned Hostel *</label>
                    <select
                      name="hostel"
                      value={formData.hostel}
                      onChange={handleChange}
                      required
                      className="form-input"
                    >
                      <option value="">Select Hostel</option>
                      {hostels.map((hostel) => (
                        <option key={hostel.id} value={hostel.id}>{hostel.name} Hostel</option>
                      ))}
                    </select>
                    <div className="form-hint">You’ll manage leaves for this hostel.</div>
                  </div>
                )}

                {/* Admin */}
                {formData.role === "admin" && (
                  <div className="info-message">
                    <div className="info-icon">⚙</div>
                    <div className="info-content">
                      <strong>Administrator Account</strong>
                      <p>You'll have full system access and management capabilities.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="auth-actions-wide">
            <button
              className="btn btn-primary btn-large"
              type="submit"
              disabled={loading || !formData.role}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="auth-links">
              <span>Already have an account?</span>
              <a href="/signin" className="auth-link">Sign In here</a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;