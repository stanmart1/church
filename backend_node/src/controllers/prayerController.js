import pool from '../config/database.js';

export const getPrayerRequests = async (req, res) => {
  try {
    console.log('Fetching prayer requests...');
    const { status, limit = 10 } = req.query;
    
    let query = 'SELECT pr.*, m.name as member_name FROM prayer_requests pr LEFT JOIN members m ON pr.member_id = m.id WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND pr.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ` ORDER BY pr.created_at DESC LIMIT $${paramCount}`;
    params.push(limit);

    const result = await pool.query(query, params);
    console.log(`Found ${result.rows.length} prayer requests`);
    res.json(result.rows);
  } catch (error) {
    console.error('Get prayer requests error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getMemberPrayerRequests = async (req, res) => {
  try {
    console.log('Fetching member prayer requests:', req.params.memberId);
    const result = await pool.query(
      'SELECT * FROM prayer_requests WHERE member_id = $1 ORDER BY created_at DESC',
      [req.params.memberId]
    );
    console.log(`Found ${result.rows.length} prayer requests for member`);
    res.json(result.rows);
  } catch (error) {
    console.error('Get member prayer requests error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getPrayerRequest = async (req, res) => {
  try {
    console.log('Fetching prayer request:', req.params.id);
    const result = await pool.query(
      'SELECT pr.*, m.name as member_name FROM prayer_requests pr LEFT JOIN members m ON pr.member_id = m.id WHERE pr.id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Prayer request not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get prayer request error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const createPrayerRequest = async (req, res) => {
  try {
    console.log('Creating prayer request');
    const { member_id, title, description, status } = req.body;

    const result = await pool.query(
      'INSERT INTO prayer_requests (member_id, title, description, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [member_id, title, description || null, status || 'active']
    );

    console.log('Prayer request created:', result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create prayer request error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updatePrayerRequest = async (req, res) => {
  try {
    console.log('Updating prayer request:', req.params.id);
    const { title, description, status } = req.body;

    const result = await pool.query(
      'UPDATE prayer_requests SET title = $1, description = $2, status = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [title, description, status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Prayer request not found' });
    }

    console.log('Prayer request updated:', result.rows[0].id);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update prayer request error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const deletePrayerRequest = async (req, res) => {
  try {
    console.log('Deleting prayer request:', req.params.id);
    const result = await pool.query('DELETE FROM prayer_requests WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Prayer request not found' });
    }

    console.log('Prayer request deleted:', req.params.id);
    res.json({ message: 'Prayer request deleted successfully' });
  } catch (error) {
    console.error('Delete prayer request error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const prayForRequest = async (req, res) => {
  try {
    console.log('Praying for request:', req.params.id);
    const result = await pool.query(
      'UPDATE prayer_requests SET prayer_count = prayer_count + 1 WHERE id = $1 RETURNING prayer_count',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Prayer request not found' });
    }

    console.log('Prayer count incremented');
    res.json({ prayer_count: result.rows[0].prayer_count });
  } catch (error) {
    console.error('Pray for request error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
