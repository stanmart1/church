import express from 'express';
import { getSettings, getSettingByKey, updateSetting, updateBulkSettings, getSystemStatus, getSecurityStats, getRecentNotifications, getIntegrationStats, testIntegration, testEmail, markNotificationRead, getUnreadCount } from '../controllers/settingsController.js';

const router = express.Router();

/**
 * @swagger
 * /settings:
 *   get:
 *     summary: Get all settings
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Settings retrieved
 */

/**
 * @swagger
 * /settings/system/status:
 *   get:
 *     summary: Get system status
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: System status retrieved
 */

/**
 * @swagger
 * /settings/security/stats:
 *   get:
 *     summary: Get security statistics
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Security stats retrieved
 */

/**
 * @swagger
 * /settings/notifications/recent:
 *   get:
 *     summary: Get recent notifications
 *     tags: [Settings]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notifications retrieved
 */

/**
 * @swagger
 * /settings/notifications/unread-count:
 *   get:
 *     summary: Get unread notification count
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Unread count retrieved
 */

/**
 * @swagger
 * /settings/notifications/{id}/read:
 *   put:
 *     summary: Mark notification as read
 *     tags: [Settings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notification marked as read
 */

/**
 * @swagger
 * /settings/notifications/test-email:
 *   post:
 *     summary: Send test email
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Test email sent
 */

/**
 * @swagger
 * /settings/{key}:
 *   get:
 *     summary: Get setting by key
 *     tags: [Settings]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Setting retrieved
 *   put:
 *     summary: Update setting
 *     tags: [Settings]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *             properties:
 *               value:
 *                 type: string
 *     responses:
 *       200:
 *         description: Setting updated
 */

/**
 * @swagger
 * /settings/bulk:
 *   post:
 *     summary: Update multiple settings
 *     tags: [Settings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Settings updated
 */

router.get('/', getSettings);
router.get('/system/status', getSystemStatus);
router.get('/security/stats', getSecurityStats);
router.get('/notifications/recent', getRecentNotifications);
router.get('/notifications/unread-count', getUnreadCount);
router.put('/notifications/:id/read', markNotificationRead);
router.post('/notifications/test-email', testEmail);
router.get('/integrations/stats', getIntegrationStats);
router.post('/integrations/:integration/test', testIntegration);
router.get('/:key', getSettingByKey);
router.put('/:key', updateSetting);
router.post('/bulk', updateBulkSettings);

export default router;
