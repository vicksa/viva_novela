/**
 * Middleware centralizado de tratamento de erros.
 * Captura todos os erros não tratados e retorna resposta padronizada.
 */
const errorHandler = (err, req, res, _next) => {
  console.error('❌ Erro:', err);

  // Erros de upload (Multer): tipo/tamanho inválido, etc.
  if (err.name === 'MulterError') {
    const mensagens = {
      LIMIT_FILE_SIZE: 'Arquivo excede o tamanho máximo permitido (5MB).',
      LIMIT_UNEXPECTED_FILE: err.message || 'Arquivo inválido.',
    };
    return res.status(400).json({ error: mensagens[err.code] || 'Erro no upload do arquivo.' });
  }

  // Erros do Supabase
  if (err.code && err.message && err.details) {
    return res.status(500).json({
      error: 'Erro no banco de dados.',
      ...(process.env.NODE_ENV !== 'production' && { detalhes: err.message }),
    });
  }

  // Erro de JSON malformado (Express body-parser)
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON malformado no corpo da requisição.' });
  }

  // Erro genérico
  const statusCode = err.statusCode || err.status || 500;
  const message = err.expose ? err.message : 'Erro interno do servidor.';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && {
      detalhes: err.message,
      stack: err.stack,
    }),
  });
};

module.exports = { errorHandler };
