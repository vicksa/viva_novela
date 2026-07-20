require('dotenv').config();
const { getDb } = require('./db');

/**
 * Promove UM usuário específico a admin (exige o email como argumento —
 * nunca promove todo mundo, para não ser um risco contra dados reais).
 * Uso: node src/database/makeAdmin.js usuario@exemplo.com
 */
async function makeAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Uso: node src/database/makeAdmin.js <email>');
    process.exit(1);
  }

  const db = await getDb();
  const usuario = await db.get('SELECT id FROM usuarios WHERE email = ?', [email]);

  if (!usuario) {
    console.error(`❌ Nenhum usuário encontrado com email ${email}.`);
    process.exit(1);
  }

  await db.run("UPDATE usuarios SET papel = 'admin' WHERE email = ?", [email]);
  console.log(`✅ Usuário ${email} agora é administrador.`);
}

makeAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erro:', error.message || error);
    process.exit(1);
  });
