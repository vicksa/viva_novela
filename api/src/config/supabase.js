const ws = require('ws');
const { createClient } = require('@supabase/supabase-js');
const config = require('./index');

// supabase-js sempre inicializa um RealtimeClient (mesmo sem usar realtime),
// que exige WebSocket nativo (Node 22+) ou um transport explícito no Node 20
// (versão do runtime no Render) — sem isso o require já derruba o processo.
const supabaseOptions = {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws },
};

/**
 * Client com a service_role key — bypassa RLS, usado para operações
 * administrativas (criar usuário no Auth, upload no Storage). Nunca expor
 * ao client.
 */
const supabaseAdmin = createClient(config.supabase.url, config.supabase.serviceRoleKey, supabaseOptions);

/**
 * Client com a anon key — usado apenas para login/refresh (signInWithPassword,
 * refreshSession), que não exigem a service_role key.
 */
const supabaseAuth = createClient(config.supabase.url, config.supabase.anonKey, supabaseOptions);

module.exports = { supabaseAdmin, supabaseAuth };
