import React, { useState } from 'react';
import { StyleSheet, View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Colors, Typography, Spacing } from '@/constants/theme';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, isLoading } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = 'E-mail é obrigatório.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Insira um e-mail válido.';
    }
    if (!password) {
      newErrors.password = 'Senha é obrigatória.';
    } else if (password.length < 6) {
      newErrors.password = 'A senha deve ter no mínimo 6 caracteres.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    
    try {
      await signIn(email, password);
      // RootLayout will handle redirect to (tabs) automatically
    } catch (error: any) {
      Alert.alert(
        'Erro de Acesso',
        error.message || 'E-mail ou senha incorretos. Por favor, tente novamente.'
      );
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert('Em Breve', 'A autenticação com o Google estará disponível na próxima atualização.');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Logo and Tagline */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>Viva Novela</Text>
          <Text style={styles.tagline}>Histórias que prendem. Capítulos que viciam.</Text>
        </View>

        {/* Input Fields */}
        <View style={styles.formContainer}>
          <Input
            label="E-mail"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            placeholder="Digite seu e-mail"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <Input
            label="Senha"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
            placeholder="Digite sua senha"
            secureTextEntry
            autoCapitalize="none"
            error={errors.password}
          />

          {/* Action Buttons */}
          <Button
            title="Entrar"
            onPress={handleLogin}
            variant="primary"
            loading={isLoading}
            fullWidth
            style={styles.loginButton}
          />

          <Button
            title="Entrar com Google"
            onPress={handleGoogleLogin}
            variant="secondary"
            fullWidth
            style={styles.googleButton}
          />
        </View>

        {/* Footer Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Não tem uma conta? </Text>
          <Link href="/(auth)/cadastro" asChild>
            <Text style={styles.linkText}>Cadastre-se</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: 80,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logo: {
    ...Typography.headline,
    fontSize: 40,
    color: Colors.accent,
    marginBottom: Spacing.xs,
  },
  tagline: {
    ...Typography.accent,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  loginButton: {
    marginTop: Spacing.md,
  },
  googleButton: {
    marginTop: Spacing.sm,
    backgroundColor: 'transparent',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  footerText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  linkText: {
    ...Typography.bodySmall,
    color: Colors.accent,
    fontFamily: 'Lato_700Bold',
  },
});
