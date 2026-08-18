const { getDb } = require('../database/db');
const { supabaseAuth } = require('../config/supabase');

/**
 * Valida o token via supabase.auth.getUser() (chama o Auth do Supabase) em vez
 * de jwt.verify local — este projeto usa chaves de assinatura assimétricas
 * (ES256, via JWKS), não o segredo HMAC legado, então verificar localmente
 * exigiria buscar/cachear a chave pública. Usar o SDK evita essa complexidade
 * e funciona com qualquer esquema de assinatura que o projeto use.
 */
async function verifyToken(token) {
  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

/**
 * Middleware obrigatório de autenticação.
 * Extrai o token Bearer, valida via Supabase Auth e anexa userId/userEmail/userPapel ao req.
 */
const authRequired = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
    }

    const token = authHeader.split(' ')[1];
    const user = await verifyToken(token);

    if (!user) {
      return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }

    req.userId = user.id;
    req.userEmail = user.email;

    const db = await getDb();
    const usuario = await db.get('SELECT papel FROM usuarios WHERE id = ?', [req.userId]);
    req.userPapel = usuario ? usuario.papel : 'leitor';

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware opcional de autenticação.
 * Tenta extrair e validar o token, mas não falha se ausente.
 */
const authOptional = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.userId = null;
      req.userEmail = null;
      req.userPapel = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const user = await verifyToken(token);

    if (!user) {
      req.userId = null;
      req.userEmail = null;
      req.userPapel = null;
      return next();
    }

    req.userId = user.id;
    req.userEmail = user.email;

    const db = await getDb();
    const usuario = await db.get('SELECT papel FROM usuarios WHERE id = ?', [req.userId]);
    req.userPapel = usuario ? usuario.papel : 'leitor';

    next();
  } catch (err) {
    req.userId = null;
    req.userEmail = null;
    req.userPapel = null;
    next();
  }
};

module.exports = { authRequired, authOptional };
