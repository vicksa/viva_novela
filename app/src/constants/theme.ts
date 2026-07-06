export const Colors = {
  background: '#0D0D0D',
  surface: '#1A1A1A',
  surfaceLight: '#252525',
  primary: '#6B1A2E',
  primaryLight: '#8B2A3E',
  primaryDark: '#4A1220',
  accent: '#C9A84C',
  accentLight: '#D4B96A',
  text: '#F5ECD7',
  textSecondary: '#A0A0A0',
  textMuted: '#666666',
  border: '#2C2C2C',
  error: '#E53E3E',
  success: '#38A169',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.6)',
} as const;

export const Typography = {
  headline: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 28, color: Colors.text },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22, color: Colors.text },
  subtitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18, color: Colors.text },
  accent: { fontFamily: 'PlayfairDisplay_400Regular_Italic', fontSize: 18, color: Colors.accent },
  body: { fontFamily: 'Lato_400Regular', fontSize: 17, color: Colors.text },
  bodySmall: { fontFamily: 'Lato_400Regular', fontSize: 15, color: Colors.textSecondary },
  label: { fontFamily: 'Lato_700Bold', fontSize: 14, color: Colors.text },
  labelSmall: { fontFamily: 'Lato_700Bold', fontSize: 12, color: Colors.textSecondary },
  meta: { fontFamily: 'Lato_300Light', fontSize: 12, color: Colors.textMuted },
} as const;

export const Spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const BorderRadius = { sm: 8, md: 12, lg: 16, xl: 24, full: 999 } as const;
