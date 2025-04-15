let mockNotes = [];
let noteIdCounter = 1;

module.exports = {
  getNotesForContact: jest.fn((contactId) =>
    Promise.resolve(mockNotes.filter(note => note.contact_id == contactId))
  ),

  getNote: jest.fn((contactId, noteId) =>
    Promise.resolve(
      mockNotes.find(note => note.contact_id == contactId && note.id == noteId)
    )
  ),

  createNote: jest.fn((contactId, body) => {
    const newNote = {
      id: noteIdCounter++,
      contact_id: contactId,
      body,
    };

    mockNotes.push(newNote);
    return Promise.resolve(newNote);
  }),

  updateNote: jest.fn((noteId, body) => {
    const index = mockNotes.findIndex(note => note.id == noteId);
    if (index === -1) return Promise.resolve(null);

    mockNotes[index] = { ...mockNotes[index], body };
    return Promise.resolve(mockNotes[index]);
  }),

  deleteNote: jest.fn((noteId) => {
    const index = mockNotes.findIndex(note => note.id == noteId);
    if (index === -1) return Promise.resolve(false);

    mockNotes.splice(index, 1);
    return Promise.resolve(true);
  }),

  resetMockData: () => {
    mockNotes = [];
    noteIdCounter = 1;
  }
};
