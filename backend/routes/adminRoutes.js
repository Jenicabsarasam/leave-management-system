import express from "express";
import {
  // Core controllers
  getAdminStats,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllLeaves,
  updateLeaveStatus,
  verifyProof,
  generateReportSummary,


  // Analytics controllers
  getMonthlyLeaveStats,
  getRoleDistribution,
  getBranchLeaveRatio,
  getHostelMovement,
  getUserActivityAnalytics,
  comparePeriods,
  getAnomalousLeaveUsers,

} from "../controllers/adminController.js";

import { verifyToken, permit } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ---------------------- 🧭 BASIC DASHBOARD DATA ---------------------- */
router.get("/stats", verifyToken, permit("admin"), getAdminStats);

/* ---------------------- 👥 USER MANAGEMENT ---------------------- */
router.get("/users", verifyToken, permit("admin"), getAllUsers);
router.post("/users", verifyToken, permit("admin"), createUser);  // ✅ Add User route
router.put("/users/:id", verifyToken, permit("admin"), updateUser);
router.delete("/users/:id", verifyToken, permit("admin"), deleteUser);


/* ---------------------- 📋 LEAVE MANAGEMENT ---------------------- */
router.get("/leaves", verifyToken, permit("admin"), getAllLeaves);
router.put("/leaves/:id/status", verifyToken, permit("admin"), updateLeaveStatus);
router.put("/leaves/:id/verify-proof", verifyToken, permit("admin"), verifyProof);

/* ---------------------- 📈 REPORTS & ANALYTICS ---------------------- */
router.get("/generate-report", verifyToken, permit("admin"), generateReportSummary);
router.get("/analytics/monthly", verifyToken, permit("admin"), getMonthlyLeaveStats);
router.get("/analytics/roles", verifyToken, permit("admin"), getRoleDistribution);
router.get("/analytics/branches", verifyToken, permit("admin"), getBranchLeaveRatio);
router.get("/analytics/hostels", verifyToken, permit("admin"), getHostelMovement);
router.get("/analytics/activity", verifyToken, permit("admin"), getUserActivityAnalytics);
router.get("/analytics/compare", verifyToken, permit("admin"), comparePeriods);
router.get("/analytics/anomalies", verifyToken, permit("admin"), getAnomalousLeaveUsers);


export default router;
