const { z } = require('zod');

const envSchema = z.object({
  JWT_SECRET: z.string().min(16, 'JWT_SECRET é obrigatória e deve ter pelo menos 16 caracteres'),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:8081,http://localhost:5173,http://localhost:5174'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória (connection string do Postgres)'),
  UPLOADS_DIR: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Variáveis de ambiente inválidas:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const config = {
  jwt: {
    secret: parsed.data.JWT_SECRET,
  },
  port: parsed.data.PORT,
  nodeEnv: parsed.data.NODE_ENV,
  corsOrigins: parsed.data.CORS_ORIGIN.split(',').map((o) => o.trim()),
  isProduction: parsed.data.NODE_ENV === 'production',
  databaseUrl: parsed.data.DATABASE_URL,
  // Diretório onde as capas enviadas pelo admin são salvas. Em produção,
  // deve apontar para dentro de um disco persistente do Render (ver render.yaml)
  // — sem isso, os uploads somem a cada novo deploy.
  uploadsDir: parsed.data.UPLOADS_DIR || require('path').join(__dirname, '../../public/uploads'),
};

module.exports = config;
