const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Defina o caminho para o arquivo de banco de dados
const dbPath = path.resolve(__dirname, 'anime.db');

// Verifique se o arquivo de banco de dados existe
if (!fs.existsSync(dbPath)) {
  console.error('Erro: O arquivo de banco de dados não foi encontrado no caminho:', dbPath);
  process.exit(1); // Sai do processo com um código de erro
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao abrir o banco de dados:', err.message);
    process.exit(1); // Sai do processo com um código de erro
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

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
