import pool from '../config/database.js';

export const getPermissions = async (req, res) => {
  try {
    console.log('Fetching all permissions...');
    const result = await pool.query('SELECT * FROM permissions ORDER BY name');
    console.log(`Found ${result.rows.length} permissions`);
    res.json(result.rows);
  } catch (error) {
    console.error('Get permissions error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getRolePermissions = async (req, res) => {
  try {
    console.log('Fetching permissions for role:', req.params.role);
    const result = await pool.query(
      `SELECT p.* FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role = $1
       ORDER BY p.name`,
      [req.params.role]
    );
    console.log(`Found ${result.rows.length} permissions for role ${req.params.role}`);
    res.json(result.rows);
  } catch (error) {
    console.error('Get role permissions error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateRolePermissions = async (req, res) => {
  try {
    console.log('Updating permissions for role:', req.params.role);
    const { permission_ids } = req.body;

    await pool.query('DELETE FROM role_permissions WHERE role = $1', [req.params.role]);

    if (permission_ids && permission_ids.length > 0) {
      const values = permission_ids.map((id, i) => `($1, $${i + 2})`).join(',');
      const params = [req.params.role, ...permission_ids];
      await pool.query(
        `INSERT INTO role_permissions (role, permission_id) VALUES ${values}`,
        params
      );
    }

    console.log('Role permissions updated');
    res.json({ message: 'Role permissions updated successfully' });
  } catch (error) {
    console.error('Update role permissions error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
