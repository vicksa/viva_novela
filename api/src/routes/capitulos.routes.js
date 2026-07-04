const { Router } = require('express');
const capitulosController = require('../controllers/capitulos.controller');
const { validate } = require('../middleware/validate.middleware');
const { authOptional } = require('../middleware/auth.middleware');
const { capituloIdParams } = require('../schemas/leituras.schema');

const router = Router();

// GET /capitulos/:id - Obter capítulo completo (com lógica de acesso)
router.get(
  '/:id',
  authOptional,
  validate({ params: capituloIdParams }),
  capitulosController.obterCapitulo
);

module.exports = router;
