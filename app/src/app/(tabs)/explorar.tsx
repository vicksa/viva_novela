import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, Pressable, FlatList, SafeAreaView } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { useHistorias } from '@/hooks/useHistorias';
import HistoriaCard from '@/components/HistoriaCard';
import LoadingScreen from '@/components/ui/LoadingScreen';

const GENEROS = ['Todos', 'Romance', 'Drama', 'Suspense', 'Comédia Romântica', 'Fantasia'];

export default function ExplorarScreen() {
  const [generoSelecionado, setGeneroSelecionado] = useState('Todos');
  const [busca, setBusca] = useState('');
  const [buscaDebounced, setBuscaDebounced] = useState('');

  // Debouncing busca value manually
  const handleBuscaChange = (text: string) => {
    setBusca(text);
    // Basic debounce logic (simplified for React Native)
    const timeoutId = setTimeout(() => {
      setBuscaDebounced(text);
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  const generoParam = generoSelecionado === 'Todos' ? undefined : generoSelecionado;
  
  const { data: historias, isLoading } = useHistorias(generoParam, buscaDebounced || undefined);

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar histórias ou autoras..."
            placeholderTextColor={Colors.textMuted}
            value={busca}
            onChangeText={handleBuscaChange}
            autoCorrect={false}
          />
          {busca.length > 0 && (
            <Pressable onPress={() => handleBuscaChange('')} style={styles.clearButton}>
              <Text style={styles.clearText}>✕</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Genre filter chips */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {GENEROS.map((gen) => {
            const isSelected = generoSelecionado === gen;
            return (
              <Pressable
                key={gen}
                onPress={() => setGeneroSelecionado(gen)}
                style={[
                  styles.chip,
                  isSelected ? styles.activeChip : styles.inactiveChip
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected ? styles.activeChipText : styles.inactiveChipText
                  ]}
                >
                  {gen}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Story grid list */}
      {isLoading ? (
        <LoadingScreen label="Buscando histórias..." />
      ) : historias && historias.length > 0 ? (
        <FlatList
          data={historias}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContainer}
          renderItem={({ item }) => (
            <View style={styles.gridItemContainer}>
              <HistoriaCard {...item} />
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📖</Text>
          <Text style={styles.emptyTitle}>Nenhuma história encontrada</Text>
          <Text style={styles.emptySubtitle}>
            Tente mudar o gênero ou ajustar os termos da sua pesquisa.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchHeader: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Lato_400Regular',
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 0,
  },
  clearButton: {
    padding: Spacing.xs,
  },
  clearText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  filterSection: {
    paddingVertical: Spacing.md,
  },
  filterScroll: {
    paddingHorizontal: Spacing.md,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm - 2,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    borderWidth: 1,
  },
  activeChip: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  inactiveChip: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  chipText: {
    fontFamily: 'Lato_700Bold',
    fontSize: 13,
  },
  activeChipText: {
    color: Colors.black,
  },
  inactiveChipText: {
    color: Colors.textSecondary,
  },
  gridContainer: {
    paddingHorizontal: Spacing.md - 4,
    paddingBottom: Spacing.xl,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  gridItemContainer: {
    flex: 0.48,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.title,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
