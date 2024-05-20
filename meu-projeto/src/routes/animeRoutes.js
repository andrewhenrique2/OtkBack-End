const express = require('express');
const router = express.Router();
const db = require('../database/database');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Rota para obter informações de um anime específico
router.get('/anime-info/:animeId', (req, res, next) => {
  const animeId = req.params.animeId;
  console.log("Recebido GET em /anime-info com animeId:", animeId);
  db.get("SELECT * FROM animes WHERE id = ?", [animeId], (err, row) => {
    if (err) {
      console.error("Erro ao buscar anime:", err);
      next(err);
    } else if (row) {
      db.all("SELECT id, title, episodeNumber, description, videoUrl FROM episodes WHERE animeId = ?", [animeId], (err, episodes) => {
        if (err) {
          console.error("Erro ao buscar episódios:", err);
          next(err);
        } else {
          console.log("Episódios recuperados do banco de dados:", episodes);
          res.json({ ...row, episodes });
        }
      });
    } else {
      console.log("Anime não encontrado para o animeId:", animeId);
      res.status(404).json({ message: 'Anime não encontrado' });
    }
  });
});

// Rota para obter todos os animes junto com seus episódios
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
          console.log("Animes com episódios recuperados do banco de dados:", animesWithEpisodes);
          res.json(animesWithEpisodes);
        }
      });
    }
  });
});

// Rota para adicionar um novo anime (apenas administradores)
router.post('/animes', [auth, admin], (req, res, next) => {
  const { title, description, imageUrl } = req.body;
  console.log("Recebido POST em /animes com dados:", req.body);
  db.run("INSERT INTO animes (title, description, imageUrl) VALUES (?, ?, ?)", [title, description, imageUrl], function (err) {
    if (err) {
      console.error("Erro ao adicionar anime:", err);
      next(err);
    } else {
      console.log("Anime adicionado com sucesso com ID:", this.lastID);
      res.status(201).json({ message: 'Anime adicionado com sucesso!', id: this.lastID });
    }
  });
});

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

// Rota para remover um anime (apenas administradores)
router.delete('/animes/:animeId', [auth, admin], (req, res, next) => {
  const animeId = req.params.animeId;
  console.log("Recebido DELETE em /animes com animeId:", animeId);

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
          res.status(200).json({ message: 'Anime e episódios deletados com sucesso!' });
        }
      });
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
