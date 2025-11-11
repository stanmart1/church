import express from 'express';
import { getForms, getForm, createForm, updateForm, deleteForm, deleteForms, submitFormResponse, getFormResponses, exportFormResponses, exportForms } from '../controllers/formController.js';

const router = express.Router();

/**
 * @swagger
 * /forms:
 *   get:
 *     summary: Get all forms
 *     tags: [Forms]
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
 *         description: Forms retrieved
 *   post:
 *     summary: Create form
 *     tags: [Forms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - fields
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               fields:
 *                 type: array
 *     responses:
 *       201:
 *         description: Form created
 */

/**
 * @swagger
 * /forms/delete-multiple:
 *   post:
 *     summary: Delete multiple forms
 *     tags: [Forms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Forms deleted
 */

/**
 * @swagger
 * /forms/export:
 *   post:
 *     summary: Export forms to CSV
 *     tags: [Forms]
 *     responses:
 *       200:
 *         description: CSV file
 */

/**
 * @swagger
 * /forms/{id}:
 *   get:
 *     summary: Get form by ID
 *     tags: [Forms]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Form retrieved
 *   put:
 *     summary: Update form
 *     tags: [Forms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Form updated
 *   delete:
 *     summary: Delete form
 *     tags: [Forms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Form deleted
 */

/**
 * @swagger
 * /forms/{id}/responses:
 *   get:
 *     summary: Get form responses
 *     tags: [Forms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Responses retrieved
 *   post:
 *     summary: Submit form response
 *     tags: [Forms]
 *     security: []
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
 *     responses:
 *       201:
 *         description: Response submitted
 */

/**
 * @swagger
 * /forms/{id}/responses/export:
 *   get:
 *     summary: Export form responses to CSV
 *     tags: [Forms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: CSV file
 */

router.get('/', getForms);
router.get('/:id', getForm);
router.post('/', createForm);
router.put('/:id', updateForm);
router.delete('/:id', deleteForm);
router.post('/delete-multiple', deleteForms);
router.post('/export', exportForms);
router.post('/:id/responses', submitFormResponse);
router.get('/:id/responses', getFormResponses);
router.get('/:id/responses/export', exportFormResponses);

export default router;
