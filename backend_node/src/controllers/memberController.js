import pool from '../config/database.js';

export const getMembers = async (req, res) => {
  try {
    console.log('Fetching members...');
    const { search, status, role, page = 1, limit = 10 } = req.query;
    
    let query = 'SELECT * FROM members WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) FROM members WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (search) {
      const searchCondition = ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      query += searchCondition;
      countQuery += searchCondition;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (status) {
      const statusCondition = ` AND membership_status = $${paramCount}`;
      query += statusCondition;
      countQuery += statusCondition;
      params.push(status);
      paramCount++;
    }

    if (role) {
      const roleCondition = ` AND role = $${paramCount}`;
      query += roleCondition;
      countQuery += roleCondition;
      params.push(role);
      paramCount++;
    }

    const offset = (page - 1) * limit;
    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const [result, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, paramCount - 1))
    ]);

    const total = parseInt(countResult.rows[0].count);
    console.log(`Found ${result.rows.length} members (page ${page} of ${Math.ceil(total / limit)})`);
    
    res.json({
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get members error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getMember = async (req, res) => {
  try {
    console.log('Fetching member:', req.params.id);
    const result = await pool.query('SELECT * FROM members WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get member error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const createMember = async (req, res) => {
  try {
    console.log('Creating member:', req.body.name);
    const { name, email, phone, address, membership_status, role, birthday, gender, marital_status } = req.body;

    const result = await pool.query(
      `INSERT INTO members (name, email, phone, address, membership_status, role, birthday, gender, marital_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [name, email, phone, address || null, membership_status || 'active', role || 'member', birthday || null, gender || null, marital_status || null]
    );

    console.log('Member created:', result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create member error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateMember = async (req, res) => {
  try {
    console.log('Updating member:', req.params.id);
    const { name, email, phone, address, membership_status, role, birthday, gender, marital_status } = req.body;

    const result = await pool.query(
      `UPDATE members 
       SET name = $1, email = $2, phone = $3, address = $4, membership_status = $5, 
           role = $6, birthday = $7, gender = $8, marital_status = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 RETURNING *`,
      [name, email, phone, address, membership_status, role, birthday, gender, marital_status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    console.log('Member updated:', result.rows[0].id);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update member error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const deleteMember = async (req, res) => {
  try {
    console.log('Deleting member:', req.params.id);
    const result = await pool.query('DELETE FROM members WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    console.log('Member deleted:', req.params.id);
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Delete member error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const exportMembers = async (req, res) => {
  try {
    const { format, search, role } = req.query;
    
    let query = 'SELECT name, email, phone, address, membership_status, role, birthday, gender, marital_status, date_joined FROM members WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (role) {
      query += ` AND role = $${paramCount}`;
      params.push(role);
      paramCount++;
    }

    query += ' ORDER BY name ASC';
    const result = await pool.query(query, params);

    if (format === 'csv') {
      const headers = ['Name', 'Email', 'Phone', 'Address', 'Status', 'Role', 'Birthday', 'Gender', 'Marital Status', 'Date Joined'];
      const csv = [
        headers.join(','),
        ...result.rows.map(row => [
          `"${row.name}"`,
          `"${row.email}"`,
          `"${row.phone}"`,
          `"${row.address || ''}"`,
          row.membership_status,
          row.role,
          row.birthday || '',
          row.gender || '',
          row.marital_status || '',
          row.date_joined
        ].join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=members-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csv);
    } else if (format === 'pdf') {
      // Simple PDF generation
      let pdfContent = `Members Report - ${new Date().toLocaleDateString()}\n\n`;
      result.rows.forEach(row => {
        pdfContent += `Name: ${row.name}\nEmail: ${row.email}\nPhone: ${row.phone}\nRole: ${row.role}\n\n`;
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=members-${new Date().toISOString().split('T')[0]}.pdf`);
      res.send(pdfContent);
    } else {
      res.status(400).json({ error: 'Invalid format' });
    }
  } catch (error) {
    console.error('Export members error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
