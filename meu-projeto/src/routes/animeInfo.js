const express = require('express');
const router = express.Router();
const db = require('../database/database');

// Rota para obter informações de um anime específico
router.get('/anime-info/:animeId', async (req, res, next) => {
  try {
    const animeId = req.params.animeId;
    // Lógica para buscar as informações do anime no banco de dados usando o ID
    const animeInfo = await db.get("SELECT * FROM animes WHERE id = ?", [animeId]);
    res.json(animeInfo);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
