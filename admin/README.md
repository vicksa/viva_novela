# Viva Novela — Painel Admin

Painel administrativo (React + Vite) para gerenciar histórias, capítulos e usuários do Viva Novela.

## Funcionalidades

- Login (Supabase Auth, restrito a usuários com `papel = 'admin'`)
- CRUD de histórias, com upload de capa (Supabase Storage)
- CRUD de capítulos por história, com controle de grátis/pago (`is_gratuito`, `custo_moedas`)
- Gestão de usuários (criar, editar saldo/plano/papel, excluir)

## Desenvolvimento

```bash
npm install
cp .env.example .env   # ajuste VITE_API_URL se a API não estiver em localhost:3000
npm run dev
```

A API (`../api`) precisa estar rodando e configurada com as credenciais do Supabase — veja `api/.env.example`.

## Build

```bash
npm run build
```

Gera os arquivos estáticos em `dist/`, publicados hoje como um Static Site no Render (ver `render.yaml` na raiz do monorepo).
