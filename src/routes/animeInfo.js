const express = require('express');
const router = express.Router();
const db = require('../database/database');
const axios = require('axios');

// Rota para obter informações de um anime específico
router.get('/anime-info/:animeId', async (req, res, next) => {
  const animeId = req.params.animeId; // Obtém o animeId dos parâmetros da URL
  console.log("Recebido GET em /anime-info com animeId:", animeId);

  try {
    // Busca o anime no banco de dados local pelo id
    db.get("SELECT * FROM animes WHERE id = ?", [animeId], (err, row) => {
      if (err) {
        // Se houver um erro na consulta, loga o erro e passa para o próximo middleware de erro
        console.error("Erro ao buscar anime:", err);
        next(err);
      } else if (row) {
        // Se o anime for encontrado no banco de dados, busca os episódios associados
        db.all("SELECT id, title, episodeNumber, description, videoUrl FROM episodes WHERE animeId = ?", [animeId], (err, episodes) => {
          if (err) {
            // Se houver um erro ao buscar os episódios, loga o erro e passa para o próximo middleware de erro
            console.error("Erro ao buscar episódios:", err);
            next(err);
          } else {
            // Se os episódios forem encontrados, loga-os e retorna a resposta com os dados do anime e seus episódios
            console.log("Episódios recuperados do banco de dados:", episodes);
            res.json({ ...row, episodes });
          }
        });
      } else {
        // Caso não encontre o anime no banco de dados local, busca na API do Kitsu
        axios.get(`https://kitsu.io/api/edge/anime/${animeId}?include=genres`)
          .then(response => {
            const animeData = response.data.data; // Obtém os dados do anime da resposta da API
            if (animeData) {
              // Se o anime for encontrado na API do Kitsu, retorna os dados do anime
              res.json(animeData);
            } else {
              // Se o anime não for encontrado na API do Kitsu, retorna um erro 404
              res.status(404).json({ message: 'Anime não encontrado na API do Kitsu' });
            }
          })
          .catch(apiError => {
            // Se houver um erro ao buscar na API do Kitsu, loga o erro e retorna um erro 404
            console.error("Erro ao buscar anime na API do Kitsu:", apiError);
            res.status(404).json({ message: 'Erro ao buscar anime na API do Kitsu' });
          });
      }
    });
  } catch (error) {
    // Se houver um erro no bloco try, passa para o próximo middleware de erro
    next(error);
  }
});

module.exports = router;
