const { Router } = require('express');
const { authRequired } = require('../middleware/auth.middleware');
const { getDb } = require('../database/db');

const router = Router();

router.get('/', authRequired, async (req, res, next) => {
  try {
    const db = await getDb();
    const user = await db.get(
      'SELECT id, email, nome, plano, vip_expira_em, saldo_moedas FROM usuarios WHERE id = ?',
      [req.userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    return res.json({
      id: user.id,
      email: user.email,
      nome: user.nome,
      plano: user.plano,
      vipExpiraEm: user.vip_expira_em,
      saldoMoedas: user.saldo_moedas
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
