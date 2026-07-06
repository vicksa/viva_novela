import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';
import HistoriaCard from '@/components/HistoriaCard';
import type { Historia } from '@/hooks/useHistorias';

interface SecaoHistoriasProps {
  titulo: string;
  historias: Historia[];
  onVerMais?: () => void;
}

export default function SecaoHistorias({ titulo, historias, onVerMais }: SecaoHistoriasProps) {
  if (!historias || historias.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>{titulo}</Text>
        {onVerMais && (
          <TouchableOpacity onPress={onVerMais}>
            <Text style={styles.verMais}>Ver Mais</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={historias}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <HistoriaCard {...item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  titulo: {
    ...Typography.subtitle,
  },
  verMais: {
    fontFamily: 'Lato_700Bold',
    fontSize: 13,
    color: Colors.accent,
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
  },
});
