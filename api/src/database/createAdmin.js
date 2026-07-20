require('dotenv').config();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { getDb } = require('./db');

/**
 * Cria (ou reseta a senha de) a conta admin, usando credenciais fornecidas
 * via variáveis de ambiente — nunca hardcoded. Uso:
 *   ADMIN_EMAIL=voce@exemplo.com ADMIN_PASSWORD=senha-forte node src/database/createAdmin.js
 */
async function createAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const senha = process.env.ADMIN_PASSWORD;
  const nome = process.env.ADMIN_NOME || 'Administrador';

  if (!email || !senha) {
    console.error('❌ Defina ADMIN_EMAIL e ADMIN_PASSWORD nas variáveis de ambiente antes de rodar este script.');
    process.exit(1);
  }

  if (senha.length < 8) {
    console.error('❌ ADMIN_PASSWORD deve ter pelo menos 8 caracteres.');
    process.exit(1);
  }

  const db = await getDb();
  const hashed = await bcrypt.hash(senha, 10);

  const existing = await db.get('SELECT id FROM usuarios WHERE email = ?', [email]);
  if (existing) {
    await db.run(
      'UPDATE usuarios SET senha = ?, papel = ? WHERE email = ?',
      [hashed, 'admin', email]
    );
    console.log(`✅ Usuário admin (${email}) já existia. Senha atualizada e papel garantido como 'admin'.`);
    return;
  }

  const id = crypto.randomUUID();
  await db.run(
    `INSERT INTO usuarios (id, email, nome, senha, papel, plano, saldo_moedas)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, email, nome, hashed, 'admin', 'vip', 9999]
  );

  console.log(`✅ Usuário admin criado com sucesso: ${email}`);
}

createAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erro ao criar/atualizar admin:', error.message || error);
    process.exit(1);
  });
