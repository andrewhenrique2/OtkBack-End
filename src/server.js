const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const animeRoutes = require('./routes/animeRoutes');
const filmRoutes = require('./routes/filmRoutes');
const authRoutes = require('./routes/authRoutes');
const recentAnimeRoutes = require('./routes/recentAnimeRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar CSP
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    connectSrc: ["'self'", 'https://kitsu.io']
  }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Adicionando rotas
app.use('/api', animeRoutes);
app.use('/api', filmRoutes);
app.use('/api', recentAnimeRoutes);
app.use('/auth', authRoutes);

// Adicionando rota básica para verificar a API
app.get('/', (req, res) => {
  res.send('API está funcionando');
});

// Middleware para lidar com erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo deu errado!');
});

// Iniciando o servidor
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
