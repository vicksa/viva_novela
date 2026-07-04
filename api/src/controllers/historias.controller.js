const { getDb } = require('../database/db');

function formatarHistoria(item) {
  return {
    id: item.id,
    titulo: item.titulo,
    autor: item.autora,
    sinopse: item.sinopse,
    genero: item.genero,
    capaUrl: item.capa_url,
    totalCapitulos: item.total_capitulos,
    destaque: !!item.destaque,
    criadoEm: item.created_at,
    tags: item.tags ? JSON.parse(item.tags) : [],
  };
}

/**
 * GET /historias
 * Lista histórias ativas com paginação, filtro por gênero e busca por título.
 */
const listar = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, genero, busca, destaque, ordenar } = req.query;
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    const offset = (parsedPage - 1) * parsedLimit;

    const db = await getDb();

    let whereClauses = ["status = 'ativo'"];
    let params = [];

    if (genero) {
      whereClauses.push("genero = ?");
      params.push(genero);
    }

    if (busca) {
      whereClauses.push("titulo LIKE ?");
      params.push(`%${busca}%`);
    }

    if (destaque === 'true' || destaque === '1' || destaque === 1) {
      whereClauses.push("destaque = 1");
    }

    let orderClause = "ORDER BY created_at DESC";
    if (ordenar === 'maisLidas') {
      orderClause = "ORDER BY total_capitulos DESC";
    }

    const whereString = whereClauses.join(' AND ');

    const countRow = await db.get(`SELECT COUNT(*) as count FROM historias WHERE ${whereString}`, params);
    const total = countRow.count;

    const data = await db.all(`SELECT * FROM historias WHERE ${whereString} ${orderClause} LIMIT ? OFFSET ?`, [...params, parsedLimit, offset]);

    const formattedData = data.map(formatarHistoria);

    return res.json({
      data: formattedData,
      paginacao: {
        pagina: parsedPage,
        limite: parsedLimit,
        total: total,
        totalPaginas: Math.ceil((total || 0) / parsedLimit),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /historias/:id
 * Retorna os detalhes de uma história específica.
 */
const detalhe = async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    const historia = await db.get(`SELECT * FROM historias WHERE id = ? AND status = 'ativo'`, [id]);

    if (!historia) {
      return res.status(404).json({ error: 'História não encontrada.' });
    }

    return res.json({ data: formatarHistoria(historia) });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /historias/:id/capitulos
 * Lista capítulos de uma história (sem o campo conteudo), ordenados por número.
 */
const listarCapitulos = async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    // Verificar se a história existe
    const historia = await db.get(`SELECT id FROM historias WHERE id = ? AND status = 'ativo'`, [id]);

    if (!historia) {
      return res.status(404).json({ error: 'História não encontrada.' });
    }

    const capitulos = await db.all(
      `SELECT id, historia_id, numero, titulo, is_gratuito, custo_moedas, created_at FROM capitulos WHERE historia_id = ? ORDER BY numero ASC`,
      [id]
    );

    // Determinar se o usuário (quando logado) já desbloqueou cada capítulo pago
    let usuario = null;
    let leituraIds = new Set();
    if (req.userId) {
      usuario = await db.get('SELECT plano, vip_expira_em FROM usuarios WHERE id = ?', [req.userId]);
      const leituras = await db.all(
        'SELECT capitulo_id FROM leituras WHERE usuario_id = ? AND historia_id = ?',
        [req.userId, id]
      );
      leituraIds = new Set(leituras.map((l) => l.capitulo_id));
    }

    const vipAtivo = !!(
      usuario &&
      usuario.plano === 'vip' &&
      usuario.vip_expira_em &&
      new Date(usuario.vip_expira_em) > new Date()
    );

    const formattedCapitulos = capitulos.map((c) => {
      const gratuito = c.is_gratuito === 1 || c.is_gratuito === true;
      const bloqueado = !gratuito && !vipAtivo && !leituraIds.has(c.id);

      return {
        id: c.id,
        historiaId: c.historia_id,
        numero: c.numero,
        titulo: c.titulo,
        gratuito,
        bloqueado,
        custoMoedas: c.custo_moedas,
      };
    });

    return res.json({ data: formattedCapitulos });
  } catch (err) {
    next(err);
  }
};

module.exports = { listar, detalhe, listarCapitulos };
