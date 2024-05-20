const jwt = require('jsonwebtoken');
const secret = 'your_jwt_secret';

const auth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
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
