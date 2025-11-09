import db from "../config/db.js";

// ✅ Get admin statistics
export const getAdminStats = async (req, res) => {
  try {
    const usersCount = await db.query(`
      SELECT role_id, COUNT(*) as count 
      FROM users 
      GROUP BY role_id
    `);

    const leavesCount = await db.query(`
      SELECT COUNT(*) as total_leaves,
             COUNT(CASE WHEN status IN ('pending', 'parent_approved', 'advisor_approved', 'emergency_pending') THEN 1 END) as pending_leaves,
             COUNT(CASE WHEN type = 'emergency' THEN 1 END) as emergency_leaves,
             COUNT(CASE WHEN proof_submitted = true THEN 1 END) as proofs_submitted,
             COUNT(CASE WHEN proof_verified = true THEN 1 END) as proofs_verified
      FROM leaves
    `);

    const roles = await db.query(`SELECT id, name FROM roles`);
    const roleMap = {};
    roles.rows.forEach(role => { roleMap[role.id] = role.name; });

    const userStats = {};
    usersCount.rows.forEach(row => {
      const roleName = roleMap[row.role_id];
      userStats[roleName] = parseInt(row.count);
    });

    const leavesData = leavesCount.rows[0];
    res.json({
      totalUsers: usersCount.rows.reduce((sum, row) => sum + parseInt(row.count), 0),
      totalLeaves: parseInt(leavesData.total_leaves),
      pendingLeaves: parseInt(leavesData.pending_leaves),
      emergencyLeaves: parseInt(leavesData.emergency_leaves),
      proofsSubmitted: parseInt(leavesData.proofs_submitted),
      proofsVerified: parseInt(leavesData.proofs_verified),
      activeStudents: userStats.student || 0,
      activeAdvisors: userStats.advisor || 0,
      activeWardens: userStats.warden || 0,
      activeParents: userStats.parent || 0,
      systemUptime: "99.9%",
      storageUsed: "2.3GB"
    });
  } catch (err) {
    console.error("Error in getAdminStats:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ Get all users
export const getAllUsers = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.*, r.name as role, b.name as branch_name, h.name as hostel_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN branches b ON u.branch_id = b.id
      LEFT JOIN hostels h ON u.hostel_id = h.id
      ORDER BY u.created_at DESC
    `);
    const users = result.rows.map(u => ({
      id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role,
      roll_number: u.roll_number, division: u.division, branch_name: u.branch_name,
      hostel_name: u.hostel_name, status: u.status || "active", created_at: u.created_at
    }));
    res.json({ users });
  } catch (err) {
    console.error("Error in getAllUsers:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ Create new user
export const createUser = async (req, res) => {
  const { name, email, phone, role, roll_number, division, branch_id, hostel_id, password } = req.body;
  try {
    if (!name || !email || !role || !password)
      return res.status(400).json({ msg: "Name, email, role, and password are required" });

    const existing = await db.query("SELECT id FROM users WHERE email=$1", [email]);
    if (existing.rows.length > 0)
      return res.status(400).json({ msg: "User with this email already exists" });

    const roleRes = await db.query("SELECT id FROM roles WHERE name=$1", [role]);
    if (roleRes.rows.length === 0) return res.status(400).json({ msg: "Invalid role" });
    const role_id = roleRes.rows[0].id;

    const result = await db.query(
      `INSERT INTO users (name, email, phone, role_id, roll_number, division, branch_id, hostel_id, password, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'active') RETURNING *`,
      [name, email, phone, role_id, roll_number, division, branch_id, hostel_id, password]
    );
    res.json({ msg: "User created successfully", user: result.rows[0] });
  } catch (err) {
    console.error("Error in createUser:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ Update user
export const updateUser = async (req, res) => {
  const userId = parseInt(req.params.id);
  const { name, email, phone, role, roll_number, division, branch_id, hostel_id, status } = req.body;
  try {
    const user = await db.query("SELECT * FROM users WHERE id=$1", [userId]);
    if (!user.rows.length) return res.status(404).json({ msg: "User not found" });

    let role_id = user.rows[0].role_id;
    if (role) {
      const r = await db.query("SELECT id FROM roles WHERE name=$1", [role]);
      if (!r.rows.length) return res.status(400).json({ msg: "Invalid role" });
      role_id = r.rows[0].id;
    }

    const result = await db.query(
      `UPDATE users SET name=$1,email=$2,phone=$3,role_id=$4,roll_number=$5,
       division=$6,branch_id=$7,hostel_id=$8,status=$9,updated_at=NOW() WHERE id=$10 RETURNING *`,
      [name, email, phone, role_id, roll_number, division, branch_id, hostel_id, status, userId]
    );
    res.json({ msg: "User updated successfully", user: result.rows[0] });
  } catch (err) {
    console.error("Error in updateUser:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ Delete user
export const deleteUser = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const existing = await db.query("SELECT * FROM users WHERE id=$1", [id]);
    if (!existing.rows.length) return res.status(404).json({ msg: "User not found" });
    await db.query("DELETE FROM users WHERE id=$1", [id]);
    res.json({ msg: "User deleted successfully" });
  } catch (err) {
    console.error("Error in deleteUser:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ Get all leaves with filter support
export const getAllLeaves = async (req, res) => {
  try {
    const { status, branch, hostel } = req.query;
    let query = `
      SELECT l.*, s.name as student_name, s.roll_number as student_rollno, s.division as student_division,
             b.name as branch_name, h.name as hostel_name, p.name as parent_name, a.name as advisor_name, w.name as warden_name
      FROM leaves l
      JOIN users s ON l.student_id = s.id
      LEFT JOIN branches b ON s.branch_id = b.id
      LEFT JOIN hostels h ON s.hostel_id = h.id
      LEFT JOIN users p ON l.parent_id = p.id
      LEFT JOIN users a ON l.advisor_id = a.id
      LEFT JOIN users w ON l.warden_id = w.id
      WHERE 1=1
    `;
    const values = [];
    if (status) { query += ` AND l.status=$${values.length+1}`; values.push(status); }
    if (branch) { query += ` AND b.name=$${values.length+1}`; values.push(branch); }
    if (hostel) { query += ` AND h.name=$${values.length+1}`; values.push(hostel); }

    query += " ORDER BY l.created_at DESC";
    const result = await db.query(query, values);
    res.json({ leaves: result.rows });
  } catch (err) {
    console.error("Error in getAllLeaves:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ Approve/Reject leave
export const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const valid = ["approved", "rejected", "completed"];
    if (!valid.includes(status)) return res.status(400).json({ msg: "Invalid status" });

    await db.query(`UPDATE leaves SET status=$1, updated_at=NOW() WHERE id=$2`, [status, id]);
    res.json({ msg: `Leave ${status} successfully.` });
  } catch (err) {
    console.error("Error updating leave status:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ Verify proof
export const verifyProof = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`UPDATE leaves SET proof_verified=TRUE WHERE id=$1`, [id]);
    res.json({ msg: "Proof verified successfully." });
  } catch (err) {
    console.error("Error verifying proof:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ Get system logs
export const getSystemLogs = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM system_logs ORDER BY timestamp DESC LIMIT 100
    `);
    res.json({ logs: result.rows });
  } catch (err) {
    console.error("Error in getSystemLogs:", err);
    res.json({ logs: [] });
  }
};

// ✅ AI-style report
export const generateReportSummary = async (req, res) => {
  try {
    const total = await db.query("SELECT COUNT(*) AS count FROM leaves");
    const approved = await db.query(`
      SELECT COUNT(*) AS count FROM leaves WHERE status IN ('approved','completed','advisor_approved','warden_approved')
    `);
    const pending = await db.query(`
      SELECT COUNT(*) AS count FROM leaves WHERE status IN ('pending','parent_approved','emergency_pending')
    `);
    const rejected = await db.query("SELECT COUNT(*) AS count FROM leaves WHERE status='rejected'");
    const topReason = await db.query(`
      SELECT reason, COUNT(*) AS count FROM leaves GROUP BY reason ORDER BY count DESC LIMIT 1
    `);

    const summary = `Total ${total.rows[0].count} leaves recorded. ${approved.rows[0].count} approved, ${pending.rows[0].count} pending, ${rejected.rows[0].count} rejected. Most common reason: '${topReason.rows[0]?.reason || "N/A"}'.`;
    res.json({ aiSummary: summary });
  } catch (err) {
    console.error("Error in generateReportSummary:", err);
    res.status(500).json({ msg: "Error generating report" });
  }
};
// ✅ Toggle user activation
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status value" });
    }

    await db.query(
      `UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2`,
      [status, id]
    );

    res.json({ msg: `User ${status === "active" ? "activated" : "deactivated"} successfully` });
  } catch (err) {
    console.error("Error toggling user status:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
// ========= REPORTS & ANALYTICS =========
export const getMonthlyLeaveStats = async (req, res) => {
  try {
    // group by yyyy-mm
    const q = `
      SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS ym,
             COUNT(*) AS total,
             COUNT(*) FILTER (WHERE status IN ('approved','completed','advisor_approved','warden_approved')) AS approved,
             COUNT(*) FILTER (WHERE status='rejected') AS rejected,
             COUNT(*) FILTER (WHERE type='emergency') AS emergency
      FROM leaves
      GROUP BY ym
      ORDER BY ym ASC;
    `;
    const r = await db.query(q);
    res.json({ months: r.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Error fetching monthly stats" });
  }
};

export const getRoleDistribution = async (_req, res) => {
  try {
    const q = `
      SELECT r.name AS role, COUNT(*)::int AS count
      FROM users u
      JOIN roles r ON r.id=u.role_id
      GROUP BY r.name
      ORDER BY r.name;
    `;
    const r = await db.query(q);
    res.json({ roles: r.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Error fetching role distribution" });
  }
};

export const getBranchLeaveRatio = async (_req, res) => {
  try {
    const q = `
      SELECT COALESCE(b.name, 'Unassigned') AS branch, COUNT(*)::int AS leaves
      FROM leaves l
      JOIN users s ON s.id=l.student_id
      LEFT JOIN branches b ON b.id=s.branch_id
      GROUP BY branch
      ORDER BY leaves DESC;
    `;
    const r = await db.query(q);
    res.json({ branches: r.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Error fetching branch leave ratio" });
  }
};

export const getHostelMovement = async (_req, res) => {
  try {
    const q = `
      SELECT COALESCE(h.name, 'Day Scholar / None') AS hostel,
             COUNT(*)::int AS leaves
      FROM leaves l
      JOIN users s ON s.id=l.student_id
      LEFT JOIN hostels h ON h.id=s.hostel_id
      GROUP BY hostel
      ORDER BY leaves DESC;
    `;
    const r = await db.query(q);
    res.json({ hostels: r.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Error fetching hostel movement" });
  }
};

export const getUserActivityAnalytics = async (_req, res) => {
  try {
    // “Most active advisors” by number of advisor approvals
    const advisors = await db.query(`
      SELECT a.id, a.name, COUNT(*)::int AS approvals
      FROM leaves l
      JOIN users a ON a.id=l.advisor_id
      WHERE l.status IN ('advisor_approved','warden_approved','completed')
      GROUP BY a.id, a.name
      ORDER BY approvals DESC
      LIMIT 10;
    `);

    // average approval time (created_at to first non-pending approval)
    const approvalTime = await db.query(`
      SELECT COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (first_approval - created_at))/3600)::numeric,2),0) AS avg_hours
      FROM (
        SELECT l.id, l.created_at,
               LEAST(
                 NULLIF(l.parent_approved_at, NULL),
                 NULLIF(l.advisor_approved_at, NULL),
                 NULLIF(l.warden_approved_at, NULL)
               ) AS first_approval
        FROM leaves l
      ) x
      WHERE first_approval IS NOT NULL;
    `);

    res.json({
      mostActiveAdvisors: advisors.rows,
      avgApprovalHours: Number(approvalTime.rows[0]?.avg_hours || 0),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Error fetching user activity analytics" });
  }
};

export const comparePeriods = async (req, res) => {
  try {
    // expects ?from=YYYY-MM-01&to=YYYY-MM-01 (two months)
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ msg: "from and to are required (YYYY-MM-DD)" });

    const q = `
      SELECT period, COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE type='emergency')::int AS emergency,
        COUNT(*) FILTER (WHERE status IN ('approved','completed','advisor_approved','warden_approved'))::int AS approved,
        COUNT(*) FILTER (WHERE status='rejected')::int AS rejected
      FROM (
        SELECT CASE
          WHEN date_trunc('month', created_at)=date_trunc('month', $1::date) THEN 'A'
          WHEN date_trunc('month', created_at)=date_trunc('month', $2::date) THEN 'B'
        END AS period
        FROM leaves
        WHERE date_trunc('month', created_at) IN (date_trunc('month', $1::date), date_trunc('month', $2::date))
      ) t
      GROUP BY period
      ORDER BY period;
    `;
    const r = await db.query(q, [from, to]);
    res.json({ compare: r.rows }); // A vs B
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Error comparing periods" });
  }
};

export const getAnomalousLeaveUsers = async (_req, res) => {
  try {
    // z-score over total leaves per user (simple anomaly flag)
    const byUser = await db.query(`
      WITH per_user AS (
        SELECT s.id, s.name, COUNT(*)::int AS leaves
        FROM leaves l JOIN users s ON s.id=l.student_id
        GROUP BY s.id, s.name
      ),
      stats AS (
        SELECT AVG(leaves) AS avg, STDDEV_POP(leaves) AS sd FROM per_user
      )
      SELECT p.id, p.name, p.leaves,
             CASE WHEN sd=0 THEN 0 ELSE (p.leaves - avg)/sd END AS z
      FROM per_user p, stats
      WHERE sd IS NOT NULL
      ORDER BY z DESC NULLS LAST
      LIMIT 20;
    `);
    res.json({ anomalies: byUser.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Error finding anomalies" });
  }
};

// ========= LOGS (filters, export, AI-ish summary) =========
export const getSystemLogsFiltered = async (req, res) => {
  try {
    const { type, q, limit = 100 } = req.query;

    // If your table has columns: id, action, type, user_name, ip_address, timestamp, meta
    let where = [];
    let params = [];
    let idx = 1;

    if (type) {
      where.push(`type = $${idx++}`);
      params.push(type);
    }
    if (q) {
      where.push(`(action ILIKE $${idx} OR user_name ILIKE $${idx})`);
      params.push(`%${q}%`);
      idx++;
    }

    const sql =
      `SELECT id, action, type, user_name, ip_address, timestamp 
       FROM system_logs
       ${where.length ? "WHERE " + where.join(" AND ") : ""}
       ORDER BY timestamp DESC
       LIMIT ${Number(limit)}`;

    const r = await db.query(sql, params);
    res.json({ logs: r.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Error fetching logs" });
  }
};

export const exportLogsCSV = async (req, res) => {
  try {
    const r = await db.query(`
      SELECT id, action, type, user_name, ip_address, timestamp
      FROM system_logs
      ORDER BY timestamp DESC
      LIMIT 5000;
    `);
    const header = "id,action,type,user_name,ip_address,timestamp\n";
    const rows = r.rows
      .map((x) =>
        [
          x.id,
          `"${(x.action || "").replace(/"/g, '""')}"`,
          x.type || "",
          `"${(x.user_name || "").replace(/"/g, '""')}"`,
          x.ip_address || "",
          x.timestamp?.toISOString ? x.timestamp.toISOString() : x.timestamp,
        ].join(",")
      )
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=logs.csv");
    res.send(header + rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Error exporting logs" });
  }
};

export const getLogsAISummary = async (_req, res) => {
  try {
    const r = await db.query(`
      SELECT type, COUNT(*)::int AS cnt
      FROM system_logs
      GROUP BY type
      ORDER BY cnt DESC;
    `);
    // simple “AI-style” line:
    const total = r.rows.reduce((s, x) => s + x.cnt, 0);
    const parts = r.rows.map((x) => `${x.type || 'general'} (${Math.round((x.cnt / (total || 1)) * 100)}%)`);
    res.json({
      total,
      summary: `Most frequent actions: ${parts.join(", ")}.`,
      breakdown: r.rows,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Error summarizing logs" });
  }
};
