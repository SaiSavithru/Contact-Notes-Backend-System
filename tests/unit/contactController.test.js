const contactController = require('../../controllers/contactController');
const contactModel = require('../../models/contact');
const authMiddleware = require('../../middleware/authentication');

jest.mock('../../models/contact');
describe('Contact Controller - Unit Tests', () => {
  beforeEach(() => {
    contactModel.resetMockData();
  });

  // Test for Unauthorized access
  describe('Unauthorized', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should return 401 if no JWT token is provided', () => {
      const req = {
        headers: {}
      };
    
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    
      const next = jest.fn();
    
      authMiddleware(req, res, next);
    
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized! No token provided' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  // Tests for Getting all contacts
  describe('GET /api/contacts', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should return 200 if list of contacts are returned', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const mockContacts = [{ id: 1, name: 'User1', email: 'user1@test.com' }];
      contactModel.getAllContacts.mockResolvedValue(mockContacts);

      await contactController.getAllContacts(req, res);

      expect(contactModel.getAllContacts).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockContacts);
    });

    test('should return 500 if an error occurs to get all contacts)', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      contactModel.getAllContacts.mockRejectedValue(new Error('DB failed'));
      await contactController.getAllContacts(req, res);

      expect(contactModel.getAllContacts).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to retrieve contacts' });
    });
  });

  // Tests for Posting a contact
  describe('POST /api/contacts', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should return 201 when contact is created successfully', async () => {
      const req = {
        body: { name: 'User 1', email: 'user1@test.com' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    
      contactModel.getContactByEmail.mockResolvedValue(null);
      contactModel.createContact.mockResolvedValue({ id: 1, name: 'User 1', email: 'user1@test.com' });
    
      await contactController.createContact(req, res);

      expect(contactModel.getContactByEmail).toHaveBeenCalledWith('user1@test.com');
      expect(contactModel.createContact).toHaveBeenCalledWith('User 1', 'user1@test.com');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 1, name: 'User 1', email: 'user1@test.com' });
    });

    test('should return 400 if email is missing', async () => {
      const req = { body: { name: 'Jane' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      contactModel.createContact.mockResolvedValue(null);
    
      await contactController.createContact(req, res);

      expect(contactModel.createContact).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Name and email are required' });
    });

    test('should return 400 if name is missing', async () => {
      const req = { body: { email: 'jane@example.com' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    
      contactModel.createContact.mockResolvedValue(null);

      await contactController.createContact(req, res);

      expect(contactModel.createContact).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Name and email are required' });
    });

    test('should return 409 if email already exists', async () => {
      const req = {
        body: { name: 'User 1', email: 'user1@test.com' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    
      contactModel.getContactByEmail.mockResolvedValue({ id: 1, name: 'User1', email: 'user1@test.com' });
      contactModel.createContact.mockResolvedValue(null);
    
      await contactController.createContact(req, res);

      expect(contactModel.getContactByEmail).toHaveBeenCalledWith('user1@test.com');
      expect(contactModel.createContact).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email already exists' });
    });

    test('should return 500 if an error occurs during creation', async () => {
      const req = {
        body: { name: 'User 1', email: 'user1@test.com' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    
      contactModel.getContactByEmail.mockResolvedValue(null);
      contactModel.createContact.mockRejectedValue(new Error('DB error'));
    
      await contactController.createContact(req, res);
    
      expect(contactModel.getContactByEmail).toHaveBeenCalled();
      expect(contactModel.createContact).toHaveBeenCalledWith('User 1', 'user1@test.com');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to create contact' });
    });
  });

  // Tests for Getting a contact
  describe('GET /api/contacts/:id', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should return 200 and contact if found', async () => {
      const req = { params: { id: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const contact = { id: 1, name: 'User 1', email: 'user1@test.com' }
      contactModel.getContactById.mockResolvedValue(contact);

      await contactController.getContact(req, res);

      expect(contactModel.getContactById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(contact);
    });

    test('should return 404 if contact is not found', async () => {
      const req = { params: { id: 99 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    
      contactModel.getContactById.mockResolvedValue(null);
    
      await contactController.getContact(req, res);

      expect(contactModel.getContactById).toHaveBeenCalledWith(99);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Contact not found' });
    });

    test('should return 500 if an error occurs while retrieving contact', async () => {
      const req = { params: { id: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    
      contactModel.getContactById.mockRejectedValue(new Error('DB error'));
    
      await contactController.getContact(req, res);

      expect(contactModel.getContactById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to retrieve contact for Contact Id' });
    });
  });

  // Tests for Updating a contact
  describe('PUT /api/contacts/:id', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should return 200 and contact, if contact is successfully updated with name and email', async () => {
      const req = {
        params: { id: 1 },
        body: { name: 'Updated User', email: 'updatedUser@example.com' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const existingContact = { id: 1, name: 'User', email: 'user@example.com' };
      const updatedContact = { id: 1, name: 'Updated User', email: 'updatedUser@example.com' };
      contactModel.getContactById.mockResolvedValue(existingContact);
      contactModel.getContactByEmail.mockResolvedValue(null);
      contactModel.updateContact.mockResolvedValue(updatedContact);
  
      await contactController.updateContact(req, res);
  
      expect(contactModel.getContactById).toHaveBeenCalledWith(1);
      expect(contactModel.getContactByEmail).toHaveBeenCalledWith('updatedUser@example.com');
      expect(contactModel.updateContact).toHaveBeenCalledWith(1, {
        name: 'Updated User',
        email: 'updatedUser@example.com'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedContact);
    });

    test('should return 200 and contact, if contact is successfully updated with only name', async () => {
      const req = {
        params: { id: 1 },
        body: { name: 'Updated User' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    
      const existingContact = { id: 1, name: 'User', email: 'user@example.com' };
      const updatedContact = { id: 1, name: 'Updated User', email: 'user@example.com' };
      contactModel.getContactById.mockResolvedValue(existingContact);
      contactModel.getContactByEmail.mockResolvedValue(null);
      contactModel.updateContact.mockResolvedValue(updatedContact);
  
      await contactController.updateContact(req, res);
  
      expect(contactModel.getContactById).toHaveBeenCalledWith(1);
      expect(contactModel.getContactByEmail).not.toHaveBeenCalled();
      expect(contactModel.updateContact).toHaveBeenCalledWith(1, { name: 'Updated User' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedContact);
    });

    test('should return 200 and contact, if contact is successfully updated with only email', async () => {
      const req = {
        params: { id: 1 },
        body: { email: 'updatedUser@example.com' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    
      const existingContact = { id: 1, name: 'User', email: 'user@example.com' };
      const updatedContact = { id: 1, name: 'User', email: 'updatedUser@example.com' };
      contactModel.getContactById.mockResolvedValue(existingContact);
      contactModel.getContactByEmail.mockResolvedValue(null);
      contactModel.updateContact.mockResolvedValue(updatedContact);
  
      await contactController.updateContact(req, res);

      expect(contactModel.getContactById).toHaveBeenCalledWith(1);
      expect(contactModel.getContactByEmail).toHaveBeenCalledWith('updatedUser@example.com');
      expect(contactModel.updateContact).toHaveBeenCalledWith(1, { email: 'updatedUser@example.com' });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedContact);
    });

    test('should return 400 if no fields are provided for update', async () => {
      const req = {
        params: { id: 1 },
        body: {}
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      contactModel.getContactById.mockResolvedValue({ id: 1, name: 'User', email: 'user@example.com' });
      contactModel.getContactByEmail.mockResolvedValue(null);
      contactModel.updateContact.mockResolvedValue(null);

      await contactController.updateContact(req, res);
    
      expect(contactModel.getContactById).toHaveBeenCalledWith(1);
      expect(contactModel.getContactByEmail).not.toHaveBeenCalled();
      expect(contactModel.updateContact).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'No fields provided for update' });
    });

    test('should return 404 if contact does not exist', async () => {
      const req = {
        params: { id: 99 },
        body: { name: 'Test User' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      contactModel.getContactById.mockResolvedValue(null);
      contactModel.getContactByEmail.mockResolvedValue(null);
      contactModel.updateContact.mockResolvedValue(null);
    
      await contactController.updateContact(req, res);
    
      expect(contactModel.getContactById).toHaveBeenCalledWith(99);
      expect(contactModel.getContactByEmail).not.toHaveBeenCalled();
      expect(contactModel.updateContact).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Contact not found' });
    });

    test('should return 409 if email to be updated already exists', async () => {
      const req = {
        params: { id: 2 },
        body: { email: 'updatedUser@example.com' },
      };
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      const existingCurrentContact = { id: 2, name: 'Test User 2', email: 'user@example.com' };
      const existingUserContact = { id: 1, name: 'Test User 1', email: 'updatedUser@example.com' };
      contactModel.getContactById.mockResolvedValue(existingCurrentContact);
      contactModel.getContactByEmail.mockResolvedValue(existingUserContact);
      contactModel.updateContact.mockResolvedValue(null);
  
      await contactController.updateContact(req, res);
  
      expect(contactModel.getContactById).toHaveBeenCalledWith(2);
      expect(contactModel.getContactByEmail).toHaveBeenCalledWith('updatedUser@example.com');
      expect(contactModel.updateContact).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email already exists' });
    });

    test('should return 500 if an error occurs during update', async () => {
      const req = {
        params: { id: 1 },
        body: { name: 'User 1' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const existingContact = { id: 1, name: 'User', email: 'user@example.com' };
      contactModel.getContactById.mockResolvedValue(existingContact);
      contactModel.getContactByEmail.mockResolvedValue(null);
      contactModel.updateContact.mockRejectedValue(new Error('DB error'));
    
      await contactController.updateContact(req, res);
    
      expect(contactModel.getContactById).toHaveBeenCalledWith(1);
      expect(contactModel.getContactByEmail).not.toHaveBeenCalled();
      expect(contactModel.updateContact).toHaveBeenCalledWith(1, { name: 'User 1' });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to update contact' });
    });
  });

  // Tests for Deleting a contact
  describe('DELETE /api/contacts/:id', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should return 204 when contact is successfully deleted', async () => {
      const req = { params: { id: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        end: jest.fn(),
        json: jest.fn()
      };
    
      contactModel.deleteContact.mockResolvedValue(true);
    
      await contactController.deleteContact(req, res);
    
      expect(contactModel.deleteContact).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.end).toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    test('should return 404 if contact does not exist', async () => {
      const req = { params: { id: 99 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        end: jest.fn()
      };
    
      contactModel.deleteContact.mockResolvedValue(false);
    
      await contactController.deleteContact(req, res);
    
      expect(contactModel.deleteContact).toHaveBeenCalledWith(99);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Contact not found' });
      expect(res.end).not.toHaveBeenCalled();
    });

    test('should return 500 if there is a server error', async () => {
      const req = { params: { id: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        end: jest.fn()
      };
    
      contactModel.deleteContact.mockRejectedValue(new Error('DB error'));
    
      await contactController.deleteContact(req, res);
    
      expect(contactModel.deleteContact).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to delete contact' });
    });
  });

});
