const express = require('express');
const router = express.Router();
const db = require('../database/database');
const axios = require('axios');

// Rota para obter informações de um anime específico
router.get('/anime-info/:animeId', async (req, res, next) => {
  const animeId = req.params.animeId;
  console.log("Recebido GET em /anime-info com animeId:", animeId);

  try {
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
        // Caso não encontre no banco de dados local, busca na API do Kitsu
        axios.get(`https://kitsu.io/api/edge/anime/${animeId}?include=genres`)
          .then(response => {
            const animeData = response.data.data;
            if (animeData) {
              res.json(animeData);
            } else {
              res.status(404).json({ message: 'Anime não encontrado na API do Kitsu' });
            }
          })
          .catch(apiError => {
            console.error("Erro ao buscar anime na API do Kitsu:", apiError);
            res.status(404).json({ message: 'Erro ao buscar anime na API do Kitsu' });
          });
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
