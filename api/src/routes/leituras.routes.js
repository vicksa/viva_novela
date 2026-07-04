const { Router } = require('express');
const leiturasController = require('../controllers/leituras.controller');
const { validate } = require('../middleware/validate.middleware');
const { authRequired } = require('../middleware/auth.middleware');
const { salvarPosicaoBody } = require('../schemas/leituras.schema');

const router = Router();

// POST /leituras - Salvar posição de leitura
router.post(
  '/',
  authRequired,
  validate({ body: salvarPosicaoBody }),
  leiturasController.salvarPosicao
);

// GET /leituras/continuar - Obter histórias em progresso
router.get(
  '/continuar',
  authRequired,
  leiturasController.continuarLendo
);

module.exports = router;
