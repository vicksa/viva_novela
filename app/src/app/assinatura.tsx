import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert, SafeAreaView, Pressable } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';
import { useAssinaturaStatus, useCriarAssinatura, useCancelarAssinatura, Frequencia } from '@/hooks/usePagamentos';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

// Mantenha os valores em sincronia com PLANOS em api/src/controllers/pagamentos.controller.js
const PLANOS: { frequencia: Frequencia; titulo: string; preco: string; detalhe: string }[] = [
  { frequencia: 'mensal', titulo: 'Mensal', preco: 'R$ 19,90', detalhe: 'por mês' },
  { frequencia: 'anual', titulo: 'Anual', preco: 'R$ 149,90', detalhe: 'por ano (economize)' },
];

export default function AssinaturaScreen() {
  const router = useRouter();
  const { plano, vipExpiraEm, fetchProfile } = useUserStore();
  const { data: assinatura, refetch: refetchAssinatura } = useAssinaturaStatus();
  const criarAssinatura = useCriarAssinatura();
  const cancelarAssinatura = useCancelarAssinatura();
  const [processando, setProcessando] = useState<Frequencia | null>(null);

  const isVip = plano === 'vip';

  const handleAssinar = async (frequencia: Frequencia) => {
    setProcessando(frequencia);
    try {
      const { checkoutUrl } = await criarAssinatura.mutateAsync(frequencia);
      await WebBrowser.openBrowserAsync(checkoutUrl);
      // A confirmação chega por webhook assíncrono — recarrega o estado ao voltar.
      await Promise.all([fetchProfile(), refetchAssinatura()]);
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Não foi possível iniciar a assinatura.');
    } finally {
      setProcessando(null);
    }
  };

  const handleCancelar = () => {
    Alert.alert('Cancelar assinatura', 'Tem certeza que deseja cancelar sua assinatura VIP?', [
      { text: 'Voltar', style: 'cancel' },
      {
        text: 'Cancelar assinatura',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelarAssinatura.mutateAsync();
            await fetchProfile();
            Alert.alert('Assinatura cancelada', 'Você continua com acesso VIP até o fim do período já pago.');
          } catch (err: any) {
            Alert.alert('Erro', err.message || 'Não foi possível cancelar a assinatura.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>✕ Fechar</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Viva Novela VIP</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.crownEmoji}>👑</Text>
        <Text style={styles.titulo}>Leitura ilimitada</Text>
        <Text style={styles.subtitulo}>
          Assine o VIP e desbloqueie todos os capítulos de todas as histórias, sem esperar e sem pagar por
          capítulo.
        </Text>

        {isVip ? (
          <Card style={styles.card}>
            <Text style={styles.statusTitle}>Você já é VIP</Text>
            {vipExpiraEm && (
              <Text style={styles.statusDetalhe}>
                Válido até {new Date(vipExpiraEm).toLocaleDateString('pt-BR')}
              </Text>
            )}
            {assinatura?.status === 'authorized' && (
              <Button
                title="Cancelar assinatura"
                onPress={handleCancelar}
                variant="danger"
                fullWidth
                loading={cancelarAssinatura.isPending}
                style={styles.cardButton}
              />
            )}
          </Card>
        ) : (
          PLANOS.map((p) => (
            <Card key={p.frequencia} style={styles.card}>
              <Text style={styles.planoTitulo}>{p.titulo}</Text>
              <Text style={styles.planoPreco}>{p.preco}</Text>
              <Text style={styles.planoDetalhe}>{p.detalhe}</Text>
              <Button
                title="Assinar"
                onPress={() => handleAssinar(p.frequencia)}
                variant="primary"
                fullWidth
                loading={processando === p.frequencia}
                disabled={processando !== null}
                style={styles.cardButton}
              />
            </Card>
          ))
        )}

        <Text style={styles.aviso}>
          O pagamento é processado pelo Mercado Pago. A confirmação da assinatura pode levar alguns instantes
          após o checkout.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    marginRight: Spacing.md,
  },
  backText: {
    fontFamily: 'Lato_700Bold',
    fontSize: 15,
    color: Colors.text,
  },
  headerTitle: {
    ...Typography.title,
    fontSize: 20,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    alignItems: 'center',
  },
  crownEmoji: {
    fontSize: 56,
    marginBottom: Spacing.md,
  },
  titulo: {
    ...Typography.title,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitulo: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  card: {
    width: '100%',
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  planoTitulo: {
    ...Typography.label,
    color: Colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  planoPreco: {
    ...Typography.headline,
    marginTop: Spacing.xs,
  },
  planoDetalhe: {
    ...Typography.bodySmall,
    marginBottom: Spacing.md,
  },
  cardButton: {
    marginTop: Spacing.sm,
    width: '100%',
  },
  statusTitle: {
    ...Typography.subtitle,
  },
  statusDetalhe: {
    ...Typography.bodySmall,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  aviso: {
    ...Typography.meta,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
