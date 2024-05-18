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
});

module.exports = db;
