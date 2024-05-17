const express = require('express');
const router = express.Router();
const db = require('../database/database');

// Rota para obter todos os animes
router.get('/animes', (req, res, next) => {
  db.all("SELECT * FROM animes", [], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar animes:", err);
      next(err);
    } else {
      console.log("Animes recuperados do banco de dados:", rows);
      res.json(rows);
    }
  });
});

// Rota para adicionar um novo anime
router.post('/animes', (req, res, next) => {
  const { title, description, imageUrl, episodeNumber, videoUrl } = req.body; // Inclua videoUrl
  console.log("Recebido POST em /animes com dados:", req.body);
  db.run("INSERT INTO animes (title, description, imageUrl, episodeNumber, videoUrl) VALUES (?, ?, ?, ?, ?)", [title, description, imageUrl, episodeNumber, videoUrl], function (err) { // Inclua videoUrl
    if (err) {
      console.error("Erro ao adicionar anime:", err);
      next(err);
    } else {
      console.log("Anime adicionado com sucesso com ID:", this.lastID);
      res.status(201).json({ message: 'Anime adicionado com sucesso!', id: this.lastID });
    }
  });
});

// Rota para obter informações de um anime específico
router.get('/anime-info/:animeId', (req, res, next) => {
  const animeId = req.params.animeId;
  console.log("Recebido GET em /anime-info com animeId:", animeId);
  db.get("SELECT * FROM animes WHERE id = ?", [animeId], (err, row) => {
    if (err) {
      next(err);
    } else if (row) {
      db.all("SELECT title FROM episodes WHERE animeId = ?", [animeId], (err, episodes) => {
        if (err) {
          next(err);
        } else {
          res.json({ ...row, episodes });
        }
      });
    } else {
      res.status(404).json({ message: 'Anime não encontrado' });
    }
  });
});

module.exports = router;
