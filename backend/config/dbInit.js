const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || ''
};

const dbName = process.env.DB_NAME || 'ktai';

async function initDB() {
  let connection;
  try {
    // 1. Connect without database to ensure DB exists
    connection = await mysql.createConnection(dbConfig);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`Database '${dbName}' verified/created.`);
    await connection.end();

    // 2. Connect with pool from db.js to create tables
    const pool = require('./db');

    // Create users table
    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'employee') NOT NULL DEFAULT 'employee',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `;
    await pool.query(createUsersTableQuery);
    console.log("Table 'users' verified/created.");

    // Create projects table
    const createProjectsTableQuery = `
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        client VARCHAR(255) NOT NULL,
        description TEXT,
        domain VARCHAR(255),
        tech_stack TEXT,
        github_url VARCHAR(500),
        api_url VARCHAR(500),
        db_name VARCHAR(255),
        status ENUM('Planning', 'Development', 'Testing', 'Live', 'Maintenance') DEFAULT 'Planning',
        start_date VARCHAR(50),
        end_date VARCHAR(50),
        senior_dev_name VARCHAR(255),
        senior_dev_email VARCHAR(255),
        senior_dev_phone VARCHAR(50),
        senior_dev_role VARCHAR(100),
        senior_dev_working_from VARCHAR(50),
        senior_dev_working_to VARCHAR(50),
        senior_dev_responsibilities TEXT,
        senior_dev_kt_notes TEXT,
        is_access_enabled TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `;
    await pool.query(createProjectsTableQuery);
    console.log("Table 'projects' verified/created.");

    // Create project_assignments table
    const createAssignmentsTableQuery = `
      CREATE TABLE IF NOT EXISTS project_assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        employee_id INT NOT NULL,
        employee_name VARCHAR(255) NOT NULL,
        employee_email VARCHAR(255) NOT NULL,
        emp_uid VARCHAR(100),
        department VARCHAR(255),
        designation VARCHAR(255),
        assigned_date VARCHAR(50),
        reporting_senior VARCHAR(255),
        is_enabled TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `;
    await pool.query(createAssignmentsTableQuery);
    console.log("Table 'project_assignments' verified/created.");

    try {
      await pool.query("ALTER TABLE project_assignments ADD COLUMN is_enabled TINYINT(1) DEFAULT 1");
      console.log("Column 'is_enabled' added to 'project_assignments'.");
    } catch (e) {
      // Column might already exist
    }

    // Create project_resources table
    const createResourcesTableQuery = `
      CREATE TABLE IF NOT EXISTS project_resources (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        resource_type ENUM('file', 'link', 'note') NOT NULL,
        title VARCHAR(255) NOT NULL,
        file_path VARCHAR(500),
        file_type VARCHAR(100),
        url VARCHAR(500),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `;
    await pool.query(createResourcesTableQuery);
    console.log("Table 'project_resources' verified/created.");

    // 3. Seed default Admin if not exists
    const adminEmail = 'adminkt@gmail.com';
    const adminPassword = 'ktai123';
    
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [adminEmail]);
    if (rows.length === 0) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Admin KT', adminEmail, hashedPassword, 'admin']
      );
      console.log(`Default admin user seeded successfully with email: ${adminEmail}`);
    } else {
      console.log(`Admin user '${adminEmail}' already exists.`);
    }

  } catch (error) {
    console.error("Database initialization failed:", error);
    if (connection) {
      try {
        await connection.end();
      } catch (err) {
        // Ignore close error
      }
    }
    throw error;
  }
}

module.exports = initDB;
