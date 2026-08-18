-- ============================================================
-- VIVA NOVELA - Schema SQL para Supabase (PostgreSQL)
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABELAS
-- ============================================================

-- Tabela de usuários (autenticação via Supabase Auth — id é o mesmo UUID de
-- auth.users, criado pela API via supabase.auth.admin.createUser antes do INSERT)
CREATE TABLE usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  papel TEXT NOT NULL DEFAULT 'leitor',
  saldo_moedas INTEGER DEFAULT 0,
  plano VARCHAR(10) DEFAULT 'gratuito' CHECK (plano IN ('gratuito','vip')),
  vip_expira_em TIMESTAMP,
  avatar_url TEXT,
  fcm_token TEXT,
  criado_em TIMESTAMP DEFAULT NOW(),
  ultimo_acesso TIMESTAMP DEFAULT NOW()
);

-- Tabela de histórias
CREATE TABLE historias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(200) NOT NULL,
  sinopse TEXT NOT NULL,
  capa_url TEXT NOT NULL,
  genero VARCHAR(60) NOT NULL,
  total_capitulos INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'rascunho'
    CHECK (status IN ('rascunho','ativo','pausado','concluido')),
  autora VARCHAR(120) NOT NULL,
  tags TEXT[],
  destaque BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de capítulos
CREATE TABLE capitulos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  historia_id UUID REFERENCES historias(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  conteudo TEXT NOT NULL,
  custo_moedas INTEGER DEFAULT 5,
  is_gratuito BOOLEAN DEFAULT FALSE,
  publicado_em TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(historia_id, numero)
);

-- Tabela de leituras (progresso por usuário/capítulo)
CREATE TABLE leituras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  capitulo_id UUID REFERENCES capitulos(id) ON DELETE CASCADE,
  historia_id UUID REFERENCES historias(id) ON DELETE CASCADE,
  posicao_scroll FLOAT DEFAULT 0.0,
  percentual_lido FLOAT DEFAULT 0.0,
  lido_em TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(usuario_id, capitulo_id)
);

-- Tabela de compras
CREATE TABLE compras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('moedas','assinatura')),
  valor_reais DECIMAL(10,2) NOT NULL,
  moedas_creditadas INTEGER,
  gateway_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pendente'
    CHECK (status IN ('pendente','aprovado','cancelado')),
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de biblioteca (histórias salvas)
CREATE TABLE biblioteca (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  historia_id UUID REFERENCES historias(id) ON DELETE CASCADE,
  salvo_em TIMESTAMP DEFAULT NOW(),
  UNIQUE(usuario_id, historia_id)
);

-- Tabela de assinaturas (cobrança recorrente via Mercado Pago)
CREATE TABLE assinaturas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  mp_preapproval_id VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','authorized','paused','cancelled')),
  frequencia VARCHAR(10) NOT NULL CHECK (frequencia IN ('mensal','anual')),
  valor_reais DECIMAL(10,2) NOT NULL,
  criado_em TIMESTAMP DEFAULT NOW(),
  proximo_pagamento_em TIMESTAMP,
  cancelado_em TIMESTAMP
);

-- ============================================================
-- TRIGGER: Capítulos 1, 2, 3 sempre gratuitos
-- ============================================================

CREATE OR REPLACE FUNCTION set_capitulos_gratuitos()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.numero <= 3 THEN
    NEW.is_gratuito := TRUE;
    NEW.custo_moedas := 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_capitulos_gratuitos
  BEFORE INSERT OR UPDATE ON capitulos
  FOR EACH ROW EXECUTE FUNCTION set_capitulos_gratuitos();

-- ============================================================
-- TRIGGER: Atualizar total_capitulos na tabela historias
-- ============================================================

CREATE OR REPLACE FUNCTION atualizar_total_capitulos()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE historias SET total_capitulos = (
      SELECT COUNT(*) FROM capitulos WHERE historia_id = NEW.historia_id
    ) WHERE id = NEW.historia_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE historias SET total_capitulos = (
      SELECT COUNT(*) FROM capitulos WHERE historia_id = OLD.historia_id
    ) WHERE id = OLD.historia_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_atualizar_total_capitulos
  AFTER INSERT OR DELETE ON capitulos
  FOR EACH ROW EXECUTE FUNCTION atualizar_total_capitulos();

-- ============================================================
-- ÍNDICES para performance
-- ============================================================

CREATE INDEX idx_leituras_usuario ON leituras(usuario_id);
CREATE INDEX idx_leituras_capitulo ON leituras(capitulo_id);
CREATE INDEX idx_leituras_historia ON leituras(historia_id);
CREATE INDEX idx_compras_usuario ON compras(usuario_id);
CREATE INDEX idx_biblioteca_usuario ON biblioteca(usuario_id);
CREATE INDEX idx_biblioteca_historia ON biblioteca(historia_id);
CREATE INDEX idx_capitulos_historia ON capitulos(historia_id);
CREATE INDEX idx_capitulos_historia_numero ON capitulos(historia_id, numero);
CREATE INDEX idx_historias_status ON historias(status);
CREATE INDEX idx_historias_genero ON historias(genero);
CREATE INDEX idx_historias_destaque ON historias(destaque) WHERE destaque = TRUE;
CREATE INDEX idx_assinaturas_usuario ON assinaturas(usuario_id);

-- ============================================================
-- CONTROLE DE ACESSO
-- ============================================================
-- A autenticação (login/senha) é feita pelo Supabase Auth. A API continua
-- sendo o único ponto de acesso ao banco (via connection string privilegiada,
-- não pelas chaves anon/public), então todo o controle de acesso — inclusive
-- o que cada usuário pode ler/editar — continua sendo feito na camada da API
-- (coluna usuarios.papel), não via RLS. RLS não está habilitado nestas
-- tabelas porque não há client falando direto com o Postgres do Supabase.

-- ============================================================
-- STORAGE (capas das histórias)
-- ============================================================
-- Os arquivos de capa são enviados pela API para o Supabase Storage, bucket
-- "capas" (ver api/src/config/supabase.js), que retorna uma URL pública
-- permanente — não dependem de disco local nem de disco persistente do Render.

INSERT INTO storage.buckets (id, name, public)
VALUES ('capas', 'capas', true)
ON CONFLICT (id) DO NOTHING;
