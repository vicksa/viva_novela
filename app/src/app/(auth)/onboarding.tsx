import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, useWindowDimensions, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import Button from '@/components/ui/Button';

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  gradientColors: string[];
}

const SLIDES: Slide[] = [
  {
    id: '1',
    title: 'Descubra histórias apaixonantes',
    subtitle: 'Mergulhe em romances envolventes de alta qualidade, criados sob medida para fazer o seu coração bater mais forte.',
    iconName: '🌹',
    gradientColors: [Colors.primary, Colors.primaryDark],
  },
  {
    id: '2',
    title: 'Capítulos rápidos para o dia a dia',
    subtitle: 'Episódios curtos e dinâmicos de 5 minutos. Perfeitos para ler no ônibus, na fila do banco ou antes de dormir.',
    iconName: '⏱️',
    gradientColors: [Colors.accent, Colors.primary],
  },
  {
    id: '3',
    title: 'Comece grátis hoje mesmo',
    subtitle: 'Os primeiros capítulos são sempre gratuitos. Destrave novos episódios diariamente ou assine para leitura ilimitada.',
    iconName: '✨',
    gradientColors: [Colors.primaryDark, '#1A040A'],
  },
];

export default function OnboardingScreen() {
  const { width, height } = useWindowDimensions();
  const router = useRouter();
  const setOnboarded = useAuthStore((state) => state.setOnboarded);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<Slide>>(null);

  const handleSkip = () => {
    setOnboarded(true);
    router.replace('/(auth)/login');
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      setOnboarded(true);
      router.replace('/(auth)/cadastro');
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  });

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  });

  const renderSlide = ({ item }: { item: Slide }) => {
    return (
      <View style={[styles.slideContainer, { width }]}>
        <View style={styles.visualContainer}>
          <View style={[styles.glowCircle, { backgroundColor: item.gradientColors[0] + '40' }]} />
          <View style={[styles.iconCircle, { borderColor: Colors.accent }]}>
            <Text style={styles.iconEmoji}>{item.iconName}</Text>
          </View>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Skip Button */}
      {currentIndex < SLIDES.length - 1 && (
        <Pressable onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Pular</Text>
        </Pressable>
      )}

      {/* Slide List */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
        keyExtractor={(item) => item.id}
      />

      {/* Bottom controls */}
      <View style={styles.bottomContainer}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* Action Button */}
        <Button
          title={currentIndex === SLIDES.length - 1 ? 'Começar Agora' : 'Avançar'}
          onPress={handleNext}
          variant="primary"
          fullWidth
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
  skipButton: {
    position: 'absolute',
    top: 50,
    right: Spacing.lg,
    zIndex: 10,
    padding: Spacing.sm,
  },
  skipText: {
    ...Typography.bodySmall,
    color: Colors.accent,
    fontFamily: 'Lato_700Bold',
  },
  slideContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  visualContainer: {
    width: 260,
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  glowCircle: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  iconEmoji: {
    fontSize: 64,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  title: {
    ...Typography.headline,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: 34,
  },
  subtitle: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.textSecondary,
    lineHeight: 24,
    paddingHorizontal: Spacing.sm,
  },
  bottomContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    height: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 20,
    backgroundColor: Colors.accent,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: Colors.textMuted,
  },
});
