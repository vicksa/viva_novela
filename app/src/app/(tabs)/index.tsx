import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { useHistoriasDestaque, useHistoriasMaisLidas, useHistoriasNovas, useContinuarLendo } from '@/hooks/useHistorias';
import CarrosselDestaques from '@/components/CarrosselDestaques';
import SecaoHistorias from '@/components/SecaoHistorias';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // Queries
  const { data: destaques, isLoading: loadingDestaques, refetch: refetchDestaques } = useHistoriasDestaque();
  const { data: continuados, isLoading: loadingContinuados, refetch: refetchContinuados } = useContinuarLendo();
  const { data: maisLidas, isLoading: loadingMaisLidas, refetch: refetchMaisLidas } = useHistoriasMaisLidas();
  const { data: novas, isLoading: loadingNovas, refetch: refetchNovas } = useHistoriasNovas();

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchDestaques(),
      refetchContinuados(),
      refetchMaisLidas(),
      refetchNovas()
    ]);
    setRefreshing(false);
  };

  const showLoading = loadingDestaques || loadingMaisLidas || loadingNovas;

  if (showLoading && !refreshing) {
    return <LoadingScreen label="Carregando suas histórias..." />;
  }

  const historiasContinuar = continuados?.map(item => item.historia) || [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logoText}>Viva Novela</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>MVP</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.accent}
            colors={[Colors.accent]}
          />
        }
      >
        {/* Featured Stories Carousel */}
        {destaques && destaques.length > 0 && (
          <View style={styles.carouselSection}>
            <CarrosselDestaques historias={destaques} />
          </View>
        )}

        {/* Continue Reading Section (Only if there is progress) */}
        {historiasContinuar.length > 0 && (
          <SecaoHistorias
            titulo="Continue Lendo"
            historias={historiasContinuar}
            onVerMais={() => {}}
          />
        )}

        {/* Popular Stories Section */}
        {maisLidas && maisLidas.length > 0 && (
          <SecaoHistorias
            titulo="Mais Lidas"
            historias={maisLidas}
            onVerMais={() => router.push('/(tabs)/explorar')}
          />
        )}

        {/* New Stories Section */}
        {novas && novas.length > 0 && (
          <SecaoHistorias
            titulo="Novas Histórias"
            historias={novas}
            onVerMais={() => router.push('/(tabs)/explorar')}
          />
        )}

        {/* Bottom space */}
        <View style={styles.footerSpacing} />
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logoText: {
    ...Typography.headline,
    fontSize: 26,
    color: Colors.accent,
  },
  headerBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  headerBadgeText: {
    fontFamily: 'Lato_700Bold',
    fontSize: 10,
    color: Colors.text,
  },
  carouselSection: {
    marginVertical: Spacing.md,
  },
  footerSpacing: {
    height: 40,
  },
});
