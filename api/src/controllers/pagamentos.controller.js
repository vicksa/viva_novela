const crypto = require('crypto');
const { MercadoPagoConfig, PreApproval, WebhookSignatureValidator } = require('mercadopago');
const { getDb, withTransaction } = require('../database/db');
const config = require('../config');

const mpClient = new MercadoPagoConfig({ accessToken: config.mercadoPago.accessToken });
const preApprovalClient = new PreApproval(mpClient);

// Valores de exemplo — ajuste para os preços reais da assinatura VIP.
const PLANOS = {
  mensal: { frequency: 1, frequency_type: 'months', valor: 19.9 },
  anual: { frequency: 12, frequency_type: 'months', valor: 149.9 },
};

function calcularProximoPagamento(frequencia) {
  const data = new Date();
  if (frequencia === 'anual') {
    data.setFullYear(data.getFullYear() + 1);
  } else {
    data.setMonth(data.getMonth() + 1);
  }
  return data;
}

/**
 * Valida a notificação do Mercado Pago usando o validador oficial do SDK
 * (header x-signature + x-request-id, HMAC-SHA256 contra o webhook secret).
 */
function assinaturaWebhookValida(req) {
  try {
    WebhookSignatureValidator.validate({
      xSignature: req.headers['x-signature'],
      xRequestId: req.headers['x-request-id'],
      dataId: req.query['data.id'],
      secret: config.mercadoPago.webhookSecret,
    });
    return true;
  } catch {
    return false;
  }
}

const pagamentosController = {
  async criarAssinatura(req, res, next) {
    try {
      const { frequencia } = req.body;
      const plano = PLANOS[frequencia];

      const db = await getDb();
      const usuario = await db.get('SELECT id, email, nome FROM usuarios WHERE id = ?', [req.userId]);
      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      // O Mercado Pago exige um back_url http(s) válido (não aceita esquemas
      // customizados como vivanovela://) — usamos uma página própria da API
      // que redireciona pro app via deep link (ver GET /pagamentos/retorno).
      const backUrl = `${req.protocol}://${req.get('host')}/pagamentos/retorno`;

      const preapproval = await preApprovalClient.create({
        body: {
          reason: `Viva Novela VIP - ${frequencia}`,
          external_reference: usuario.id,
          payer_email: usuario.email,
          back_url: backUrl,
          auto_recurring: {
            frequency: plano.frequency,
            frequency_type: plano.frequency_type,
            transaction_amount: plano.valor,
            currency_id: 'BRL',
          },
        },
      });

      await db.run(
        `INSERT INTO assinaturas (id, usuario_id, mp_preapproval_id, status, frequencia, valor_reais)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [crypto.randomUUID(), usuario.id, preapproval.id, 'pending', frequencia, plano.valor]
      );

      res.status(201).json({ data: { checkoutUrl: preapproval.init_point } });
    } catch (error) {
      next(error);
    }
  },

  async webhook(req, res, next) {
    try {
      if (!assinaturaWebhookValida(req)) {
        // Não confia na notificação, mas responde 200 para o MP não ficar reenviando.
        return res.sendStatus(200);
      }

      const preapprovalId = req.query['data.id'];
      const db = await getDb();

      // Idempotência: o MP reenvia a notificação se não responder 200 a tempo.
      // req.body.id é o id da notificação em si (diferente de data.id, que é o
      // id do recurso/assinatura e se repete entre notificações distintas do
      // mesmo preapproval). "Reivindica" o evento com um INSERT que falha
      // silenciosamente (ON CONFLICT DO NOTHING) se já foi visto — só quem
      // conseguir inserir a linha processa o evento.
      const eventId = req.body?.id ? String(req.body.id) : `${preapprovalId}:${req.query.action || req.query.type || ''}`;
      const eventType = req.body?.type || req.query.type || null;
      const evento = await db.get(
        `INSERT INTO webhook_events (provider, event_id, event_type, payload)
         VALUES ('mercadopago', ?, ?, ?)
         ON CONFLICT (provider, event_id) DO NOTHING
         RETURNING id`,
        [eventId, eventType, JSON.stringify(req.body || {})]
      );

      if (!evento) {
        // Já processado antes — confirma recebimento sem reprocessar.
        return res.sendStatus(200);
      }

      const preapproval = await preApprovalClient.get({ id: preapprovalId });

      const assinatura = await db.get('SELECT * FROM assinaturas WHERE mp_preapproval_id = ?', [preapprovalId]);
      if (!assinatura) return res.sendStatus(200);

      if (preapproval.status === 'authorized') {
        const proximoPagamento = calcularProximoPagamento(assinatura.frequencia);

        await withTransaction(async (trx) => {
          await trx.run(
            "UPDATE assinaturas SET status = 'authorized', proximo_pagamento_em = ? WHERE id = ?",
            [proximoPagamento.toISOString(), assinatura.id]
          );
          await trx.run('UPDATE usuarios SET plano = ?, vip_expira_em = ? WHERE id = ?', [
            'vip',
            proximoPagamento.toISOString(),
            assinatura.usuario_id,
          ]);
          await trx.run(
            `INSERT INTO compras (id, usuario_id, tipo, valor_reais, gateway_id, status)
             VALUES (?, ?, 'assinatura', ?, ?, 'aprovado')`,
            [crypto.randomUUID(), assinatura.usuario_id, assinatura.valor_reais, preapprovalId]
          );
        });
      } else if (preapproval.status === 'cancelled' || preapproval.status === 'paused') {
        await db.run('UPDATE assinaturas SET status = ? WHERE id = ?', [preapproval.status, assinatura.id]);
      }

      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  },

  async cancelarAssinatura(req, res, next) {
    try {
      const db = await getDb();
      const assinatura = await db.get(
        "SELECT * FROM assinaturas WHERE usuario_id = ? AND status = 'authorized' ORDER BY criado_em DESC LIMIT 1",
        [req.userId]
      );

      if (!assinatura) {
        return res.status(404).json({ error: 'Nenhuma assinatura ativa encontrada.' });
      }

      await preApprovalClient.update({ id: assinatura.mp_preapproval_id, body: { status: 'cancelled' } });

      await db.run("UPDATE assinaturas SET status = 'cancelled', cancelado_em = NOW() WHERE id = ?", [
        assinatura.id,
      ]);

      res.json({ data: { message: 'Assinatura cancelada com sucesso.' } });
    } catch (error) {
      next(error);
    }
  },

  async statusAssinatura(req, res, next) {
    try {
      const db = await getDb();
      const assinatura = await db.get(
        'SELECT * FROM assinaturas WHERE usuario_id = ? ORDER BY criado_em DESC LIMIT 1',
        [req.userId]
      );

      res.json({ data: assinatura || null });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = pagamentosController;
