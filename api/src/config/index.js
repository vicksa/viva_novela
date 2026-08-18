const { z } = require('zod');

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:8081,http://localhost:5173,http://localhost:5174'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória (connection string do Postgres do Supabase)'),
  SUPABASE_URL: z.string().min(1, 'SUPABASE_URL é obrigatória'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY é obrigatória'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY é obrigatória'),
  // Não é mais usada para verificar tokens localmente (o projeto usa chaves
  // assimétricas ES256/JWKS, não o segredo HMAC legado) — auth.middleware.js
  // valida via supabaseAuth.auth.getUser() em vez disso. Mantida opcional
  // apenas por compatibilidade, caso algo volte a precisar dela.
  SUPABASE_JWT_SECRET: z.string().optional(),
  MERCADOPAGO_ACCESS_TOKEN: z.string().min(1, 'MERCADOPAGO_ACCESS_TOKEN é obrigatória'),
  MERCADOPAGO_WEBHOOK_SECRET: z.string().min(1, 'MERCADOPAGO_WEBHOOK_SECRET é obrigatória'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Variáveis de ambiente inválidas:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const config = {
  port: parsed.data.PORT,
  nodeEnv: parsed.data.NODE_ENV,
  corsOrigins: parsed.data.CORS_ORIGIN.split(',').map((o) => o.trim()),
  isProduction: parsed.data.NODE_ENV === 'production',
  databaseUrl: parsed.data.DATABASE_URL,
  supabase: {
    url: parsed.data.SUPABASE_URL,
    anonKey: parsed.data.SUPABASE_ANON_KEY,
    serviceRoleKey: parsed.data.SUPABASE_SERVICE_ROLE_KEY,
    jwtSecret: parsed.data.SUPABASE_JWT_SECRET,
  },
  mercadoPago: {
    accessToken: parsed.data.MERCADOPAGO_ACCESS_TOKEN,
    webhookSecret: parsed.data.MERCADOPAGO_WEBHOOK_SECRET,
  },
};

module.exports = config;
