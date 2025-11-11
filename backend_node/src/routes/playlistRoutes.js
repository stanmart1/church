import express from 'express';
import { getPlaylists, getPlaylist, createPlaylist, updatePlaylist, deletePlaylist, addSermonToPlaylist, removeSermonFromPlaylist, incrementPlays, toggleSermonBookmark } from '../controllers/playlistController.js';

const router = express.Router();

/**
 * @swagger
 * /playlists:
 *   get:
 *     summary: Get all playlists
 *     tags: [Playlists]
 *     parameters:
 *       - in: query
 *         name: memberId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Playlists retrieved
 *   post:
 *     summary: Create playlist
 *     tags: [Playlists]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - member_id
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               member_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Playlist created
 */

/**
 * @swagger
 * /playlists/{id}:
 *   get:
 *     summary: Get playlist by ID
 *     tags: [Playlists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Playlist retrieved
 *   put:
 *     summary: Update playlist
 *     tags: [Playlists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Playlist updated
 *   delete:
 *     summary: Delete playlist
 *     tags: [Playlists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Playlist deleted
 */

/**
 * @swagger
 * /playlists/{id}/sermons:
 *   post:
 *     summary: Add sermon to playlist
 *     tags: [Playlists]
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
 *             required:
 *               - sermon_id
 *             properties:
 *               sermon_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Sermon added to playlist
 */

/**
 * @swagger
 * /playlists/{id}/sermons/{sermonId}:
 *   delete:
 *     summary: Remove sermon from playlist
 *     tags: [Playlists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: sermonId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sermon removed from playlist
 */

/**
 * @swagger
 * /playlists/{id}/play:
 *   post:
 *     summary: Increment playlist play count
 *     tags: [Playlists]
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
 * /playlists/bookmark/{sermonId}:
 *   post:
 *     summary: Toggle sermon bookmark
 *     tags: [Playlists]
 *     parameters:
 *       - in: path
 *         name: sermonId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - member_id
 *             properties:
 *               member_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Bookmark toggled
 */

router.get('/', getPlaylists);
router.get('/:id', getPlaylist);
router.post('/', createPlaylist);
router.put('/:id', updatePlaylist);
router.delete('/:id', deletePlaylist);
router.post('/:id/sermons', addSermonToPlaylist);
router.delete('/:id/sermons/:sermonId', removeSermonFromPlaylist);
router.post('/:id/play', incrementPlays);
router.post('/bookmark/:sermonId', toggleSermonBookmark);

export default router;
