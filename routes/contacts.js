// Route for contacts
const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

/** GET All Contacts Method */
/**
 * @openapi
 * '/api/contacts':
 *  get:
 *     tags:
 *     - Contacts
 *     summary: Get all contacts
 *     description: Get list of all contacts. Requires JWT authentication.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *      200:
 *        description: Fetched Successfully
 *      401:
 *        description: Unauthorized - JWT token missing or invalid
 *      500:
 *        description: Internal Server Error (Failed to get all contacts)
*/
router.get('/', contactController.getAllContacts);

/** POST Contact Method */
/**
 * @openapi
 * '/api/contacts':
 *  post:
 *     tags:
 *     - Contacts
 *     summary: Create a new contact
 *     description: Create a new contact with name and email. Requires JWT authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 default: Jane Doe
 *               email:
 *                 type: string
 *                 default: janedoe@example.com
 *     responses:
 *       201:
 *         description: Contact created successfully
 *       400:
 *         description: Bad Request (name and email are required)
 *       401:
 *         description: Unauthorized - JWT token missing or invalid
 *       409:
 *         description: Conflict - Email already exists
 *       500:
 *         description: Internal Server Error (Failed to create contact)
 */
router.post('/', contactController.createContact);

/** GET Contact Method */
/**
 * @openapi
 * '/api/contacts/{contactId}':
 *  get:
 *     tags:
 *     - Contacts
 *     summary: Get a contact by ID
 *     description: Get contact details by its unique contact ID. Requires JWT authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the contact to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved contact
 *       401:
 *         description: Unauthorized - JWT token missing or invalid
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Internal Server Error (Failed to get contact)
 */
router.get('/:id', contactController.getContact);

/** PUT Contact Method */
/**
 * @openapi
 * '/api/contacts/{contactId}':
 *   put:
 *     summary: Update a contact by ID
 *     description: Update an existing contact's name and/or email by its unique contact ID. Requires JWT authentication.
 *     tags:
 *       - Contacts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the contact to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *             minProperties: 1
 *             additionalProperties: false
 *     responses:
 *       200:
 *         description: Contact updated successfully
 *       400:
 *         description: No fields provided for update
 *       401:
 *         description: Unauthorized - JWT token missing or invalid
 *       404:
 *         description: Contact not found
 *       409:
 *         description: Conflict - Email already exists
 *       500:
 *         description: Internal Server Error (Failed to update contact)
 */
router.put('/:id', contactController.updateContact);

/** DELETE Contact Method */
/**
 * @openapi
 * '/api/contacts/{contactId}':
 *   delete:
 *     summary: Delete a contact by ID
 *     description: Delete a contact by its unique contact ID. Requires JWT authentication.
 *     tags:
 *       - Contacts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the contact to delete
 *     responses:
 *       204:
 *         description: Contact deleted successfully
 *       401:
 *         description: Unauthorized - JWT token missing or invalid
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Internal Server Error (Failed to delete contact)
 */
router.delete('/:id', contactController.deleteContact);

module.exports = router;
