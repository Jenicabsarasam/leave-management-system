// src/controllers/leaveController.js
import QRCode from "qrcode";
import db from "../config/db.js";


// ---------------------- Student applies ----------------------
export const applyLeave = async (req, res) => {
  const { reason, startDate, endDate, type } = req.body;
  if (!reason || !startDate || !endDate)
    return res.status(400).json({ msg: "All fields required" });

  try {
    const result = await db.query(
      `INSERT INTO leaves(student_id, reason, start_date, end_date, type, status)
       VALUES($1,$2,$3,$4,$5,'pending') RETURNING *`,
      [req.user.id, reason, startDate, endDate, type || 'normal']
    );
    res.status(201).json({ msg: "Leave applied", leave: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ---------------------- Get leaves for logged-in user ----------------------
export const getLeaves = async (req, res) => {
  try {
    let query = `
      SELECT l.*, s.name as student_name, 
             p.id as parent_id, p.name as parent_name,
             a.id as advisor_id, a.name as advisor_name,
             w.id as warden_id, w.name as warden_name
      FROM leaves l
      JOIN users s ON l.student_id=s.id
      LEFT JOIN users p ON l.parent_id=p.id
      LEFT JOIN users a ON l.advisor_id=a.id
      LEFT JOIN users w ON l.warden_id=w.id
    `;

    const { role, id } = req.user;

    if (role === "student") {
      query += ` WHERE l.student_id=${id}`;
    } else if (role === "parent") {
      // Assume parent table has child_id
      query += ` WHERE p.id=${id}`;
    } 
    // advisor/warden see all leaves

    const result = await db.query(query);
    res.json({ leaves: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ---------------------- Parent approve/reject ----------------------
export const parentApproveLeave = async (req, res) => {
  const leaveId = parseInt(req.params.id);
  const { action } = req.body;

  if (!["approve", "reject"].includes(action))
    return res.status(400).json({ msg: 'Action must be "approve" or "reject"' });

  try {
    const status = action === "approve" ? "parent_approved" : "rejected";
    const result = await db.query(
      `UPDATE leaves SET status=$1, parent_id=$2 WHERE id=$3 RETURNING *`,
      [status, req.user.id, leaveId]
    );
    if (result.rows.length === 0) return res.status(404).json({ msg: "Leave not found" });
    res.json({ msg: `Leave ${status}`, leave: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ---------------------- Advisor review ----------------------
export const advisorReviewLeave = async (req, res) => {
  const leaveId = parseInt(req.params.id);
  const { action } = req.body;

  if (!["approve", "reject"].includes(action))
    return res.status(400).json({ msg: 'Action must be "approve" or "reject"' });

  try {
    // Only review leaves approved by parent
    const check = await db.query(`SELECT status FROM leaves WHERE id=$1`, [leaveId]);
    if (check.rows.length === 0) return res.status(404).json({ msg: "Leave not found" });
    if (check.rows[0].status !== "parent_approved")
      return res.status(400).json({ msg: "Leave must be approved by parent first" });

    const status = action === "approve" ? "advisor_approved" : "rejected";
    const result = await db.query(
      `UPDATE leaves SET status=$1, advisor_id=$2 WHERE id=$3 RETURNING *`,
      [status, req.user.id, leaveId]
    );

    res.json({ msg: `Leave ${status}`, leave: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ---------------------- Warden approve ----------------------
export const wardenApproveLeave = async (req, res) => {
  const leaveId = parseInt(req.params.id);
  const { action } = req.body;

  if (!["approve", "reject", "verify"].includes(action))
    return res.status(400).json({ msg: 'Action must be "approve", "reject", or "verify"' });

  try {
    const check = await db.query(`SELECT status, student_id FROM leaves WHERE id=$1`, [leaveId]);
    if (check.rows.length === 0) return res.status(404).json({ msg: "Leave not found" });
    if (check.rows[0].status !== "advisor_approved")
      return res.status(400).json({ msg: "Leave must be approved by advisor first" });

    let status = action === "approve" ? "warden_approved" : action === "reject" ? "rejected" : "verify";

    const updateResult = await db.query(
      `UPDATE leaves SET status=$1, warden_id=$2 WHERE id=$3 RETURNING *`,
      [status, req.user.id, leaveId]
    );

    const leave = updateResult.rows[0];

    // Generate QR code for approved leaves
    if (status === "warden_approved") {
      const qrData = `leaveId:${leave.id}|studentId:${leave.student_id}|status:approved`;
      leave.qr_code = await QRCode.toDataURL(qrData);
    }

    res.json({ msg: `Leave ${status}`, leave });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ---------------------- Confirm Arrival ----------------------
export const confirmArrival = async (req, res) => {
  const leaveId = parseInt(req.params.id);

  try {
    const check = await db.query(`SELECT status FROM leaves WHERE id=$1`, [leaveId]);
    if (check.rows.length === 0) return res.status(404).json({ msg: "Leave not found" });
    if (check.rows[0].status !== "warden_approved")
      return res.status(400).json({ msg: "Leave must be approved by warden first" });

    const timestamp = new Date().toISOString();
    const result = await db.query(
      `UPDATE leaves SET arrival_timestamp=$1 WHERE id=$2 RETURNING *`,
      [timestamp, leaveId]
    );

    res.json({ msg: "Arrival confirmed by parent", leave: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
