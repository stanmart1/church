import express from 'express';
import { getMembers, getMember, createMember, updateMember, deleteMember, exportMembers } from '../controllers/memberController.js';

const router = express.Router();

/**
 * @swagger
 * /members:
 *   get:
 *     summary: Get all members
 *     tags: [Members]
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
 *     responses:
 *       200:
 *         description: Members retrieved
 *   post:
 *     summary: Create member
 *     tags: [Members]
 *     responses:
 *       201:
 *         description: Member created
 */

/**
 * @swagger
 * /members/export:
 *   get:
 *     summary: Export members to CSV
 *     tags: [Members]
 *     responses:
 *       200:
 *         description: CSV file
 */

/**
 * @swagger
 * /members/{id}:
 *   get:
 *     summary: Get member by ID
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Member retrieved
 *   put:
 *     summary: Update member
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Member updated
 *   delete:
 *     summary: Delete member
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Member deleted
 */

router.get('/', getMembers);
router.get('/export', exportMembers);
router.get('/:id', getMember);
router.post('/', createMember);
router.put('/:id', updateMember);
router.delete('/:id', deleteMember);

export default router;
