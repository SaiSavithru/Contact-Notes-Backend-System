// Controller for contact
const contactModel = require('../models/contact');
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

exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await withTimeout(
      contactModel.getAllContacts(),
      TIMEOUT_MS
    );

    res.status(200).json(contacts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve contacts' });
  }
};

exports.createContact = async (req, res) => {
  const { name, email } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    const existingContact = await withTimeout(
      contactModel.getContactByEmail(email),
      TIMEOUT_MS
    );

    if (existingContact) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const contact = await withTimeout(
      contactModel.createContact(name, email),
      TIMEOUT_MS
    );
    res.status(201).json(contact);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create contact' });
  }
};

exports.getContact = async (req, res) => {
  const contactId = req.params.id;

  try {
    const contact = await withTimeout(
      contactModel.getContactById(contactId),
      TIMEOUT_MS
    );

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.status(200).json(contact);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve contact for Contact Id' });
  }
};

exports.updateContact = async (req, res) => {
  const contactId = req.params.id;
  const { name, email } = req.body || {};

  const fieldsToUpdate = {};
  if (name !== undefined) fieldsToUpdate.name = name;
  if (email !== undefined) fieldsToUpdate.email = email;

  try {
    const contact = await withTimeout(
      contactModel.getContactById(contactId),
      TIMEOUT_MS
    );

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ error: 'No fields provided for update' });
    }

    if (email !== undefined) {
      const existingContact = await withTimeout(
        contactModel.getContactByEmail(email),
        TIMEOUT_MS
      );

      if (existingContact && existingContact.id !== contactId) {
        return res.status(409).json({ error: 'Email already exists' });
      }
    }

    const updatedContact = await withTimeout(
      contactModel.updateContact(contactId, fieldsToUpdate),
      TIMEOUT_MS
    );
    res.status(200).json(updatedContact);
  } catch (err) {
    // console.error(err);
    res.status(500).json({ error: 'Failed to update contact' });
  }
};

exports.deleteContact = async (req, res) => {
  const contactId = req.params.id;

  try {
    const success = await withTimeout(
      contactModel.deleteContact(contactId),
      TIMEOUT_MS
    );

    if (!success) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete contact' });
  }
};
