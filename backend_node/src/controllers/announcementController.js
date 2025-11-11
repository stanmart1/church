import pool from '../config/database.js';

export const getAnnouncements = async (req, res) => {
  try {
    console.log('Fetching announcements...');
    const { search, status, priority, page = 1, limit = 10 } = req.query;
    
    let query = 'SELECT a.*, u.name as created_by_name FROM announcements a LEFT JOIN users u ON a.created_by = u.id WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) FROM announcements WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (search) {
      const searchCondition = ` AND (title ILIKE $${paramCount} OR content ILIKE $${paramCount})`;
      query += searchCondition;
      countQuery += searchCondition;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (status) {
      const statusCondition = ` AND status = $${paramCount}`;
      query += statusCondition.replace('status', 'a.status');
      countQuery += statusCondition;
      params.push(status);
      paramCount++;
    }

    if (priority) {
      const priorityCondition = ` AND priority = $${paramCount}`;
      query += priorityCondition.replace('priority', 'a.priority');
      countQuery += priorityCondition;
      params.push(priority);
      paramCount++;
    }

    const offset = (page - 1) * limit;
    query += ` ORDER BY a.publish_date DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const [result, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, paramCount - 1))
    ]);

    const total = parseInt(countResult.rows[0].count);
    console.log(`Found ${result.rows.length} announcements (page ${page} of ${Math.ceil(total / limit)})`);
    
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
    console.error('Get announcements error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getAnnouncement = async (req, res) => {
  try {
    console.log('Fetching announcement:', req.params.id);
    const result = await pool.query(
      'SELECT a.*, u.name as created_by_name FROM announcements a LEFT JOIN users u ON a.created_by = u.id WHERE a.id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get announcement error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    console.log('Creating announcement:', req.body.title);
    const { title, content, priority, publish_date, expiry_date, status, created_by, send_email, send_sms } = req.body;

    const result = await pool.query(
      `INSERT INTO announcements (title, content, priority, publish_date, expiry_date, status, created_by, send_email, send_sms)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [title, content, priority || 'medium', publish_date, expiry_date || null, status || 'draft', created_by || null, send_email || false, send_sms || false]
    );

    console.log('Announcement created:', result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create announcement error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateAnnouncement = async (req, res) => {
  try {
    console.log('Updating announcement:', req.params.id);
    const { title, content, priority, publish_date, expiry_date, status } = req.body;

    const result = await pool.query(
      `UPDATE announcements 
       SET title = $1, content = $2, priority = $3, publish_date = $4, expiry_date = $5, 
           status = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [title, content, priority, publish_date, expiry_date, status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    console.log('Announcement updated:', result.rows[0].id);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update announcement error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    console.log('Deleting announcement:', req.params.id);
    const result = await pool.query('DELETE FROM announcements WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    console.log('Announcement deleted:', req.params.id);
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const incrementViews = async (req, res) => {
  try {
    await pool.query('UPDATE announcements SET views = views + 1 WHERE id = $1', [req.params.id]);
    res.json({ message: 'View count incremented' });
  } catch (error) {
    console.error('Increment views error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
