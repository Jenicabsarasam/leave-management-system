// src/pages/SignUp.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../api";
import "../assets/styles/styles.css";
import logo from "../assets/college-1.jpg";

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
    hostel: ""
  });
  
  const [loading, setLoading] = useState(false);
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
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
        hostel: formData.hostel
      };

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
    <div className="container">
      <header className="header">
        <div className="brand">
          <img src={logo} alt="logo" />
          <h1>Sign Up</h1>
        </div>
        <nav className="nav">
          <a href="/">Home</a>
          <a href="/signin">Sign In</a>
        </nav>
      </header>

      <main className="card">
        <h3>Create your account</h3>
        <form onSubmit={handleSignUp}>
          <div className="form-row">
            <div style={{ flex: 1 }}>
              <label className="kv">Full name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required 
                placeholder="Your name" 
              />
            </div>
            <div style={{ width: "180px" }}>
              <label className="kv">Role</label>
              <select 
                required
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="">Select role</option>
                <option value="student">Student</option>
                <option value="parent">Parent</option>
                <option value="advisor">Advisor</option>
                <option value="warden">Warden</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: "12px" }}>
            <label className="kv">Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              required 
              placeholder="you@college.edu" 
            />
          </div>

          <div style={{ marginTop: "12px" }} className="form-row">
            <div style={{ flex: 1 }}>
              <label className="kv">Password</label>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                required 
                placeholder="Choose a password" 
              />
            </div>
            <div style={{ width: "160px" }}>
              <label className="kv">Phone (optional)</label>
              <input 
                type="text" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210" 
              />
            </div>
          </div>

          {/* Student-specific fields */}
          {formData.role === 'student' && (
            <>
              <div style={{ marginTop: "12px" }}>
                <label className="kv">Roll Number</label>
                <input 
                  type="text" 
                  name="studentRollNo"
                  value={formData.studentRollNo}
                  onChange={handleChange}
                  required
                  placeholder="Enter your roll number" 
                />
              </div>
              
              <div style={{ marginTop: "12px" }} className="form-row">
                <div style={{ flex: 1 }}>
                  <label className="kv">Branch</label>
                  <select 
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Branch</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ width: "120px" }}>
                  <label className="kv">Division</label>
                  <select 
                    name="division"
                    value={formData.division}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Division</option>
                    {divisions.map(div => (
                      <option key={div} value={div}>Division {div}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="kv">Hostel</label>
                  <select 
                    name="hostel"
                    value={formData.hostel}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Hostel</option>
                    {hostels.map(hostel => (
                      <option key={hostel.id} value={hostel.id}>
                        {hostel.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Parent-specific fields */}
          {formData.role === 'parent' && (
            <div style={{ marginTop: "12px" }}>
              <label className="kv">Your Child's Roll Number</label>
              <input 
                type="text" 
                name="studentRollNo"
                value={formData.studentRollNo}
                onChange={handleChange}
                required
                placeholder="Enter student roll number" 
              />
              <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
                This links you to your child's leave requests
              </div>
            </div>
          )}

          {/* Advisor-specific fields */}
          {formData.role === 'advisor' && (
            <div style={{ marginTop: "12px" }} className="form-row">
              <div style={{ flex: 1 }}>
                <label className="kv">Assigned Branch</label>
                <select 
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Branch</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ width: "120px" }}>
                <label className="kv">Division</label>
                <select 
                  name="division"
                  value={formData.division}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Division</option>
                  {divisions.map(div => (
                    <option key={div} value={div}>Division {div}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Warden-specific fields - ONLY HOSTEL */}
          {formData.role === 'warden' && (
            <div style={{ marginTop: "12px" }}>
              <label className="kv">Assigned Hostel</label>
              <select 
                name="hostel"
                value={formData.hostel}
                onChange={handleChange}
                required
              >
                <option value="">Select Hostel</option>
                {hostels.map(hostel => (
                  <option key={hostel.id} value={hostel.id}>
                    {hostel.name}
                  </option>
                ))}
              </select>
              <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
                You will only see leave requests from students in this hostel
              </div>
            </div>
          )}

          <div style={{ marginTop: "16px" }} className="row">
            <button 
              className="btn btn-primary" 
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
            <a className="btn btn-outline" href="/signin">Already have an account?</a>
          </div>
        </form>
        <div style={{ marginTop: "12px", color: "var(--muted)" }}>
          Tip: Choose role carefully — dashboards show role-specific options and approvals.
        </div>
      </main>
    </div>
  );
};

export default SignUp;