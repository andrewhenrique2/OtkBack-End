const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('anime.db');

db.serialize(() => {
  try {
    db.run(`CREATE TABLE IF NOT EXISTS animes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      imageUrl TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS episodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      animeId INTEGER,
      title TEXT,
      episodeNumber INTEGER,
      description TEXT,
      videoUrl TEXT,
      origin TEXT,
      FOREIGN KEY(animeId) REFERENCES animes(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      email TEXT,
      password TEXT,
      role TEXT DEFAULT 'user'
    )`);

    // Adicionando a tabela recent_animes
    db.run(`CREATE TABLE IF NOT EXISTS recent_animes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      imageUrl TEXT,
      episodeNumber INTEGER,
      videoUrl TEXT
    )`);

    // Adicionando a tabela films
    db.run(`CREATE TABLE IF NOT EXISTS films (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      imageUrl TEXT,
      videoUrl TEXT
    )`);
  } catch (error) {
    console.error('Erro ao criar tabelas:', error);
  }
});

module.exports = db;
