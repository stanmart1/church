import { HTTP_STATUS } from '../config/constants.js';
import { verifyAndCheckToken, extractToken } from '../utils/tokenUtils.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization);
    req.user = await verifyAndCheckToken(token);
    next();
  } catch (error) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: error.message });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Not authenticated' });
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};
