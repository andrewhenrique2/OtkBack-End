// src/database/database.js
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

    db.run(`CREATE TABLE IF NOT EXISTS recent_animes (
      id TEXT PRIMARY KEY,
      title TEXT,
      description TEXT,
      imageUrl TEXT,
      episodeNumber INTEGER,
      videoUrl TEXT
    )`);

    // Atualize a tabela films para usar TEXT para o id
    db.run(`CREATE TABLE IF NOT EXISTS films (
      id TEXT PRIMARY KEY,
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
