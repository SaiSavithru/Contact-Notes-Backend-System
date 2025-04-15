// Notes Database Model
const pool = require('../config/db');

const getNotesForContact = async (contactId) => {
  const { rows } = await pool.query('SELECT * FROM notes WHERE contact_id = $1', [contactId]);
  return rows;
};

const createNote = async (contactId, body) => {
  const { rows } = await pool.query(
    'INSERT INTO notes(contact_id, body) VALUES($1, $2) RETURNING *',
    [contactId, body]
  );
  return rows[0];
};

const getNote = async (contactId, noteId) => {
  const { rows } = await pool.query('SELECT * FROM notes WHERE contact_id = $1 AND id=$2', [contactId, noteId]);
  return rows[0];
};

const updateNote = async (noteId, body) => {
  const { rows } = await pool.query(
    'UPDATE notes SET body=$1 WHERE id=$2 RETURNING *',
    [body, noteId]
  );
  return rows[0];
};

const deleteNote = async (noteId) => {
  const { rowCount } = await pool.query('DELETE FROM notes WHERE id = $1', [noteId]);
  return rowCount > 0;
};

module.exports = {
  getNotesForContact,
  getNote,
  createNote,
  updateNote,
  deleteNote,
};
