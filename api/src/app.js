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
const { authRequired } = require('./middleware/auth.middleware');
const { adminRequired } = require('./middleware/admin.middleware');

const app = express();

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

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/historias', historiasRoutes);
app.use('/api/capitulos', capitulosRoutes);
app.use('/api/leituras', leiturasRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/admin', authRequired, adminRequired, adminRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

// Error handler
app.use(errorHandler);

module.exports = app;
