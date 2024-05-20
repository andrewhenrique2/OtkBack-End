const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const animeRoutes = require('./routes/animeRoutes');
const filmRoutes = require('./routes/filmRoutes');
const authRoutes = require('./routes/authRoutes');
const recentAnimeRoutes = require('./routes/recentAnimeRoutes'); // Adicionado

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use('/api', animeRoutes);
app.use('/api', filmRoutes);
app.use('/api', recentAnimeRoutes); // Adicionado
app.use('/auth', authRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo deu errado!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
