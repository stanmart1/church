export const buildWhereClause = (conditions, startParamIndex = 1) => {
  const clauses = [];
  const params = [];
  let paramIndex = startParamIndex;

  conditions.forEach(({ field, operator, value, type = 'exact' }) => {
    if (value === undefined || value === null || value === '') return;
    
    if (type === 'search') {
      const fields = Array.isArray(field) ? field : [field];
      const searchClauses = fields.map(f => `${f} ILIKE $${paramIndex}`);
      clauses.push(`(${searchClauses.join(' OR ')})`);
      params.push(`%${value}%`);
      paramIndex++;
    } else if (type === 'exact') {
      clauses.push(`${field} ${operator || '='} $${paramIndex}`);
      params.push(value);
      paramIndex++;
    }
  });

  return { 
    whereClause: clauses.length ? ' AND ' + clauses.join(' AND ') : '', 
    params,
    nextParamIndex: paramIndex
  };
};

export const buildPaginatedQuery = (baseQuery, conditions, page, limit) => {
  const { whereClause, params, nextParamIndex } = buildWhereClause(conditions);
  
  const query = baseQuery + whereClause;
  const countQuery = query.replace(/SELECT .+ FROM/, 'SELECT COUNT(*) FROM').split('ORDER BY')[0];
  
  const offset = (page - 1) * limit;
  const paginatedQuery = query + ` LIMIT $${nextParamIndex} OFFSET $${nextParamIndex + 1}`;
  const queryParams = [...params, limit, offset];
  
  return { query: paginatedQuery, countQuery, params, queryParams };
};
