const { Pool } = require('pg');
const config = require('../config');

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

/**
 * Os controllers escrevem SQL com placeholders posicionais `?` (herdados da
 * era SQLite). O Postgres exige `$1, $2, ...` — converte automaticamente na
 * ordem em que aparecem, para não precisar reescrever cada query manualmente.
 */
function toPgSql(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

function wrapQueryable(queryable) {
  return {
    async get(sql, params = []) {
      const result = await queryable.query(toPgSql(sql), params);
      return result.rows[0];
    },
    async all(sql, params = []) {
      const result = await queryable.query(toPgSql(sql), params);
      return result.rows;
    },
    async run(sql, params = []) {
      return queryable.query(toPgSql(sql), params);
    },
  };
}

async function getDb() {
  return wrapQueryable(getPool());
}

/**
 * Executa fn(db) dentro de uma transação real do Postgres, usando um único
 * client dedicado do pool (BEGIN/COMMIT/ROLLBACK). Use para operações que
 * precisam ser atômicas (ex: checar saldo + debitar moedas + criar leitura).
 */
async function withTransaction(fn) {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const db = wrapQueryable(client);
    const result = await fn(db);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  getDb,
  withTransaction,
};
