// src/pages/Home.jsx
import React from "react";
import "../assets/styles/styles.css";
import logo from "../assets/college-logo.png";
import heroImage from "../assets/college-hero.jpg";
import addUser from "../assets/add-user.png";

const Home = () => {
  const features = [
    {
      icon: "🚀",
      title: "Fast Approvals",
      description: "Reduce leave processing time by 70% with automated workflows"
    },
    {
      icon: "🔒",
      title: "Enhanced Safety",
      description: "Real-time tracking and emergency protocols for student safety"
    },
    {
      icon: "📱",
      title: "QR E-Passes",
      description: "Digital passes with QR codes for seamless campus movement"
    },
    {
      icon: "👥",
      title: "Multi-Role Access",
      description: "Parents, advisors, wardens all in one coordinated system"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Student Request",
      description: "Submit leave with transport details",
      color: "var(--primary)"
    },
    {
      number: "02",
      title: "Parent Approval",
      description: "Instant notification & quick approval",
      color: "#ff6b6b"
    },
    {
      number: "03",
      title: "Advisor Review",
      description: "Academic clearance & verification",
      color: "#4ecdc4"
    },
    {
      number: "04",
      title: "Warden Finalize",
      description: "Hostel clearance & e-pass generation",
      color: "var(--accent)"
    }
  ];

  return (
    <div className="container">
      {/* Enhanced Header */}
      <header className="header">
        <div className="brand">
          <div className="logo-container">
            <img src={logo} alt="college logo" />
          </div>
          <div className="brand-text">
            <h1>Smart Leave & Safety System</h1>
            <p className="brand-tagline">Digitalizing Campus Leave Management</p>
          </div>
        </div>
        <nav className="nav">
          <a href="/" className="nav-link active">Home</a>
          <a href="/signin" className="nav-link nav-cta">Sign In</a>
          <a href="/signup" className="nav-link nav-cta">Get Started</a>
        </nav>
      </header>

      {/* Hero Section */}
<section className="hero-section">
  <div>  
    <h1 className="hero-title">
      Transform Student Leave Management with 
      <span className="text-primary"> Digital Efficiency</span>
    </h1>

    <p className="hero-description">
      Experience the future of campus leave approvals with our comprehensive digital platform. 
      Fast-track emergency requests, multi-level approvals, and real-time tracking in one secure system.
    </p>

    <div className="hero-stats">
      <div className="stat">
        <div className="stat-number">10x</div>
        <div className="stat-label">Faster Approvals</div>
      </div>
      <div className="stat">
        <div className="stat-number">99%</div>
        <div className="stat-label">Secure Process</div>
      </div>
      <div className="stat">
        <div className="stat-number">24/7</div>
        <div className="stat-label">Accessibility</div>
      </div>
    </div>

    <div className="cta-group">
      <a className="btn btn-outline" href="/signup">
  <span className="btn-icon">
    <img 
      src={addUser} 
      alt="Add user" 
      className="btn-icon-img"
    />
  </span>
  Create Account
</a>

      <a className="btn btn-outline" href="/signin">
        <span className="btn-icon">🔑</span>
        Sign In To Account
      </a>
    </div>
  </div>

  <div className="hero-visual">
    <div className="visual-container">
      <img src={heroImage} alt="Modern campus environment" className="hero-image" />
    </div>
  </div>
</section>


      {/* Features Grid */}
      <section className="section">
        <div className="section-header">
          <h2>Why Choose Our System?</h2>
          <p>Comprehensive features designed for modern educational institutions</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="section">
        <div className="section-header">
          <h2>How It Works in 4 Simple Steps</h2>
          <p>Streamlined process from request to return confirmation</p>
        </div>
        <div className="process-steps">
          {steps.map((step, index) => (
            <div key={index} className="process-step">
              <div className="step-number" style={{ backgroundColor: step.color }}>
                {step.number}
              </div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
              <div className="step-connector"></div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Add more details</h2>
          <p>More information about our site</p>
          <div className="cta-buttons">
            <a className="btn btn-primary" href="/signup">
              Demo Buttons now goes to sign Up
            </a>
            <a className="btn btn-outline" href="/signin">
              Demo Buttons now goes to Sign In
            </a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <p>© 2025 Smart Leave & Safety System</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;