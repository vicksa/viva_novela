const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function createAdmin() {
  const db = await open({ filename: path.join(__dirname, 'database.sqlite'), driver: sqlite3.Database });
  
  // Verifica se o usuário 'admin' já existe
  const existing = await db.get("SELECT * FROM usuarios WHERE email = 'admin'");
  if (existing) {
    const hashed = await bcrypt.hash('123456', 10);
    await db.run("UPDATE usuarios SET senha = ? WHERE email = 'admin'", [hashed]);
    console.log("Usuário admin já existia. Senha resetada para 123456.");
    return;
  }

  const id = crypto.randomUUID();
  const hashedPassword = await bcrypt.hash('123456', 10);

  await db.run(`
    INSERT INTO usuarios (id, email, nome, senha, papel, plano, saldo_moedas) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [id, 'admin', 'Administrador', hashedPassword, 'admin', 'vip', 9999]);

  console.log('Usuário admin criado com sucesso (senha: 123456)!');
}

createAdmin().catch(console.error);
