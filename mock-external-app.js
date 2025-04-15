const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const PORT = process.env.EXT_PORT || 4001;

app.get('/auth/token', (req, res) => {
  const payload = {
    userId: 1,
    name: 'Mock User',
  };

  const token = jwt.sign(payload, process.env.JWT_EXT_SECRET, { expiresIn: '10s' });
  res.json({ token });
});

app.get('/external-data', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_EXT_SECRET);
    return res.json({ data: `Data from external service, ${decoded.name}` });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});

app.listen(PORT, () => {
  console.log(`Mock external service running on http://localhost:${PORT}`);
});
