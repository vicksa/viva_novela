const jwt = require('jsonwebtoken');
const { getDb } = require('../database/db');
const config = require('../config');

/**
 * Middleware obrigatório de autenticação.
 * Extrai o token Bearer, valida via JWT e anexa userId/userEmail/userPapel ao req.
 */
const authRequired = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.userId = decoded.id;
      req.userEmail = decoded.email;

      const db = await getDb();
      const user = await db.get('SELECT papel FROM usuarios WHERE id = ?', [req.userId]);
      if (user) {
        req.userPapel = user.papel;
      } else {
        req.userPapel = 'leitor';
      }

      next();
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
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

    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.userId = decoded.id;
      req.userEmail = decoded.email;

      const db = await getDb();
      const user = await db.get('SELECT papel FROM usuarios WHERE id = ?', [req.userId]);
      if (user) {
        req.userPapel = user.papel;
      } else {
        req.userPapel = 'leitor';
      }

      next();
    } catch (error) {
      req.userId = null;
      req.userEmail = null;
      req.userPapel = null;
      next();
    }
  } catch (err) {
    req.userId = null;
    req.userEmail = null;
    req.userPapel = null;
    next();
  }
};

module.exports = { authRequired, authOptional };
