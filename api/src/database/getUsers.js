const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

async function getUsers() {
  const db = await open({ filename: path.join(__dirname, 'database.sqlite'), driver: sqlite3.Database });
  const users = await db.all("SELECT id, email, nome, papel FROM usuarios");
  console.log(JSON.stringify(users, null, 2));
}

getUsers().catch(console.error);
