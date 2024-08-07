const express = require('express');
const router = express.Router();
const db = require('../database/database');
const auth = require('../middleware/auth'); // Middleware de autenticação
const admin = require('../middleware/admin'); // Middleware de autorização
const { v4: uuidv4 } = require('uuid'); // Importar uuid

// Rota para obter informações de um filme específico
router.get('/film-info/:filmId', (req, res, next) => {
  const filmId = req.params.filmId; // Obtém o filmId dos parâmetros da URL
  db.get("SELECT * FROM films WHERE id = ?", [filmId], (err, row) => {
    if (err) {
      console.error("Erro ao buscar filme:", err);
      next(err); // Passa o erro para o próximo middleware
    } else if (row) {
      res.json(row); // Retorna os dados do filme
    } else {
      res.status(404).json({ message: 'Filme não encontrado' }); // Filme não encontrado
    }
  });
});

// Rota para obter todos os filmes
router.get('/films', (req, res, next) => {
  db.all("SELECT * FROM films", [], (err, films) => {
    if (err) {
      console.error("Erro ao buscar filmes:", err);
      next(err); // Passa o erro para o próximo middleware
    } else {
      res.json(films); // Retorna a lista de filmes
    }
  });
});

// Rota para adicionar um novo filme (apenas administradores)
router.post('/films', [auth, admin], (req, res, next) => {
  const { title, description, imageUrl, videoUrl } = req.body; // Obtém dados do corpo da requisição
  const id = uuidv4(); // Gera um ID único
  console.log("Recebido POST em /films com dados:", req.body);
  
  db.run("INSERT INTO films (id, title, description, imageUrl, videoUrl) VALUES (?, ?, ?, ?, ?)", 
    [id, title, description, imageUrl, videoUrl], function (err) {
    if (err) {
      console.error("Erro ao adicionar filme:", err);
      next(err); // Passa o erro para o próximo middleware
    } else {
      console.log("Filme adicionado com sucesso com ID:", id);
      res.status(201).json({ message: 'Filme adicionado com sucesso!', id: id }); // Filme adicionado com sucesso
    }
  });
});

// Rota para remover um filme (apenas administradores)
router.delete('/films/:filmId', [auth, admin], (req, res, next) => {
  const filmId = req.params.filmId; // Obtém o filmId dos parâmetros da URL
  db.run("DELETE FROM films WHERE id = ?", [filmId], function(err) {
    if (err) {
      console.error("Erro ao deletar filme:", err);
      next(err); // Passa o erro para o próximo middleware
    } else {
      res.status(200).json({ message: 'Filme deletado com sucesso!' }); // Filme deletado com sucesso
    }
  });
});

module.exports = router;
