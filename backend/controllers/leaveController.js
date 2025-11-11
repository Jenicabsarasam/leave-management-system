// backend/controllers/leaveController.js
import QRCode from "qrcode";
import db from "../config/db.js";
import fs from 'fs';

// ---------------------- Student applies ----------------------
export const applyLeave = async (req, res) => {
  const { reason, startDate, endDate, type } = req.body;
  if (!reason || !startDate || !endDate)
    return res.status(400).json({ msg: "All fields required" });

  try {
    let status = 'pending';
    
    // For emergency leaves, skip to warden approval directly
    if (type === 'emergency') {
      status = 'emergency_pending'; // New status for emergency leaves
    }

    const result = await db.query(
      `INSERT INTO leaves(student_id, reason, start_date, end_date, type, status)
       VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user.id, reason, startDate, endDate, type || 'normal', status]
    );
    
    const message = type === 'emergency' 
      ? "Emergency leave applied! It will be processed directly by warden." 
      : "Leave applied";
      
    res.status(201).json({ msg: message, leave: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ---------------------- Get leaves for logged-in user ----------------------
export const getLeaves = async (req, res) => {
  try {
    let query = `
      SELECT 
        l.*, 
        s.id as student_id, 
        s.name as student_name, 
        s.roll_number as student_rollno,
        s.division as student_division,
        b.name as branch_name,
        h.name as hostel_name,
        p.id as parent_id, p.name as parent_name,
        a.id as advisor_id, a.name as advisor_name,
        w.id as warden_id, w.name as warden_name,
        -- 👇 ADD THESE FIELDS
        l.meeting_scheduled,
        l.meeting_date,
        l.warden_comments
      FROM leaves l
      JOIN users s ON l.student_id = s.id
      LEFT JOIN branches b ON s.branch_id = b.id
      LEFT JOIN hostels h ON s.hostel_id = h.id
      LEFT JOIN users p ON l.parent_id = p.id
      LEFT JOIN users a ON l.advisor_id = a.id
      LEFT JOIN users w ON l.warden_id = w.id
    `;

    const { role, id } = req.user;
    let params = [];
    let whereConditions = [];

    if (role === "student") {
      whereConditions.push(`l.student_id = $1`);
      params = [id];
    } else if (role === "parent") {
      whereConditions.push(`l.student_id IN (
        SELECT ps.student_id 
        FROM parent_student ps 
        WHERE ps.parent_id = $1
      )`);
      params = [id];
    } else if (role === "advisor") {
      const advisorRes = await db.query(
        `SELECT u.branch_id, u.division, b.name as branch_name 
         FROM users u 
         LEFT JOIN branches b ON u.branch_id = b.id 
         WHERE u.id = $1`,
        [id]
      );
      if (advisorRes.rows.length > 0) {
        const advisor = advisorRes.rows[0];
        if (advisor.branch_id && advisor.division) {
          whereConditions.push(`s.branch_id = $1 AND s.division = $2`);
          params = [advisor.branch_id, advisor.division];
        }
      }
      whereConditions.push(`(l.status IN ('parent_approved', 'pending') OR l.type = 'emergency')`);
    } else if (role === "warden") {
      const wardenRes = await db.query(
        `SELECT u.hostel_id, h.name as hostel_name 
         FROM users u 
         LEFT JOIN hostels h ON u.hostel_id = h.id 
         WHERE u.id = $1`,
        [id]
      );
      if (wardenRes.rows.length > 0) {
        const warden = wardenRes.rows[0];
        if (warden.hostel_id) {
          whereConditions.push(`s.hostel_id = $1`);
          params = [warden.hostel_id];
        }
      }
      whereConditions.push(`(
        l.status IN ('advisor_approved', 'parent_approved', 'emergency_pending', 'proof_requested', 'meeting_scheduled', 'verified') 
        OR l.type = 'emergency'
        OR l.warden_id = $${params.length + 1}
        OR l.status IN ('warden_approved', 'rejected', 'completed')
      )`);
      params.push(id);
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ` + whereConditions.join(' AND ');
    }

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

    // Don't process emergency leaves through parent flow
    if (checkResult.rows[0].type === 'emergency') {
      return res.status(400).json({ msg: "Emergency leaves are processed directly by warden" });
    }

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

    const result = await db.query(
      `UPDATE leaves 
      SET arrival_timestamp = NOW(), status = 'completed'
      WHERE id = $1 
      RETURNING *`,
      [leaveId]
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
    
    // Don't process emergency leaves through normal advisor flow
    if (leave.type === 'emergency') {
      return res.status(400).json({ msg: "Emergency leaves are processed directly by warden" });
    }
    
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

// ---------------------- Warden approve (normal leaves) ----------------------
export const wardenApproveLeave = async (req, res) => {
  const leaveId = parseInt(req.params.id);
  const { action } = req.body;

  console.log('🏠 Warden approval request:', { leaveId, action, user: req.user });

  if (!["approve", "reject", "verify"].includes(action)) {
    console.log('❌ Invalid action:', action);
    return res.status(400).json({ msg: 'Action must be "approve", "reject", or "verify"' });
  }

  try {
    const check = await db.query(
      `SELECT * FROM leaves WHERE id=$1`, 
      [leaveId]
    );
    
    if (check.rows.length === 0) {
      console.log('❌ Leave not found:', leaveId);
      return res.status(404).json({ msg: "Leave not found" });
    }
    
    const leave = check.rows[0];
    console.log('📋 Leave details:', leave);
    
    // Check if it's an emergency leave
    if (leave.type === 'emergency') {
      console.log('❌ Emergency leave detected, redirecting to emergency approval');
      return res.status(400).json({ msg: "Use emergency approval for emergency leaves" });
    }
    
    if (leave.status !== "advisor_approved") {
      console.log('❌ Invalid status for warden approval:', leave.status);
      return res.status(400).json({ 
        msg: `Leave must be approved by advisor first. Current status: ${leave.status}` 
      });
    }

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

    console.log('💾 Updating leave status to:', status);
    const updateResult = await db.query(
      `UPDATE leaves SET status=$1, warden_id=$2 WHERE id=$3 RETURNING *`,
      [status, req.user.id, leaveId]
    );

    const updatedLeave = updateResult.rows[0];

    // Generate QR code for approved leaves
    if (status === "warden_approved") {
      try {
        console.log('🔗 Generating QR code for leave:', leaveId);
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
        console.log('✅ QR code generated and saved');
      } catch (qrError) {
        console.error('❌ QR code generation error:', qrError);
      }
    }

    console.log('✅ Warden approval successful');
    res.json({ 
      msg: `Leave ${message}`, 
      leave: updatedLeave 
    });
  } catch (err) {
    console.error('💥 Error in wardenApproveLeave:', err);
    console.error('Error details:', err.message);
    res.status(500).json({ 
      msg: "Server error during warden approval",
      error: err.message 
    });
  }
};

// ---------------------- Warden emergency approval ----------------------
export const wardenEmergencyApprove = async (req, res) => {
  const leaveId = parseInt(req.params.id);
  const { action, comments, meetingDate } = req.body;

  console.log('🚨 Warden emergency approval request:', { leaveId, action, comments, meetingDate, user: req.user });

  if (!["approve", "reject", "schedule_meeting"].includes(action)) {
    console.log('❌ Invalid emergency action:', action);
    return res.status(400).json({ msg: 'Action must be "approve", "reject", or "schedule_meeting"' });
  }

  try {
    const check = await db.query(
      `SELECT * FROM leaves WHERE id=$1`, 
      [leaveId]
    );
    
    if (check.rows.length === 0) {
      console.log('❌ Emergency leave not found:', leaveId);
      return res.status(404).json({ msg: "Leave not found" });
    }
    
    const leave = check.rows[0];
    console.log('📋 Emergency leave details:', leave);
    
    // Check if it's an emergency leave
    if (leave.type !== 'emergency') {
      console.log('❌ Not an emergency leave:', leave.type);
      return res.status(400).json({ msg: "This is not an emergency leave" });
    }

    let status, message;
    let emergencyApprovedAt = null;
    let meetingScheduled = false;
    let meetingDateValue = null;
    
    if (action === "approve") {
      status = "warden_approved";
      message = "Emergency leave approved by warden";
      emergencyApprovedAt = new Date().toISOString();
      
      // Generate QR code for approved emergency leaves
      try {
        console.log('🔗 Generating QR code for emergency leave:', leaveId);
        const qrData = JSON.stringify({
          leaveId: leave.id,
          studentId: leave.student_id,
          status: "emergency_approved"
        });
        const qr_code = await QRCode.toDataURL(qrData);
        
        await db.query(
          `UPDATE leaves SET qr_code=$1 WHERE id=$2`,
          [qr_code, leaveId]
        );
        console.log('✅ Emergency QR code generated and saved');
      } catch (qrError) {
        console.error('❌ Emergency QR code generation error:', qrError);
      }
    } else if (action === "reject") {
      status = "rejected";
      message = "Emergency leave rejected by warden";
    } else {
      status = "meeting_scheduled";
      message = "Meeting scheduled with student";
      meetingScheduled = true;
      meetingDateValue = meetingDate;
    }

    console.log('💾 Updating emergency leave status to:', status);
    
    // Build the update query
    const updateResult = await db.query(
      `UPDATE leaves 
       SET status=$1, warden_id=$2, warden_comments=$3, emergency_approved_at=$4, 
           meeting_scheduled=$5, meeting_date=$6
       WHERE id=$7 
       RETURNING *`,
      [status, req.user.id, comments || null, emergencyApprovedAt, meetingScheduled, meetingDateValue, leaveId]
    );

    console.log('✅ Emergency warden action successful');
    res.json({ 
      msg: message, 
      leave: updateResult.rows[0] 
    });
  } catch (err) {
    console.error('💥 Error in wardenEmergencyApprove:', err);
    console.error('Error details:', err.message);
    res.status(500).json({ 
      msg: "Server error during emergency warden approval",
      error: err.message 
    });
  }
};
//---------Upload Proof ----------
// In leaveController.js - uploadProof function
// In leaveController.js - uploadProof function
// In leaveController.js - uploadProof function
export const uploadProof = async (req, res) => {
  const leaveId = parseInt(req.params.id);
  
  try {
    console.log('📋 Upload proof request for leave:', leaveId);
    console.log('👤 User ID:', req.user.id);
    console.log('📄 File info:', req.file);

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
    
    if (check.rows.length === 0) {
      console.log('❌ Leave not found or unauthorized');
      return res.status(404).json({ msg: "Leave not found or unauthorized" });
    }
    
    const leave = check.rows[0];
    console.log('📝 Leave found:', leave.id, 'Status:', leave.status, 'Type:', leave.type);
    
    // Only allow proof upload for emergency leaves that are completed
    if (leave.type !== 'emergency' || leave.status !== 'completed') {
      console.log('❌ Invalid leave type or status for proof upload');
      return res.status(400).json({ 
        msg: "Proof can only be uploaded for completed emergency leaves. Current status: " + leave.status 
      });
    }

    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ msg: "Proof file is required" });
    }

    // Verify file actually exists on disk - FIXED: Use ES modules import
    
    if (!fs.existsSync(req.file.path)) {
      console.log('❌ File not found on disk:', req.file.path);
      return res.status(500).json({ msg: "File upload failed - file not saved correctly" });
    }

    console.log('✅ File verified on disk:', req.file.path);

    // Save file path to database - use relative path for web access
    const filePath = `/uploads/proofs/${req.file.filename}`;
    
    console.log('💾 Saving to database - filePath:', filePath);
    
    const updateResult = await db.query(
      `UPDATE leaves SET proof_file_path=$1, proof_submitted=true, proof_submitted_at=$2 WHERE id=$3 RETURNING *`,
      [filePath, new Date().toISOString(), leaveId]
    );

    console.log('✅ Proof uploaded successfully for leave:', leaveId);

    res.json({ 
      msg: "Proof uploaded successfully", 
      leave: updateResult.rows[0],
      filePath: filePath,
      fileUrl: `http://localhost:5050${filePath}`
    });
  } catch (err) {
    console.error('💥 Error in uploadProof:', err);
    res.status(500).json({ msg: "Server error during proof upload: " + err.message });
  }
};
// ---------------------- Verify Proof ----------------------
export const verifyProof = async (req, res) => {
  const leaveId = parseInt(req.params.id);
  const { verified, comments } = req.body;

  try {
    // Check if leave exists and advisor is authorized
    const check = await db.query(
      `SELECT l.*, s.branch_id, s.division
       FROM leaves l
       JOIN users s ON l.student_id = s.id
       WHERE l.id = $1`,
      [leaveId]
    );
    
    if (check.rows.length === 0) 
      return res.status(404).json({ msg: "Leave not found" });
    
    const leave = check.rows[0];
    
    // Check if advisor is assigned to this student's branch and division
    const advisorCheck = await db.query(
      `SELECT id FROM users WHERE id=$1 AND branch_id=$2 AND division=$3`,
      [req.user.id, leave.branch_id, leave.division]
    );
    
    if (advisorCheck.rows.length === 0) 
      return res.status(403).json({ msg: "Not authorized to verify this proof" });

    if (!leave.proof_submitted) {
      return res.status(400).json({ msg: "No proof submitted for this leave" });
    }

    const updateResult = await db.query(
      `UPDATE leaves 
       SET proof_verified=$1, proof_verified_by=$2, proof_verified_at=$3, warden_comments=COALESCE($4, warden_comments)
       WHERE id=$5 
       RETURNING *`,
      [verified, req.user.id, new Date().toISOString(), comments, leaveId]
    );

    const message = verified ? "Proof verified successfully" : "Proof rejected";
    res.json({ 
      msg: message, 
      leave: updateResult.rows[0] 
    });
  } catch (err) {
    console.error('Error in verifyProof:', err);
    res.status(500).json({ msg: "Server error during proof verification" });
  }
};

// ---------------------- Get Students Summary for Advisor ----------------------
export const getStudentsSummary = async (req, res) => {
  try {
    const { id } = req.user;

    // Get advisor's assigned branch and division
    const advisorRes = await db.query(
      `SELECT branch_id, division FROM users WHERE id = $1`,
      [id]
    );
    
    if (advisorRes.rows.length === 0 || !advisorRes.rows[0].branch_id || !advisorRes.rows[0].division) {
      return res.json({ students: [] });
    }

    const advisor = advisorRes.rows[0];

    // Get all students under this advisor with their leave statistics
    const studentsSummary = await db.query(
      `SELECT 
        s.id,
        s.name,
        s.roll_number,
        s.phone,
        s.email,
        COUNT(l.id) as total_leaves,
        COUNT(CASE WHEN l.status = 'completed' THEN 1 END) as completed_leaves,
        COUNT(CASE WHEN l.type = 'emergency' THEN 1 END) as emergency_leaves,
        COUNT(CASE WHEN l.proof_submitted = true THEN 1 END) as proofs_submitted,
        COUNT(CASE WHEN l.proof_verified = true THEN 1 END) as proofs_verified,
        MAX(l.created_at) as last_leave_date
       FROM users s
       LEFT JOIN leaves l ON s.id = l.student_id
       WHERE s.role_id = (SELECT id FROM roles WHERE name = 'student')
         AND s.branch_id = $1 
         AND s.division = $2
       GROUP BY s.id, s.name, s.roll_number, s.phone, s.email
       ORDER BY s.roll_number`,
      [advisor.branch_id, advisor.division]
    );

    // Get recent leaves for these students
    const recentLeaves = await db.query(
      `SELECT 
        l.*,
        s.name as student_name,
        s.roll_number,
        p.name as parent_name,
        w.name as warden_name
       FROM leaves l
       JOIN users s ON l.student_id = s.id
       LEFT JOIN users p ON l.parent_id = p.id
       LEFT JOIN users w ON l.warden_id = w.id
       WHERE s.branch_id = $1 AND s.division = $2
       ORDER BY l.created_at DESC
       LIMIT 50`,
      [advisor.branch_id, advisor.division]
    );

    res.json({ 
      students: studentsSummary.rows,
      recentLeaves: recentLeaves.rows
    });
  } catch (err) {
    console.error('Error in getStudentsSummary:', err);
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