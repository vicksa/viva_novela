import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { useCapitulo } from '@/hooks/useHistorias';
import { useReaderStore } from '@/store/readerStore';
import { useUserStore } from '@/store/userStore';
import { api } from '@/services/api';
import Button from '@/components/ui/Button';

export default function LeitorScreen() {
  const { capituloId } = useLocalSearchParams<{ capituloId: string }>();
  const router = useRouter();

  // Stores
  const { fontSize, isDarkMode, increaseFontSize, decreaseFontSize, toggleDarkMode, loadSettings } = useReaderStore();
  const { fetchProfile } = useUserStore();

  // State
  const [showControls, setShowControls] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  
  // Track last saved progress to avoid duplicate API calls
  const lastSavedProgress = useRef(0);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: result, isLoading, refetch } = useCapitulo(capituloId || '');

  useEffect(() => {
    loadSettings();
  }, []);

  // Debounced progress saving
  const handleScroll = (event: any) => {
    const { y } = event.nativeEvent.contentOffset;
    const height = event.nativeEvent.contentSize.height - event.nativeEvent.layoutMeasurement.height;
    if (height <= 0) return;
    
    const progress = Math.min(Math.max(y / height, 0), 1);
    setScrollProgress(progress);

    // Save progress to DB debounced (every 3 seconds)
    if (Math.abs(progress - lastSavedProgress.current) > 0.05 || progress === 1) {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
      
      saveTimeout.current = setTimeout(async () => {
        try {
          await api.post('/api/leituras', {
            capitulo_id: capituloId,
            posicao_scroll: progress,
            percentual_lido: Math.round(progress * 100)
          });
          lastSavedProgress.current = progress;
        } catch (err) {
          console.warn('Erro ao salvar progresso de leitura:', err);
        }
      }, 3000);
    }
  };

  useEffect(() => {
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, []);

  const handleComprarMoedas = () => {
    Alert.alert('Loja de Moedas', 'A loja de moedas estará disponível em breve!');
  };

  const handleDestravarCapitulo = async () => {
    // Re-fetch to trigger debiting of coins if user now has enough
    try {
      await refetch();
      await fetchProfile(); // Update local coins balance in userStore
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Falha ao processar o pagamento.');
    }
  };

  if (isLoading || !capituloId) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: isDarkMode ? Colors.background : Colors.white }]}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  // Paywall Check
  if (result && !result.acesso) {
    const themeBg = isDarkMode ? Colors.background : Colors.white;
    const themeText = isDarkMode ? Colors.text : Colors.black;
    const themeSub = isDarkMode ? Colors.textSecondary : Colors.textMuted;
    
    const isLogin = result.motivo === 'login_required';
    const isSemMoedas = result.motivo === 'sem_moedas';

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeBg }]}>
        {/* Top bar with back button */}
        <View style={[styles.topBar, { borderBottomColor: Colors.border }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={[styles.backText, { color: themeText }]}>✕ Voltar</Text>
          </Pressable>
        </View>

        <View style={styles.paywallContent}>
          <Text style={styles.lockEmoji}>🔒</Text>
          <Text style={[styles.paywallTitle, { color: themeText }]}>
            {isLogin ? 'Faça login para continuar' : 'Destrave este capítulo'}
          </Text>
          
          {isLogin ? (
            <Text style={[styles.paywallSubtitle, { color: themeSub }]}>
              Você precisa estar conectada para acessar capítulos VIP e salvar seu progresso.
            </Text>
          ) : (
            <Text style={[styles.paywallSubtitle, { color: themeSub }]}>
              Este capítulo custa <Text style={{ color: Colors.accent, fontWeight: 'bold' }}>{result.custo} moedas</Text>.
              {isSemMoedas && ` Seu saldo atual é de ${result.saldo_atual || 0} moedas.`}
            </Text>
          )}

          {isLogin ? (
            <Button
              title="Ir para o Login"
              onPress={() => router.replace('/(auth)/login')}
              variant="primary"
              fullWidth
            />
          ) : isSemMoedas ? (
            <View style={{ width: '100%' }}>
              <Button
                title="Comprar Moedas"
                onPress={handleComprarMoedas}
                variant="primary"
                fullWidth
                style={{ marginBottom: Spacing.sm }}
              />
              <Button
                title="Tentar Novamente"
                onPress={handleDestravarCapitulo}
                variant="secondary"
                fullWidth
              />
            </View>
          ) : (
            <Button
              title={`Destravar com ${result.custo} Moedas`}
              onPress={handleDestravarCapitulo}
              variant="primary"
              fullWidth
            />
          )}
        </View>
      </SafeAreaView>
    );
  }

  const capitulo = result?.capitulo;

  if (!capitulo) {
    return (
      <SafeAreaView style={[styles.container, styles.center, { backgroundColor: isDarkMode ? Colors.background : Colors.white }]}>
        <Text style={{ color: Colors.error }}>Erro ao carregar o capítulo.</Text>
        <Button title="Voltar" onPress={() => router.back()} variant="primary" style={{ marginTop: Spacing.md }} />
      </SafeAreaView>
    );
  }

  const themeBg = isDarkMode ? Colors.background : Colors.white;
  const themeText = isDarkMode ? Colors.text : Colors.black;
  const progressPercent = Math.round(scrollProgress * 100);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeBg }]}>
      {/* Top Progress bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: Colors.accent }]} />
      </View>

      {/* Top Bar Controls */}
      {showControls && (
        <View style={[styles.topBar, { backgroundColor: themeBg, borderBottomColor: isDarkMode ? Colors.border : '#E2E8F0' }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={[styles.backText, { color: themeText }]}>✕ Fechar</Text>
          </Pressable>
          <Text style={[styles.chapterTitleHeader, { color: themeText }]} numberOfLines={1}>
            {capitulo.titulo}
          </Text>
          <Text style={[styles.progressTextHeader, { color: isDarkMode ? Colors.textSecondary : Colors.textMuted }]}>
            {progressPercent}%
          </Text>
        </View>
      )}

      {/* Scrollable Reader Text content */}
      <ScrollView
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContentReader}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => setShowControls(!showControls)} style={styles.contentPressable}>
          <Text style={[styles.chapterNumber, { color: Colors.accent }]}>Capítulo {capitulo.numero}</Text>
          <Text style={[styles.chapterTitleBody, { color: themeText }]}>{capitulo.titulo}</Text>
          
          <Text style={[styles.readerText, { fontSize, color: themeText, lineHeight: fontSize * 1.6 }]}>
            {capitulo.conteudo}
          </Text>
        </Pressable>
      </ScrollView>

      {/* Bottom controls panel */}
      {showControls && (
        <View style={[styles.bottomBarControls, { backgroundColor: themeBg, borderTopColor: isDarkMode ? Colors.border : '#E2E8F0' }]}>
          {/* Font Controls */}
          <View style={styles.controlRow}>
            <Text style={[styles.controlLabel, { color: themeText }]}>Tamanho do texto</Text>
            <View style={styles.btnGroup}>
              <Pressable onPress={decreaseFontSize} style={[styles.sizeBtn, { borderColor: Colors.border }]}>
                <Text style={[styles.sizeBtnText, { color: themeText }]}>A-</Text>
              </Pressable>
              <View style={styles.sizeIndicator}>
                <Text style={[styles.sizeIndicatorText, { color: themeText }]}>{fontSize}</Text>
              </View>
              <Pressable onPress={increaseFontSize} style={[styles.sizeBtn, { borderColor: Colors.border }]}>
                <Text style={[styles.sizeBtnText, { color: themeText }]}>A+</Text>
              </Pressable>
            </View>
          </View>

          {/* Theme Controls */}
          <View style={styles.controlRow}>
            <Text style={[styles.controlLabel, { color: themeText }]}>Modo de leitura</Text>
            <Pressable
              onPress={toggleDarkMode}
              style={[
                styles.themeBtn,
                { backgroundColor: isDarkMode ? Colors.surfaceLight : '#EDF2F7', borderColor: Colors.border }
              ]}
            >
              <Text style={[styles.themeBtnText, { color: themeText }]}>
                {isDarkMode ? '🌙 Escuro' : '☀️ Claro'}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarBg: {
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.1)',
    width: '100%',
  },
  progressBarFill: {
    height: 3,
  },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    paddingVertical: Spacing.xs,
  },
  backText: {
    fontFamily: 'Lato_700Bold',
    fontSize: 15,
  },
  chapterTitleHeader: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 16,
    marginHorizontal: Spacing.md,
  },
  progressTextHeader: {
    fontFamily: 'Lato_700Bold',
    fontSize: 13,
    width: 45,
    textAlign: 'right',
  },
  scrollContentReader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: 80,
  },
  contentPressable: {
    width: '100%',
  },
  chapterNumber: {
    fontFamily: 'Lato_700Bold',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
  },
  chapterTitleBody: {
    ...Typography.title,
    fontSize: 26,
    lineHeight: 34,
    marginBottom: Spacing.xl,
  },
  readerText: {
    fontFamily: 'Lato_400Regular',
    textAlign: 'justify',
  },
  bottomBarControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    gap: Spacing.md,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlLabel: {
    fontFamily: 'Lato_700Bold',
    fontSize: 14,
  },
  btnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sizeBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeBtnText: {
    fontFamily: 'Lato_700Bold',
    fontSize: 16,
  },
  sizeIndicator: {
    paddingHorizontal: Spacing.md,
  },
  sizeIndicatorText: {
    fontFamily: 'Lato_700Bold',
    fontSize: 15,
  },
  themeBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm - 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  themeBtnText: {
    fontFamily: 'Lato_700Bold',
    fontSize: 13,
  },
  paywallContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingBottom: 60,
  },
  lockEmoji: {
    fontSize: 80,
    marginBottom: Spacing.xl,
  },
  paywallTitle: {
    ...Typography.title,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  paywallSubtitle: {
    ...Typography.body,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xxl,
  },
});
