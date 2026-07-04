# 📖 Viva Novela

_Histórias que prendem. Capítulos que viciam._

Plataforma mobile de histórias de romance serializadas em capítulos curtos, com foco no público feminino brasileiro.

## Stack

| Componente | Tecnologia |
|-----------|-----------|
| App Mobile | React Native (Expo SDK 56) |
| Backend API | Node.js + Express |
| Banco de Dados | Supabase (PostgreSQL) |
| Painel Admin | React + Vite (Entrega 3) |

## Estrutura

```
viva-novela/
├── app/          ← App React Native (Expo)
├── api/          ← Backend Node.js + Express
├── admin/        ← Painel Admin (Entrega 3)
└── database/     ← Schema SQL para Supabase
```

## Desenvolvimento

### App Mobile
```bash
cd app
npx expo start
```

### Backend API
```bash
cd api
cp .env.example .env  # Preencher com suas credenciais
npm run dev
```

### Seed do Banco
```bash
cd api
node src/seed/seed.js
```

## Licença

Propriedade de Viva Novela © 2026. Todos os direitos reservados.
