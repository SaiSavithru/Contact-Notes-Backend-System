// Middleware to verify JWT tokens in requests:
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
//   console.log("Authentication req", req.headers)
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized! No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = decoded;
    next();
  });
};
