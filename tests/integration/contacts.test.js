jest.mock('../../models/contact');
const request = require('supertest');
const app = require('../../app');
const jwt = require('jsonwebtoken');
const contactModel = require('../../models/contact');

const token = jwt.sign({ userId: 'testuser' }, process.env.JWT_SECRET || 'testsecret');

describe('Contacts API - Integration Tests', () => {
    beforeEach(() => {
      contactModel.resetMockData();
      jest.clearAllMocks();
    });

    describe('GET /api/contacts', () => {
      test('should return 200 and list of all contacts', async () => {
        await contactModel.createContact('Test User 1', 'user1@test.com');
        await contactModel.createContact('Test User 2', 'user2@test.com');

        const res = await request(app)
          .get('/api/contacts')
          .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(2);
        expect(res.body[0]).toHaveProperty('name', 'Test User 1');
        expect(res.body[0]).toHaveProperty('email', 'user1@test.com');
        expect(res.body[1]).toHaveProperty('name', 'Test User 2');
        expect(res.body[1]).toHaveProperty('email', 'user2@test.com');
      });

      test('should return 401 if JWT is missing', async () => {
        const res = await request(app).get('/api/contacts');

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'Unauthorized! No token provided');
      });
    });

    describe('POST /api/contacts', () => {
      test('should return 201 on creating a contact', async () => {
        const res = await request(app)
          .post('/api/contacts')
          .set('Authorization', `Bearer ${token}`)
          .send({
            name: 'Test User',
            email: 'user@test.com'
          });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id');
        const contact = await contactModel.getContactById(res.body.id);
        expect(contact).toBeTruthy();
        expect(contact.name).toBe('Test User');
      });

      test('should return 400 if data is missing', async () => {
        const res = await request(app)
          .post('/api/contacts')
          .set('Authorization', `Bearer ${token}`)
          .send({});

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Name and email are required');
      });

      test('should return 401 if JWT is missing', async () => {
        const res = await request(app)
          .post('/api/contacts')
          .send({
            name: 'Test User',
            email: 'user@test.com'
          });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'Unauthorized! No token provided');
      });

      test('should return 409 if email already exists', async () => {
        await contactModel.createContact('Test User', 'user@test.com');

        const res = await request(app)
          .post('/api/contacts')
          .set('Authorization', `Bearer ${token}`)
          .send({
            name: 'Test User2',
            email: 'user@test.com'
          });

        expect(res.statusCode).toBe(409);
        expect(res.body).toHaveProperty('error', 'Email already exists');
      });
    });

    describe('GET /api/contacts/:id', () => {
      test('should return 200 and the contact by ID with valid JWT', async () => {
        const contact = await contactModel.createContact('Test User', 'user@test.com');

        const res = await request(app)
          .get(`/api/contacts/${contact.id}`)
          .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('name', 'Test User');
      });

      test('should return 401 if JWT is missing', async () => {
        const contact = await contactModel.createContact('Test User', 'user@test.com');

        const res = await request(app)
          .get(`/api/contacts/${contact.id}`);

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'Unauthorized! No token provided');
      });
  
      test('should return 404 if contact is not found', async () => {
        const res = await request(app)
          .get('/api/contacts/9999')
          .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error', 'Contact not found');
      });
    });

    describe('PUT /api/contacts/:id', () => {
      test('should return 200 and update a contact with name and email', async () => {
        const contact = await contactModel.createContact('Test User', 'user@test.com');

        const res = await request(app)
          .put(`/api/contacts/${contact.id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ name: 'Updated User', email: 'updateduser@test.com' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('name', 'Updated User');
        expect(res.body).toHaveProperty('email', 'updateduser@test.com');
      });

      test('should return 200 and update a contact with only name', async () => {
        const contact = await contactModel.createContact('Test User', 'user@test.com');

        const res = await request(app)
          .put(`/api/contacts/${contact.id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ name: 'Updated User' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('name', 'Updated User');
        expect(res.body).toHaveProperty('email', 'user@test.com');
      });

      test('should return 200 and update a contact with only email', async () => {
        const contact = await contactModel.createContact('Test User', 'user@test.com');

        const res = await request(app)
          .put(`/api/contacts/${contact.id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ email: 'updateduser@test.com' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('name', 'Test User');
        expect(res.body).toHaveProperty('email', 'updateduser@test.com');
      });

      test('should return 400 if data is missing', async () => {
        const contact = await contactModel.createContact('Test User', 'user@test.com');

        const res = await request(app)
          .put(`/api/contacts/${contact.id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({});

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'No fields provided for update');
      });

      test('should return 401 if JWT is missing', async () => {
        const contact = await contactModel.createContact('Test User', 'user@test.com');

        const res = await request(app)
          .put(`/api/contacts/${contact.id}`)
          .send({ email: 'updateduser@test.com' });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'Unauthorized! No token provided');
      });

      test('should return 404 if contact not found', async () => {
        const res = await request(app)
          .put('/api/contacts/9999')
          .set('Authorization', `Bearer ${token}`)
          .send({ name: 'Updated User', email: 'updateduser@test.com' });

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error', 'Contact not found');
      });

      test('should return 409 if email already exists', async () => {
        await contactModel.createContact('Test User 1', 'user1@test.com');
        await contactModel.createContact('Test User 2', 'user2@test.com');

        const res = await request(app)
          .put('/api/contacts/2')
          .set('Authorization', `Bearer ${token}`)
          .send({
            email: 'user1@test.com'
          });

        expect(res.statusCode).toBe(409);
        expect(res.body).toHaveProperty('error', 'Email already exists');
      });
    });

    describe('DELETE /api/contacts/:id', () => {
      test('should return 204 on deleting a contact', async () => {
        const contact = await contactModel.createContact('Test User', 'user@test.com');

        const res = await request(app)
          .delete(`/api/contacts/${contact.id}`)
          .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(204);
        const deletedContact = await contactModel.getContactById(contact.id);
        expect(deletedContact).toBeUndefined();
      });

      test('should return 401 if JWT is missing', async () => {
        const contact = await contactModel.createContact('Test User', 'user@test.com');

        const res = await request(app)
          .delete(`/api/contacts/${contact.id}`);

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'Unauthorized! No token provided');
      });

      test('should return 404 if contact not found', async () => {
        const res = await request(app)
          .delete('/api/contacts/9999')
          .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error', 'Contact not found');
      });
    });
});
