import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import AdvisorDashboard from "./pages/AdvisorDashboard";
import WardenDashboard from "./pages/WardenDashboard";
import ParentDashboard from "./pages/ParentDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/advisor/dashboard" element={<AdvisorDashboard />} />
        <Route path="/warden/dashboard" element={<WardenDashboard />} />
        <Route path="/parent/dashboard" element={<ParentDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
