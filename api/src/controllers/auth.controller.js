const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { getDb } = require('../database/db');
const config = require('../config');

const authController = {
  async registrar(req, res, next) {
    try {
      const { email, nome, senha } = req.body;
      
      if (!email || !nome || !senha) {
        return res.status(400).json({ error: 'Email, nome e senha são obrigatórios.' });
      }

      const db = await getDb();
      
      // Verifica se o usuário já existe
      const usuarioExistente = await db.get('SELECT id FROM usuarios WHERE email = ?', [email]);
      if (usuarioExistente) {
        return res.status(400).json({ error: 'Este e-mail já está em uso.' });
      }

      const salt = await bcrypt.genSalt(10);
      const senhaHash = await bcrypt.hash(senha, salt);
      const id = crypto.randomUUID();

      await db.run(
        'INSERT INTO usuarios (id, email, nome, senha, plano, saldo_moedas) VALUES (?, ?, ?, ?, ?, ?)',
        [id, email, nome, senhaHash, 'gratuito', 0]
      );

      const token = jwt.sign(
        { id, email, plano: 'gratuito' },
        config.jwt.secret,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        data: {
          usuario: { id, email, nome, plano: 'gratuito', saldo_moedas: 0 },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
      }

      const db = await getDb();
      
      const usuario = await db.get('SELECT * FROM usuarios WHERE email = ?', [email]);
      if (!usuario) {
        return res.status(401).json({ error: 'Credenciais inválidas.' });
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        return res.status(401).json({ error: 'Credenciais inválidas.' });
      }

      const token = jwt.sign(
        { id: usuario.id, email: usuario.email, plano: usuario.plano },
        config.jwt.secret,
        { expiresIn: '7d' }
      );

      res.json({
        data: {
          usuario: {
            id: usuario.id,
            email: usuario.email,
            nome: usuario.nome,
            plano: usuario.plano,
            saldo_moedas: usuario.saldo_moedas,
            papel: usuario.papel
          },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;
