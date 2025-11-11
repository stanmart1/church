import pool from '../config/database.js';

export const getSeries = async (req, res) => {
  try {
    console.log('Fetching sermon series...');
    const result = await pool.query('SELECT * FROM sermon_series ORDER BY name');
    console.log(`Found ${result.rows.length} series`);
    res.json(result.rows);
  } catch (error) {
    console.error('Get series error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getSeriesById = async (req, res) => {
  try {
    console.log('Fetching series:', req.params.id);
    const result = await pool.query('SELECT * FROM sermon_series WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Series not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get series error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const createSeries = async (req, res) => {
  try {
    console.log('Creating series:', req.body.name);
    const { name, description } = req.body;

    const result = await pool.query(
      'INSERT INTO sermon_series (name, description) VALUES ($1, $2) RETURNING *',
      [name, description || null]
    );

    console.log('Series created:', result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create series error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateSeries = async (req, res) => {
  try {
    console.log('Updating series:', req.params.id);
    const { name, description } = req.body;

    const result = await pool.query(
      'UPDATE sermon_series SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [name, description, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Series not found' });
    }

    console.log('Series updated:', result.rows[0].id);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update series error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const deleteSeries = async (req, res) => {
  try {
    console.log('Deleting series:', req.params.id);
    const result = await pool.query('DELETE FROM sermon_series WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Series not found' });
    }

    console.log('Series deleted:', req.params.id);
    res.json({ message: 'Series deleted successfully' });
  } catch (error) {
    console.error('Delete series error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
