import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, BorderRadius, Spacing } from '@/constants/theme';
import Badge from '@/components/ui/Badge';

interface CapituloItemProps {
  id: string;
  historiaId: string;
  numero: number;
  titulo: string;
  gratuito: boolean;
  bloqueado: boolean;
  palavras: number;
  onPress?: () => void;
}

export default function CapituloItem({
  id,
  numero,
  titulo,
  gratuito,
  bloqueado,
  palavras,
  onPress,
}: CapituloItemProps) {
  const router = useRouter();
  const isLocked = bloqueado && !gratuito;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/leitor/${id}`);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={styles.container}
    >
      <View style={[styles.numberCircle, isLocked && styles.numberCircleLocked]}>
        <Text style={[styles.number, isLocked && styles.numberLocked]}>
          {numero}
        </Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {titulo}
        </Text>
        <Text style={styles.meta}>
          ~{Math.ceil((palavras || 600) / 200)} min de leitura
        </Text>
      </View>
      <View style={styles.right}>
        {gratuito ? (
          <Badge label="Grátis" variant="free" />
        ) : isLocked ? (
          <Text style={styles.lockIcon}>🔒</Text>
        ) : (
          <Text style={styles.unlockIcon}>📖</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  numberCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  numberCircleLocked: {
    backgroundColor: Colors.surfaceLight,
  },
  number: {
    fontFamily: 'Lato_700Bold',
    fontSize: 14,
    color: Colors.text,
  },
  numberLocked: {
    color: Colors.textMuted,
  },
  content: {
    flex: 1,
  },
  title: {
    ...Typography.body,
    fontSize: 15,
    marginBottom: 2,
  },
  meta: {
    ...Typography.meta,
  },
  right: {
    marginLeft: Spacing.sm,
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 18,
  },
  unlockIcon: {
    fontSize: 18,
  },
});
