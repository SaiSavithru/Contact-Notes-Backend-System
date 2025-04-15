const noteController = require('../../controllers/noteController');
const contactModel = require('../../models/contact');
const noteModel = require('../../models/note');
const { produceNoteEvent } = require('../../kafka/producer');

jest.mock('../../models/contact');
jest.mock('../../models/note');
jest.mock('../../kafka/producer');

describe('Note Controller - Unit Tests', () => {
  beforeEach(() => {
    noteModel.resetMockData();
  });

  // Tests for getting all notes for a contact
  describe('GET /api/contacts/:contactId/notes', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should return 200 and notes if found', async () => {
      const req = { params: { contactId: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      contactModel.getContactById.mockResolvedValue({ id: 1, name: 'User', email: 'user@example.com' });
      noteModel.getNotesForContact.mockResolvedValue([{ id: 1, contact_id: 1, body: 'Test Note' }]);

      await noteController.getNotesForContact(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ id: 1, contact_id: 1, body: 'Test Note' }]);
    });

    test('should return 404 if contact not found', async () => {
      const req = { params: { contactId: 99 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      contactModel.getContactById.mockResolvedValue(null);

      await noteController.getNotesForContact(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Contact not found' });
    });

    test('should return 404 if no notes found', async () => {
      const req = { params: { contactId: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      contactModel.getContactById.mockResolvedValue({ id: 1, name: 'User', email: 'user@example.com' });
      noteModel.getNotesForContact.mockResolvedValue(null);

      await noteController.getNotesForContact(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'No notes found' });
    });

    test('should return 500 on server error', async () => {
      const req = { params: { contactId: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      contactModel.getContactById.mockRejectedValue(new Error('DB error'));

      await noteController.getNotesForContact(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to retrieve notes for contact' });
    });
  });

  // Tests for creating a note
  describe('POST /api/contacts/:contactId/notes', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should return 201 and create note', async () => {
      const req = {
        params: { contactId: 1 },
        body: { body: 'New Note' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      contactModel.getContactById.mockResolvedValue({ id: 1, name: 'User', email: 'user@example.com' });
      noteModel.createNote.mockResolvedValue({ id: 1, contactId: 1, body: 'New Note' });

      await noteController.createNote(req, res);

      expect(noteModel.createNote).toHaveBeenCalledWith(1, 'New Note');
      expect(produceNoteEvent).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 1, contactId: 1, body: 'New Note' });
    });

    test('should return 400 if note body missing', async () => {
      const req = {
        params: { contactId: 1 },
        body: {}
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      contactModel.getContactById.mockResolvedValue({ id: 1, name: 'User', email: 'user@example.com' });

      await noteController.createNote(req, res);

      expect(noteModel.createNote).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Note Body is required' });
    });

    test('should return 404 if contact not found', async () => {
      const req = {
        params: { contactId: 99 },
        body: { body: 'Some note' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      contactModel.getContactById.mockResolvedValue(null);

      await noteController.createNote(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Contact not found' });
    });

    test('should return 500 on error', async () => {
      const req = {
        params: { contactId: 1 },
        body: { body: 'Some note' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      contactModel.getContactById.mockResolvedValue({ id: 1, name: 'User', email: 'user@example.com' });
      noteModel.createNote.mockRejectedValue(new Error('DB error'));

      await noteController.createNote(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to create note' });
    });
  });

  // Tests for getting a note
  describe('GET /api/contacts/:contactId/notes/:noteId', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should return 200 and note if found', async () => {
      const req = { params: { contactId: 1, noteId: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      contactModel.getContactById.mockResolvedValue({ id: 1, name: 'User', email: 'user@example.com' });
      noteModel.getNote.mockResolvedValue({ id: 1, body: 'Test note' });

      await noteController.getNote(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: 1, body: 'Test note' });
    });

    test('should return 404 if contact not found', async () => {
      const req = { params: { contactId: 99, noteId: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      contactModel.getContactById.mockResolvedValue(null);

      await noteController.getNote(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Contact not found' });
    });

    test('should return 404 if note not found', async () => {
      const req = { params: { contactId: 1, noteId: 99 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      contactModel.getContactById.mockResolvedValue({ id: 1, name: 'User', email: 'user@example.com' });
      noteModel.getNote.mockResolvedValue(null);

      await noteController.getNote(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Note not found' });
    });

    test('should return 500 on server error', async () => {
      const req = { params: { contactId: 1, noteId: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      contactModel.getContactById.mockResolvedValue({ id: 1, name: 'User', email: 'user@example.com' });
      noteModel.getNote.mockRejectedValue(new Error('DB error'));

      await noteController.getNote(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to retrieve note' });
    });
  });

  // Tests for updating a note
  describe('PUT /api/contacts/:contactId/notes/:noteId', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should return 200 and updated note', async () => {
      const req = {
        params: { contactId: 1, noteId: 1 },
        body: { body: 'Updated body' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      contactModel.getContactById.mockResolvedValue({ id: 1, name: 'User', email: 'user@example.com' });
      noteModel.getNote.mockResolvedValue({ id: 1, contact_id: 1, body: 'Old Note' });
      noteModel.updateNote.mockResolvedValue({ id: 1, contact_id: 1, body: 'Updated Note' });
  
      await noteController.updateNote(req, res);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: 1, contact_id: 1, body: 'Updated Note' });
    });
  
    test('should return 404 if contact not found', async () => {
      const req = {
        params: { contactId: 1, noteId: 1 },
        body: { body: 'Updated body' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      contactModel.getContactById.mockResolvedValue(null);
  
      await noteController.updateNote(req, res);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Contact not found' });
    });
  
    test('should return 404 if note not found', async () => {
      const req = {
        params: { contactId: 1, noteId: 1 },
        body: { body: 'Updated body' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      contactModel.getContactById.mockResolvedValue({ id: 1, name: 'User', email: 'user@example.com' });
      noteModel.getNote.mockResolvedValue(null);
  
      await noteController.updateNote(req, res);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Note not found' });
    });
  
    test('should return 400 if body is missing', async () => {
      const req = {
        params: { contactId: 1, noteId: 1 },
        body: {}
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      contactModel.getContactById.mockResolvedValue({ id: 1, name: 'User', email: 'user@example.com' });
      noteModel.getNote.mockResolvedValue({ id: 1, name: 'User', email: 'user@example.com' });
  
      await noteController.updateNote(req, res);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Note Body is required' });
    });
  
    test('should return 500 on server error', async () => {
      const req = {
        params: { contactId: 1, noteId: 1 },
        body: { body: 'Updated body' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      contactModel.getContactById.mockRejectedValue(new Error('DB error'));
  
      await noteController.updateNote(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to update note' });
    });
  });

  // Tests for deleting a note
  describe('DELETE /api/contacts/:contactId/notes/:noteId', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should return 204 on successful delete', async () => {
      const req = {
        params: { contactId: 1, noteId: 1 }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        end: jest.fn(),
        json: jest.fn()
      };
  
      contactModel.getContactById.mockResolvedValue({ id: 1, name: 'User', email: 'user@example.com' });
      noteModel.getNote.mockResolvedValue({ id: 1, name: 'User', email: 'user@example.com' });
      noteModel.deleteNote.mockResolvedValue(null);
  
      await noteController.deleteNote(req, res);
  
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.end).toHaveBeenCalled();
    });
  
    test('should return 404 if contact not found', async () => {
      const req = {
        params: { contactId: 1, noteId: 1 }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      contactModel.getContactById = jest.fn().mockResolvedValue(null);
  
      await noteController.deleteNote(req, res);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Contact not found' });
    });
  
    test('should return 404 if note not found', async () => {
      const req = {
        params: { contactId: 1, noteId: 1 }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      contactModel.getContactById = jest.fn().mockResolvedValue({ id: 1, name: 'User', email: 'user@example.com' });
      noteModel.getNote = jest.fn().mockResolvedValue(null);
  
      await noteController.deleteNote(req, res);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Note not found' });
    });
  
    test('should return 500 on server error', async () => {
      const req = {
        params: { contactId: 1, noteId: 1 }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      contactModel.getContactById = jest.fn().mockRejectedValue(new Error('DB error'));
  
      await noteController.deleteNote(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to delete note' });
    });
  });
});
