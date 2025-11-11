import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

export const getProfile = async (req, res) => {
  try {
    console.log('Fetching profile:', req.params.userId);
    const result = await pool.query(
      'SELECT id, name, email, role, phone, status, created_at FROM users WHERE id = $1',
      [req.params.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    console.log('Updating profile:', req.params.userId);
    const { name, email, phone } = req.body;

    const result = await pool.query(
      `UPDATE users SET name = $1, email = $2, phone = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING id, name, email, role, phone, status, created_at`,
      [name, email, phone, req.params.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    console.log('Profile updated:', result.rows[0].id);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const deleteProfile = async (req, res) => {
  try {
    console.log('Deleting profile:', req.params.userId);
    
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.userId]);
    
    console.log('Profile deleted:', req.params.userId);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete profile error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    console.log('Changing password for user:', req.params.userId);
    const { current_password, new_password } = req.body;

    const user = await pool.query('SELECT password FROM users WHERE id = $1', [req.params.userId]);
    
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValid = await bcrypt.compare(current_password, user.rows[0].password);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, req.params.userId]
    );

    console.log('Password changed for user:', req.params.userId);
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const uploadProfilePhoto = async (req, res) => {
  try {
    console.log('Uploading profile photo for user:', req.params.userId);
    const { photo_url } = req.body;

    const result = await pool.query(
      'UPDATE users SET photo_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING photo_url',
      [photo_url, req.params.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Profile photo updated');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Upload profile photo error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getNotificationPreferences = async (req, res) => {
  try {
    console.log('Fetching notification preferences:', req.params.userId);
    const result = await pool.query(
      'SELECT notification_preferences FROM users WHERE id = $1',
      [req.params.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0].notification_preferences || {});
  } catch (error) {
    console.error('Get notification preferences error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateNotificationPreferences = async (req, res) => {
  try {
    console.log('Updating notification preferences:', req.params.userId);
    const { preferences } = req.body;

    const result = await pool.query(
      'UPDATE users SET notification_preferences = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING notification_preferences',
      [JSON.stringify(preferences), req.params.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Notification preferences updated');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update notification preferences error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
