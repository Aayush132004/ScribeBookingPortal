import { pool } from "../config/db.js";
import { sendMail } from "../../utils/sendMail.js";

//by default will send 10 unverified scribes and will send more accordingly to req like verified/unverified and page no
export const loadScribes = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    let { verified = "false", page = 1 } = req.query;

    const limit = 10;
    const pageNum = Number(page);

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        message: "Invalid page number"
      });
    }

    // normalize verified flag
    if (verified !== "true" && verified !== "false") {
      return res.status(400).json({
        message: "verified must be true or false"
      });
    }

    const isVerified = verified === "true";
    const offset = (pageNum - 1) * limit;

    // ⚠️ FIXED: Changed s.created_at to u.created_at
    const query = `
      SELECT
        s.id AS scribe_id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.state,
        u.district,
        u.profile_image_url, 
        u.aadhaar_card_url,  
        s.is_verified,
        s.qualification_doc_url,
        u.created_at
      FROM scribes s
      JOIN users u ON u.id = s.user_id
      WHERE s.is_verified = ?
      ORDER BY u.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Note: execute doesn't work well with template literal injected LIMIT/OFFSET in some drivers, 
    // but works here if valid numbers. ideally use ? for limit/offset too.
    const [scribes] = await conn.execute(query, [isVerified]);

    return res.status(200).json({
      page: pageNum,
      verified: isVerified,
      scribes,
      has_more: scribes.length === limit
    });

  } catch (err) {
    console.error("Admin load scribes error:", err);
    return res.status(500).json({
      message: "Internal server error"
    });
  } finally {
    conn.release();
  }
};

//to verify an individual scribe
export const verifyScribes = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const { scribe_id, is_verified } = req.body;

    // basic validation
    if (
      !scribe_id ||
      typeof is_verified !== "boolean"
    ) {
      return res.status(400).json({
        message: "scribe_id and is_verified (boolean) are required"
      });
    }

    // check scribe exists
    const [scribes] = await conn.execute(
      "SELECT id, is_verified FROM scribes WHERE id = ?",
      [scribe_id]
    );

    if (!scribes.length) {
      return res.status(404).json({
        message: "Scribe not found"
      });
    }

    // update verification status
    await conn.execute(
      "UPDATE scribes SET is_verified = ? WHERE id = ?",
      [is_verified, scribe_id]
    );

    return res.status(200).json({
      message: `Scribe ${is_verified ? "verified" : "unverified"} successfully`
    });

  } catch (err) {
    console.error("Verify scribe error:", err);
    return res.status(500).json({
      message: "Internal server error"
    });
  } finally {
    conn.release();
  }
};

//to view(read-only) requests basically the exam requests between student and scribe
export const viewRequests = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const { status, page = 1 } = req.query;

    const limit = 10;
    const pageNum = Number(page);

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        message: "Invalid page number"
      });
    }

    const ALLOWED_STATUSES = [
      "OPEN",
      "ACCEPTED",
      "COMPLETED",
      "TIMED_OUT"
    ];

    if (status && !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Invalid status filter"
      });
    }

    const offset = (pageNum - 1) * limit;

    // default status = ACCEPTED
    const finalStatus = status || "ACCEPTED";

    let query = `
      SELECT
        er.id,
        er.exam_date,
        er.exam_time,
        er.language,
        er.state,
        er.district,
        er.city,
        er.status,
        er.student_name,
        er.scribe_name,
        er.created_at,
        er.accepted_at,
        er.completed_at
      FROM exam_requests er
      WHERE er.status = ?
      ORDER BY er.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [requests] = await conn.execute(query, [finalStatus]);

    return res.status(200).json({
      page: pageNum,
      status: finalStatus,
      requests,
      has_more: requests.length === limit
    });

  } catch (err) {
    console.error("Admin view requests error:", err);
    return res.status(500).json({
      message: "Internal server error"
    });
  } finally {
    conn.release();
  }
};

//To delete scribe
export const deleteScribe = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    
    // Get user details for email before deleting
    const [users] = await conn.execute("SELECT u.email, u.first_name FROM users u JOIN scribes s ON u.id = s.user_id WHERE s.id = ?", [id]);
    
    await conn.beginTransaction();
    // Delete user (cascade will remove scribe entry)
    await conn.execute("DELETE FROM users WHERE id = (SELECT user_id FROM scribes WHERE id = ?)", [id]);
    await conn.commit();

    if (users.length) {
      const { email, first_name } = users[0];
      try {
        await sendMail({
          to: email,
          subject: "Account Deleted by Administrator - Scribe Portal",
          html: `<h1>Hello ${first_name},</h1><p>Your scribe account has been deleted by an administrator. If you think this is a mistake, please contact support.</p>`
        });
      } catch (mailErr) {
        console.error("Mail error during admin deletion:", mailErr);
      }
    }

    res.status(200).json({ message: "Scribe deleted successfully" });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error(err);
    res.status(500).json({ message: "Error deleting scribe" });
  } finally {
    conn.release();
  }
};

export const loadAllUsers = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { role, page = 1 } = req.query;
    const limit = 20;
    const offset = (Number(page) - 1) * limit;

    let query = `
      SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.role, u.created_at, u.is_active
      FROM users u
      WHERE u.role != 'ADMIN'
    `;
    const params = [];

    if (role) {
      query += " AND u.role = ?";
      params.push(role);
    }

    query += ` ORDER BY u.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    
    const [users] = await conn.execute(query, params);
    res.status(200).json({ users, has_more: users.length === limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error loading users" });
  } finally {
    conn.release();
  }
};

export const toggleUserActive = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    await conn.execute("UPDATE users SET is_active = ? WHERE id = ?", [is_active, id]);
    res.status(200).json({ message: `User ${is_active ? 'enabled' : 'disabled'} successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating user status" });
  } finally {
    conn.release();
  }
};

export const deleteUser = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    await conn.execute("DELETE FROM users WHERE id = ?", [id]);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting user" });
  } finally {
    conn.release();
  }
};