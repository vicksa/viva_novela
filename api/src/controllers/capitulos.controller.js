const { getDb, withTransaction } = require('../database/db');
const crypto = require('crypto');

/**
 * GET /capitulos/:id
 * Lógica completa de acesso a capítulo:
 * 1. Busca capítulo no DB
 * 2. Se is_gratuito → retorna conteúdo
 * 3. Se não logado → { acesso: false, motivo: 'login_required' }
 * 4. Se user.plano === 'vip' && vip não expirado → retorna conteúdo
 * 5. Se já tem leitura (releitura) → retorna conteúdo
 * 6. Se saldo_moedas >= custo → debita moedas, cria leitura, retorna conteúdo
 * 7. Senão → { acesso: false, motivo: 'sem_moedas', custo }
 */
const obterCapitulo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    // 1. Buscar capítulo
    const capitulo = await db.get('SELECT * FROM capitulos WHERE id = ?', [id]);

    if (!capitulo) {
      return res.status(404).json({ error: 'Capítulo não encontrado.' });
    }

    const isGratuito = capitulo.is_gratuito === 1 || capitulo.is_gratuito === true;

    // 2. Capítulo gratuito → acesso livre
    if (isGratuito) {
      return res.json({
        data: {
          acesso: true,
          capitulo: {
            ...capitulo,
            is_gratuito: true
          },
        },
      });
    }

    // 3. Não logado → precisa de login
    if (!req.userId) {
      return res.json({
        data: {
          acesso: false,
          motivo: 'login_required',
          capitulo: {
            id: capitulo.id,
            historia_id: capitulo.historia_id,
            numero: capitulo.numero,
            titulo: capitulo.titulo,
            custo_moedas: capitulo.custo_moedas,
            is_gratuito: false
          },
        },
      });
    }

    // A partir daqui, checar saldo + debitar moedas + criar leitura precisa ser
    // atômico para não debitar em duplicidade sob requisições concorrentes.
    // `SELECT ... FOR UPDATE` trava a linha do usuário até o COMMIT, então uma
    // segunda requisição concorrente para o mesmo usuário espera esta terminar
    // antes de ler o saldo (em vez de ambas lerem o mesmo saldo desatualizado).
    const resultado = await withTransaction(async (tdb) => {
      // 4. Buscar dados do usuário (com lock de linha)
      const usuario = await tdb.get(
        'SELECT id, plano, vip_expira_em, saldo_moedas FROM usuarios WHERE id = ? FOR UPDATE',
        [req.userId]
      );

      if (!usuario) {
        return { status: 404, body: { error: 'Usuário não encontrado no banco de dados.' } };
      }

      // 5. Verificar se é VIP ativo
      if (usuario.plano === 'vip' && usuario.vip_expira_em) {
        const vipExpira = new Date(usuario.vip_expira_em);
        if (vipExpira > new Date()) {
          return {
            status: 200,
            body: {
              data: {
                acesso: true,
                motivo: 'vip',
                capitulo: { ...capitulo, is_gratuito: false },
              },
            },
          };
        }
      }

      // 6. Verificar se já tem leitura (releitura gratuita)
      const leituraExistente = await tdb.get(
        'SELECT id FROM leituras WHERE usuario_id = ? AND capitulo_id = ?',
        [req.userId, id]
      );

      if (leituraExistente) {
        return {
          status: 200,
          body: {
            data: {
              acesso: true,
              motivo: 'releitura',
              capitulo: { ...capitulo, is_gratuito: false },
            },
          },
        };
      }

      // 7. Verificar saldo de moedas
      const custo = capitulo.custo_moedas || 0;

      if (usuario.saldo_moedas >= custo) {
        // Debitar moedas
        const novoSaldo = usuario.saldo_moedas - custo;

        await tdb.run(
          'UPDATE usuarios SET saldo_moedas = ? WHERE id = ?',
          [novoSaldo, req.userId]
        );

        // Criar registro de leitura
        const leituraId = crypto.randomUUID();
        await tdb.run(
          'INSERT INTO leituras (id, usuario_id, capitulo_id, historia_id, posicao_scroll, percentual_lido) VALUES (?, ?, ?, ?, ?, ?)',
          [leituraId, req.userId, id, capitulo.historia_id, 0, 0]
        );

        return {
          status: 200,
          body: {
            data: {
              acesso: true,
              motivo: 'moedas_debitadas',
              moedas_gastas: custo,
              saldo_restante: novoSaldo,
              capitulo: { ...capitulo, is_gratuito: false },
            },
          },
        };
      }

      // 8. Sem moedas suficientes
      return {
        status: 200,
        body: {
          data: {
            acesso: false,
            motivo: 'sem_moedas',
            custo: custo,
            saldo_atual: usuario.saldo_moedas,
            capitulo: {
              id: capitulo.id,
              historia_id: capitulo.historia_id,
              numero: capitulo.numero,
              titulo: capitulo.titulo,
              custo_moedas: capitulo.custo_moedas,
              is_gratuito: false
            },
          },
        },
      };
    });

    return res.status(resultado.status).json(resultado.body);
  } catch (err) {
    next(err);
  }
};

module.exports = { obterCapitulo };
