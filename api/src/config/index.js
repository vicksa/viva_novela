const { z } = require('zod');

const envSchema = z.object({
  JWT_SECRET: z.string().min(16, 'JWT_SECRET é obrigatória e deve ter pelo menos 16 caracteres'),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:8081,http://localhost:5173,http://localhost:5174'),
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
};

module.exports = config;
