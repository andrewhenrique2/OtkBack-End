const sqlite3 = require('sqlite3').verbose();

// Crie uma nova instância do banco de dados SQLite
const db = new sqlite3.Database('anime.db');

// Crie a tabela de animes se ainda não existir
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS animes (id INTEGER PRIMARY KEY, title TEXT, description TEXT, imageUrl TEXT, score INTEGER)");

  // Crie a tabela de episódios se ainda não existir
  db.run("CREATE TABLE IF NOT EXISTS episodes (id INTEGER PRIMARY KEY, animeId INTEGER, title TEXT, episodeNumber INTEGER, description TEXT, videoUrl TEXT, FOREIGN KEY(animeId) REFERENCES animes(id))");
});

module.exports = db;
