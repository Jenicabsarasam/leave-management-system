// src/pages/SignIn.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ import useNavigate
import "../assets/styles/styles.css";
import logo from "../assets/college-1.jpg";

const SignIn = () => {
  const [role, setRole] = useState("");
  const navigate = useNavigate(); // ✅ initialize navigate

  const handleSignIn = (e) => {
    e.preventDefault();
    if (!role) return alert("Select a role");

    // ✅ navigate to route instead of window.location.href
    switch (role) {
  case "student": navigate("/student/dashboard"); break;
  case "parent": navigate("/parent/dashboard"); break;
  case "advisor": navigate("/advisor/dashboard"); break;
  case "warden": navigate("/warden/dashboard"); break;
  case "admin": navigate("/admin/dashboard"); break;
  default: alert("Select a role");
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
            <input type="email" required />
          </div>
          <div style={{ marginTop: "8px" }}>
            <label className="kv">Password</label>
            <input type="password" required />
          </div>
          <div style={{ marginTop: "8px" }}>
            <label className="kv">Role</label>
            <select
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
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
            <button className="btn btn-primary" type="submit">
              Sign in
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
