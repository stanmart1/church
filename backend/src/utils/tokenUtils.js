import jwt from 'jsonwebtoken';
import { isTokenBlacklisted } from '../services/tokenBlacklistService.js';

export const verifyAndCheckToken = async (token) => {
  if (!token) {
    throw new Error('No token provided');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  const blacklisted = await isTokenBlacklisted(decoded.userId, decoded.iat);
  if (blacklisted) {
    throw new Error('Token has been invalidated');
  }

  return decoded;
};

export const extractToken = (authHeader) => {
  return authHeader?.split(' ')[1];
};

export const generateToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};
