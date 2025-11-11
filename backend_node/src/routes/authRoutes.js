import express from 'express';
import { register, login, verifyToken, getLoginHistory, logoutAll } from '../controllers/authController.js';
import { validateLogin, validateRegister, validateUserId } from '../middleware/validation.js';

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - first_name
 *               - last_name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already exists
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account locked
 */

/**
 * @swagger
 * /auth/verify:
 *   get:
 *     summary: Verify JWT token
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Token valid
 *       401:
 *         description: Invalid token
 */

/**
 * @swagger
 * /auth/login-history/{userId}:
 *   get:
 *     summary: Get user login history
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Login history retrieved
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /auth/logout-all/{userId}:
 *   post:
 *     summary: Logout from all devices
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Logged out from all devices
 *       401:
 *         description: Unauthorized
 */

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/verify', verifyToken);
router.get('/login-history/:userId', validateUserId, getLoginHistory);
router.post('/logout-all/:userId', validateUserId, logoutAll);

export default router;
