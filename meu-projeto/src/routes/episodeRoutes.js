const express = require('express');
const router = express.Router();
const db = require('../database/database');

// Rota para adicionar um novo episódio a um anime existente
router.post('/animes/:animeId/episodes', async (req, res, next) => {
  try {
    const { title, episodeNumber, description, videoUrl } = req.body;
    const { animeId } = req.params;
    // Lógica para adicionar o novo episódio ao banco de dados
    await db.run("INSERT INTO episodes (animeId, title, episodeNumber, description, videoUrl) VALUES (?, ?, ?, ?, ?)", [animeId, title, episodeNumber, description, videoUrl]);
    res.status(201).json({ message: 'Episódio adicionado com sucesso!' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
