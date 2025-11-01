import pool from '../config/database.js';
import { broadcastStreamStatusChange, broadcastStreamUpdate, broadcastViewersUpdate, broadcastViewerKicked } from '../websocket/livestreamWebSocket.js';
import { sendLivestreamStartNotification } from '../services/notificationService.js';
import icecastService from '../services/icecastService.js';

export const getLivestreams = async (req, res) => {
  try {
    console.log('Fetching livestreams...');
    const result = await pool.query('SELECT * FROM livestreams ORDER BY created_at DESC LIMIT 10');
    console.log(`Found ${result.rows.length} livestreams`);
    res.json(result.rows);
  } catch (error) {
    console.error('Get livestreams error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getCurrentLivestream = async (req, res) => {
  try {
    console.log('Fetching current livestream...');
    const result = await pool.query('SELECT * FROM livestreams WHERE is_live = true ORDER BY start_time DESC LIMIT 1');
    
    if (result.rows.length === 0) {
      return res.json({ message: 'No active livestream' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get current livestream error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const createLivestream = async (req, res) => {
  try {
    console.log('Creating livestream:', req.body.title);
    const { title, description } = req.body;

    const result = await pool.query(
      'INSERT INTO livestreams (title, description, stream_url, is_live, start_time) VALUES ($1, $2, $3, true, CURRENT_TIMESTAMP) RETURNING *',
      [title, description || null, null]
    );

    const streamUrl = icecastService.getStreamUrl();

    await pool.query(
      'UPDATE livestreams SET stream_url = $1 WHERE id = $2',
      [streamUrl, result.rows[0].id]
    );

    console.log('Livestream created:', result.rows[0].id);
    broadcastStreamStatusChange();
    
    sendLivestreamStartNotification(result.rows[0].id, result.rows[0]).catch(err => 
      console.error('Failed to send notifications:', err)
    );
    
    res.status(201).json({ ...result.rows[0], stream_url: streamUrl });
  } catch (error) {
    console.error('Create livestream error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateLivestream = async (req, res) => {
  try {
    console.log('Updating livestream:', req.params.id);
    const { title, description, stream_url, is_live, viewers } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount}`);
      values.push(title);
      paramCount++;
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }
    if (stream_url !== undefined) {
      updates.push(`stream_url = $${paramCount}`);
      values.push(stream_url);
      paramCount++;
    }
    if (is_live !== undefined) {
      updates.push(`is_live = $${paramCount}`);
      values.push(is_live);
      paramCount++;
    }
    if (viewers !== undefined) {
      updates.push(`viewers = $${paramCount}`);
      values.push(viewers);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.params.id);
    const query = `UPDATE livestreams SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Livestream not found' });
    }

    console.log('Livestream updated:', result.rows[0].id);
    broadcastStreamUpdate();
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update livestream error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const endLivestream = async (req, res) => {
  try {
    console.log('Ending livestream:', req.params.id);
    
    const viewerCount = await pool.query(
      'SELECT COUNT(*) as count FROM stream_viewers WHERE livestream_id = $1 AND status = $2',
      [req.params.id, 'active']
    );
    
    const result = await pool.query(
      'UPDATE livestreams SET is_live = false, end_time = CURRENT_TIMESTAMP, viewers = $1 WHERE id = $2 AND is_live = true RETURNING *',
      [parseInt(viewerCount.rows[0].count), req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Livestream not found or already ended' });
    }

    await pool.query(
      'UPDATE stream_viewers SET status = $1 WHERE livestream_id = $2 AND status = $3',
      ['inactive', req.params.id, 'active']
    );

    console.log('Livestream ended:', result.rows[0].id);
    broadcastStreamStatusChange();
    res.json(result.rows[0]);
  } catch (error) {
    console.error('End livestream error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getChatMessages = async (req, res) => {
  try {
    console.log('Fetching chat messages:', req.params.id);
    const { limit = 50 } = req.query;

    const result = await pool.query(
      'SELECT * FROM chat_messages WHERE livestream_id = $1 ORDER BY created_at DESC LIMIT $2',
      [req.params.id, limit]
    );

    console.log(`Found ${result.rows.length} messages`);
    res.json(result.rows.reverse());
  } catch (error) {
    console.error('Get chat messages error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const sendChatMessage = async (req, res) => {
  try {
    console.log('Sending chat message:', req.params.id);
    const { user_id, user_name, text } = req.body;

    const result = await pool.query(
      'INSERT INTO chat_messages (livestream_id, user_id, user_name, text) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.params.id, user_id || null, user_name, text]
    );

    console.log('Chat message sent:', result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Send chat message error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateViewerCount = async (req, res) => {
  try {
    const { viewers } = req.body;
    await pool.query('UPDATE livestreams SET viewers = $1 WHERE id = $2', [viewers, req.params.id]);
    res.json({ message: 'Viewer count updated' });
  } catch (error) {
    console.error('Update viewer count error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getStreamHistory = async (req, res) => {
  try {
    console.log('Fetching stream history...');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM livestreams WHERE is_live = false AND end_time IS NOT NULL'
    );
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    const result = await pool.query(
      'SELECT * FROM livestreams WHERE is_live = false AND end_time IS NOT NULL ORDER BY start_time DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    
    console.log(`Found ${result.rows.length} past streams`);
    res.json({
      data: result.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Get stream history error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getViewers = async (req, res) => {
  try {
    console.log('Fetching viewers for stream:', req.params.id);
    const result = await pool.query(
      'SELECT * FROM stream_viewers WHERE livestream_id = $1 ORDER BY joined_at DESC',
      [req.params.id]
    );
    console.log(`Found ${result.rows.length} viewers`);
    res.json(result.rows);
  } catch (error) {
    console.error('Get viewers error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const addViewer = async (req, res) => {
  try {
    const { name, location, user_id } = req.body;
    
    if (user_id) {
      const existing = await pool.query(
        'SELECT id FROM stream_viewers WHERE livestream_id = $1 AND user_id = $2 AND status = $3',
        [req.params.id, user_id, 'active']
      );
      
      if (existing.rows.length > 0) {
        return res.json(existing.rows[0]);
      }
    }
    
    const result = await pool.query(
      'INSERT INTO stream_viewers (livestream_id, name, location, status, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.params.id, name, location || null, 'active', user_id || null]
    );
    
    broadcastViewersUpdate();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add viewer error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const removeViewer = async (req, res) => {
  try {
    const viewer = await pool.query('SELECT user_id FROM stream_viewers WHERE id = $1', [req.params.viewerId]);
    await pool.query('DELETE FROM stream_viewers WHERE id = $1', [req.params.viewerId]);
    
    if (viewer.rows.length > 0 && viewer.rows[0].user_id) {
      broadcastViewerKicked(viewer.rows[0].user_id);
    }
    broadcastViewersUpdate();
    res.json({ message: 'Viewer removed' });
  } catch (error) {
    console.error('Remove viewer error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const banViewer = async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE stream_viewers SET status = $1 WHERE id = $2 RETURNING *',
      ['banned', req.params.viewerId]
    );
    broadcastViewersUpdate();
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ban viewer error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const unbanViewer = async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE stream_viewers SET status = $1 WHERE id = $2 RETURNING *',
      ['active', req.params.viewerId]
    );
    broadcastViewersUpdate();
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Unban viewer error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const deleteChatMessage = async (req, res) => {
  try {
    console.log('Deleting chat message:', req.params.messageId);
    await pool.query('DELETE FROM chat_messages WHERE id = $1', [req.params.messageId]);
    res.json({ message: 'Message deleted' });
  } catch (error) {
    console.error('Delete chat message error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const streamAudio = async (req, res) => {
  try {
    res.json({ success: true });
  } catch (error) {
    console.error('Stream audio error:', error.message);
    res.status(500).json({ error: error.message });
  }
};



export const bulkViewerAction = async (req, res) => {
  try {
    const { viewer_ids, action, note } = req.body;
    
    if (!viewer_ids || !Array.isArray(viewer_ids) || viewer_ids.length === 0) {
      return res.status(400).json({ error: 'viewer_ids array is required' });
    }
    
    if (action === 'disconnect') {
      const viewers = await pool.query(
        'SELECT user_id FROM stream_viewers WHERE id = ANY($1)',
        [viewer_ids]
      );
      
      await pool.query('DELETE FROM stream_viewers WHERE id = ANY($1)', [viewer_ids]);
      
      if (note) {
        await pool.query(
          'INSERT INTO moderation_logs (action, viewer_ids, note, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)',
          ['disconnect', viewer_ids, note]
        );
      }
      
      viewers.rows.forEach(viewer => {
        if (viewer.user_id) {
          broadcastViewerKicked(viewer.user_id);
        }
      });
    } else if (action === 'ban') {
      await pool.query(
        'UPDATE stream_viewers SET status = $1 WHERE id = ANY($2)',
        ['banned', viewer_ids]
      );
      
      if (note) {
        await pool.query(
          'INSERT INTO moderation_logs (action, viewer_ids, note, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)',
          ['ban', viewer_ids, note]
        );
      }
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
    
    broadcastViewersUpdate();
    res.json({ message: `${action} completed for ${viewer_ids.length} viewers` });
  } catch (error) {
    console.error('Bulk viewer action error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getStreamStats = async (req, res) => {
  try {
    const streamId = req.params.id;

    const stream = await pool.query('SELECT * FROM livestreams WHERE id = $1', [streamId]);
    if (stream.rows.length === 0) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    const viewers = await pool.query(
      'SELECT COUNT(*) as current_viewers FROM stream_viewers WHERE livestream_id = $1 AND status = $2',
      [streamId, 'active']
    );

    const peakViewers = await pool.query(
      'SELECT MAX(viewers) as peak_viewers FROM livestreams WHERE DATE(start_time) = CURRENT_DATE'
    );

    const chatCount = await pool.query(
      'SELECT COUNT(*) as chat_messages FROM chat_messages WHERE livestream_id = $1',
      [streamId]
    );

    let duration = 0;
    if (stream.rows[0].is_live && stream.rows[0].start_time) {
      const durationResult = await pool.query(
        'SELECT EXTRACT(EPOCH FROM (NOW() - start_time))::INTEGER as duration FROM livestreams WHERE id = $1',
        [streamId]
      );
      duration = durationResult.rows[0]?.duration || 0;
    } else if (!stream.rows[0].is_live && stream.rows[0].start_time && stream.rows[0].end_time) {
      const durationResult = await pool.query(
        'SELECT EXTRACT(EPOCH FROM (end_time - start_time))::INTEGER as duration FROM livestreams WHERE id = $1',
        [streamId]
      );
      duration = durationResult.rows[0]?.duration || 0;
    }

    res.json({
      current_viewers: parseInt(viewers.rows[0].current_viewers),
      peak_viewers: parseInt(peakViewers.rows[0].peak_viewers) || 0,
      duration: duration,
      chat_messages: parseInt(chatCount.rows[0].chat_messages),
      is_live: stream.rows[0].is_live
    });
  } catch (error) {
    console.error('Get stream stats error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
