const { getDb } = require('../database/db');
const { supabaseAdmin, supabaseAuth } = require('../config/supabase');

const authController = {
  async registrar(req, res, next) {
    try {
      const { email, nome, senha } = req.body;

      if (!email || !nome || !senha) {
        return res.status(400).json({ error: 'Email, nome e senha são obrigatórios.' });
      }

      const db = await getDb();

      const usuarioExistente = await db.get('SELECT id FROM usuarios WHERE email = ?', [email]);
      if (usuarioExistente) {
        return res.status(400).json({ error: 'Este e-mail já está em uso.' });
      }

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true,
      });

      if (authError) {
        return res.status(400).json({ error: authError.message });
      }

      const id = authData.user.id;

      await db.run(
        'INSERT INTO usuarios (id, email, nome, plano, saldo_moedas) VALUES (?, ?, ?, ?, ?)',
        [id, email, nome, 'gratuito', 0]
      );

      const { data: sessionData, error: sessionError } = await supabaseAuth.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (sessionError) {
        return res.status(400).json({ error: sessionError.message });
      }

      res.status(201).json({
        data: {
          usuario: { id, email, nome, plano: 'gratuito', saldo_moedas: 0 },
          token: sessionData.session.access_token,
          refreshToken: sessionData.session.refresh_token,
        },
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

      const { data: sessionData, error: sessionError } = await supabaseAuth.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (sessionError) {
        return res.status(401).json({ error: 'Credenciais inválidas.' });
      }

      const db = await getDb();
      const usuario = await db.get('SELECT * FROM usuarios WHERE id = ?', [sessionData.user.id]);
      if (!usuario) {
        return res.status(401).json({ error: 'Credenciais inválidas.' });
      }

      res.json({
        data: {
          usuario: {
            id: usuario.id,
            email: usuario.email,
            nome: usuario.nome,
            plano: usuario.plano,
            saldo_moedas: usuario.saldo_moedas,
            papel: usuario.papel,
          },
          token: sessionData.session.access_token,
          refreshToken: sessionData.session.refresh_token,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: 'refreshToken é obrigatório.' });
      }

      const { data, error } = await supabaseAuth.auth.refreshSession({ refresh_token: refreshToken });

      if (error) {
        return res.status(401).json({ error: 'Sessão expirada, faça login novamente.' });
      }

      res.json({
        data: {
          token: data.session.access_token,
          refreshToken: data.session.refresh_token,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
