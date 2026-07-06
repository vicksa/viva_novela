import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert, SafeAreaView } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function PerfilScreen() {
  const { user, signOut } = useAuthStore();
  const { nome, plano, saldoMoedas, fetchProfile, isLoading } = useUserStore();

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleComprarMoedas = () => {
    Alert.alert(
      'Loja de Moedas',
      'A loja de moedas estará disponível em breve! No MVP, você pode testar as funções gratuitamente ou ler os capítulos livres.'
    );
  };

  const handleUpgradeVip = () => {
    Alert.alert(
      'Plano VIP',
      'Assinaturas VIP com leitura ilimitada estarão disponíveis na próxima versão do Viva Novela!'
    );
  };

  const handleSair = () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja sair de sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const initial = nome ? nome.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || 'U');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Info Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.userName}>{nome || 'Leitora Viva Novela'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Coins Wallet Card */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardEmoji}>🪙</Text>
            <View style={styles.cardHeaderTexts}>
              <Text style={styles.cardTitle}>Meu Saldo</Text>
              <Text style={styles.cardValue}>{saldoMoedas} moedas</Text>
            </View>
          </View>
          <Button
            title="Comprar Moedas"
            onPress={handleComprarMoedas}
            variant="secondary"
            fullWidth
            style={styles.cardButton}
          />
        </Card>

        {/* VIP subscription Card */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardEmoji}>👑</Text>
            <View style={styles.cardHeaderTexts}>
              <Text style={styles.cardTitle}>Plano Atual</Text>
              <Text style={styles.cardValue}>
                {plano === 'vip' ? 'Assinatura VIP' : 'Plano Gratuito'}
              </Text>
            </View>
          </View>
          <Button
            title={plano === 'vip' ? 'Gerenciar VIP' : 'Seja VIP Ilimitado'}
            onPress={handleUpgradeVip}
            variant={plano === 'vip' ? 'ghost' : 'primary'}
            fullWidth
            style={styles.cardButton}
          />
        </Card>

        {/* General settings / options */}
        <View style={styles.menuSection}>
          <Button
            title="Sair da Conta"
            onPress={handleSair}
            variant="danger"
            fullWidth
            style={styles.logoutButton}
          />
        </View>

        {/* Version */}
        <Text style={styles.versionText}>Viva Novela v1.0.0 (MVP)</Text>
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.title,
    fontSize: 22,
    color: Colors.text,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  avatarText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 36,
    color: Colors.text,
  },
  userName: {
    ...Typography.title,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  card: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardEmoji: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  cardHeaderTexts: {
    flex: 1,
  },
  cardTitle: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
  },
  cardValue: {
    ...Typography.subtitle,
    color: Colors.text,
    marginTop: 2,
  },
  cardButton: {
    marginTop: 4,
  },
  menuSection: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  logoutButton: {
    backgroundColor: Colors.error,
  },
  versionText: {
    ...Typography.meta,
    textAlign: 'center',
    color: Colors.textMuted,
  },
});
