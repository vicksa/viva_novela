const { getDb } = require('../database/db');
const seed = require('./seed');

async function seedIfEmpty() {
  const db = await getDb();
  const { count } = await db.get('SELECT COUNT(*) as count FROM historias');

  if (count > 0) {
    console.log(`ℹ️  Banco já tem ${count} história(s), pulando seed automático.`);
    return;
  }

  console.log('🌱 Banco vazio, rodando seed automático...');
  await seed();
}

seedIfEmpty()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erro no seed automático:', error.message || error);
    process.exit(1);
  });
