const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const db = require('../database/database');
const router = express.Router();

const secret = 'your_jwt_secret';

// Registro
router.post('/register', [
  check('username').not().isEmpty().withMessage('Username é obrigatório'),
  check('email').isEmail().withMessage('Email inválido'),
  check('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) throw err;

    db.run("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, hashedPassword], function (err) {
      if (err) {
        return res.status(500).json({ message: 'Erro ao registrar usuário' });
      }
      const token = jwt.sign({ id: this.lastID, role: 'user' }, secret, { expiresIn: '1h' });
      res.status(201).json({ message: 'Usuário registrado com sucesso', token });
    });
  });
});

// Login
router.post('/login', [
  check('email').isEmail().withMessage('Email inválido'),
  check('password').exists().withMessage('Senha é obrigatória')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao buscar usuário' });
    }

    if (!user) {
      return res.status(400).json({ message: 'Usuário não encontrado' });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) throw err;

      if (isMatch) {
        const token = jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn: '1h' });
        res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
      } else {
        res.status(400).json({ message: 'Senha incorreta' });
      }
    });
  });
});

// Rota para obter informações do usuário logado
router.get('/me', (req, res) => {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ message: 'Nenhum token, autorização negada' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    db.get("SELECT id, username, email, role FROM users WHERE id = ?", [decoded.id], (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Erro ao buscar informações do usuário' });
      }

      if (!user) {
        return res.status(400).json({ message: 'Usuário não encontrado' });
      }

      res.json(user);
    });
  } catch (e) {
    res.status(400).json({ message: 'Token inválido' });
  }
});

module.exports = router;
