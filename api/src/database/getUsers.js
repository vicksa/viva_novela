require('dotenv').config();
const { getDb } = require('./db');

async function getUsers() {
  const db = await getDb();
  const users = await db.all('SELECT id, email, nome, papel FROM usuarios');
  console.log(JSON.stringify(users, null, 2));
}

getUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erro:', error.message || error);
    process.exit(1);
  });
