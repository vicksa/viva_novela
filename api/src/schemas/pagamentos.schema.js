const { z } = require('zod');

const criarAssinaturaBody = z.object({
  frequencia: z.enum(['mensal', 'anual']),
});

module.exports = { criarAssinaturaBody };
