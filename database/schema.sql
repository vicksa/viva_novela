-- ============================================================
-- VIVA NOVELA - Schema SQL para Supabase (PostgreSQL)
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABELAS
-- ============================================================

-- Tabela de usuários (complementa auth.users do Supabase)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  saldo_moedas INTEGER DEFAULT 0,
  plano VARCHAR(10) DEFAULT 'free' CHECK (plano IN ('free','vip')),
  vip_expira_em TIMESTAMP,
  avatar_url TEXT,
  fcm_token TEXT,
  data_cadastro TIMESTAMP DEFAULT NOW(),
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
  criado_em TIMESTAMP DEFAULT NOW()
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
  criado_em TIMESTAMP DEFAULT NOW(),
  UNIQUE(historia_id, numero)
);

-- Tabela de leituras (progresso por usuário/capítulo)
CREATE TABLE leituras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES users(id) ON DELETE CASCADE,
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
  usuario_id UUID REFERENCES users(id),
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
  usuario_id UUID REFERENCES users(id) ON DELETE CASCADE,
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
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leituras ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE biblioteca ENABLE ROW LEVEL SECURITY;

-- Histórias e capítulos são públicos (leitura), sem RLS para SELECT
-- O controle de acesso ao conteúdo é feito pela API

-- Políticas para users
CREATE POLICY users_select_self ON users
  FOR SELECT USING (id = (SELECT auth.uid()));

CREATE POLICY users_update_self ON users
  FOR UPDATE USING (id = (SELECT auth.uid()));

-- Políticas para leituras
CREATE POLICY leituras_select_self ON leituras
  FOR SELECT USING (usuario_id = (SELECT auth.uid()));

CREATE POLICY leituras_insert_self ON leituras
  FOR INSERT WITH CHECK (usuario_id = (SELECT auth.uid()));

CREATE POLICY leituras_update_self ON leituras
  FOR UPDATE USING (usuario_id = (SELECT auth.uid()));

-- Políticas para compras
CREATE POLICY compras_select_self ON compras
  FOR SELECT USING (usuario_id = (SELECT auth.uid()));

-- Políticas para biblioteca
CREATE POLICY biblioteca_all_self ON biblioteca
  FOR ALL USING (usuario_id = (SELECT auth.uid()));

-- ============================================================
-- STORAGE BUCKETS (criar via Dashboard do Supabase)
-- ============================================================
-- Bucket 'capas' → Público (para capas das histórias)
-- Bucket 'avatars' → Autenticado (para fotos de perfil)
--
-- Instruções:
-- 1. No Dashboard do Supabase, vá em Storage
-- 2. Crie bucket 'capas' com acesso público
-- 3. Crie bucket 'avatars' com acesso autenticado
