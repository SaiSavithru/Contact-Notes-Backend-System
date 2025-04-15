// Contact Database Model
const pool = require('../config/db');

const getAllContacts = async () => {
  const { rows } = await pool.query('SELECT * FROM contacts');
  return rows;
};

const getContactById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM contacts WHERE id = $1', [id]);
  return rows[0];
};

const getContactByEmail = async (email) => {
  const { rows } = await pool.query('SELECT * FROM contacts WHERE LOWER(email) = LOWER($1)', [email]);
  return rows[0];
}

const createContact = async (name, email) => {
  const { rows } = await pool.query(
    'INSERT INTO contacts(name, email) VALUES($1, $2) RETURNING *',
    [name, email]
  );
  return rows[0];
};

const updateContact = async (id, fields) => {
  const keys = Object.keys(fields);
  if (keys.length === 0) return null;
  
  const setClause = keys.map((key, idx) => `${key} = $${idx + 1}`).join(', ');
  const values = keys.map(key => fields[key]);
  
  const query = `UPDATE contacts SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
  const { rows } = await pool.query(query, [...values, id]);
  
  return rows[0];
};

const deleteContact = async (id) => {
  const { rowCount } = await pool.query('DELETE FROM contacts WHERE id = $1', [id]);
  return rowCount > 0;
};

module.exports = {
  getAllContacts,
  getContactById,
  getContactByEmail,
  createContact,
  updateContact,
  deleteContact,
};
