import pool from '../config/database.js';

export const getPlaylists = async (req, res) => {
  try {
    console.log('Fetching playlists...');
    const { member_id } = req.query;
    
    let query = 'SELECT p.*, m.name as member_name, COUNT(ps.id) as sermon_count FROM playlists p LEFT JOIN members m ON p.member_id = m.id LEFT JOIN playlist_sermons ps ON p.id = ps.playlist_id WHERE 1=1';
    const params = [];

    if (member_id) {
      query += ' AND p.member_id = $1';
      params.push(member_id);
    }

    query += ' GROUP BY p.id, m.name ORDER BY p.created_at DESC';

    const result = await pool.query(query, params);
    console.log(`Found ${result.rows.length} playlists`);
    res.json(result.rows);
  } catch (error) {
    console.error('Get playlists error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getPlaylist = async (req, res) => {
  try {
    console.log('Fetching playlist:', req.params.id);
    const playlist = await pool.query('SELECT p.*, m.name as member_name FROM playlists p LEFT JOIN members m ON p.member_id = m.id WHERE p.id = $1', [req.params.id]);
    
    if (playlist.rows.length === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const sermons = await pool.query(
      `SELECT s.*, ps.added_at FROM sermons s 
       JOIN playlist_sermons ps ON s.id = ps.sermon_id 
       WHERE ps.playlist_id = $1 
       ORDER BY ps.added_at DESC`,
      [req.params.id]
    );

    res.json({ ...playlist.rows[0], sermons: sermons.rows });
  } catch (error) {
    console.error('Get playlist error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const createPlaylist = async (req, res) => {
  try {
    console.log('Creating playlist:', req.body.name);
    const { name, description, isPublic, sermons } = req.body;

    const result = await pool.query(
      'INSERT INTO playlists (name, description, is_public) VALUES ($1, $2, $3) RETURNING *',
      [name, description || null, isPublic || false]
    );

    const playlistId = result.rows[0].id;

    // Add sermons if provided
    if (sermons && Array.isArray(sermons)) {
      for (const sermonId of sermons) {
        if (sermonId) {
          await pool.query(
            'INSERT INTO playlist_sermons (playlist_id, sermon_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [playlistId, sermonId]
          );
        }
      }
      console.log(`Added ${sermons.length} sermons to playlist ${playlistId}`);
    }

    console.log('Playlist created:', playlistId);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create playlist error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updatePlaylist = async (req, res) => {
  try {
    console.log('Updating playlist:', req.params.id);
    const { name, description, isPublic, sermons } = req.body;

    const result = await pool.query(
      'UPDATE playlists SET name = $1, description = $2, is_public = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [name, description, isPublic !== undefined ? isPublic : false, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Update sermons if provided
    if (sermons && Array.isArray(sermons)) {
      // Delete existing sermons
      await pool.query('DELETE FROM playlist_sermons WHERE playlist_id = $1', [req.params.id]);
      
      // Add new sermons
      for (const sermonId of sermons) {
        if (sermonId) {
          await pool.query(
            'INSERT INTO playlist_sermons (playlist_id, sermon_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [req.params.id, sermonId]
          );
        }
      }
      console.log(`Updated ${sermons.length} sermons for playlist ${req.params.id}`);
    }

    console.log('Playlist updated:', result.rows[0].id);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update playlist error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const deletePlaylist = async (req, res) => {
  try {
    console.log('Deleting playlist:', req.params.id);
    const result = await pool.query('DELETE FROM playlists WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    console.log('Playlist deleted:', req.params.id);
    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    console.error('Delete playlist error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const addSermonToPlaylist = async (req, res) => {
  try {
    console.log('Adding sermon to playlist:', req.params.id);
    const { sermon_id } = req.body;

    await pool.query(
      'INSERT INTO playlist_sermons (playlist_id, sermon_id) VALUES ($1, $2)',
      [req.params.id, sermon_id]
    );

    console.log('Sermon added to playlist');
    res.status(201).json({ message: 'Sermon added to playlist' });
  } catch (error) {
    console.error('Add sermon to playlist error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const removeSermonFromPlaylist = async (req, res) => {
  try {
    console.log('Removing sermon from playlist:', req.params.id);
    const result = await pool.query(
      'DELETE FROM playlist_sermons WHERE playlist_id = $1 AND sermon_id = $2 RETURNING id',
      [req.params.id, req.params.sermonId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sermon not found in playlist' });
    }

    console.log('Sermon removed from playlist');
    res.json({ message: 'Sermon removed from playlist' });
  } catch (error) {
    console.error('Remove sermon from playlist error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const incrementPlays = async (req, res) => {
  try {
    await pool.query('UPDATE playlists SET plays = plays + 1 WHERE id = $1', [req.params.id]);
    res.json({ message: 'Play count incremented' });
  } catch (error) {
    console.error('Increment plays error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const toggleSermonBookmark = async (req, res) => {
  try {
    console.log('Toggling sermon bookmark:', req.params.sermonId);
    const { member_id, playlist_id } = req.body;

    const existing = await pool.query(
      'SELECT id FROM playlist_sermons WHERE playlist_id = $1 AND sermon_id = $2',
      [playlist_id, req.params.sermonId]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        'DELETE FROM playlist_sermons WHERE playlist_id = $1 AND sermon_id = $2',
        [playlist_id, req.params.sermonId]
      );
      res.json({ bookmarked: false, message: 'Bookmark removed' });
    } else {
      await pool.query(
        'INSERT INTO playlist_sermons (playlist_id, sermon_id) VALUES ($1, $2)',
        [playlist_id, req.params.sermonId]
      );
      res.json({ bookmarked: true, message: 'Bookmark added' });
    }
  } catch (error) {
    console.error('Toggle sermon bookmark error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
