import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function createAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
  });

  try {
    const email = 'admin@scribe.com';
    const password = 'Admin@123';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Checking if admin exists...');
    const [existing] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
    
    if (existing.length > 0) {
      console.log('Admin already exists.');
      return;
    }

    console.log('Creating admin user...');
    await connection.execute(
      `INSERT INTO users (first_name, last_name, email, phone, password_hash, role, highest_qualification, state, district, city, pincode) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Super', 'Admin', email, '0000000000', hashedPassword, 'ADMIN', 'Post-Graduate', 'delhi', 'new delhi', 'Delhi', '110001']
    );

    console.log('Admin user created successfully!');
    console.log('Email: admin@scribe.com');
    console.log('Password: Admin@123');

  } catch (err) {
    console.error('Error creating admin:', err);
  } finally {
    await connection.end();
  }
}

createAdmin();
