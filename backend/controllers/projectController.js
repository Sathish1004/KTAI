const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

// Helper to check and create directory
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 1. Get employees list (Admin only helper to select employees to assign)
exports.getEmployeesList = async (req, res) => {
  try {
    const [employees] = await pool.query(
      'SELECT id, name, email FROM users WHERE role = "employee" ORDER BY name ASC'
    );
    res.status(200).json({
      status: 'success',
      data: { employees }
    });
  } catch (error) {
    console.error("getEmployeesList error:", error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch employees list.'
    });
  }
};

// 2. Create Project (Admin only)
exports.createProject = async (req, res) => {
  let connection;
  try {
    const {
      name, client, description, domain, tech_stack, github_url, api_url, db_name,
      status, start_date, end_date,
      senior_dev_name, senior_dev_email, senior_dev_phone, senior_dev_role,
      senior_dev_working_from, senior_dev_working_to, senior_dev_responsibilities, senior_dev_kt_notes,
      is_access_enabled,
      assignments,
      resources
    } = req.body;

    if (!name || !client) {
      return res.status(400).json({
        status: 'error',
        message: 'Project Name and Client Name are required.'
      });
    }

    // Get a transactional connection
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Insert core project & senior dev details
    const insertProjectQuery = `
      INSERT INTO projects (
        name, client, description, domain, tech_stack, github_url, api_url, db_name,
        status, start_date, end_date,
        senior_dev_name, senior_dev_email, senior_dev_phone, senior_dev_role,
        senior_dev_working_from, senior_dev_working_to, senior_dev_responsibilities, senior_dev_kt_notes,
        is_access_enabled
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [projectResult] = await connection.query(insertProjectQuery, [
      name, client, description, domain, tech_stack, github_url, api_url, db_name,
      status || 'Planning', start_date, end_date,
      senior_dev_name, senior_dev_email, senior_dev_phone, senior_dev_role,
      senior_dev_working_from, senior_dev_working_to, senior_dev_responsibilities, senior_dev_kt_notes,
      is_access_enabled !== undefined ? is_access_enabled : 1
    ]);

    const projectId = projectResult.insertId;

    // Insert Employee Assignments (if provided)
    if (assignments && Array.isArray(assignments) && assignments.length > 0) {
      const insertAssignmentQuery = `
        INSERT INTO project_assignments (
          project_id, employee_id, employee_name, employee_email, emp_uid, department, designation, assigned_date, reporting_senior, is_enabled
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      for (const assignment of assignments) {
        await connection.query(insertAssignmentQuery, [
          projectId,
          assignment.employee_id,
          assignment.employee_name,
          assignment.employee_email,
          assignment.emp_uid,
          assignment.department,
          assignment.designation,
          assignment.assigned_date,
          senior_dev_name || 'Senior Developer',
          assignment.is_enabled !== undefined ? assignment.is_enabled : 1
        ]);
      }
    }

    // Insert Links / Notes resources (if provided)
    if (resources && Array.isArray(resources) && resources.length > 0) {
      const insertResourceQuery = `
        INSERT INTO project_resources (
          project_id, resource_type, title, url, notes
        ) VALUES (?, ?, ?, ?, ?)
      `;

      for (const resItem of resources) {
        await connection.query(insertResourceQuery, [
          projectId,
          resItem.resource_type, // 'link' or 'note'
          resItem.title,
          resItem.url || null,
          resItem.notes || null
        ]);
      }
    }

    await connection.commit();
    connection.release();

    res.status(201).json({
      status: 'success',
      message: 'Project created and initialized successfully.',
      data: { projectId }
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error("createProject error:", error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create project.'
    });
  }
};

// 3. Get list of projects (Guarded: Admin sees all, Employee sees assigned only)
exports.getProjects = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    let query = '';
    let params = [];

    if (userRole === 'admin') {
      query = 'SELECT * FROM projects ORDER BY created_at DESC';
    } else {
      query = `
        SELECT p.*, a.assigned_date, a.designation, a.department, a.is_enabled 
        FROM projects p
        INNER JOIN project_assignments a ON p.id = a.project_id
        WHERE a.employee_id = ? AND p.is_access_enabled = 1
        ORDER BY a.assigned_date DESC, p.created_at DESC
      `;
      params = [userId];
    }

    const [projects] = await pool.query(query, params);

    res.status(200).json({
      status: 'success',
      data: { projects }
    });
  } catch (error) {
    console.error("getProjects error:", error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch projects.'
    });
  }
};

// 4. Get Project Details by ID (Guarded: must be Admin, or Employee assigned to it)
exports.getProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userRole = req.user.role;
    const userId = req.user.id;

    // 1. Fetch project profile
    const [projects] = await pool.query('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (projects.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found.'
      });
    }

    const project = projects[0];

    // 2. Access control verification for employees
    if (userRole !== 'admin') {
      const [assigned] = await pool.query(
        'SELECT id, is_enabled FROM project_assignments WHERE project_id = ? AND employee_id = ?',
        [projectId, userId]
      );
      if (assigned.length === 0 || project.is_access_enabled === 0 || assigned[0].is_enabled === 0) {
        return res.status(403).json({
          status: 'error',
          message: 'Access Restricted: Admin must give access to this project.'
        });
      }
    }

    // 3. Fetch assignments
    const [assignments] = await pool.query(
      'SELECT id, employee_id, employee_name, employee_email, emp_uid, department, designation, assigned_date, reporting_senior, is_enabled FROM project_assignments WHERE project_id = ?',
      [projectId]
    );

    // 4. Fetch resources
    const [resources] = await pool.query(
      'SELECT id, resource_type, title, file_path, file_type, url, notes, created_at FROM project_resources WHERE project_id = ? ORDER BY created_at DESC',
      [projectId]
    );

    res.status(200).json({
      status: 'success',
      data: {
        project,
        assignments,
        resources
      }
    });

  } catch (error) {
    console.error("getProjectById error:", error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch project details.'
    });
  }
};

// 5. Upload file resource (Admin only)
exports.uploadResource = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { title } = req.body;

    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'Please upload a file.'
      });
    }

    const titleStr = title || req.file.originalname;
    const ext = path.extname(req.file.originalname).substring(1);
    
    // Express serves static folder backend/uploads as /uploads
    const relativeFilePath = `/uploads/${req.file.filename}`;

    const insertResourceQuery = `
      INSERT INTO project_resources (project_id, resource_type, title, file_path, file_type)
      VALUES (?, 'file', ?, ?, ?)
    `;

    const [result] = await pool.query(insertResourceQuery, [
      projectId,
      titleStr,
      relativeFilePath,
      ext
    ]);

    res.status(201).json({
      status: 'success',
      message: 'File resource uploaded and indexed successfully.',
      data: {
        resource: {
          id: result.insertId,
          project_id: projectId,
          resource_type: 'file',
          title: titleStr,
          file_path: relativeFilePath,
          file_type: ext
        }
      }
    });

  } catch (error) {
    console.error("uploadResource error:", error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload document.'
    });
  }
};

// 6. Update Project (Admin only)
exports.updateProject = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const projectId = req.params.id;
    const {
      name, client, description, domain, tech_stack, github_url, api_url, db_name,
      status, start_date, end_date,
      senior_dev_name, senior_dev_email, senior_dev_phone, senior_dev_role,
      senior_dev_working_from, senior_dev_working_to, senior_dev_responsibilities, senior_dev_kt_notes,
      is_access_enabled,
      assignments,
      resources
    } = req.body;

    if (!name || !client) {
      connection.release();
      return res.status(400).json({
        status: 'error',
        message: 'Project Name and Client Name are required.'
      });
    }

    const updateQuery = `
      UPDATE projects 
      SET name = ?, client = ?, description = ?, domain = ?, tech_stack = ?, github_url = ?, api_url = ?, db_name = ?,
          status = ?, start_date = ?, end_date = ?,
          senior_dev_name = ?, senior_dev_email = ?, senior_dev_phone = ?, senior_dev_role = ?,
          senior_dev_working_from = ?, senior_dev_working_to = ?, senior_dev_responsibilities = ?, senior_dev_kt_notes = ?,
          is_access_enabled = ?
      WHERE id = ?
    `;

    await connection.query(updateQuery, [
      name, client, description, domain, tech_stack, github_url, api_url, db_name,
      status, start_date, end_date,
      senior_dev_name, senior_dev_email, senior_dev_phone, senior_dev_role,
      senior_dev_working_from, senior_dev_working_to, senior_dev_responsibilities, senior_dev_kt_notes,
      is_access_enabled !== undefined ? is_access_enabled : 1,
      projectId
    ]);

    // Update Employee Assignments (Clear existing assignments first)
    await connection.query('DELETE FROM project_assignments WHERE project_id = ?', [projectId]);
    if (assignments && Array.isArray(assignments) && assignments.length > 0) {
      const insertAssignmentQuery = `
        INSERT INTO project_assignments (
          project_id, employee_id, employee_name, employee_email, emp_uid, department, designation, assigned_date, reporting_senior, is_enabled
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      for (const assignment of assignments) {
        await connection.query(insertAssignmentQuery, [
          projectId,
          assignment.employee_id,
          assignment.employee_name,
          assignment.employee_email,
          assignment.emp_uid,
          assignment.department,
          assignment.designation,
          assignment.assigned_date,
          senior_dev_name || 'Senior Developer',
          assignment.is_enabled !== undefined ? assignment.is_enabled : 1
        ]);
      }
    }

    // Update Links & Notes resources (Clear links and notes only, keep uploaded file resources!)
    await connection.query("DELETE FROM project_resources WHERE project_id = ? AND resource_type IN ('link', 'note')", [projectId]);
    if (resources && Array.isArray(resources) && resources.length > 0) {
      const insertResourceQuery = `
        INSERT INTO project_resources (
          project_id, resource_type, title, url, notes
        ) VALUES (?, ?, ?, ?, ?)
      `;

      for (const resItem of resources) {
        if (resItem.resource_type !== 'file') {
          await connection.query(insertResourceQuery, [
            projectId,
            resItem.resource_type,
            resItem.title,
            resItem.url || null,
            resItem.notes || null
          ]);
        }
      }
    }

    await connection.commit();
    connection.release();

    res.status(200).json({
      status: 'success',
      message: 'Project updated successfully.'
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error("updateProject error:", error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update project.'
    });
  }
};

// 7. Delete Project (Admin only)
exports.deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    await pool.query('DELETE FROM projects WHERE id = ?', [projectId]);
    res.status(200).json({
      status: 'success',
      message: 'Project deleted successfully.'
    });
  } catch (error) {
    console.error("deleteProject error:", error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete project.'
    });
  }
};

// 8. Delete specific project resource (Admin only)
exports.deleteResource = async (req, res) => {
  try {
    const resourceId = req.params.resourceId;

    // Fetch resource file path to clean from disk
    const [resources] = await pool.query('SELECT file_path FROM project_resources WHERE id = ?', [resourceId]);
    if (resources.length > 0 && resources[0].file_path) {
      const fs = require('fs');
      const absolutePath = path.join(__dirname, '..', resources[0].file_path);
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
    }

    await pool.query('DELETE FROM project_resources WHERE id = ?', [resourceId]);

    res.status(200).json({
      status: 'success',
      message: 'Resource deleted successfully.'
    });
  } catch (error) {
    console.error("deleteResource error:", error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete resource.'
    });
  }
};
