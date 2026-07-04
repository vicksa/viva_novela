const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

async function update() {
  const db = await open({ filename: path.join(__dirname, 'database.sqlite'), driver: sqlite3.Database });
  await db.run("UPDATE usuarios SET papel = 'admin'");
  console.log('Todos os usuários agora são administradores.');
}

update().catch(console.error);
