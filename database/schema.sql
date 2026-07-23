-- ============================================================
-- VIVA NOVELA - Schema SQL para Supabase (PostgreSQL)
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABELAS
-- ============================================================

-- Tabela de usuários (autenticação própria via JWT/bcrypt, não usa auth.users do Supabase)
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha TEXT NOT NULL,
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
  concluido BOOLEAN DEFAULT FALSE,
  lido_em TIMESTAMP DEFAULT NOW(),
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

-- ============================================================
-- CONTROLE DE ACESSO
-- ============================================================
-- Este banco roda em Postgres puro (não Supabase), acessado apenas pela API
-- via connection string privilegiada, com autenticação própria (JWT + bcrypt,
-- coluna usuarios.papel). Todo o controle de acesso — inclusive o que cada
-- usuário pode ler/editar — é feito na camada da API, não via RLS do Postgres
-- (RLS do Supabase depende de auth.uid(), que não existe fora do Supabase).

-- ============================================================
-- UPLOADS (capas das histórias)
-- ============================================================
-- Os arquivos de capa são enviados pela API para o Cloudinary (ver
-- api/src/config/cloudinary.js e CLOUDINARY_URL), que retorna uma URL
-- pública permanente — não dependem de disco local nem de disco
-- persistente do Render.
