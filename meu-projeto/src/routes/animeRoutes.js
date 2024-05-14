const express = require('express');
const router = express.Router();
const db = require('../database/database');

// Rota para adicionar um novo anime
router.post('/animes', async (req, res, next) => {
  try {
    const { title, description, imageUrl, score } = req.body;
    // Lógica para adicionar o novo anime ao banco de dados, incluindo o score
    await db.run("INSERT INTO animes (title, description, imageUrl, score) VALUES (?, ?, ?, ?)", [title, description, imageUrl, score]);
    res.status(201).json({ message: 'Anime adicionado com sucesso!' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
