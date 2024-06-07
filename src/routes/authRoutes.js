const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { check, validationResult } = require('express-validator');
const db = require('../database/database');
const auth = require('../middleware/auth');  // Adicione esta linha para importar o middleware `auth`
const router = express.Router();

const secret = 'your_jwt_secret';

const storage = multer.memoryStorage();
const upload = multer({ storage });

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
router.get('/me', auth, (req, res) => {
  db.get("SELECT id, username, email, role FROM users WHERE id = ?", [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao buscar informações do usuário' });
    }

    if (!user) {
      return res.status(400).json({ message: 'Usuário não encontrado' });
    }

    res.json(user);
  });
});

// Rota para mudar a senha do usuário logado
router.put('/change-password', auth, [
  check('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres')
], (req, res) => {
  console.log('Requisição de mudança de senha recebida:', req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { password } = req.body;

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) throw err;

    db.run("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, req.user.id], function (err) {
      if (err) {
        return res.status(500).json({ message: 'Erro ao alterar senha' });
      }
      res.status(200).json({ message: 'Senha alterada com sucesso' });
    });
  });
});

// Rota para upload de avatar
router.post('/upload-avatar', [auth, upload.single('avatar')], (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhum arquivo enviado' });
  }

  const avatar = req.file.buffer.toString('base64'); // Exemplo de armazenamento como base64 no banco de dados
  db.run("UPDATE users SET avatar = ? WHERE id = ?", [avatar, req.user.id], function (err) {
    if (err) {
      return res.status(500).json({ message: 'Erro ao fazer upload do avatar' });
    }
    res.status(200).json({ message: 'Avatar alterado com sucesso' });
  });
});

module.exports = router;
