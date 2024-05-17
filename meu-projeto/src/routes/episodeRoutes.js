const express = require('express');
const router = express.Router();
const db = require('../database/database');

// Rota para adicionar um novo episódio a um anime existente
router.post('/animes/:animeId/episodes', (req, res, next) => {
  const { title, episodeNumber, description, videoUrl } = req.body;
  const { animeId } = req.params;
  db.run("INSERT INTO episodes (animeId, title, episodeNumber, description, videoUrl) VALUES (?, ?, ?, ?, ?)", [animeId, title, episodeNumber, description, videoUrl], function (err) {
    if (err) {
      next(err);
    } else {
      res.status(201).json({ message: 'Episódio adicionado com sucesso!' });
    }
  });
});

module.exports = router;
