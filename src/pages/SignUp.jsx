// src/pages/SignUp.jsx
import React from "react";
import "../assets/styles/styles.css";
import logo from "../assets/college-1.jpg";

const SignUp = () => {
  const handleSignUp = (e) => {
    e.preventDefault();
    alert("Demo: account created. Now use Sign In to go to dashboard.");
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
              <input type="text" required placeholder="Your name" />
            </div>
            <div style={{ width: "180px" }}>
              <label className="kv">Role</label>
              <select required>
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
            <input type="email" required placeholder="you@college.edu" />
          </div>

          <div style={{ marginTop: "12px" }} className="form-row">
            <div style={{ flex: 1 }}>
              <label className="kv">Password</label>
              <input type="password" required placeholder="Choose a password" />
            </div>
            <div style={{ width: "160px" }}>
              <label className="kv">Phone (optional)</label>
              <input type="text" placeholder="+91 98765 43210" />
            </div>
          </div>

          <div style={{ marginTop: "16px" }} className="row">
            <button className="btn btn-primary" type="submit">Create account</button>
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
