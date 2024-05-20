const express = require('express');
const router = express.Router();
const db = require('../database/database');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Rota para obter informações de um filme específico
router.get('/film-info/:filmId', (req, res, next) => {
  const filmId = req.params.filmId;
  console.log("Recebido GET em /film-info com filmId:", filmId);
  db.get("SELECT * FROM films WHERE id = ?", [filmId], (err, row) => {
    if (err) {
      console.error("Erro ao buscar filme:", err);
      next(err);
    } else if (row) {
      res.json(row);
    } else {
      res.status(404).json({ message: 'Filme não encontrado' });
    }
  });
});

// Rota para obter todos os filmes
router.get('/films', (req, res, next) => {
  db.all("SELECT * FROM films", [], (err, films) => {
    if (err) {
      console.error("Erro ao buscar filmes:", err);
      next(err);
    } else {
      res.json(films);
    }
  });
});

// Rota para adicionar um novo filme (apenas administradores)
router.post('/films', [auth, admin], (req, res, next) => {
  const { title, description, imageUrl, videoUrl } = req.body;
  console.log("Recebido POST em /films com dados:", req.body);
  db.run("INSERT INTO films (title, description, imageUrl, videoUrl) VALUES (?, ?, ?, ?)", [title, description, imageUrl, videoUrl], function (err) {
    if (err) {
      console.error("Erro ao adicionar filme:", err);
      next(err);
    } else {
      console.log("Filme adicionado com sucesso com ID:", this.lastID);
      res.status(201).json({ message: 'Filme adicionado com sucesso!', id: this.lastID });
    }
  });
});

// Rota para remover um filme (apenas administradores)
router.delete('/films/:filmId', [auth, admin], (req, res, next) => {
  const filmId = req.params.filmId;
  console.log("Recebido DELETE em /films com filmId:", filmId);

  db.run("DELETE FROM films WHERE id = ?", [filmId], function(err) {
    if (err) {
      console.error("Erro ao deletar filme:", err);
      next(err);
    } else {
      res.status(200).json({ message: 'Filme deletado com sucesso!' });
    }
  });
});

module.exports = router;
