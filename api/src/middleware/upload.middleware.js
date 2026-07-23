const multer = require('multer');
const path = require('path');

const TIPOS_PERMITIDOS = new Set(['image/jpeg', 'image/png', 'image/webp']);
const EXTENSOES_PERMITIDAS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5MB

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!TIPOS_PERMITIDOS.has(file.mimetype) || !EXTENSOES_PERMITIDAS.has(ext)) {
    return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Apenas imagens JPEG, PNG ou WEBP são permitidas.'));
  }
  cb(null, true);
}

// Arquivo fica em memória (req.file.buffer); o controller sobe o buffer
// direto para o Cloudinary, sem gravar nada em disco local.
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: TAMANHO_MAXIMO_BYTES,
    files: 1,
  },
});

module.exports = upload;
