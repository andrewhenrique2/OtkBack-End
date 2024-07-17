const express = require('express');
const router = express.Router();
const db = require('../database/database');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { v4: uuidv4 } = require('uuid');

// Rota para obter informações de um anime específico
router.get('/anime-info/:animeId', (req, res, next) => {
  const animeId = req.params.animeId; // Obtém o animeId dos parâmetros da URL
  db.get("SELECT * FROM animes WHERE id = ?", [animeId], (err, row) => {
    if (err) {
      console.error("Erro ao buscar anime:", err);
      next(err); // Passa o erro para o próximo middleware
    } else if (row) {
      // Se o anime for encontrado, busca os episódios
      db.all("SELECT id, title, episodeNumber, description, videoUrl FROM episodes WHERE animeId = ?", [animeId], (err, episodes) => {
        if (err) {
          console.error("Erro ao buscar episódios:", err);
          next(err);
        } else {
          res.json({ ...row, episodes }); // Retorna os dados do anime e episódios
        }
      });
    } else {
      res.status(404).json({ message: 'Anime não encontrado' }); // Anime não encontrado
    }
  });
});

// Rota para obter todos os animes
router.get('/animes', (req, res, next) => {
  db.all("SELECT * FROM animes", [], (err, animes) => {
    if (err) {
      console.error("Erro ao buscar animes:", err);
      next(err);
    } else {
      db.all("SELECT * FROM episodes", [], (err, episodes) => {
        if (err) {
          console.error("Erro ao buscar episódios:", err);
          next(err);
        } else {
          const animesWithEpisodes = animes.map(anime => ({
            ...anime,
            episodes: episodes.filter(episode => episode.animeId === anime.id)
          }));
          res.json(animesWithEpisodes); // Retorna animes com seus episódios
        }
      });
    }
  });
});

// Rota para adicionar um novo anime (apenas administradores)
router.post('/animes', [auth, admin], (req, res, next) => {
  const { title, description, imageUrl } = req.body;
  db.run("INSERT INTO animes (title, description, imageUrl) VALUES (?, ?, ?)", [title, description, imageUrl], function (err) {
    if (err) {
      console.error("Erro ao adicionar anime:", err);
      next(err);
    } else {
      res.status(201).json({ message: 'Anime adicionado com sucesso!', id: this.lastID }); // Anime adicionado com sucesso
    }
  });
});

// Rota para adicionar um novo episódio a um anime existente (apenas administradores)
router.post('/animes/:animeId/episodes', [auth, admin], (req, res, next) => {
  const { title, episodeNumber, description, videoUrl, origin } = req.body;
  const { animeId } = req.params;
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
          res.status(201).json({ message: 'Episódio adicionado com sucesso!', id: this.lastID }); // Episódio adicionado com sucesso
        }
      });
    } else {
      res.status(404).json({ message: 'Anime não encontrado no banco de dados local' }); // Anime não encontrado
    }
  });
});

// Rota para remover um anime (apenas administradores)
router.delete('/animes/:animeId', [auth, admin], (req, res, next) => {
  const animeId = req.params.animeId;
  db.run("DELETE FROM episodes WHERE animeId = ?", [animeId], function(err) {
    if (err) {
      console.error("Erro ao deletar episódios do anime:", err);
      next(err);
    } else {
      db.run("DELETE FROM animes WHERE id = ?", [animeId], function(err) {
        if (err) {
          console.error("Erro ao deletar anime:", err);
          next(err);
        } else {
          res.status(200).json({ message: 'Anime e episódios deletados com sucesso!' }); // Anime e episódios deletados com sucesso
        }
      });
    }
  });
});

module.exports = router;
