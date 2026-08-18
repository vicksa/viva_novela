const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const { errorHandler } = require('./middleware/errorHandler.middleware');

const authRoutes = require('./routes/auth.routes');
const historiasRoutes = require('./routes/historias.routes');
const capitulosRoutes = require('./routes/capitulos.routes');
const leiturasRoutes = require('./routes/leituras.routes');
const perfilRoutes = require('./routes/perfil.routes');
const adminRoutes = require('./routes/admin.routes');
const pagamentosRoutes = require('./routes/pagamentos.routes');
const { authRequired } = require('./middleware/auth.middleware');
const { adminRequired } = require('./middleware/admin.middleware');

const app = express();

// O Render (e a maioria dos PaaS) termina TLS na borda e repassa por HTTP
// internamente — sem isso, req.protocol sempre reporta "http" (quebra o
// back_url do Mercado Pago) e o rate limiter usa o IP do proxy em vez do
// IP real do cliente.
app.set('trust proxy', 1);

// Segurança
app.use(helmet());

// CORS
app.use(
  cors({
    origin: config.corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente mais tarde.' },
  // O Mercado Pago pode reenviar a notificação várias vezes em pouco tempo;
  // não deixar o rate limiter global bloquear o webhook.
  skip: (req) => req.path === '/api/pagamentos/webhook',
});
app.use(limiter);

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      ambiente: config.nodeEnv,
    },
  });
});

// Página de retorno do checkout do Mercado Pago: o back_url da assinatura
// precisa ser uma URL http(s) válida (o MP rejeita esquemas customizados tipo
// vivanovela://), então essa página abre no navegador e imediatamente
// redireciona para o app via deep link.
app.get('/pagamentos/retorno', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0;url=vivanovela://assinatura">
  <title>Viva Novela</title>
</head>
<body>
  <p>Voltando para o app... Se nada acontecer, <a href="vivanovela://assinatura">toque aqui</a>.</p>
</body>
</html>`);
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/historias', historiasRoutes);
app.use('/api/capitulos', capitulosRoutes);
app.use('/api/leituras', leiturasRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/admin', authRequired, adminRequired, adminRoutes);
app.use('/api/pagamentos', pagamentosRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

// Error handler
app.use(errorHandler);

module.exports = app;
