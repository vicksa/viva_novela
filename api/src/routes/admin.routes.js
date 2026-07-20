const express = require('express');
const adminController = require('../controllers/admin.controller');
const upload = require('../middleware/upload.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  usuarioIdParams,
  criarUsuarioBody,
  editarUsuarioBody,
  historiaIdParams,
  criarHistoriaBody,
  editarHistoriaBody,
  capituloIdParams,
  criarCapituloBody,
  editarCapituloBody,
} = require('../schemas/admin.schema');

const router = express.Router();

router.get('/usuarios', adminController.listarUsuarios);
router.post('/usuarios', validate({ body: criarUsuarioBody }), adminController.criarUsuario);
router.put('/usuarios/:id', validate({ params: usuarioIdParams, body: editarUsuarioBody }), adminController.editarUsuario);
router.delete('/usuarios/:id', validate({ params: usuarioIdParams }), adminController.deletarUsuario);

router.get('/historias', adminController.listarHistorias);
router.get('/historias/:id/capitulos', validate({ params: historiaIdParams }), adminController.listarCapitulosPorHistoria);
router.post('/historias', validate({ body: criarHistoriaBody }), adminController.criarHistoria);
router.put('/historias/:id', validate({ params: historiaIdParams, body: editarHistoriaBody }), adminController.editarHistoria);
router.delete('/historias/:id', validate({ params: historiaIdParams }), adminController.deletarHistoria);

router.post('/capitulos', validate({ body: criarCapituloBody }), adminController.criarCapitulo);
router.put('/capitulos/:id', validate({ params: capituloIdParams, body: editarCapituloBody }), adminController.editarCapitulo);
router.delete('/capitulos/:id', validate({ params: capituloIdParams }), adminController.deletarCapitulo);

router.post('/upload', upload.single('file'), adminController.uploadCapa);

module.exports = router;
