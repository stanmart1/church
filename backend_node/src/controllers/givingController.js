import pool from '../config/database.js';

export const getMemberGiving = async (req, res) => {
  try {
    console.log('Fetching member giving history:', req.params.memberId);
    const { year } = req.query;
    
    let query = 'SELECT * FROM giving WHERE member_id = $1';
    const params = [req.params.memberId];
    
    if (year) {
      query += ' AND EXTRACT(YEAR FROM date) = $2';
      params.push(year);
    }
    
    query += ' ORDER BY date DESC';
    
    const result = await pool.query(query, params);
    console.log(`Found ${result.rows.length} giving records`);
    res.json(result.rows);
  } catch (error) {
    console.error('Get member giving error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getMemberGivingSummary = async (req, res) => {
  try {
    console.log('Fetching member giving summary:', req.params.memberId);
    const { year } = req.query;
    
    let query = 'SELECT COALESCE(SUM(amount), 0) as total FROM giving WHERE member_id = $1';
    const params = [req.params.memberId];
    
    if (year) {
      query += ' AND EXTRACT(YEAR FROM date) = $2';
      params.push(year);
    }
    
    const result = await pool.query(query, params);
    res.json({ total: parseFloat(result.rows[0].total) });
  } catch (error) {
    console.error('Get member giving summary error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const createGiving = async (req, res) => {
  try {
    console.log('Creating giving record');
    const { member_id, amount, type, method, date } = req.body;

    const result = await pool.query(
      'INSERT INTO giving (member_id, amount, type, method, date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [member_id, amount, type, method || 'online', date || new Date()]
    );

    console.log('Giving record created:', result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create giving error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
