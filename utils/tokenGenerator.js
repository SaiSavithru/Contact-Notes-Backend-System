const jwt = require('jsonwebtoken');

const token = jwt.sign({ user: 'test-user' }, 'mySuperSecretKey', { expiresIn: '2h' });
console.log(token);
