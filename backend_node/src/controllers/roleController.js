import pool from '../config/database.js';

export const getRoles = async (req, res) => {
  try {
    console.log('Fetching roles...');
    const roles = ['admin', 'pastor', 'minister', 'staff', 'member'];
    const result = await pool.query(`
      WITH all_roles AS (
        SELECT unnest($1::text[]) as role
      )
      SELECT 
        ar.role as value,
        ar.role as label,
        COALESCE(COUNT(DISTINCT rp.permission_id), 0) as permission_count
      FROM all_roles ar
      LEFT JOIN role_permissions rp ON ar.role = rp.role
      GROUP BY ar.role
      ORDER BY ar.role
    `, [roles]);
    console.log(`Found ${result.rows.length} roles`);
    res.json(result.rows);
  } catch (error) {
    console.error('Get roles error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getPermissions = async (req, res) => {
  try {
    console.log('Fetching permissions...');
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
    const result = await pool.query(`
      SELECT p.* 
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role = $1
      ORDER BY p.name
    `, [req.params.role]);
    console.log(`Found ${result.rows.length} permissions`);
    res.json(result.rows);
  } catch (error) {
    console.error('Get role permissions error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getRole = async (req, res) => {
  try {
    console.log('Fetching role:', req.params.id);
    const result = await pool.query(`
      SELECT 
        role as name,
        array_agg(p.name) as permissions
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE role = $1
      GROUP BY role
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get role error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const createRole = async (req, res) => {
  try {
    console.log('Creating role:', req.body.name);
    const { name, permissions } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const permissionName of permissions) {
        const permResult = await client.query('SELECT id FROM permissions WHERE name = $1', [permissionName]);
        if (permResult.rows.length > 0) {
          await client.query(
            'INSERT INTO role_permissions (role, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [name, permResult.rows[0].id]
          );
        }
      }
      
      await client.query('COMMIT');
      console.log('Role created:', name);
      res.status(201).json({ name, permissions });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create role error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateRole = async (req, res) => {
  try {
    console.log('Updating role:', req.params.id);
    const { permissions } = req.body;
    const role = req.params.id;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      await client.query('DELETE FROM role_permissions WHERE role = $1', [role]);
      
      for (const permissionName of permissions) {
        const permResult = await client.query('SELECT id FROM permissions WHERE name = $1', [permissionName]);
        if (permResult.rows.length > 0) {
          await client.query(
            'INSERT INTO role_permissions (role, permission_id) VALUES ($1, $2)',
            [role, permResult.rows[0].id]
          );
        }
      }
      
      await client.query('COMMIT');
      console.log('Role updated:', role);
      res.json({ name: role, permissions });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update role error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const deleteRole = async (req, res) => {
  try {
    console.log('Deleting role:', req.params.id);
    const result = await pool.query('DELETE FROM role_permissions WHERE role = $1 RETURNING role', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }

    console.log('Role deleted:', req.params.id);
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Delete role error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
