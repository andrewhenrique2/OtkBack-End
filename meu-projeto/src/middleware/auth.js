// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const secret = 'your_jwt_secret';

const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ message: 'Nenhum token, autorização negada' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(400).json({ message: 'Token inválido' });
  }
};

module.exports = auth;
