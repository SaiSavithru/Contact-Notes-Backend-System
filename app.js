const express = require('express');
require('dotenv').config();
const rateLimit = require('express-rate-limit');
const authMiddleware = require('./middleware/authentication');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
const makeAuthenticatedRequest = require('./utils/fetchTokenAndRetry');

const contactsRoute = require('./routes/contacts');
const notesRoute = require('./routes/notes');

const app = express();
app.use(express.json());

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/contacts', authMiddleware, contactsRoute);
app.use('/api/contacts/:contactId/notes', authMiddleware, notesRoute);
app.get('/api/external-service', async (req, res) => {
  try {
    const data = await makeAuthenticatedRequest({
      method: 'GET',
      url: 'http://localhost:4001/external-data',
    });

    res.json(data.data);
    console.log("Data from external-service:", data.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

// 404 handler (for unmatched routes)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("Something went wrong!", err);
  res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;
