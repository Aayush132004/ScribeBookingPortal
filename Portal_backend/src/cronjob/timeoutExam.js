import cron from "node-cron";
import { pool } from "../config/db.js";

// The logic function (separated so we can call it immediately)
const runExamCheck = async () => {
  try {
    console.log("⚡ Cron Triggered. Checking database..."); // <--- You should see this now

    // 1. Get IST Time
    const [timeRes] = await pool.execute(
      `SELECT 
        (NOW() + INTERVAL '05:30' HOUR_MINUTE) as ist_now,
        DATE(NOW() + INTERVAL '05:30' HOUR_MINUTE) as ist_date,
        TIME(NOW() + INTERVAL '05:30' HOUR_MINUTE) as ist_time`
    );
    
    const { ist_now, ist_date, ist_time } = timeRes[0];
    // console.log(`   🕒 Time Check: ${ist_now}`); // Uncomment to debug time

    // 2. MARK AS COMPLETED (Scribe assigned + Time passed)
    const [completedResult] = await pool.execute(
      `UPDATE exam_requests 
       SET status = 'COMPLETED', completed_at = ?
       WHERE status = 'ACCEPTED' 
       AND accepted_scribe_id IS NOT NULL
       AND (
         exam_date < ? 
         OR (exam_date = ? AND exam_time < ?)
       )`,
      [ist_now, ist_date, ist_date, ist_time]
    );

    // 3. MARK AS TIMED_OUT (No scribe + Time passed)
    const [timeoutResult] = await pool.execute(
      `UPDATE exam_requests 
       SET status = 'TIMED_OUT' 
       WHERE status = 'OPEN' 
       AND (
          exam_date < ? 
          OR (exam_date = ? AND IFNULL(exam_time, '23:59:59') < ?)
       )`,
      [ist_date, ist_date, ist_time]
    );

    // Only log if something actually changed to keep console clean
    if (completedResult.affectedRows > 0) {
      console.log(`✅ COMPLETED: ${completedResult.affectedRows} requests.`);
    }
    if (timeoutResult.affectedRows > 0) {
      console.log(`⏰ TIMED OUT: ${timeoutResult.affectedRows} requests.`);
    }

  } catch (err) {
    console.error("❌ Cron Error:", err.message);
  }
};

export const startExamTimeoutCron = () => {
  console.log("🟢 Exam Status Cron Job Initialized...");

  // 1. Run IMMEDIATELY on server start (so you don't have to wait)
  runExamCheck();

  // 2. Schedule for every minute thereafter
  cron.schedule("* * * * *", () => {
    runExamCheck();
  });
};