const express = require('express');
const router = express.Router();
const db = require('../database/database');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Rota para adicionar um novo episódio a um anime existente (apenas administradores)
router.post('/animes/:animeId/episodes', [auth, admin], (req, res, next) => {
  const { title, episodeNumber, description, videoUrl, origin } = req.body;
  const { animeId } = req.params;
  console.log("Recebido POST em /animes/:animeId/episodes com dados:", req.body);
  db.get("SELECT * FROM animes WHERE id = ?", [animeId], (err, row) => {
    if (err) {
      console.error("Erro ao buscar anime:", err);
      next(err);
    } else if (row) {
      db.run("INSERT INTO episodes (animeId, title, episodeNumber, description, videoUrl, origin) VALUES (?, ?, ?, ?, ?, ?)", [animeId, title, episodeNumber, description, videoUrl, origin], function (err) {
        if (err) {
          console.error("Erro ao adicionar episódio:", err);
          next(err);
        } else {
          console.log("Episódio adicionado com sucesso com ID:", this.lastID);
          res.status(201).json({ message: 'Episódio adicionado com sucesso!', id: this.lastID });
        }
      });
    } else {
      res.status(404).json({ message: 'Anime não encontrado no banco de dados local' });
    }
  });
});

module.exports = router;
