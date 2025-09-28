// backend/controllers/leaveController.js
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
    // In getLeaves function - update the SELECT query
let query = `
  SELECT l.*, 
         s.id as student_id, s.name as student_name, s.roll_number as student_rollno,
         p.id as parent_id, p.name as parent_name,
         a.id as advisor_id, a.name as advisor_name,
         w.id as warden_id, w.name as warden_name
  FROM leaves l
  JOIN users s ON l.student_id = s.id
  LEFT JOIN users p ON l.parent_id = p.id
  LEFT JOIN users a ON l.advisor_id = a.id
  LEFT JOIN users w ON l.warden_id = w.id
`;

    const { role, id } = req.user;
    let params = [];

    if (role === "student") {
      query += ` WHERE l.student_id = $1`;
      params = [id];
    } else if (role === "parent") {
      // Get leaves only for parent's children
      query += ` 
        WHERE l.student_id IN (
          SELECT ps.student_id 
          FROM parent_student ps 
          WHERE ps.parent_id = $1
        )
      `;
      params = [id];
    } else if (role === "advisor") {
      // Advisor sees all leaves that need their approval
      query += ` WHERE l.status IN ('parent_approved', 'pending')`;
    } else if (role === "warden") {
      // Warden sees all leaves that need their approval
      query += ` WHERE l.status IN ('advisor_approved', 'parent_approved')`;
    }
    // Admin can see all leaves (no WHERE clause)

    query += ` ORDER BY l.created_at DESC`;

    const result = await db.query(query, params);
    res.json({ leaves: result.rows });
  } catch (err) {
    console.error('Error in getLeaves:', err);
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
    // Check if leave exists and if parent is authorized to approve it
    const checkQuery = `
      SELECT l.*, s.name as student_name
      FROM leaves l
      JOIN users s ON l.student_id = s.id
      WHERE l.id = $1 AND l.student_id IN (
        SELECT ps.student_id 
        FROM parent_student ps 
        WHERE ps.parent_id = $2
      )
    `;
    
    const checkResult = await db.query(checkQuery, [leaveId, req.user.id]);
    
    if (checkResult.rows.length === 0) 
      return res.status(404).json({ msg: "Leave not found or unauthorized" });

    if (checkResult.rows[0].status !== "pending")
      return res.status(400).json({ msg: "Leave already processed" });

    const status = action === "approve" ? "parent_approved" : "rejected";
    const result = await db.query(
      `UPDATE leaves SET status=$1, parent_id=$2 WHERE id=$3 RETURNING *`,
      [status, req.user.id, leaveId]
    );
    
    res.json({ 
      msg: `Leave ${action === "approve" ? "approved" : "rejected"}`, 
      leave: result.rows[0] 
    });
  } catch (err) {
    console.error('Error in parentApproveLeave:', err);
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
    // Check if leave exists and status is correct
    const check = await db.query(
      `SELECT * FROM leaves WHERE id=$1`, 
      [leaveId]
    );
    
    if (check.rows.length === 0) 
      return res.status(404).json({ msg: "Leave not found" });
    
    const leave = check.rows[0];
    
    if (leave.status !== "parent_approved")
      return res.status(400).json({ 
        msg: `Leave must be approved by parent first. Current status: ${leave.status}` 
      });

    const status = action === "approve" ? "advisor_approved" : "rejected";
    const result = await db.query(
      `UPDATE leaves SET status=$1, advisor_id=$2 WHERE id=$3 RETURNING *`,
      [status, req.user.id, leaveId]
    );

    res.json({ 
      msg: `Leave ${action === "approve" ? "approved by advisor" : "rejected by advisor"}`, 
      leave: result.rows[0] 
    });
  } catch (err) {
    console.error('Error in advisorReviewLeave:', err);
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
    const check = await db.query(
      `SELECT * FROM leaves WHERE id=$1`, 
      [leaveId]
    );
    
    if (check.rows.length === 0) 
      return res.status(404).json({ msg: "Leave not found" });
    
    const leave = check.rows[0];
    
    if (leave.status !== "advisor_approved")
      return res.status(400).json({ 
        msg: `Leave must be approved by advisor first. Current status: ${leave.status}` 
      });

    let status, message;
    
    if (action === "approve") {
      status = "warden_approved";
      message = "approved by warden";
    } else if (action === "reject") {
      status = "rejected";
      message = "rejected by warden";
    } else {
      status = "verified";
      message = "verified by warden";
    }

    const updateResult = await db.query(
      `UPDATE leaves SET status=$1, warden_id=$2 WHERE id=$3 RETURNING *`,
      [status, req.user.id, leaveId]
    );

    const updatedLeave = updateResult.rows[0];

    // Generate QR code for warden approved leaves
    if (status === "warden_approved") {
      try {
        const qrData = JSON.stringify({
          leaveId: updatedLeave.id,
          studentId: updatedLeave.student_id,
          studentName: updatedLeave.student_name,
          startDate: updatedLeave.start_date,
          endDate: updatedLeave.end_date,
          status: "approved"
        });
        updatedLeave.qr_code = await QRCode.toDataURL(qrData);
        
        // Save QR code to database
        await db.query(
          `UPDATE leaves SET qr_code=$1 WHERE id=$2`,
          [updatedLeave.qr_code, leaveId]
        );
      } catch (qrError) {
        console.error('QR code generation error:', qrError);
      }
    }

    res.json({ 
      msg: `Leave ${message}`, 
      leave: updatedLeave 
    });
  } catch (err) {
    console.error('Error in wardenApproveLeave:', err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ---------------------- Confirm Arrival ----------------------
export const confirmArrival = async (req, res) => {
  const leaveId = parseInt(req.params.id);

  try {
    // Check if leave exists and parent is authorized
    const checkQuery = `
      SELECT l.*
      FROM leaves l
      WHERE l.id = $1 AND l.student_id IN (
        SELECT ps.student_id 
        FROM parent_student ps 
        WHERE ps.parent_id = $2
      )
    `;
    
    const check = await db.query(checkQuery, [leaveId, req.user.id]);
    
    if (check.rows.length === 0) 
      return res.status(404).json({ msg: "Leave not found or unauthorized" });
    
    const leave = check.rows[0];
    
    if (leave.status !== "warden_approved")
      return res.status(400).json({ 
        msg: `Leave must be approved by warden first. Current status: ${leave.status}` 
      });

    if (leave.arrival_timestamp)
      return res.status(400).json({ msg: "Arrival already confirmed" });

    const timestamp = new Date().toISOString();
    const result = await db.query(
      `UPDATE leaves SET arrival_timestamp=$1, status='completed' WHERE id=$2 RETURNING *`,
      [timestamp, leaveId]
    );

    res.json({ 
      msg: "Arrival confirmed successfully", 
      leave: result.rows[0] 
    });
  } catch (err) {
    console.error('Error in confirmArrival:', err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ---------------------- Get QR Code ----------------------
export const getQRCode = async (req, res) => {
  const leaveId = parseInt(req.params.id);

  try {
    const result = await db.query(
      `SELECT qr_code FROM leaves WHERE id=$1`,
      [leaveId]
    );
    
    if (result.rows.length === 0) 
      return res.status(404).json({ msg: "Leave not found" });
    
    if (!result.rows[0].qr_code)
      return res.status(400).json({ msg: "QR code not generated for this leave" });

    res.json({ qr_code: result.rows[0].qr_code });
  } catch (err) {
    console.error('Error in getQRCode:', err);
    res.status(500).json({ msg: "Server error" });
  }
};