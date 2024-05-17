const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('anime.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS animes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    imageUrl TEXT,
    episodeNumber INTEGER,
    videoUrl TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS episodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    animeId INTEGER,
    title TEXT,
    episodeNumber INTEGER,
    description TEXT,
    videoUrl TEXT,
    FOREIGN KEY(animeId) REFERENCES animes(id)
  )`);

  // Adicione esta linha para incluir a coluna videoUrl na tabela animes, se ainda não existir
  db.run("ALTER TABLE animes ADD COLUMN videoUrl TEXT", (err) => {
    if (err) {
      if (err.message.includes("duplicate column name")) {
        console.log("Coluna videoUrl já existe.");
      } else {
        console.error("Erro ao adicionar coluna videoUrl:", err);
      }
    } else {
      console.log("Coluna videoUrl adicionada com sucesso.");
    }
  });
});

module.exports = db;
