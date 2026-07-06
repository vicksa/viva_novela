import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius } from '@/constants/theme';

type BadgeVariant = 'free' | 'vip' | 'new' | 'locked';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  free: { bg: Colors.success, text: Colors.white },
  vip: { bg: Colors.accent, text: Colors.black },
  new: { bg: Colors.primary, text: Colors.text },
  locked: { bg: Colors.surfaceLight, text: Colors.textMuted },
};

export default function Badge({ label, variant = 'free' }: BadgeProps) {
  const colors = variantColors[variant];

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: 'Lato_700Bold',
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
