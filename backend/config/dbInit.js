// const mysql = require('mysql2/promise');
// const bcrypt = require('bcrypt');
// require('dotenv').config();

// const dbConfig = {
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || ''
// };

// const dbName = process.env.DB_NAME || 'ktai';

// async function initDB() {
//   let connection;
//   try {
//     // 1. Connect without database to ensure DB exists
//     connection = await mysql.createConnection(dbConfig);
//     await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
//     console.log(`Database '${dbName}' verified/created.`);
//     await connection.end();

//     // 2. Connect with pool from db.js to create tables
//     const pool = require('./db');

//     // Create users table
//     const createUsersTableQuery = `
//       CREATE TABLE IF NOT EXISTS users (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         fullName VARCHAR(255) NOT NULL,
//         email VARCHAR(255) NOT NULL UNIQUE,
//         password VARCHAR(255) NOT NULL,
//         password_plain VARCHAR(255) NULL,
//         role ENUM('admin', 'employee') NOT NULL DEFAULT 'employee',
//         status VARCHAR(50) NOT NULL DEFAULT 'Active',
//         createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//       ) ENGINE=InnoDB;
//     `;
//     await pool.query(createUsersTableQuery);
//     console.log("Table 'users' verified/created.");

//     try {
//       await pool.query("ALTER TABLE users CHANGE COLUMN name fullName VARCHAR(255) NOT NULL");
//       console.log("Column 'name' renamed to 'fullName' in 'users'.");
//     } catch (e) {
//       // Column might already be renamed
//     }

//     try {
//       await pool.query("ALTER TABLE users CHANGE COLUMN created_at createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
//       console.log("Column 'created_at' renamed to 'createdAt' in 'users'.");
//     } catch (e) {
//       // Column might already be renamed
//     }

//     try {
//       await pool.query("ALTER TABLE users ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'Active'");
//       console.log("Column 'status' added to 'users'.");
//     } catch (e) {
//       // Column might already exist
//     }

//     try {
//       await pool.query("ALTER TABLE users ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
//       console.log("Column 'updatedAt' added to 'users'.");
//     } catch (e) {
//       // Column might already exist
//     }

//     try {
//       await pool.query("ALTER TABLE users ADD COLUMN password_plain VARCHAR(255) NULL");
//       console.log("Column 'password_plain' added to 'users'.");
//     } catch (e) {
//       // Column might already exist
//     }

//     // Create projects table
//     const createProjectsTableQuery = `
//       CREATE TABLE IF NOT EXISTS projects (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         name VARCHAR(255) NOT NULL,
//         client VARCHAR(255) NOT NULL,
//         description TEXT,
//         domain VARCHAR(255),
//         tech_stack TEXT,
//         github_url VARCHAR(500),
//         api_url VARCHAR(500),
//         db_name VARCHAR(255),
//         status ENUM('Planning', 'Development', 'Testing', 'Live', 'Maintenance') DEFAULT 'Planning',
//         start_date VARCHAR(50),
//         end_date VARCHAR(50),
//         senior_dev_name VARCHAR(255),
//         senior_dev_email VARCHAR(255),
//         senior_dev_phone VARCHAR(50),
//         senior_dev_role VARCHAR(100),
//         senior_dev_working_from VARCHAR(50),
//         senior_dev_working_to VARCHAR(50),
//         senior_dev_responsibilities TEXT,
//         senior_dev_kt_notes TEXT,
//         is_access_enabled TINYINT(1) DEFAULT 1,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       ) ENGINE=InnoDB;
//     `;
//     await pool.query(createProjectsTableQuery);
//     console.log("Table 'projects' verified/created.");

//     // Create project_assignments table
//     const createAssignmentsTableQuery = `
//       CREATE TABLE IF NOT EXISTS project_assignments (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         project_id INT NOT NULL,
//         employee_id INT NOT NULL,
//         employee_name VARCHAR(255) NOT NULL,
//         employee_email VARCHAR(255) NOT NULL,
//         emp_uid VARCHAR(100),
//         department VARCHAR(255),
//         designation VARCHAR(255),
//         assigned_date VARCHAR(50),
//         reporting_senior VARCHAR(255),
//         is_enabled TINYINT(1) DEFAULT 1,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
//         FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
//       ) ENGINE=InnoDB;
//     `;
//     await pool.query(createAssignmentsTableQuery);
//     console.log("Table 'project_assignments' verified/created.");

//     try {
//       await pool.query("ALTER TABLE project_assignments ADD COLUMN is_enabled TINYINT(1) DEFAULT 1");
//       console.log("Column 'is_enabled' added to 'project_assignments'.");
//     } catch (e) {
//       // Column might already exist
//     }

//     // Create project_resources table
//     const createResourcesTableQuery = `
//       CREATE TABLE IF NOT EXISTS project_resources (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         project_id INT NOT NULL,
//         resource_type ENUM('file', 'link', 'note') NOT NULL,
//         title VARCHAR(255) NOT NULL,
//         file_path VARCHAR(500),
//         file_type VARCHAR(100),
//         url VARCHAR(500),
//         notes TEXT,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
//       ) ENGINE=InnoDB;
//     `;
//     await pool.query(createResourcesTableQuery);
//     console.log("Table 'project_resources' verified/created.");

//     // 3. Seed default Admin if not exists
//     const adminEmail = 'adminkt@gmail.com';
//     const adminPassword = 'ktai123';

//     const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [adminEmail]);
//     if (rows.length === 0) {
//       const hashedPassword = await bcrypt.hash(adminPassword, 10);
//       await pool.query(
//         'INSERT INTO users (fullName, email, password, password_plain, role, status) VALUES (?, ?, ?, ?, ?, ?)',
//         ['Admin KT', adminEmail, hashedPassword, adminPassword, 'admin', 'Active']
//       );
//       console.log(`Default admin user seeded successfully with email: ${adminEmail}`);
//     } else {
//       console.log(`Admin user '${adminEmail}' already exists.`);
//       // Update default admin plain password if it is null
//       await pool.query('UPDATE users SET password_plain = ? WHERE email = ? AND password_plain IS NULL', [adminPassword, adminEmail]);
//     }

//   } catch (error) {
//     console.error("Database initialization failed:", error);
//     if (connection) {
//       try {
//         await connection.end();
//       } catch (err) {
//         // Ignore close error
//       }
//     }
//     throw error;
//   }
// }

// module.exports = initDB;

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ktai',

  ssl: {
    rejectUnauthorized: false
  },

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

async function initDB() {
  let pool;

  try {
    console.log('Connecting to MySQL...');
    console.log(`Host: ${dbConfig.host}`);
    console.log(`Port: ${dbConfig.port}`);
    console.log(`Database: ${dbConfig.database}`);
    console.log(`User: ${dbConfig.user}`);

    // =========================================================
    // 1. Connect directly to the existing application database
    // =========================================================

    pool = mysql.createPool(dbConfig);

    // Test the connection
    await pool.query('SELECT 1');

    console.log('✅ MySQL connection successful.');
    console.log(`✅ Database '${dbConfig.database}' connected.`);

    // =========================================================
    // 2. USERS TABLE
    // =========================================================

    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullName VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        password_plain VARCHAR(255) NULL,
        role ENUM('admin', 'employee') NOT NULL DEFAULT 'employee',
        status VARCHAR(50) NOT NULL DEFAULT 'Active',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `;

    await pool.query(createUsersTableQuery);
    console.log("✅ Table 'users' verified/created.");

    // =========================================================
    // Rename old "name" column if required
    // =========================================================

    try {
      await pool.query(
        "ALTER TABLE users CHANGE COLUMN name fullName VARCHAR(255) NOT NULL"
      );

      console.log(
        "Column 'name' renamed to 'fullName' in 'users'."
      );
    } catch (e) {
      // Already renamed or column doesn't exist
    }

    // =========================================================
    // Rename old created_at column if required
    // =========================================================

    try {
      await pool.query(
        "ALTER TABLE users CHANGE COLUMN created_at createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
      );

      console.log(
        "Column 'created_at' renamed to 'createdAt' in 'users'."
      );
    } catch (e) {
      // Already renamed or column doesn't exist
    }

    // =========================================================
    // Add status column if required
    // =========================================================

    try {
      await pool.query(
        "ALTER TABLE users ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'Active'"
      );

      console.log("Column 'status' added to 'users'.");
    } catch (e) {
      // Already exists
    }

    // =========================================================
    // Add updatedAt column if required
    // =========================================================

    try {
      await pool.query(
        "ALTER TABLE users ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
      );

      console.log("Column 'updatedAt' added to 'users'.");
    } catch (e) {
      // Already exists
    }

    // =========================================================
    // Add password_plain column if required
    // =========================================================

    try {
      await pool.query(
        "ALTER TABLE users ADD COLUMN password_plain VARCHAR(255) NULL"
      );

      console.log(
        "Column 'password_plain' added to 'users'."
      );
    } catch (e) {
      // Already exists
    }

    // =========================================================
    // 3. PROJECTS TABLE
    // =========================================================

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
        status ENUM(
          'Planning',
          'Development',
          'Testing',
          'Live',
          'Maintenance'
        ) DEFAULT 'Planning',
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

    console.log(
      "✅ Table 'projects' verified/created."
    );

    // =========================================================
    // 4. PROJECT ASSIGNMENTS TABLE
    // =========================================================

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

        FOREIGN KEY (project_id)
          REFERENCES projects(id)
          ON DELETE CASCADE,

        FOREIGN KEY (employee_id)
          REFERENCES users(id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `;

    await pool.query(createAssignmentsTableQuery);

    console.log(
      "✅ Table 'project_assignments' verified/created."
    );

    // =========================================================
    // Add is_enabled column if required
    // =========================================================

    try {
      await pool.query(
        "ALTER TABLE project_assignments ADD COLUMN is_enabled TINYINT(1) DEFAULT 1"
      );

      console.log(
        "Column 'is_enabled' added to 'project_assignments'."
      );
    } catch (e) {
      // Already exists
    }

    // =========================================================
    // 5. PROJECT RESOURCES TABLE
    // =========================================================

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

        FOREIGN KEY (project_id)
          REFERENCES projects(id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `;

    await pool.query(createResourcesTableQuery);

    console.log(
      "✅ Table 'project_resources' verified/created."
    );

    // =========================================================
    // 6. DEFAULT ADMIN USER
    // =========================================================

    const adminEmail = 'adminkt@gmail.com';
    const adminPassword = 'ktai123';

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [adminEmail]
    );

    if (rows.length === 0) {

      const hashedPassword = await bcrypt.hash(
        adminPassword,
        10
      );

      await pool.query(
        `INSERT INTO users
        (fullName, email, password, password_plain, role, status)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          'Admin KT',
          adminEmail,
          hashedPassword,
          adminPassword,
          'admin',
          'Active'
        ]
      );

      console.log(
        `✅ Default admin created: ${adminEmail}`
      );

    } else {

      console.log(
        `✅ Admin '${adminEmail}' already exists.`
      );

      await pool.query(
        `UPDATE users
         SET password_plain = ?
         WHERE email = ?
         AND password_plain IS NULL`,
        [
          adminPassword,
          adminEmail
        ]
      );
    }

    console.log('==========================================');
    console.log('✅ DATABASE INITIALIZATION COMPLETED');
    console.log('==========================================');

  } catch (error) {

    console.error('==========================================');
    console.error('❌ DATABASE INITIALIZATION FAILED');
    console.error('==========================================');

    console.error('Code:', error.code);
    console.error('Message:', error.message);

    if (pool) {
      try {
        await pool.end();
      } catch (err) {
        // Ignore pool closing error
      }
    }

    throw error;
  }
}

module.exports = initDB;