import express from 'express';
import { getPrayerRequests, getPrayerRequest, createPrayerRequest, updatePrayerRequest, deletePrayerRequest, getMemberPrayerRequests, prayForRequest } from '../controllers/prayerController.js';

const router = express.Router();

/**
 * @swagger
 * /prayers:
 *   get:
 *     summary: Get all prayer requests
 *     tags: [Prayers]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Prayer requests retrieved
 *   post:
 *     summary: Create prayer request
 *     tags: [Prayers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - member_id
 *               - request
 *             properties:
 *               member_id:
 *                 type: integer
 *               request:
 *                 type: string
 *     responses:
 *       201:
 *         description: Prayer request created
 */

/**
 * @swagger
 * /prayers/member/{memberId}:
 *   get:
 *     summary: Get member prayer requests
 *     tags: [Prayers]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Prayer requests retrieved
 */

/**
 * @swagger
 * /prayers/{id}:
 *   get:
 *     summary: Get prayer request by ID
 *     tags: [Prayers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Prayer request retrieved
 *   put:
 *     summary: Update prayer request
 *     tags: [Prayers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Prayer request updated
 *   delete:
 *     summary: Delete prayer request
 *     tags: [Prayers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Prayer request deleted
 */

/**
 * @swagger
 * /prayers/{id}/pray:
 *   post:
 *     summary: Pray for request
 *     tags: [Prayers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Prayer recorded
 */

router.get('/', getPrayerRequests);
router.get('/member/:memberId', getMemberPrayerRequests);
router.get('/:id', getPrayerRequest);
router.post('/', createPrayerRequest);
router.put('/:id', updatePrayerRequest);
router.delete('/:id', deletePrayerRequest);
router.post('/:id/pray', prayForRequest);

export default router;
