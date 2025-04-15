// Controller for notes
const contactModel = require('../models/contact');
const noteModel = require('../models/note');
const retryWithBackOff = require('../utils/retryWithBackOff');
const { produceNoteEvent } = require('../kafka/producer');
const TIMEOUT_MS = 5000;

function withTimeout(promise, timeoutMs) {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('Request timed out'));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise])
    .finally(() => clearTimeout(timeoutId));
}

exports.getNotesForContact = async (req, res) => {
  const contactId = req.params.contactId;

  try {
    const contact = await withTimeout(
      contactModel.getContactById(contactId),
      TIMEOUT_MS
    );
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const notes = await withTimeout(
      noteModel.getNotesForContact(contactId),
      TIMEOUT_MS
    );
    if (!notes || notes.length === 0) {
      return res.status(404).json({ error: 'No notes found' });
    }

    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve notes for contact' });
  }
};

exports.createNote = async (req, res) => {
  const contactId = req.params.contactId;
  const { body } = req.body || {};

  try {
    const contact = await withTimeout(
      contactModel.getContactById(contactId),
      TIMEOUT_MS
    );

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    if (!body) {
      return res.status(400).json({ error: 'Note Body is required' });
    }

    const note = await withTimeout(
      noteModel.createNote(contactId, body),
      TIMEOUT_MS
    );

    await retryWithBackOff(() => produceNoteEvent(note));
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create note' });
  }
};

exports.getNote = async (req, res) => {
  const contactId = req.params.contactId;
  const noteId = req.params.noteId;

  try {
    const contact = await withTimeout(
      contactModel.getContactById(contactId),
      TIMEOUT_MS
    );
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const note = await withTimeout(
      noteModel.getNote(contactId, noteId),
      TIMEOUT_MS
    );
    if (!note || note.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve note' });
  }
};

exports.updateNote = async (req, res) => {
    const contactId = req.params.contactId;
    const noteId = req.params.noteId;
    const { body } = req.body || {};

    try {
      const contact = await withTimeout(
        contactModel.getContactById(contactId),
        TIMEOUT_MS
      );
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }

      const note = await withTimeout(
        noteModel.getNote(contactId, noteId),
        TIMEOUT_MS
      );
      if (!note || note.length === 0) {
        return res.status(404).json({ error: 'Note not found' });
      }
      if (!body || body.length === 0) {
        return res.status(400).json({ error: 'Note Body is required' });
      }

      const updatedNote = await withTimeout(
        noteModel.updateNote(noteId, body),
        TIMEOUT_MS
      );

      await retryWithBackOff(() => produceNoteEvent(updatedNote));
      res.status(200).json(updatedNote);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update note' });
    }
};

exports.deleteNote = async (req, res) => {
  const contactId = req.params.contactId;
  const noteId = req.params.noteId;

  try {
    const contact = await withTimeout(
      contactModel.getContactById(contactId),
      TIMEOUT_MS
    );
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const note = await withTimeout(
      noteModel.getNote(contactId, noteId),
      TIMEOUT_MS
    );
    if (!note || note.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const _ = await withTimeout(
      noteModel.deleteNote(noteId),
      TIMEOUT_MS
    );
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
};
