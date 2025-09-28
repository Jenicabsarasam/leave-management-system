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
    studentRollNo: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
        studentRollNo: formData.studentRollNo
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

          {/* Student Roll Number - Only show for parents */}
          {formData.role === 'parent' && (
            <div style={{ marginTop: "12px" }}>
              <label className="kv">Your Child's Roll Number</label>
              <input 
                type="text" 
                name="studentRollNo"
                value={formData.studentRollNo}
                onChange={handleChange}
                required={formData.role === 'parent'}
                placeholder="Enter student roll number" 
              />
              <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
                This links you to your child's leave requests
              </div>
            </div>
          )}

          {/* Student ID - Only show for students */}
          {formData.role === 'student' && (
            <div style={{ marginTop: "12px" }}>
              <label className="kv">Roll Number</label>
              <input 
                type="text" 
                name="studentRollNo"
                value={formData.studentRollNo}
                onChange={handleChange}
                required={formData.role === 'student'}
                placeholder="Enter your roll number" 
              />
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

export default SignUp; // Make sure this line is present and correct