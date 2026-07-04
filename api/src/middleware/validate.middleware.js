const { ZodError } = require('zod');

/**
 * Middleware de validação com Zod.
 * Aceita um objeto com schemas para body, params e/ou query.
 *
 * Uso: validate({ body: meuSchema, params: meuParamsSchema })
 */
const validate = (schemas) => {
  return (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const mensagens = err.errors.map((e) => ({
          campo: e.path.join('.'),
          mensagem: e.message,
        }));
        return res.status(400).json({
          error: 'Dados de entrada inválidos.',
          detalhes: mensagens,
        });
      }
      next(err);
    }
  };
};

module.exports = { validate };
