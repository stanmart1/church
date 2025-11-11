import pool from '../config/database.js';
import bcrypt from 'bcryptjs';
import { HTTP_STATUS } from '../config/constants.js';
import { parsePaginationParams, formatPaginationResponse } from '../utils/pagination.js';

export const getUserStats = async (req, res) => {
  try {
    console.log('Fetching user statistics...');
    
    const statsQuery = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE status = 'active') as active_users,
        COUNT(*) FILTER (WHERE role IN ('admin', 'pastor', 'minister', 'staff')) as staff_members
      FROM users
    `;
    
    const result = await pool.query(statsQuery);
    const stats = result.rows[0];
    
    res.json({
      totalUsers: parseInt(stats.total_users),
      activeUsers: parseInt(stats.active_users),
      staffMembers: parseInt(stats.staff_members)
    });
  } catch (error) {
    console.error('Get user stats error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};


export const getUsers = async (req, res) => {
  try {
    console.log('Fetching users...');
    const { search, role, status, membership_status } = req.query;
    const { page, limit } = parsePaginationParams(req.query);
    
    let query = 'SELECT id, name, email, role, phone, address, date_joined, membership_status, birthday, gender, marital_status, status, created_at FROM users WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) FROM users WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (search) {
      const searchCondition = ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      query += searchCondition;
      countQuery += searchCondition;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (role) {
      query += ` AND role = $${paramCount}`;
      countQuery += ` AND role = $${paramCount}`;
      params.push(role);
      paramCount++;
    }

    if (status) {
      query += ` AND status = $${paramCount}`;
      countQuery += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (membership_status) {
      query += ` AND membership_status = $${paramCount}`;
      countQuery += ` AND membership_status = $${paramCount}`;
      params.push(membership_status);
      paramCount++;
    }

    const offset = (page - 1) * limit;
    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    const queryParams = [...params, limit, offset];

    const [result, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, params)
    ]);

    console.log(`Found ${result.rows.length} users (page ${page})`);
    res.json(formatPaginationResponse(result.rows, countResult.rows[0].count, page, limit));
  } catch (error) {
    console.error('Get users error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    console.log('Fetching user:', req.params.id);
    const result = await pool.query('SELECT id, name, email, role, phone, status, created_at FROM users WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    console.log('Creating user:', req.body.email);
    const { name, email, password, role, phone, address, membership_status, birthday, gender, marital_status, status } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, phone, address, membership_status, birthday, gender, marital_status, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING id, name, email, role, phone, address, date_joined, membership_status, birthday, gender, marital_status, status, created_at`,
      [name, email, hashedPassword, role || 'member', phone || null, address || null, membership_status || 'active', birthday || null, gender || null, marital_status || null, status || 'active']
    );

    console.log('User created:', result.rows[0].id);
    res.status(HTTP_STATUS.CREATED).json(result.rows[0]);
  } catch (error) {
    console.error('Create user error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    console.log('Updating user:', req.params.id);
    const { name, email, role, phone, address, membership_status, birthday, gender, marital_status, status } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET name = $1, email = $2, role = $3, phone = $4, address = $5, membership_status = $6, birthday = $7, gender = $8, marital_status = $9, status = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 RETURNING id, name, email, role, phone, address, date_joined, membership_status, birthday, gender, marital_status, status, created_at`,
      [name, email, role, phone, address, membership_status, birthday, gender, marital_status, status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'User not found' });
    }

    console.log('User updated:', result.rows[0].id);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update user error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    console.log('Deleting user:', req.params.id);
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'User not found' });
    }

    console.log('User deleted:', req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    console.log('Resetting password for user:', req.params.id);
    const { password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
      [hashedPassword, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'User not found' });
    }

    console.log('Password reset for user:', req.params.id);
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};
