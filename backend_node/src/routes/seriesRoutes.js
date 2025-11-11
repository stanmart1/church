import express from 'express';
import { getSeries, getSeriesById, createSeries, updateSeries, deleteSeries } from '../controllers/seriesController.js';

const router = express.Router();

/**
 * @swagger
 * /series:
 *   get:
 *     summary: Get all sermon series
 *     tags: [Series]
 *     security: []
 *     responses:
 *       200:
 *         description: Series retrieved
 *   post:
 *     summary: Create sermon series
 *     tags: [Series]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Series created
 */

/**
 * @swagger
 * /series/{id}:
 *   get:
 *     summary: Get series by ID
 *     tags: [Series]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Series retrieved
 *   put:
 *     summary: Update series
 *     tags: [Series]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Series updated
 *   delete:
 *     summary: Delete series
 *     tags: [Series]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Series deleted
 */

router.get('/', getSeries);
router.get('/:id', getSeriesById);
router.post('/', createSeries);
router.put('/:id', updateSeries);
router.delete('/:id', deleteSeries);

export default router;
