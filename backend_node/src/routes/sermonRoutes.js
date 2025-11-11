import express from 'express';
import { getSermons, getSermon, createSermon, updateSermon, deleteSermon, incrementPlays, incrementDownloads } from '../controllers/sermonController.js';
import { uploadSermonFiles } from '../services/storageService.js';
import { validateFileSize } from '../middleware/fileValidation.js';
import { validateSermon, validateSermonUpdate, validateUUID } from '../middleware/validation.js';

const router = express.Router();

/**
 * @swagger
 * /sermons:
 *   get:
 *     summary: Get all sermons
 *     tags: [Sermons]
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: series_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sermons retrieved
 *   post:
 *     summary: Create sermon
 *     tags: [Sermons]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - speaker
 *               - date
 *             properties:
 *               title:
 *                 type: string
 *               speaker:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *               series_id:
 *                 type: integer
 *               audio:
 *                 type: string
 *                 format: binary
 *               video:
 *                 type: string
 *                 format: binary
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Sermon created
 */

/**
 * @swagger
 * /sermons/{id}:
 *   get:
 *     summary: Get sermon by ID
 *     tags: [Sermons]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sermon retrieved
 *       404:
 *         description: Sermon not found
 *   put:
 *     summary: Update sermon
 *     tags: [Sermons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sermon updated
 *   delete:
 *     summary: Delete sermon
 *     tags: [Sermons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sermon deleted
 */

/**
 * @swagger
 * /sermons/{id}/play:
 *   post:
 *     summary: Increment sermon play count
 *     tags: [Sermons]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Play count incremented
 */

/**
 * @swagger
 * /sermons/{id}/download:
 *   post:
 *     summary: Increment sermon download count
 *     tags: [Sermons]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Download count incremented
 */

router.get('/', getSermons);
router.get('/:id', validateUUID, getSermon);
router.post('/', uploadSermonFiles, validateFileSize, validateSermon, createSermon);
router.put('/:id', validateSermonUpdate, updateSermon);
router.delete('/:id', validateUUID, deleteSermon);
router.post('/:id/play', validateUUID, incrementPlays);
router.post('/:id/download', validateUUID, incrementDownloads);

export default router;
