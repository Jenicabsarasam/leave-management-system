// src/pages/Home.jsx
import React from "react";
import "../assets/styles/styles.css";
import logo from "../assets/college-1.jpg";
import heroImage from "../assets/college-hero.jpg";

const Home = () => {
  return (
    <div className="container">
      <header className="header">
        <div className="brand">
          <img src={logo} alt="college logo" />
          <h1>Smart Leave & Safety System</h1>
        </div>
        <nav className="nav">
          <a href="/">Home</a>
          <a href="/signin">Sign In</a>
          <a href="/signup">Sign Up</a>
        </nav>
      </header>

      <section className="hero card">
        <div>
          <h2>Make student leave approvals fast, safe & traceable</h2>
          <p>
            Our system digitalizes leave requests, supports normal & emergency flows,
            multi-role approvals (Parent → Advisor → Warden), QR-based e-passes and post-arrival confirmations.
          </p>
          <div className="cta">
            <a className="btn btn-primary" href="/signup">Get started</a>
            <a className="btn btn-outline" href="/signin">Already have an account? Sign in</a>
          </div>
          <ul style={{ marginTop: "16px", color: "var(--muted)" }}>
            <li>Role-based dashboards: Student / Advisor / Parent / Warden / Admin</li>
            <li>Emergency fast-track & real-time notifications</li>
            <li>Transport ticket attachment, QR e-pass generation, history & analytics</li>
          </ul>
        </div>

        <div style={{ textAlign: "center" }}>
          <img src={heroImage} alt="campus" style={{ width: "100%", borderRadius: "12px", boxShadow: "var(--card-shadow)" }} />
          <div style={{ marginTop: "12px", fontSize: "13px", color: "var(--muted)" }}>
            Replace this image with your college image for exact branding.
          </div>
        </div>
      </section>

      <section className="card" style={{ marginTop: "22px" }}>
        <h3 style={{ marginTop: 0, color: "var(--primary)" }}>How it works (quick)</h3>
        <div className="row" style={{ marginTop: "10px" }}>
          <div style={{ flex: 1 }}>
            <strong>1. Student</strong>
            <div className="kv">Submits normal or emergency leave (upload transport ticket if leaving campus)</div>
          </div>
          <div style={{ flex: 1 }}>
            <strong>2. Parent</strong>
            <div className="kv">Approves/Rejects, confirms arrival on return date</div>
          </div>
          <div style={{ flex: 1 }}>
            <strong>3. Advisor & Warden</strong>
            <div className="kv">Advisor reviews normal requests; Warden finalizes and may schedule verification</div>
          </div>
        </div>
      </section>

      <footer className="footer">
        Built for your college — replace images with the ones in the project PDF to fully align.
      </footer>
    </div>
  );
};

export default Home;
