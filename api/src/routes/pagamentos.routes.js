const express = require('express');
const pagamentosController = require('../controllers/pagamentos.controller');
const { authRequired } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { criarAssinaturaBody } = require('../schemas/pagamentos.schema');

const router = express.Router();

router.post('/criar', authRequired, validate({ body: criarAssinaturaBody }), pagamentosController.criarAssinatura);
router.post('/webhook', pagamentosController.webhook);
router.post('/cancelar', authRequired, pagamentosController.cancelarAssinatura);
router.get('/status', authRequired, pagamentosController.statusAssinatura);

module.exports = router;
