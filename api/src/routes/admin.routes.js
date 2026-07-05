const express = require('express');
const adminController = require('../controllers/admin.controller');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.get('/usuarios', adminController.listarUsuarios);
router.put('/usuarios/:id', adminController.editarUsuario);

router.get('/historias', adminController.listarHistorias);
router.get('/historias/:id/capitulos', adminController.listarCapitulosPorHistoria);
router.post('/historias', adminController.criarHistoria);
router.put('/historias/:id', adminController.editarHistoria);
router.delete('/historias/:id', adminController.deletarHistoria);

router.post('/capitulos', adminController.criarCapitulo);
router.put('/capitulos/:id', adminController.editarCapitulo);
router.delete('/capitulos/:id', adminController.deletarCapitulo);

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }
  res.json({ data: { url: '/uploads/' + req.file.filename } });
});

module.exports = router;
