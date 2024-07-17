const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { check, validationResult } = require('express-validator');
const db = require('../database/database');
const auth = require('../middleware/auth'); // Middleware de autenticação
const router = express.Router();

const secret = process.env.JWT_SECRET;

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Registro de usuário
router.post('/register', [
  check('username').not().isEmpty().withMessage('Username é obrigatório'),
  check('email').isEmail().withMessage('Email inválido'),
  check('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Erro de validação:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  // Hash da senha e inserção no banco de dados
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Erro ao hash da senha:', err);
      return res.status(500).json({ message: 'Erro ao hash da senha' });
    }

    db.run("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, hashedPassword], function (err) {
      if (err) {
        console.error('Erro ao inserir usuário no banco de dados:', err);
        return res.status(500).json({ message: 'Erro ao registrar usuário' });
      }
      const token = jwt.sign({ id: this.lastID, role: 'user' }, secret, { expiresIn: '1h' });
      res.status(201).json({ message: 'Usuário registrado com sucesso', token });
    });
  });
});

// Login de usuário
router.post('/login', [
  check('email').isEmail().withMessage('Email inválido'),
  check('password').exists().withMessage('Senha é obrigatória')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Erro de validação:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  // Verificação do usuário e comparação de senhas
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err) {
      console.error('Erro ao buscar usuário no banco de dados:', err);
      return res.status(500).json({ message: 'Erro ao buscar usuário' });
    }

    if (!user) {
      return res.status(400).json({ message: 'Usuário não encontrado' });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Erro ao comparar senhas:', err);
        return res.status(500).json({ message: 'Erro ao comparar senhas' });
      }

      if (isMatch) {
        const token = jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn: '1h' });
        res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
      } else {
        res.status(400).json({ message: 'Senha incorreta' });
      }
    });
  });
});

// Obter informações do usuário logado
router.get('/me', auth, (req, res) => {
  db.get("SELECT id, username, email, role FROM users WHERE id = ?", [req.user.id], (err, user) => {
    if (err) {
      console.error('Erro ao buscar informações do usuário:', err);
      return res.status(500).json({ message: 'Erro ao buscar informações do usuário' });
    }

    if (!user) {
      return res.status(400).json({ message: 'Usuário não encontrado' });
    }

    res.json(user); // Retorna as informações do usuário
  });
});

// Mudar senha do usuário logado
router.put('/change-password', auth, [
  check('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres')
], (req, res) => {
  console.log('Requisição de mudança de senha recebida:', req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Erro de validação:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { password } = req.body;

  // Hash da nova senha e atualização no banco de dados
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Erro ao hash da nova senha:', err);
      return res.status(500).json({ message: 'Erro ao hash da nova senha' });
    }

    db.run("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, req.user.id], function (err) {
      if (err) {
        console.error('Erro ao atualizar senha no banco de dados:', err);
        return res.status(500).json({ message: 'Erro ao alterar senha' });
      }
      res.status(200).json({ message: 'Senha alterada com sucesso' });
    });
  });
});

// Upload de avatar
router.post('/upload-avatar', [auth, upload.single('avatar')], (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhum arquivo enviado' });
  }

  const avatar = req.file.buffer.toString('base64'); // Armazena o avatar como base64
  db.run("UPDATE users SET avatar = ? WHERE id = ?", [avatar, req.user.id], function (err) {
    if (err) {
      console.error('Erro ao fazer upload do avatar:', err);
      return res.status(500).json({ message: 'Erro ao fazer upload do avatar' });
    }
    res.status(200).json({ message: 'Avatar alterado com sucesso' });
  });
});

module.exports = router;
