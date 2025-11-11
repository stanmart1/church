import express from 'express';
import { getPermissions, getRolePermissions, updateRolePermissions } from '../controllers/permissionController.js';

const router = express.Router();

/**
 * @swagger
 * /permissions:
 *   get:
 *     summary: Get all permissions
 *     tags: [Permissions]
 *     responses:
 *       200:
 *         description: Permissions retrieved
 */

/**
 * @swagger
 * /permissions/role/{role}:
 *   get:
 *     summary: Get permissions for specific role
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role permissions retrieved
 *   put:
 *     summary: Update role permissions
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: role
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
 *               - permissions
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Permissions updated
 */

router.get('/', getPermissions);
router.get('/role/:role', getRolePermissions);
router.put('/role/:role', updateRolePermissions);

export default router;
