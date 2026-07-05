const crypto = require('crypto');
const { getDb } = require('../database/db');

const adminController = {
  async listarUsuarios(req, res, next) {
    try {
      const db = await getDb();
      const usuarios = await db.all('SELECT id, email, nome, plano, saldo_moedas, vip_expira_em, criado_em, papel FROM usuarios');
      res.json({ data: usuarios });
    } catch (error) {
      next(error);
    }
  },

  async listarHistorias(req, res, next) {
    try {
      const db = await getDb();
      const historias = await db.all('SELECT * FROM historias ORDER BY created_at DESC');
      res.json({ data: historias });
    } catch (error) {
      next(error);
    }
  },

  async listarCapitulosPorHistoria(req, res, next) {
    try {
      const { id } = req.params;
      const db = await getDb();
      const capitulos = await db.all(
        'SELECT * FROM capitulos WHERE historia_id = ? ORDER BY numero ASC',
        [id]
      );
      res.json({ data: capitulos });
    } catch (error) {
      next(error);
    }
  },

  async editarUsuario(req, res, next) {
    try {
      const { id } = req.params;
      const { saldo_moedas, plano, papel } = req.body;
      const db = await getDb();

      const usuario = await db.get('SELECT id FROM usuarios WHERE id = ?', [id]);
      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      await db.run(
        'UPDATE usuarios SET saldo_moedas = ?, plano = ?, papel = ? WHERE id = ?',
        [saldo_moedas !== undefined ? saldo_moedas : usuario.saldo_moedas,
         plano || usuario.plano,
         papel || usuario.papel,
         id]
      );

      res.json({ data: { message: 'Usuário atualizado com sucesso.' } });
    } catch (error) {
      next(error);
    }
  },

  async criarHistoria(req, res, next) {
    try {
      const { titulo, sinopse, autora, capa_url, genero, tags, destaque, total_capitulos, status } = req.body;
      const db = await getDb();
      const id = crypto.randomUUID();

      await db.run(
        `INSERT INTO historias (id, titulo, sinopse, autora, capa_url, genero, tags, destaque, total_capitulos, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, titulo, sinopse, autora, capa_url, genero, tags, destaque ? 1 : 0, total_capitulos || 0, status || 'ativo']
      );

      res.status(201).json({ data: { id, message: 'História criada com sucesso.' } });
    } catch (error) {
      next(error);
    }
  },

  async editarHistoria(req, res, next) {
    try {
      const { id } = req.params;
      const { titulo, sinopse, autora, capa_url, genero, tags, destaque, total_capitulos, status } = req.body;
      const db = await getDb();

      const historia = await db.get('SELECT id FROM historias WHERE id = ?', [id]);
      if (!historia) {
        return res.status(404).json({ error: 'História não encontrada.' });
      }

      const query = `
        UPDATE historias 
        SET titulo = COALESCE(?, titulo),
            sinopse = COALESCE(?, sinopse),
            autora = COALESCE(?, autora),
            capa_url = COALESCE(?, capa_url),
            genero = COALESCE(?, genero),
            tags = COALESCE(?, tags),
            destaque = COALESCE(?, destaque),
            total_capitulos = COALESCE(?, total_capitulos),
            status = COALESCE(?, status)
        WHERE id = ?
      `;

      await db.run(query, [
        titulo, sinopse, autora, capa_url, genero, tags, 
        destaque !== undefined ? (destaque ? 1 : 0) : null, 
        total_capitulos, status, id
      ]);

      res.json({ data: { message: 'História atualizada com sucesso.' } });
    } catch (error) {
      next(error);
    }
  },

  async deletarHistoria(req, res, next) {
    try {
      const { id } = req.params;
      const db = await getDb();

      const historia = await db.get('SELECT id FROM historias WHERE id = ?', [id]);
      if (!historia) {
        return res.status(404).json({ error: 'História não encontrada.' });
      }

      await db.run('DELETE FROM capitulos WHERE historia_id = ?', [id]);
      await db.run('DELETE FROM historias WHERE id = ?', [id]);

      res.json({ data: { message: 'História deletada com sucesso.' } });
    } catch (error) {
      next(error);
    }
  },

  async criarCapitulo(req, res, next) {
    try {
      const { historia_id, titulo, conteudo, numero, is_gratuito, custo_moedas } = req.body;
      const db = await getDb();
      const id = crypto.randomUUID();

      await db.run(
        `INSERT INTO capitulos (id, historia_id, titulo, conteudo, numero, is_gratuito, custo_moedas)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, historia_id, titulo, conteudo, numero, is_gratuito ? 1 : 0, custo_moedas || 0]
      );

      res.status(201).json({ data: { id, message: 'Capítulo criado com sucesso.' } });
    } catch (error) {
      next(error);
    }
  },

  async editarCapitulo(req, res, next) {
    try {
      const { id } = req.params;
      const { titulo, conteudo, numero, is_gratuito, custo_moedas } = req.body;
      const db = await getDb();

      const capitulo = await db.get('SELECT id FROM capitulos WHERE id = ?', [id]);
      if (!capitulo) {
        return res.status(404).json({ error: 'Capítulo não encontrado.' });
      }

      const query = `
        UPDATE capitulos
        SET titulo = COALESCE(?, titulo),
            conteudo = COALESCE(?, conteudo),
            numero = COALESCE(?, numero),
            is_gratuito = COALESCE(?, is_gratuito),
            custo_moedas = COALESCE(?, custo_moedas)
        WHERE id = ?
      `;

      await db.run(query, [
        titulo, conteudo, numero, 
        is_gratuito !== undefined ? (is_gratuito ? 1 : 0) : null, 
        custo_moedas, id
      ]);

      res.json({ data: { message: 'Capítulo atualizado com sucesso.' } });
    } catch (error) {
      next(error);
    }
  },

  async deletarCapitulo(req, res, next) {
    try {
      const { id } = req.params;
      const db = await getDb();

      const capitulo = await db.get('SELECT id FROM capitulos WHERE id = ?', [id]);
      if (!capitulo) {
        return res.status(404).json({ error: 'Capítulo não encontrado.' });
      }

      await db.run('DELETE FROM capitulos WHERE id = ?', [id]);

      res.json({ data: { message: 'Capítulo deletado com sucesso.' } });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = adminController;
