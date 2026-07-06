import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { useHistoria, useCapitulos } from '@/hooks/useHistorias';
import CapituloItem from '@/components/CapituloItem';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function HistoriaDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [expandSinopse, setExpandSinopse] = useState(false);

  const { data: historia, isLoading: loadingHistoria, error: histError } = useHistoria(id);
  const { data: capitulos, isLoading: loadingCapitulos } = useCapitulos(id);

  if (loadingHistoria || !id) {
    return <LoadingScreen label="Carregando história..." />;
  }

  if (histError || !historia) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Erro ao carregar os detalhes da história.</Text>
        <Button title="Voltar" onPress={() => router.back()} variant="primary" />
      </SafeAreaView>
    );
  }

  // Calculate estimated reading time (approx 3 mins per chapter)
  const tempoLeitura = (capitulos?.length || 0) * 3;

  const handleComecarLeitura = () => {
    if (capitulos && capitulos.length > 0) {
      // Find first chapter (usually numero = 1)
      const primeiroCapitulo = capitulos.find(c => c.numero === 1) || capitulos[0];
      router.push(`/leitor/${primeiroCapitulo.id}`);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Cover image area with back button */}
        <View style={styles.coverContainer}>
          <View style={styles.coverPlaceholder}>
            <Text style={styles.coverIcon}>🌹</Text>
            <View style={[styles.coverOverlay, { backgroundColor: Colors.primaryDark + '80' }]} />
          </View>
          
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>✕</Text>
          </Pressable>
        </View>

        {/* Text Details Area */}
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{historia.titulo}</Text>
          <Text style={styles.author}>Por {historia.autor}</Text>

          {/* Genre Badges */}
          <View style={styles.badgeRow}>
            <Badge label={historia.genero} variant="new" />
            <Badge label="Completo" variant="vip" />
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{capitulos?.length || 0}</Text>
              <Text style={styles.statLabel}>Capítulos</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{tempoLeitura} min</Text>
              <Text style={styles.statLabel}>Leitura est.</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>🔥</Text>
              <Text style={styles.statLabel}>Alta Relevância</Text>
            </View>
          </View>

          {/* Sinopse */}
          <View style={styles.sinopseContainer}>
            <Text style={styles.sectionTitle}>Sinopse</Text>
            <Text
              style={styles.sinopseText}
              numberOfLines={expandSinopse ? undefined : 3}
            >
              {historia.sinopse}
            </Text>
            <Pressable onPress={() => setExpandSinopse(!expandSinopse)} style={styles.expandButton}>
              <Text style={styles.expandButtonText}>
                {expandSinopse ? 'Ler menos ▲' : 'Ler mais ▼'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.divider} />

          {/* Chapters List Header */}
          <Text style={[styles.sectionTitle, styles.chaptersTitle]}>Lista de Capítulos</Text>
          
          {loadingCapitulos ? (
            <ActivityIndicator color={Colors.accent} size="small" style={styles.spinner} />
          ) : capitulos && capitulos.length > 0 ? (
            <View style={styles.chaptersList}>
              {capitulos.map((cap) => (
                <CapituloItem
                  key={cap.id}
                  id={cap.id}
                  historiaId={cap.historiaId}
                  numero={cap.numero}
                  titulo={cap.titulo}
                  gratuito={cap.gratuito}
                  bloqueado={cap.bloqueado}
                  palavras={cap.palavras}
                />
              ))}
            </View>
          ) : (
            <Text style={styles.noChaptersText}>Nenhum capítulo disponível ainda.</Text>
          )}
        </View>
      </ScrollView>

      {/* Fixed bottom floating action button */}
      <View style={styles.bottomBar}>
        <Button
          title="Começar a Ler"
          onPress={handleComecarLeitura}
          variant="primary"
          fullWidth
          disabled={!capitulos || capitulos.length === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 100, // Make room for bottom bar
  },
  coverContainer: {
    height: 280,
    width: '100%',
    position: 'relative',
  },
  coverPlaceholder: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverIcon: {
    fontSize: 72,
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Lato_700Bold',
  },
  detailsContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  title: {
    ...Typography.headline,
    fontSize: 26,
    lineHeight: 32,
    marginBottom: Spacing.xs,
  },
  author: {
    ...Typography.accent,
    color: Colors.accent,
    marginBottom: Spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 18,
    color: Colors.text,
  },
  statLabel: {
    ...Typography.meta,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sinopseContainer: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.subtitle,
    fontSize: 18,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  sinopseText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  expandButton: {
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
  },
  expandButtonText: {
    ...Typography.labelSmall,
    color: Colors.accent,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
  },
  chaptersTitle: {
    marginBottom: Spacing.md,
  },
  spinner: {
    marginVertical: Spacing.xl,
  },
  chaptersList: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  noChaptersText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
    marginVertical: Spacing.xl,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    ...Typography.body,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
});
