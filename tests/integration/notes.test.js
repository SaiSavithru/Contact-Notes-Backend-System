jest.mock('../../models/note');
jest.mock('../../models/contact');
jest.mock('../../kafka/producer');

const request = require('supertest');
const app = require('../../app');
const jwt = require('jsonwebtoken');
const noteModel = require('../../models/note');
const contactModel = require('../../models/contact');
const { produceNoteEvent } = require('../../kafka/producer');

const token = jwt.sign({ userId: 'testuser' }, process.env.JWT_SECRET || 'testsecret');

describe('Notes API - Integration Tests', () => {
  beforeEach(() => {
    contactModel.resetMockData();
    noteModel.resetMockData();
    jest.clearAllMocks();
  });

  // Tests for getting all notes for a contact
  describe('GET /api/contacts/:contactId/notes', () => {
    test('should return 200 and list of notes for a contact', async () => {
      const contact = await contactModel.createContact('Test User', 'user@test.com');
      await noteModel.createNote(contact.id, 'Note 1');
      await noteModel.createNote(contact.id, 'Note 2');

      const res = await request(app)
        .get(`/api/contacts/${contact.id}/notes`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body[0]).toHaveProperty('body', 'Note 1');
      expect(res.body[1]).toHaveProperty('body', 'Note 2');
    });

    test('should return 401 if JWT is missing', async () => {
      const contact = await contactModel.createContact('Test User', 'user@test.com');
      await noteModel.createNote(contact.id, 'Note 1');

      const res = await request(app)
        .get(`/api/contacts/${contact.id}/notes`)

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Unauthorized! No token provided');
    }); 

    test('should return 404 if contact not found', async () => {
      const res = await request(app)
        .get('/api/contacts/9999/notes')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Contact not found');
    });

    test('should return 404 if no notes found', async () => {
      const contact = await contactModel.createContact('Test User', 'user@test.com');

      const res = await request(app)
        .get(`/api/contacts/${contact.id}/notes`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'No notes found');
    });
  });

  // Tests for creating a note
  describe('POST /api/contacts/:contactId/notes', () => {
    test('should return 201 on creating a note', async () => {
      const contact = await contactModel.createContact('Test User', 'user@test.com');

      const res = await request(app)
        .post(`/api/contacts/${contact.id}/notes`)
        .set('Authorization', `Bearer ${token}`)
        .send({ body: 'New Note' });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('body', 'New Note');
      expect(produceNoteEvent).toHaveBeenCalledWith(expect.objectContaining({ body: 'New Note' }));
    });

    test('should return 400 if body is missing', async () => {
      const contact = await contactModel.createContact('Test User', 'user@test.com');

      const res = await request(app)
        .post(`/api/contacts/${contact.id}/notes`)
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Note Body is required');
    });

    test('should return 401 if JWT is missing', async () => {
      const contact = await contactModel.createContact('Test User', 'user@test.com');

      const res = await request(app)
        .post(`/api/contacts/${contact.id}/notes`)
        .send({ body: 'New Note' });
  
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'Unauthorized! No token provided');
      }); 

    test('should return 404 if contact not found', async () => {
      const res = await request(app)
        .post('/api/contacts/9999/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({ body: 'New Note' });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Contact not found');
    });
  });

  // Tests for getting a note
  describe('GET /api/contacts/:contactId/notes/:noteId', () => {
    test('should return 200 and a single note', async () => {
      const contact = await contactModel.createContact('Test User', 'user@test.com');
      const note = await noteModel.createNote(contact.id, 'Note content');

      const res = await request(app)
        .get(`/api/contacts/${contact.id}/notes/${note.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('body', 'Note content');
    });

    test('should return 401 if JWT is missing', async () => {
      const contact = await contactModel.createContact('Test User', 'user@test.com');
      const note = await noteModel.createNote(contact.id, 'Note content');

      const res = await request(app)
        .get(`/api/contacts/${contact.id}/notes/${note.id}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Unauthorized! No token provided');
    }); 

    test('should return 404 if note not found', async () => {
      const contact = await contactModel.createContact('Test User', 'user@test.com');

      const res = await request(app)
        .get(`/api/contacts/${contact.id}/notes/9999`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Note not found');
    });
  });

  // Tests for updating a note
  describe('PUT /api/contacts/:contactId/notes/:noteId', () => {
    test('should return 200 and the updated note', async () => {
      const contact = await contactModel.createContact('Test User', 'user@test.com');
      const note = await noteModel.createNote(contact.id, 'Old note');

      const res = await request(app)
        .put(`/api/contacts/${contact.id}/notes/${note.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ body: 'Updated note' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('body', 'Updated note');
      expect(produceNoteEvent).toHaveBeenCalled();
    });

    test('should return 400 if body is missing', async () => {
      const contact = await contactModel.createContact('Test User', 'user@test.com');
      const note = await noteModel.createNote(contact.id, 'Old note');

      const res = await request(app)
        .put(`/api/contacts/${contact.id}/notes/${note.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Note Body is required');
    });

    test('should return 401 if JWT is missing', async () => {
      const contact = await contactModel.createContact('Test User', 'user@test.com');
      const note = await noteModel.createNote(contact.id, 'Old note');

      const res = await request(app)
        .put(`/api/contacts/${contact.id}/notes/${note.id}`)
        .send({ body: 'Updated note' });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'Unauthorized! No token provided');
    });

    test('should return 404 if contact not found', async () => {
      const res = await request(app)
        .put(`/api/contacts/99/notes/9999`)
        .set('Authorization', `Bearer ${token}`)
        .send({ body: 'Updated note' });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Contact not found');
    });

    test('should return 404 if note not found', async () => {
      const contact = await contactModel.createContact('Test User', 'user@test.com');

      const res = await request(app)
        .put(`/api/contacts/${contact.id}/notes/9999`)
        .set('Authorization', `Bearer ${token}`)
        .send({ body: 'Updated note' });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Note not found');
    });
  });

  // Tests for deleting a note
  describe('DELETE /api/contacts/:contactId/notes/:noteId', () => {
    test('should return 204 on deleting a note', async () => {
      const contact = await contactModel.createContact('Test User', 'user@test.com');
      const note = await noteModel.createNote(contact.id, 'To be deleted');

      const res = await request(app)
        .delete(`/api/contacts/${contact.id}/notes/${note.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(204);
    });

    test('should return 401 if JWT is missing', async () => {
      const contact = await contactModel.createContact('Test User', 'user@test.com');
      const note = await noteModel.createNote(contact.id, 'To be deleted');

      const res = await request(app)
        .delete(`/api/contacts/${contact.id}/notes/${note.id}`);
  
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Unauthorized! No token provided');
    });

    test('should return 404 if contact not found', async () => {
      const res = await request(app)
        .delete(`/api/contacts/99/notes/9999`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Contact not found');
    });

    test('should return 404 if note not found', async () => {
      const contact = await contactModel.createContact('Test User', 'user@test.com');

      const res = await request(app)
        .delete(`/api/contacts/${contact.id}/notes/9999`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Note not found');
    });
  });
});
