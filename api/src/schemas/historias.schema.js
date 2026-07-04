const { z } = require('zod');

const listarHistoriasQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  genero: z.string().optional(),
  busca: z.string().optional(),
  destaque: z.string().optional(),
  ordenar: z.enum(['recentes', 'maisLidas']).optional(),
});

const historiaIdParams = z.object({
  id: z.string().uuid('ID da história deve ser um UUID válido.'),
});

module.exports = {
  listarHistoriasQuery,
  historiaIdParams,
};
