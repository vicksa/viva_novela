import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, BorderRadius, Spacing } from '@/constants/theme';
import Badge from '@/components/ui/Badge';

interface HistoriaCardProps {
  id: string;
  titulo: string;
  autor: string;
  genero: string;
  totalCapitulos?: number;
  capaUrl?: string;
}

const GENRE_GRADIENTS: Record<string, string[]> = {
  Romance: [Colors.primary, Colors.primaryLight],
  Drama: ['#2D1B4E', '#4A2D7A'],
  Suspense: ['#1A2A3A', '#2C4A5A'],
  Comédia: ['#3A2A1A', '#5A4A2A'],
  'Comédia Romântica': ['#3A2A1A', '#5A4A2A'],
  Fantasia: ['#1A3A2A', '#2A5A4A'],
};

function getGradientColors(genero: string): [string, string] {
  const colors = GENRE_GRADIENTS[genero] ?? [Colors.primaryDark, Colors.primary];
  return [colors[0], colors[1]];
}

export default function HistoriaCard({ id, titulo, autor, genero, totalCapitulos = 0 }: HistoriaCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/historia/${id}`);
  };

  const [startColor] = getGradientColors(genero);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={styles.container}
    >
      <View style={[styles.cover, { backgroundColor: startColor }]}>
        <View style={styles.coverInner}>
          <Text style={styles.coverLetter}>
            {titulo.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Badge label={genero} variant="new" />
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {titulo}
      </Text>
      <Text style={styles.author} numberOfLines={1}>
        {autor || 'Autora'}
      </Text>
      <Text style={styles.chapters}>
        {totalCapitulos} capítulos
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    marginRight: Spacing.md,
  },
  cover: {
    width: 160,
    height: 200,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    justifyContent: 'space-between',
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  coverInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverLetter: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 64,
    color: 'rgba(255,255,255,0.15)',
  },
  title: {
    ...Typography.label,
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 2,
  },
  author: {
    ...Typography.meta,
    marginBottom: 2,
  },
  chapters: {
    ...Typography.meta,
    color: Colors.accent,
    fontSize: 11,
  },
});
