const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database/database');
const animeRoutes = require('./routes/animeRoutes');
const episodeRoutes = require('./routes/episodeRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Use o middleware cors para permitir todas as origens
app.use(cors());

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo deu errado!');
});

// Log de solicitações recebidas
app.use((req, res, next) => {
  console.log(`Recebida solicitação ${req.method} em ${req.url}`);
  console.log('Dados recebidos:', req.body); // Adiciona log dos dados recebidos
  next();
});

// Rotas da API
app.use('/api', animeRoutes);
app.use('/api', episodeRoutes);

// Inicie o servidor
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Verifique se o banco de dados está sendo inicializado corretamente
db.serialize(() => {
  console.log('Banco de dados inicializado com sucesso');
});
