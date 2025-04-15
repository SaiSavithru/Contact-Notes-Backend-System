let mockContacts = [];
let contactIdCounter = 1;

module.exports = {
  getAllContacts: jest.fn(() => Promise.resolve(mockContacts)),

  getContactById: jest.fn((id) =>
    Promise.resolve(mockContacts.find(c => c.id == id))
  ),

  getContactByEmail: jest.fn((email) =>
    Promise.resolve(mockContacts.find(c => c.email == email))
  ),

  createContact: jest.fn((name, email) => {
    const newContact = { id: contactIdCounter++, name, email };
    mockContacts.push(newContact);
    return Promise.resolve(newContact);
  }),

  updateContact: jest.fn((id, fields) => {
    const index = mockContacts.findIndex(c => c.id == id);
    if (index === -1 || Object.keys(fields).length === 0) return Promise.resolve(null);
    mockContacts[index] = {
      ...mockContacts[index],
      ...fields
    };
    return Promise.resolve(mockContacts[index]);
  }),

  deleteContact: jest.fn((id) => {
    const index = mockContacts.findIndex(c => c.id == id);
    if (index === -1) return Promise.resolve(false);
    mockContacts.splice(index, 1);
    return Promise.resolve(true);
  }),

  resetMockData: () => {
    mockContacts = [];
    contactIdCounter = 1;
  }
};
