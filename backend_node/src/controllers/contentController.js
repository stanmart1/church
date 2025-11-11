import pool from '../config/database.js';
import { HTTP_STATUS } from '../config/constants.js';

export const getContent = async (req, res) => {
  try {
    console.log('Fetching content...');
    const result = await pool.query('SELECT * FROM content');
    
    const content = {};
    result.rows.forEach(row => {
      content[row.key] = row.value;
    });

    console.log(`Found ${result.rows.length} content items`);
    res.status(HTTP_STATUS.OK).json(content);
  } catch (error) {
    console.error('Get content error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const getContentByKey = async (req, res) => {
  try {
    console.log('Fetching content by key:', req.params.key);
    const result = await pool.query('SELECT * FROM content WHERE key = $1', [req.params.key]);
    
    if (result.rows.length === 0) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Content not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get content by key error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const updateContent = async (req, res) => {
  try {
    console.log('Updating content:', req.params.key);
    const { value } = req.body;

    const result = await pool.query(
      `INSERT INTO content (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [req.params.key, value]
    );

    console.log('Content updated:', result.rows[0].key);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update content error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const getServiceTimes = async (req, res) => {
  try {
    console.log('Fetching service times...');
    const result = await pool.query('SELECT * FROM service_times ORDER BY day, time');
    console.log(`Found ${result.rows.length} service times`);
    res.json(result.rows);
  } catch (error) {
    console.error('Get service times error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const createServiceTime = async (req, res) => {
  try {
    console.log('Creating service time');
    const { day, time, service, description } = req.body;

    const result = await pool.query(
      'INSERT INTO service_times (day, time, service, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [day, time, service, description || null]
    );

    console.log('Service time created:', result.rows[0].id);
    res.status(HTTP_STATUS.CREATED).json(result.rows[0]);
  } catch (error) {
    console.error('Create service time error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const updateServiceTime = async (req, res) => {
  try {
    console.log('Updating service time:', req.params.id);
    const { day, time, service, description } = req.body;

    const result = await pool.query(
      'UPDATE service_times SET day = $1, time = $2, service = $3, description = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [day, time, service, description || null, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Service time not found' });
    }

    console.log('Service time updated:', result.rows[0].id);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update service time error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const deleteServiceTime = async (req, res) => {
  try {
    console.log('Deleting service time:', req.params.id);
    const result = await pool.query('DELETE FROM service_times WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Service time not found' });
    }

    console.log('Service time deleted:', req.params.id);
    res.json({ message: 'Service time deleted successfully' });
  } catch (error) {
    console.error('Delete service time error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};
