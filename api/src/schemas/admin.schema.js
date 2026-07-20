const { z } = require('zod');

const usuarioIdParams = z.object({
  id: z.string().uuid('ID de usuário deve ser um UUID válido.'),
});

const criarUsuarioBody = z.object({
  email: z.string().email('Email inválido.'),
  nome: z.string().min(1, 'Nome é obrigatório.'),
  senha: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres.'),
  papel: z.enum(['leitor', 'admin']).optional(),
});

const editarUsuarioBody = z.object({
  saldo_moedas: z.coerce.number().int().min(0).optional(),
  plano: z.enum(['gratuito', 'vip']).optional(),
  papel: z.enum(['leitor', 'admin']).optional(),
});

const historiaIdParams = z.object({
  id: z.string().uuid('ID da história deve ser um UUID válido.'),
});

const historiaStatus = z.enum(['rascunho', 'ativo', 'pausado', 'concluido']);

const criarHistoriaBody = z.object({
  titulo: z.string().min(1, 'Título é obrigatório.'),
  sinopse: z.string().min(1, 'Sinopse é obrigatória.'),
  autora: z.string().min(1, 'Autora é obrigatória.'),
  capa_url: z.string().url('capa_url deve ser uma URL válida.'),
  genero: z.string().min(1, 'Gênero é obrigatório.'),
  tags: z.array(z.string()).optional(),
  destaque: z.boolean().optional(),
  total_capitulos: z.coerce.number().int().min(0).optional(),
  status: historiaStatus.optional(),
});

const editarHistoriaBody = criarHistoriaBody.partial();

const capituloIdParams = z.object({
  id: z.string().uuid('ID do capítulo deve ser um UUID válido.'),
});

const criarCapituloBody = z.object({
  historia_id: z.string().uuid('historia_id deve ser um UUID válido.'),
  numero: z.coerce.number().int().min(1, 'Número do capítulo deve ser positivo.'),
  titulo: z.string().min(1, 'Título é obrigatório.'),
  conteudo: z.string().min(1, 'Conteúdo é obrigatório.'),
  is_gratuito: z.boolean().optional(),
  custo_moedas: z.coerce.number().int().min(0).optional(),
});

const editarCapituloBody = z.object({
  titulo: z.string().min(1).optional(),
  conteudo: z.string().min(1).optional(),
  numero: z.coerce.number().int().min(1).optional(),
  is_gratuito: z.boolean().optional(),
  custo_moedas: z.coerce.number().int().min(0).optional(),
});

module.exports = {
  usuarioIdParams,
  criarUsuarioBody,
  editarUsuarioBody,
  historiaIdParams,
  criarHistoriaBody,
  editarHistoriaBody,
  capituloIdParams,
  criarCapituloBody,
  editarCapituloBody,
};
