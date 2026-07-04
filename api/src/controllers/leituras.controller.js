const { getDb } = require('../database/db');
const crypto = require('crypto');

/**
 * POST /leituras
 * Salva ou atualiza a posição de leitura (upsert em usuario_id + capitulo_id).
 */
const salvarPosicao = async (req, res, next) => {
  try {
    const { capitulo_id, posicao_scroll, percentual_lido } = req.body;
    const db = await getDb();

    // Verificar se o capítulo existe
    const capitulo = await db.get('SELECT id, historia_id FROM capitulos WHERE id = ?', [capitulo_id]);

    if (!capitulo) {
      return res.status(404).json({ error: 'Capítulo não encontrado.' });
    }

    const leituraExistente = await db.get(
      'SELECT id FROM leituras WHERE usuario_id = ? AND capitulo_id = ?',
      [req.userId, capitulo_id]
    );

    let leituraId;
    const updatedAt = new Date().toISOString();

    if (leituraExistente) {
      leituraId = leituraExistente.id;
      await db.run(
        'UPDATE leituras SET posicao_scroll = ?, percentual_lido = ?, updated_at = ? WHERE id = ?',
        [posicao_scroll, percentual_lido, updatedAt, leituraId]
      );
    } else {
      leituraId = crypto.randomUUID();
      await db.run(
        'INSERT INTO leituras (id, usuario_id, capitulo_id, historia_id, posicao_scroll, percentual_lido, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [leituraId, req.userId, capitulo_id, capitulo.historia_id, posicao_scroll, percentual_lido, updatedAt]
      );
    }

    const data = await db.get('SELECT * FROM leituras WHERE id = ?', [leituraId]);

    return res.json({ data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /leituras/continuar
 * Retorna as histórias em progresso do usuário com informações do último capítulo lido.
 */
const continuarLendo = async (req, res, next) => {
  try {
    const db = await getDb();

    const query = `
      SELECT
        l.id, l.posicao_scroll, l.percentual_lido, l.updated_at,
        c.id as cap_id, c.numero as cap_numero, c.titulo as cap_titulo, c.historia_id as cap_historia_id,
        h.id as hist_id, h.titulo as hist_titulo, h.sinopse as hist_sinopse, h.genero as hist_genero,
        h.capa_url as hist_capa_url, h.autora as hist_autora, h.total_capitulos as hist_total_capitulos,
        h.created_at as hist_created_at
      FROM leituras l
      JOIN capitulos c ON l.capitulo_id = c.id
      JOIN historias h ON l.historia_id = h.id
      WHERE l.usuario_id = ?
      ORDER BY l.updated_at DESC
    `;

    const leituras = await db.all(query, [req.userId]);

    // Agrupar por história, mantendo apenas a leitura mais recente de cada
    const historiasMap = new Map();

    for (const leitura of leituras) {
      const historiaId = leitura.hist_id;
      if (!historiaId) continue;

      if (!historiasMap.has(historiaId)) {
        historiasMap.set(historiaId, {
          id: leitura.id,
          historia: {
            id: leitura.hist_id,
            titulo: leitura.hist_titulo,
            sinopse: leitura.hist_sinopse,
            genero: leitura.hist_genero,
            capaUrl: leitura.hist_capa_url,
            autor: leitura.hist_autora,
            totalCapitulos: leitura.hist_total_capitulos,
            criadoEm: leitura.hist_created_at,
          },
          capituloAtual: leitura.cap_numero,
          progresso: leitura.percentual_lido != null ? leitura.percentual_lido / 100 : 0,
          ultimaLeitura: leitura.updated_at,
        });
      }
    }

    const resultado = Array.from(historiasMap.values());

    return res.json({ data: resultado });
  } catch (err) {
    next(err);
  }
};

module.exports = { salvarPosicao, continuarLendo };
