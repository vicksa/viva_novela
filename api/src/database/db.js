const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

let db;
let filaExclusiva = Promise.resolve();

/**
 * A conexão SQLite é uma única e compartilhada por todas as requisições, então
 * BEGIN/COMMIT concorrentes na mesma conexão colidem ("cannot start a transaction
 * within a transaction"). runExclusive serializa blocos que precisam de transação
 * (ex: leitura+débito de moedas), garantindo que um termine antes do próximo começar.
 */
function runExclusive(fn) {
  const execucao = filaExclusiva.then(() => fn());
  filaExclusiva = execucao.then(() => {}, () => {});
  return execucao;
}

async function getDb() {
  if (db) return db;
  
  db = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  // Evita erro "database is locked" sob concorrência: espera até 5s antes de falhar.
  await db.run('PRAGMA busy_timeout = 5000');

  await initializeDatabase();
  
  return db;
}

async function initializeDatabase() {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      nome TEXT NOT NULL,
      senha TEXT NOT NULL,
      plano TEXT DEFAULT 'gratuito',
      saldo_moedas INTEGER DEFAULT 0,
      vip_expira_em DATETIME,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      papel TEXT DEFAULT 'leitor'
    );

    CREATE TABLE IF NOT EXISTS historias (
      id TEXT PRIMARY KEY,
      titulo TEXT NOT NULL,
      sinopse TEXT,
      autora TEXT,
      capa_url TEXT,
      genero TEXT,
      tags TEXT,
      destaque BOOLEAN DEFAULT false,
      total_capitulos INTEGER DEFAULT 0,
      status TEXT DEFAULT 'ativo',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS capitulos (
      id TEXT PRIMARY KEY,
      historia_id TEXT NOT NULL,
      titulo TEXT NOT NULL,
      conteudo TEXT NOT NULL,
      numero INTEGER NOT NULL,
      is_gratuito BOOLEAN DEFAULT false,
      custo_moedas INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      publicado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(historia_id) REFERENCES historias(id)
    );

    CREATE TABLE IF NOT EXISTS leituras (
      id TEXT PRIMARY KEY,
      usuario_id TEXT NOT NULL,
      historia_id TEXT NOT NULL,
      capitulo_id TEXT NOT NULL,
      posicao_scroll INTEGER DEFAULT 0,
      percentual_lido REAL DEFAULT 0,
      lido_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(usuario_id) REFERENCES usuarios(id),
      FOREIGN KEY(historia_id) REFERENCES historias(id),
      FOREIGN KEY(capitulo_id) REFERENCES capitulos(id),
      UNIQUE(usuario_id, capitulo_id)
    );
  `);

  try {
    await db.exec(`ALTER TABLE usuarios ADD COLUMN papel TEXT DEFAULT 'leitor';`);
  } catch (error) {
    // A coluna já pode existir
  }
}

module.exports = {
  getDb,
  runExclusive
};
