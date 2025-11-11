import { PAGINATION } from '../config/constants.js';

/**
 * Build pagination query with filters
 * @param {string} baseQuery - Base SQL query
 * @param {object} filters - Filter object with key-value pairs
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {object} - { query, countQuery, params }
 */
export const buildPaginationQuery = (baseQuery, filters = {}, page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT) => {
  let query = baseQuery;
  let countQuery = baseQuery.replace(/SELECT .+ FROM/, 'SELECT COUNT(*) FROM').split('ORDER BY')[0];
  const params = [];
  let paramCount = 1;

  // Add filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (key === 'search') {
        const searchCondition = ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
        query += searchCondition;
        countQuery += searchCondition;
        params.push(`%${value}%`);
      } else {
        const condition = ` AND ${key} = $${paramCount}`;
        query += condition;
        countQuery += condition;
        params.push(value);
      }
      paramCount++;
    }
  });

  // Add pagination
  const offset = (page - 1) * limit;
  query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  return { query, countQuery, params: params.slice(0, paramCount - 1), paginationParams: params };
};

/**
 * Format pagination response
 * @param {array} data - Query results
 * @param {number} total - Total count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {object} - Formatted response with pagination metadata
 */
export const formatPaginationResponse = (data, total, page, limit) => ({
  data,
  pagination: {
    page: parseInt(page),
    limit: parseInt(limit),
    total: parseInt(total),
    totalPages: Math.ceil(total / limit)
  }
});

/**
 * Parse pagination params from query
 * @param {object} query - Request query object
 * @returns {object} - { page, limit }
 */
export const parsePaginationParams = (query) => ({
  page: parseInt(query.page) || PAGINATION.DEFAULT_PAGE,
  limit: parseInt(query.limit) || PAGINATION.DEFAULT_LIMIT
});
