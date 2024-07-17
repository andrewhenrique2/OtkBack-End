const express = require('express');
const router = express.Router();
const db = require('../database/database');
const auth = require('../middleware/auth'); // Middleware de autenticação
const admin = require('../middleware/admin'); // Middleware de autorização
const { v4: uuidv4 } = require('uuid'); // Importar uuid

// Rota para obter todos os animes recentes
router.get('/recent-animes', (req, res, next) => {
  db.all("SELECT * FROM recent_animes", [], (err, animes) => {
    if (err) {
      console.error("Erro ao buscar animes recentes:", err);
      next(err); // Passa o erro para o próximo middleware
    } else {
      res.json(animes); // Retorna a lista de animes recentes
    }
  });
});

// Rota para obter um anime recente específico por ID
router.get('/recent-animes/:animeId', (req, res, next) => {
  const animeId = req.params.animeId; // Obtém o animeId dos parâmetros da URL
  db.get("SELECT * FROM recent_animes WHERE id = ?", [animeId], (err, row) => {
    if (err) {
      console.error("Erro ao buscar anime recente:", err);
      next(err); // Passa o erro para o próximo middleware
    } else if (row) {
      res.json(row); // Retorna os dados do anime recente
    } else {
      res.status(404).json({ message: 'Anime recente não encontrado' }); // Anime recente não encontrado
    }
  });
});

// Rota para adicionar um novo anime recente (apenas administradores)
router.post('/recent-animes', [auth, admin], (req, res, next) => {
  const { title, description, imageUrl, episodeNumber, videoUrl } = req.body; // Obtém dados do corpo da requisição
  const id = uuidv4(); // Gera um ID único
  console.log("Recebido POST em /recent-animes com dados:", req.body);
  
  db.run("INSERT INTO recent_animes (id, title, description, imageUrl, episodeNumber, videoUrl) VALUES (?, ?, ?, ?, ?, ?)", 
    [id, title, description, imageUrl, episodeNumber, videoUrl], function (err) {
    if (err) {
      console.error("Erro ao adicionar anime recente:", err);
      next(err); // Passa o erro para o próximo middleware
    } else {
      console.log("Anime recente adicionado com sucesso com ID:", id);
      res.status(201).json({ message: 'Anime recente adicionado com sucesso!', id: id }); // Anime recente adicionado com sucesso
    }
  });
});

// Rota para remover um anime recente (apenas administradores)
router.delete('/recent-animes/:animeId', [auth, admin], (req, res, next) => {
  const animeId = req.params.animeId; // Obtém o animeId dos parâmetros da URL
  console.log("Recebido DELETE em /recent-animes com animeId:", animeId);
  
  db.run("DELETE FROM recent_animes WHERE id = ?", [animeId], function(err) {
    if (err) {
      console.error("Erro ao deletar anime recente:", err);
      next(err); // Passa o erro para o próximo middleware
    } else {
      res.status(200).json({ message: 'Anime recente deletado com sucesso!' }); // Anime recente deletado com sucesso
    }
  });
});

module.exports = router;
