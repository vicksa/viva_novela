const multer = require('multer');
const path = require('path');
const config = require('../config');

const TIPOS_PERMITIDOS = new Set(['image/jpeg', 'image/png', 'image/webp']);
const EXTENSOES_PERMITIDAS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!TIPOS_PERMITIDOS.has(file.mimetype) || !EXTENSOES_PERMITIDAS.has(ext)) {
    return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Apenas imagens JPEG, PNG ou WEBP são permitidas.'));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: TAMANHO_MAXIMO_BYTES,
    files: 1,
  },
});

module.exports = upload;
