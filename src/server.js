require('dotenv').config(); // Carrega variáveis de ambiente
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');

// Importando rotas
const animeRoutes = require('./routes/animeRoutes');
const filmRoutes = require('./routes/filmRoutes');
const authRoutes = require('./routes/authRoutes');
const recentAnimeRoutes = require('./routes/recentAnimeRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Caminhos do banco de dados
const source = path.join(__dirname, 'database', 'anime.db');
const destination = path.join(__dirname, 'database', 'backup_anime.db');

// Verifica se o arquivo de banco de dados existe e faz uma cópia de backup
if (fs.existsSync(source)) {
    fs.copyFileSync(source, destination);
    console.log('Arquivo copiado com sucesso.');
} else {
    console.error('Erro: arquivo não encontrado:', source);
}

// Configurar Content Security Policy (CSP)
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    connectSrc: ["'self'", 'https://kitsu.io']
  }
}));

app.use(bodyParser.json()); // Middleware para parsear JSON
app.use(bodyParser.urlencoded({ extended: true })); // Middleware para parsear URL-encoded
app.use(cors()); // Habilita CORS

// Adicionando rotas
app.use('/api', animeRoutes);
app.use('/api', filmRoutes);
app.use('/api', recentAnimeRoutes);
app.use('/auth', authRoutes);

// Rota básica para verificar a API
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
