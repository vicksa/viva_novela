import React, { useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, BorderRadius, Spacing } from '@/constants/theme';
import type { Historia } from '@/hooks/useHistorias';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.8;
const CARD_HEIGHT = 200;

interface CarrosselDestaquesProps {
  historias: Historia[];
}

const GRADIENT_COLORS = [
  [Colors.primary, Colors.primaryDark],
  ['#2D1B4E', '#1A0E30'],
  ['#1A2A3A', '#0D1520'],
  ['#3A1A1A', '#200D0D'],
  ['#1A3A2A', '#0D2015'],
];

function DestaqueCard({ item, index }: { item: Historia; index: number }) {
  const router = useRouter();
  const colors = GRADIENT_COLORS[index % GRADIENT_COLORS.length];

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/historia/${item.id}`)}
      style={[styles.card, { backgroundColor: colors[0] }]}
    >
      <View style={styles.cardOverlay}>
        <View style={styles.decorativeCircle}>
          <Text style={styles.decorativeLetter}>
            {item.titulo.charAt(0)}
          </Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.genre}>{item.genero}</Text>
          <Text style={styles.title} numberOfLines={2}>
            {item.titulo}
          </Text>
          <Text style={styles.author}>{item.autor}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function CarrosselDestaques({ historias }: CarrosselDestaquesProps) {
  if (!historias || historias.length === 0) {
    // Placeholder cards when no data
    const placeholders: Historia[] = [
      { id: '1', titulo: 'Amor em Chamas', autor: 'Maria Silva', sinopse: '', genero: 'Romance', totalCapitulos: 24, criadoEm: '' },
      { id: '2', titulo: 'Segredos do Coração', autor: 'Ana Santos', sinopse: '', genero: 'Drama', totalCapitulos: 18, criadoEm: '' },
      { id: '3', titulo: 'Destinos Cruzados', autor: 'Julia Costa', sinopse: '', genero: 'Romance', totalCapitulos: 30, criadoEm: '' },
    ];
    historias = placeholders;
  }

  return (
    <FlatList
      data={historias}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={CARD_WIDTH + Spacing.md}
      decelerationRate="fast"
      contentContainerStyle={styles.listContent}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <DestaqueCard item={item} index={index} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: Spacing.md,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.md,
    overflow: 'hidden',
  },
  cardOverlay: {
    flex: 1,
    flexDirection: 'row',
    padding: Spacing.lg,
  },
  decorativeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    alignSelf: 'center',
  },
  decorativeLetter: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 40,
    color: 'rgba(255,255,255,0.2)',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  genre: {
    fontFamily: 'Lato_700Bold',
    fontSize: 10,
    color: Colors.accent,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  title: {
    ...Typography.title,
    fontSize: 20,
    lineHeight: 26,
    marginBottom: Spacing.xs,
  },
  author: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontSize: 13,
  },
});
