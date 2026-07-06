import React from 'react';
import { StyleSheet, View, Text, SafeAreaView } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';

export default function BibliotecaScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minha Biblioteca</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.icon}>📚</Text>
        <Text style={styles.title}>Biblioteca Pessoal</Text>
        <Text style={styles.subtitle}>
          Esta funcionalidade estará disponível em breve! Aqui você poderá salvar suas novelas favoritas, criar marcadores e acompanhar o seu progresso de leitura.
        </Text>
      </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: 80,
  },
  icon: {
    fontSize: 72,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.title,
    color: Colors.accent,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
