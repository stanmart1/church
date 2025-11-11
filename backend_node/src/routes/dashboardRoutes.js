import express from 'express';
import { getDashboardStats, getRecentActivity, getMemberStats, getMemberRecentSermons, getMemberUpcomingEvents } from '../controllers/dashboardController.js';

const router = express.Router();

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved
 */

/**
 * @swagger
 * /dashboard/activity:
 *   get:
 *     summary: Get recent activity
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Recent activity retrieved
 */

/**
 * @swagger
 * /dashboard/member/{memberId}/stats:
 *   get:
 *     summary: Get member dashboard statistics
 *     tags: [Dashboard]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Member stats retrieved
 */

/**
 * @swagger
 * /dashboard/member/{memberId}/recent-sermons:
 *   get:
 *     summary: Get member recent sermons
 *     tags: [Dashboard]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Recent sermons retrieved
 */

/**
 * @swagger
 * /dashboard/member/{memberId}/upcoming-events:
 *   get:
 *     summary: Get member upcoming events
 *     tags: [Dashboard]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Upcoming events retrieved
 */

router.get('/stats', getDashboardStats);
router.get('/activity', getRecentActivity);
router.get('/member/:memberId/stats', getMemberStats);
router.get('/member/:memberId/recent-sermons', getMemberRecentSermons);
router.get('/member/:memberId/upcoming-events', getMemberUpcomingEvents);

export default router;
