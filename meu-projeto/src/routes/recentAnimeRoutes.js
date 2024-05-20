const express = require('express');
const router = express.Router();
const db = require('../database/database');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Rota para obter todos os animes recentes
router.get('/recent-animes', (req, res, next) => {
  db.all("SELECT * FROM recent_animes", [], (err, animes) => {
    if (err) {
      console.error("Erro ao buscar animes recentes:", err);
      next(err);
    } else {
      res.json(animes);
    }
  });
});

// Rota para adicionar um novo anime recente (apenas administradores)
router.post('/recent-animes', [auth, admin], (req, res, next) => {
  const { title, description, imageUrl, episodeNumber, videoUrl } = req.body;
  console.log("Recebido POST em /recent-animes com dados:", req.body);
  db.run("INSERT INTO recent_animes (title, description, imageUrl, episodeNumber, videoUrl) VALUES (?, ?, ?, ?, ?)", [title, description, imageUrl, episodeNumber, videoUrl], function (err) {
    if (err) {
      console.error("Erro ao adicionar anime recente:", err);
      next(err);
    } else {
      console.log("Anime recente adicionado com sucesso com ID:", this.lastID);
      res.status(201).json({ message: 'Anime recente adicionado com sucesso!', id: this.lastID });
    }
  });
});

// Rota para remover um anime recente (apenas administradores)
router.delete('/recent-animes/:animeId', [auth, admin], (req, res, next) => {
  const animeId = req.params.animeId;
  console.log("Recebido DELETE em /recent-animes com animeId:", animeId);

  db.run("DELETE FROM recent_animes WHERE id = ?", [animeId], function(err) {
    if (err) {
      console.error("Erro ao deletar anime recente:", err);
      next(err);
    } else {
      res.status(200).json({ message: 'Anime recente deletado com sucesso!' });
    }
  });
});

module.exports = router;
