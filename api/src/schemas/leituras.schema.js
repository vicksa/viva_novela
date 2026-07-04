const { z } = require('zod');

const salvarPosicaoBody = z.object({
  capitulo_id: z.string().uuid('capitulo_id deve ser um UUID válido.'),
  posicao_scroll: z.number().min(0).max(1, 'posicao_scroll deve estar entre 0 e 1.'),
  percentual_lido: z.number().min(0).max(100, 'percentual_lido deve estar entre 0 e 100.'),
});

const capituloIdParams = z.object({
  id: z.string().uuid('ID do capítulo deve ser um UUID válido.'),
});

module.exports = {
  salvarPosicaoBody,
  capituloIdParams,
};
