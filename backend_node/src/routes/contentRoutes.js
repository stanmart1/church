import express from 'express';
import { getContent, getContentByKey, updateContent, getServiceTimes, createServiceTime, updateServiceTime, deleteServiceTime } from '../controllers/contentController.js';
import { validateContent, validateServiceTime } from '../middleware/validation.js';

const router = express.Router();

/**
 * @swagger
 * /content:
 *   get:
 *     summary: Get all content
 *     tags: [Content]
 *     security: []
 *     responses:
 *       200:
 *         description: Content retrieved successfully
 */

/**
 * @swagger
 * /content/service-times:
 *   get:
 *     summary: Get all service times
 *     tags: [Content]
 *     security: []
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
 *         description: Service times retrieved
 *   post:
 *     summary: Create service time
 *     tags: [Content]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - day
 *               - time
 *             properties:
 *               day:
 *                 type: string
 *               time:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Service time created
 */

/**
 * @swagger
 * /content/service-times/{id}:
 *   put:
 *     summary: Update service time
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               day:
 *                 type: string
 *               time:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Service time updated
 *   delete:
 *     summary: Delete service time
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Service time deleted
 */

/**
 * @swagger
 * /content/{key}:
 *   get:
 *     summary: Get content by key
 *     tags: [Content]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Content retrieved
 *   put:
 *     summary: Update content by key
 *     tags: [Content]
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
 *         description: Content updated
 */

router.get('/', getContent);
router.get('/service-times', getServiceTimes);
router.post('/service-times', validateServiceTime, createServiceTime);
router.put('/service-times/:id', validateServiceTime, updateServiceTime);
router.delete('/service-times/:id', deleteServiceTime);
router.get('/:key', getContentByKey);
router.put('/:key', validateContent, updateContent);

export default router;
