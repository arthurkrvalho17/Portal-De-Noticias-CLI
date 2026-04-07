import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', 'database.sqlite');

const db = new Database(DB_PATH);

// Habilitar foreign keys
db.pragma('foreign_keys = ON');

// Criar tabelas se não existirem
db.exec(`
  CREATE TABLE IF NOT EXISTS uf (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    sigla TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS cidade (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    uf_id INTEGER NOT NULL,
    FOREIGN KEY (uf_id) REFERENCES uf(id)
  );

  CREATE TABLE IF NOT EXISTS noticia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    texto TEXT NOT NULL,
    cidade_id INTEGER NOT NULL,
    data_criacao DATETIME NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (cidade_id) REFERENCES cidade(id)
  );
`);

export { db };
