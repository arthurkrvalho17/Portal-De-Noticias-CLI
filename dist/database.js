"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const DB_PATH = path_1.default.join(__dirname, '..', 'database.sqlite');
const db = new better_sqlite3_1.default(DB_PATH);
exports.db = db;
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
//# sourceMappingURL=database.js.map