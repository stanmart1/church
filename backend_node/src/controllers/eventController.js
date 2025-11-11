import pool from '../config/database.js';
import { HTTP_STATUS } from '../config/constants.js';
import { parsePaginationParams, formatPaginationResponse } from '../utils/pagination.js';

export const getEvents = async (req, res) => {
  try {
    console.log('Fetching events...');
    const { search, status, type } = req.query;
    const { page, limit } = parsePaginationParams(req.query);
    
    let query = 'SELECT * FROM events WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) FROM events WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (search) {
      const searchCondition = ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount} OR location ILIKE $${paramCount})`;
      query += searchCondition;
      countQuery += searchCondition;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (status) {
      const statusCondition = ` AND status = $${paramCount}`;
      query += statusCondition;
      countQuery += statusCondition;
      params.push(status);
      paramCount++;
    }

    if (type) {
      const typeCondition = ` AND type = $${paramCount}`;
      query += typeCondition;
      countQuery += typeCondition;
      params.push(type);
      paramCount++;
    }

    const offset = (page - 1) * limit;
    query += ` ORDER BY date DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    const queryParams = [...params, limit, offset];

    const [result, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, params)
    ]);

    console.log(`Found ${result.rows.length} events (page ${page})`);
    res.json(formatPaginationResponse(result.rows, countResult.rows[0].count, page, limit));
  } catch (error) {
    console.error('Get events error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const getEvent = async (req, res) => {
  try {
    console.log('Fetching event:', req.params.id);
    const result = await pool.query('SELECT * FROM events WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Event not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get event error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    console.log('Creating event:', req.body.title);
    const { 
      title, 
      description, 
      startDate, 
      endDate, 
      startTime, 
      endTime, 
      location, 
      type, 
      maxAttendees, 
      registrationRequired, 
      registrationDeadline, 
      organizer, 
      cost, 
      recurring, 
      recurringType 
    } = req.body;

    const result = await pool.query(
      `INSERT INTO events (title, description, date, end_date, start_time, end_time, location, type, capacity, 
       registration_required, registration_deadline, organizer, cost, recurring, recurring_type, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
      [
        title, 
        description || null, 
        startDate, 
        endDate || null,
        startTime, 
        endTime || null, 
        location, 
        type || 'general', 
        maxAttendees ? parseInt(maxAttendees) : null,
        registrationRequired ?? true,
        registrationDeadline || null,
        organizer || null,
        cost ? parseFloat(cost) : null,
        recurring || false,
        recurringType || null,
        'upcoming'
      ]
    );

    console.log('Event created:', result.rows[0].id);
    res.status(HTTP_STATUS.CREATED).json(result.rows[0]);
  } catch (error) {
    console.error('Create event error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    console.log('Updating event:', req.params.id);
    const { 
      title, 
      description, 
      startDate,
      endDate, 
      start_time,
      end_time, 
      location, 
      type,
      capacity,
      registrationRequired,
      registrationDeadline,
      organizer,
      cost,
      recurring,
      recurringType,
      status 
    } = req.body;

    const result = await pool.query(
      `UPDATE events 
       SET title = $1, description = $2, date = $3, end_date = $4, start_time = $5, end_time = $6, 
           location = $7, type = $8, capacity = $9, registration_required = $10, registration_deadline = $11,
           organizer = $12, cost = $13, recurring = $14, recurring_type = $15, status = $16, updated_at = CURRENT_TIMESTAMP
       WHERE id = $17 RETURNING *`,
      [
        title, 
        description, 
        startDate,
        endDate || null, 
        start_time, 
        end_time || null, 
        location, 
        type || 'general', 
        capacity ? parseInt(capacity) : null,
        registrationRequired ?? true,
        registrationDeadline || null,
        organizer || null,
        cost ? parseFloat(cost) : null,
        recurring || false,
        recurringType || null,
        status || 'upcoming', 
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Event not found' });
    }

    console.log('Event updated:', result.rows[0].id);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update event error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    console.log('Deleting event:', req.params.id);
    const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Event not found' });
    }

    console.log('Event deleted:', req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const registerForEvent = async (req, res) => {
  try {
    console.log('Registering for event:', req.params.id);
    const { member_id } = req.body;

    await pool.query(
      'INSERT INTO event_registrations (event_id, member_id) VALUES ($1, $2)',
      [req.params.id, member_id]
    );

    await pool.query('UPDATE events SET registered_count = registered_count + 1 WHERE id = $1', [req.params.id]);

    console.log('Registration successful');
    res.status(HTTP_STATUS.CREATED).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Register event error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const unregisterFromEvent = async (req, res) => {
  try {
    console.log('Unregistering from event:', req.params.id);
    const result = await pool.query(
      'DELETE FROM event_registrations WHERE event_id = $1 AND member_id = $2 RETURNING id',
      [req.params.id, req.params.memberId]
    );

    if (result.rows.length === 0) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Registration not found' });
    }

    await pool.query('UPDATE events SET registered_count = registered_count - 1 WHERE id = $1', [req.params.id]);

    console.log('Unregistration successful');
    res.json({ message: 'Unregistration successful' });
  } catch (error) {
    console.error('Unregister event error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const getEventAttendees = async (req, res) => {
  try {
    console.log('Fetching event attendees:', req.params.id);
    const result = await pool.query(
      `SELECT er.*, m.name, m.email, m.phone 
       FROM event_registrations er 
       JOIN members m ON er.member_id = m.id 
       WHERE er.event_id = $1 
       ORDER BY er.registered_at DESC`,
      [req.params.id]
    );

    console.log(`Found ${result.rows.length} attendees`);
    res.json(result.rows);
  } catch (error) {
    console.error('Get attendees error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const markAttendance = async (req, res) => {
  try {
    console.log('Marking attendance:', req.params.id, req.params.memberId);
    const { attended } = req.body;

    const result = await pool.query(
      'UPDATE event_registrations SET attended = $1 WHERE event_id = $2 AND member_id = $3 RETURNING *',
      [attended, req.params.id, req.params.memberId]
    );

    if (result.rows.length === 0) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Registration not found' });
    }

    console.log('Attendance marked');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Mark attendance error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const getMemberEvents = async (req, res) => {
  try {
    console.log('Fetching member events:', req.params.memberId);
    const { registered_only } = req.query;

    let query = `
      SELECT e.*, 
        CASE WHEN er.id IS NOT NULL THEN true ELSE false END as is_registered
      FROM events e
      LEFT JOIN event_registrations er ON e.id = er.event_id AND er.member_id = $1
      WHERE e.date >= CURRENT_DATE
    `;

    if (registered_only === 'true') {
      query += ' AND er.id IS NOT NULL';
    }

    query += ' ORDER BY e.date ASC';

    const result = await pool.query(query, [req.params.memberId]);
    console.log(`Found ${result.rows.length} events for member`);
    res.json(result.rows);
  } catch (error) {
    console.error('Get member events error:', error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};
