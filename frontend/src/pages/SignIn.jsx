// frontend/src/pages/SignIn.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";
import "../assets/styles/styles.css";
import logo from "../assets/college-1.jpg";

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!formData.role) return alert("Select a role");

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
      switch (formData.role) {
        case "student": 
          navigate("/student/dashboard"); 
          break;
        case "parent": 
          navigate("/parent/dashboard"); 
          break;
        case "advisor": 
          navigate("/advisor/dashboard"); 
          break;
        case "warden": 
          navigate("/warden/dashboard"); 
          break;
        case "admin": 
          navigate("/admin/dashboard"); 
          break;
        default: 
          alert("Select a valid role");
      }
    } catch (error) {
      alert(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <div className="brand">
          <img src={logo} alt="logo" />
          <h1>Sign In</h1>
        </div>
        <nav className="nav">
          <a href="/">Home</a>
          <a href="/signup">Sign Up</a>
        </nav>
      </header>

      <main className="card" style={{ maxWidth: "720px", margin: "auto" }}>
        <h3>Sign in to your account</h3>
        <form onSubmit={handleSignIn}>
          <div style={{ marginTop: "8px" }}>
            <label className="kv">Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>
          <div style={{ marginTop: "8px" }}>
            <label className="kv">Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              required 
            />
          </div>
          <div style={{ marginTop: "8px" }}>
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

          <div style={{ marginTop: "14px" }} className="row">
            <button 
              className="btn btn-primary" 
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
            <a className="btn btn-outline" href="/signup">
              Create account
            </a>
          </div>
        </form>
      </main>
    </div>
  );
};

export default SignIn;