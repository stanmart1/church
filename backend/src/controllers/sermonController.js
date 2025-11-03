import pool from '../config/database.js';
import { HTTP_STATUS } from '../config/constants.js';
import { parsePaginationParams, formatPaginationResponse } from '../utils/pagination.js';
import { buildPaginatedQuery } from '../utils/queryBuilder.js';
import { withTransaction } from '../utils/transaction.js';

export const getSermons = async (req, res) => {
  try {
    console.log('Fetching sermons...');
    const { search, series, speaker } = req.query;
    const { page, limit } = parsePaginationParams(req.query);
    
    const baseQuery = 'SELECT s.*, ss.name as series_name FROM sermons s LEFT JOIN sermon_series ss ON s.series_id = ss.id WHERE 1=1';
    
    const conditions = [];
    if (search) {
      conditions.push({ 
        field: ['s.title', 's.speaker', 's.description'], 
        value: search, 
        type: 'search' 
      });
    }
    if (series) {
      conditions.push({ field: 's.series_id', value: series, type: 'exact' });
    }
    if (speaker) {
      conditions.push({ field: 's.speaker', value: speaker, type: 'search' });
    }

    const { query, countQuery, params, queryParams } = buildPaginatedQuery(
      baseQuery + ' ORDER BY s.date DESC',
      conditions,
      page,
      limit
    );

    const [result, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, params)
    ]);

    console.log(`Found ${result.rows.length} sermons (page ${page})`);
    res.json(formatPaginationResponse(result.rows, countResult.rows[0].count, page, limit));
  } catch (error) {
    console.error('Get sermons error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const getSermon = async (req, res) => {
  try {
    console.log('Fetching sermon:', req.params.id);
    const result = await pool.query(
      'SELECT s.*, ss.name as series_name FROM sermons s LEFT JOIN sermon_series ss ON s.series_id = ss.id WHERE s.id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Sermon not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get sermon error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const createSermon = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    
    const { title, speaker, date, duration, description, series_id, tags } = req.body;

    const audio_url = req.files?.audio ? `/uploads/sermons/audio/${req.files.audio[0].filename}` : null;
    const thumbnail_url = req.files?.thumbnail ? `/uploads/sermons/thumbnails/${req.files.thumbnail[0].filename}` : null;
    
    console.log('Creating sermon:', title);

    const sermon = await withTransaction(async (client) => {
      const result = await client.query(
        `INSERT INTO sermons (title, speaker, date, duration, description, series_id, audio_url, video_url, thumbnail_url, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [title, speaker, date, duration || null, description || null, series_id || null, audio_url, null, thumbnail_url, tags || null]
      );

      if (series_id) {
        await client.query(
          'UPDATE sermon_series SET sermon_count = sermon_count + 1 WHERE id = $1',
          [series_id]
        );
      }

      return result.rows[0];
    });

    console.log('Sermon created:', sermon.id);
    res.status(HTTP_STATUS.CREATED).json(sermon);
  } catch (error) {
    console.error('Create sermon error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const updateSermon = async (req, res) => {
  try {
    console.log('Updating sermon:', req.params.id);
    const { title, speaker, date, duration, description, series_id, audio_url, video_url, thumbnail_url, tags } = req.body;

    const result = await pool.query(
      `UPDATE sermons 
       SET title = $1, speaker = $2, date = $3, duration = $4, description = $5, 
           series_id = $6, audio_url = $7, video_url = $8, thumbnail_url = $9, tags = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 RETURNING *`,
      [title, speaker, date, duration, description, series_id, audio_url, video_url, thumbnail_url, tags, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Sermon not found' });
    }

    console.log('Sermon updated:', result.rows[0].id);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update sermon error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const deleteSermon = async (req, res) => {
  try {
    console.log('Deleting sermon:', req.params.id);
    
    await withTransaction(async (client) => {
      const sermon = await client.query('SELECT series_id FROM sermons WHERE id = $1', [req.params.id]);
      
      if (sermon.rows.length === 0) {
        throw new Error('Sermon not found');
      }

      await client.query('DELETE FROM sermons WHERE id = $1', [req.params.id]);

      if (sermon.rows[0].series_id) {
        await client.query(
          'UPDATE sermon_series SET sermon_count = sermon_count - 1 WHERE id = $1',
          [sermon.rows[0].series_id]
        );
      }
    });

    console.log('Sermon deleted:', req.params.id);
    res.json({ message: 'Sermon deleted successfully' });
  } catch (error) {
    console.error('Delete sermon error:', error.message);
    if (error.message === 'Sermon not found') {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: error.message });
    }
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const incrementPlays = async (req, res) => {
  try {
    await pool.query('UPDATE sermons SET plays = plays + 1 WHERE id = $1', [req.params.id]);
    res.json({ message: 'Play count incremented' });
  } catch (error) {
    console.error('Increment plays error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const incrementDownloads = async (req, res) => {
  try {
    const userId = req.user?.userId;
    await pool.query('UPDATE sermons SET downloads = downloads + 1 WHERE id = $1', [req.params.id]);
    if (userId) {
      await pool.query(
        'INSERT INTO sermon_downloads (sermon_id, user_id) VALUES ($1, $2) ON CONFLICT (sermon_id, user_id) DO NOTHING',
        [req.params.id, userId]
      );
    }
    res.json({ message: 'Download count incremented' });
  } catch (error) {
    console.error('Increment downloads error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};
