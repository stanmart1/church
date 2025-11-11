import express from 'express';
import { getProfile, updateProfile, deleteProfile, changePassword, uploadProfilePhoto, getNotificationPreferences, updateNotificationPreferences } from '../controllers/profileController.js';
import { validateUserId, validateUpdateUser, validatePasswordChange } from '../middleware/validation.js';

const router = express.Router();

/**
 * @swagger
 * /profile/{userId}:
 *   get:
 *     summary: Get user profile
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Profile retrieved
 *   put:
 *     summary: Update user profile
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: userId
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
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *   delete:
 *     summary: Delete user profile
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Profile deleted
 */

/**
 * @swagger
 * /profile/{userId}/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: userId
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
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed
 */

/**
 * @swagger
 * /profile/{userId}/photo:
 *   post:
 *     summary: Upload profile photo
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Photo uploaded
 */

/**
 * @swagger
 * /profile/{userId}/notifications:
 *   get:
 *     summary: Get notification preferences
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Preferences retrieved
 *   put:
 *     summary: Update notification preferences
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Preferences updated
 */

router.get('/:userId', validateUserId, getProfile);
router.put('/:userId', validateUserId, validateUpdateUser, updateProfile);
router.delete('/:userId', validateUserId, deleteProfile);
router.post('/:userId/change-password', validateUserId, validatePasswordChange, changePassword);
router.post('/:userId/photo', uploadProfilePhoto);
router.get('/:userId/notifications', validateUserId, getNotificationPreferences);
router.put('/:userId/notifications', validateUserId, updateNotificationPreferences);

export default router;
