require('dotenv').config();
const { getDb } = require('./db');
const { supabaseAdmin } = require('../config/supabase');

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
  const existing = await db.get('SELECT id FROM usuarios WHERE email = ?', [email]);

  if (existing) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(existing.id, { password: senha });
    if (error) {
      console.error('❌ Erro ao atualizar senha no Supabase Auth:', error.message);
      process.exit(1);
    }
    await db.run("UPDATE usuarios SET papel = 'admin' WHERE email = ?", [email]);
    console.log(`✅ Usuário admin (${email}) já existia. Senha atualizada e papel garantido como 'admin'.`);
    return;
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
  });

  if (authError) {
    console.error('❌ Erro ao criar usuário no Supabase Auth:', authError.message);
    process.exit(1);
  }

  const id = authData.user.id;
  await db.run(
    `INSERT INTO usuarios (id, email, nome, papel, plano, saldo_moedas)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, email, nome, 'admin', 'vip', 9999]
  );

  console.log(`✅ Usuário admin criado com sucesso: ${email}`);
}

createAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erro ao criar/atualizar admin:', error.message || error);
    process.exit(1);
  });
