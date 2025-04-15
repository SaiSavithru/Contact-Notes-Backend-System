// Route for notes
const express = require('express');
const router = express.Router({ mergeParams: true });
const normalizeNote = require('../middleware/normalizeNote');
const noteController = require('../controllers/noteController');

/** GET All Notes for a Contact Method */
/**
 * @openapi
 * '/api/contacts/{contactId}/notes':
 *  get:
 *     tags:
 *       - Notes
 *     summary: Get all notes for a contact
 *     description: Get list of all notes for a contact. Requires JWT authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the contact for which notes are to be retrieved
 *     responses:
 *      200:
 *        description: Fetched Successfully
 *      401:
 *        description: Unauthorized - JWT token missing or invalid
 *      404:
 *        description: Contact/Notes not found
 *      500:
 *        description: Internal Server Error (Failed to get all notes for a contact)
*/
router.get('/', noteController.getNotesForContact);

/** POST Note Method */
/**
 * @openapi
 * '/api/contacts/{contactId}/notes':
 *  post:
 *     tags:
 *       - Notes
 *     summary: Create a new note
 *     description: Create a new note for a contact. Requires JWT authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the contact for which note is to be created
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - note_text
 *             properties:
 *               note_text:
 *                 type: string
 *                 default: This is my note
 *     responses:
 *       201:
 *         description: Note created successfully
 *       400:
 *         description: Bad Request (note_body/note_text/body is required)
 *       401:
 *         description: Unauthorized - JWT token missing or invalid
 *       404:
 *        description: Contact not found
 *       500:
 *         description: Internal Server Error (Failed to create note)
*/
router.post('/', normalizeNote, noteController.createNote);

/** GET Note Method */
/**
 * @openapi
 * '/api/contacts/{contactId}/notes/{noteId}':
 *  get:
 *     tags:
 *       - Notes
 *     summary: Get note
 *     description: Get note by its unique note ID. Requires JWT authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the contact
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the note to retrieve
 *     responses:
 *      200:
 *        description: Note fetched Successfully
 *      401:
 *        description: Unauthorized - JWT token missing or invalid
 *      404:
 *        description: Contact/Note not found
 *      500:
 *        description: Internal Server Error (Failed to get note)
*/
router.get('/:noteId', noteController.getNote);

/** PUT Note Method */
/**
 * @openapi
 * '/api/contacts/{contactId}/notes/{noteId}':
 *   put:
 *     summary: Update a note by note ID
 *     description: Update an existing note its unique Note ID. Requires JWT authentication.
 *     tags:
 *       - Notes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the contact
 *       - in: path
 *         name: noteId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the note to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - note_text
 *             properties:
 *               note_text:
 *                 type: string
 *                 default: This is my updated note
 *     responses:
 *       200:
 *         description: Note updated successfully
 *       400:
 *         description: Note Text/Body is required to update
 *       401:
 *         description: Unauthorized - JWT token missing or invalid
 *       404:
 *         description: Contact/Note not found
 *       500:
 *         description: Internal Server Error (Failed to update note)
*/
router.put('/:noteId', normalizeNote, noteController.updateNote);

/** DELETE Note Method */
/**
 * @openapi
 * '/api/contacts/{contactId}/notes/{noteId}':
 *   delete:
 *     summary: Delete a note by note ID
 *     description: Delete a note by its unique Note ID. Requires JWT authentication.
 *     tags:
 *       - Notes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the contact
 *       - in: path
 *         name: noteId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the note to delete
 *     responses:
 *       204:
 *         description: Note deleted successfully
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       404:
 *         description: Contact/Note not found
 *       500:
 *         description: Internal Server Error (Failed to delete note)
*/
router.delete('/:noteId', noteController.deleteNote);

module.exports = router;
