import express from 'express';
import { getRoles, getRole, createRole, updateRole, deleteRole, getPermissions, getRolePermissions } from '../controllers/roleController.js';

const router = express.Router();

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: Roles retrieved
 *   post:
 *     summary: Create role
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Role created
 */

/**
 * @swagger
 * /roles/permissions:
 *   get:
 *     summary: Get all permissions
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: Permissions retrieved
 */

/**
 * @swagger
 * /roles/{role}/permissions:
 *   get:
 *     summary: Get role permissions
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role permissions retrieved
 */

/**
 * @swagger
 * /roles/{id}:
 *   get:
 *     summary: Get role by ID
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Role retrieved
 *   put:
 *     summary: Update role
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Role updated
 *   delete:
 *     summary: Delete role
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Role deleted
 */

router.get('/', getRoles);
router.get('/permissions', getPermissions);
router.get('/:role/permissions', getRolePermissions);
router.get('/:id', getRole);
router.post('/', createRole);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);

export default router;
