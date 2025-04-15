# 📒 Contact Notes Backend Service

This is a secure internal backend service that allows users to manage contacts and attach notes to each contact. It features JWT-based authentication, a RESTful API, rate limiting, retry logic, timeouts, error handling, and automatic field normalization.

## 🧩 Features

- JWT Authentication for Contact and Notes endpoints
- Full CRUD for Contacts and Notes
- Field normalization for inbound note data (`note_body`, `note_text` → `body`)
- REST API with Swagger for API documentation
- Graceful error handling, retries with backoff, and timeouts
- Rate limiting simulation for outbound service calls

## 📘 API Documentation

### Contacts Resource

- GET - /api/contacts - Get all contacts
- POST - /api/contacts - Create a new contact
- GET - /api/contacts/:id - Get contact by ID
- PUT - /api/contacts/:id - Update contact by ID
- DELETE - /api/contacts/:id - Delete contact by ID

### Notes Resource

- GET - /api/contacts/:contactId/notes - Get notes for contact
- POST - /api/contacts/:contactId/notes - Create note
- GET - /api/contacts/:contactId/notes/:noteId - Get a specific note
- PUT - /api/contacts/:contactId/notes/:noteId - Update a note
- DELETE - /api/contacts/:contactId/notes/:noteId - Delete a note

## 🧪 Test Cases

- Unit Tests (npm run unit-tests or npm run unit-contacts and npm run unit-notes)
- Integration Tests (npm run integration-tests or npm run integration-contacts and npm run integration-notes)

## 🚀 Getting Started

### 📦 Prerequisites

- Node.js/Express.js
- PostgreSQL (Database)
- `npm` and related dependencies `npm install`
- Jest/Supertest

### ⚙️ Setup and Description

- Read Documentation.txt
