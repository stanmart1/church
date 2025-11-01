import express from 'express';
import { getLivestreams, getCurrentLivestream, createLivestream, updateLivestream, endLivestream, getChatMessages, sendChatMessage, deleteChatMessage, updateViewerCount, getStreamHistory, getViewers, addViewer, removeViewer, banViewer, unbanViewer, getStreamStats, streamAudio, bulkViewerAction, uploadChunk } from '../controllers/livestreamController.js';

const router = express.Router();

/**
 * @swagger
 * /livestreams:
 *   get:
 *     summary: Get all livestreams
 *     tags: [Livestreams]
 *     responses:
 *       200:
 *         description: Livestreams retrieved
 *   post:
 *     summary: Create livestream
 *     tags: [Livestreams]
 *     responses:
 *       201:
 *         description: Livestream created
 */

/**
 * @swagger
 * /livestreams/current:
 *   get:
 *     summary: Get current active livestream
 *     tags: [Livestreams]
 *     security: []
 *     responses:
 *       200:
 *         description: Current livestream retrieved
 */

/**
 * @swagger
 * /livestreams/{id}/chat:
 *   get:
 *     summary: Get chat messages
 *     tags: [Livestreams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chat messages retrieved
 *   post:
 *     summary: Send chat message
 *     tags: [Livestreams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Message sent
 */

router.get('/', getLivestreams);
router.get('/current', getCurrentLivestream);
router.get('/history', getStreamHistory);
router.post('/', createLivestream);
router.put('/:id', updateLivestream);
router.post('/:id/end', endLivestream);
router.put('/:id/viewers', updateViewerCount);
router.get('/:id/chat', getChatMessages);
router.post('/:id/chat', sendChatMessage);
router.delete('/:id/chat/:messageId', deleteChatMessage);
router.get('/:id/viewers', getViewers);
router.post('/:id/viewers', addViewer);
router.post('/:id/viewers/bulk-action', bulkViewerAction);
router.delete('/:id/viewers/:viewerId', removeViewer);
router.post('/:id/viewers/:viewerId/ban', banViewer);
router.post('/:id/viewers/:viewerId/unban', unbanViewer);
router.get('/:id/stats', getStreamStats);
router.post('/stream', streamAudio);
router.post('/:id/upload-chunk', express.raw({ type: 'application/octet-stream', limit: '10mb' }), uploadChunk);

export default router;
