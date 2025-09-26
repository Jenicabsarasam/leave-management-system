// src/pages/Index.jsx
import React from "react";
import "../assets/styles/styless.css";

const Index = () => {
  return (
    <header className="main-header">
      <nav>
        <span className="logo">LEAVE PORTAL</span>
        <button className="nav-btn">Get Started</button>
      </nav>

      <div className="header-bg">
        <div className="red-shape"></div>
        <div className="yellow-shape"></div>
      </div>

      <h1 className="headline red-text">Aim & Goals</h1>
      <p className="subheadline">
        Efficient, secure leave request and approval for students and staff
      </p>

      <ul className="features">
        <li>Multi-role login for Students, Parents, Advisors, Wardens, Admin</li>
        <li>Digital leave requests with emergency fast-track</li>
        <li>Transport ticket upload for students</li>
        <li>Approval workflow and notifications for stakeholders</li>
        <li>QR-code e-pass for gate exit</li>
        <li>Leave history and analytics dashboard</li>
      </ul>

      <button className="get-started yellow-btn">Get Started</button>
      <div className="login-link">
        Already have an account? <a href="/signin" className="red-link">Sign In</a>
      </div>
    </header>
  );
};

export default Index;
