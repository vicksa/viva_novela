const { Router } = require('express');
const historiasController = require('../controllers/historias.controller');
const { validate } = require('../middleware/validate.middleware');
const { authOptional } = require('../middleware/auth.middleware');
const { listarHistoriasQuery, historiaIdParams } = require('../schemas/historias.schema');

const router = Router();

// GET /historias - Listar histórias ativas com paginação e filtros
router.get(
  '/',
  authOptional,
  validate({ query: listarHistoriasQuery }),
  historiasController.listar
);

// GET /historias/:id - Detalhes de uma história
router.get(
  '/:id',
  authOptional,
  validate({ params: historiaIdParams }),
  historiasController.detalhe
);

// GET /historias/:id/capitulos - Listar capítulos de uma história
router.get(
  '/:id/capitulos',
  authOptional,
  validate({ params: historiaIdParams }),
  historiasController.listarCapitulos
);

module.exports = router;
