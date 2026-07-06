import React, { useState } from 'react';
import { StyleSheet, View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Colors, Typography, Spacing } from '@/constants/theme';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function CadastroScreen() {
  const router = useRouter();
  const { signUp, isLoading } = useAuthStore();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errors, setErrors] = useState<{ nome?: string; email?: string; senha?: string }>({});

  const validate = () => {
    const newErrors: { nome?: string; email?: string; senha?: string } = {};
    if (!nome) {
      newErrors.nome = 'Nome é obrigatório.';
    } else if (nome.length < 3) {
      newErrors.nome = 'O nome deve ter no mínimo 3 caracteres.';
    }
    if (!email) {
      newErrors.email = 'E-mail é obrigatório.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Insira um e-mail válido.';
    }
    if (!senha) {
      newErrors.senha = 'Senha é obrigatória.';
    } else if (senha.length < 6) {
      newErrors.senha = 'A senha deve ter no mínimo 6 caracteres.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCadastro = async () => {
    if (!validate()) return;

    try {
      await signUp(email, senha, nome);
      Alert.alert(
        'Conta Criada!',
        'Sua conta foi criada com sucesso. Bem-vinda ao Viva Novela!',
        [{ text: 'Entrar', onPress: () => {} }] // RootLayout redirects on auth update
      );
    } catch (error: any) {
      Alert.alert(
        'Erro no Cadastro',
        error.message || 'Houve um problema ao criar a sua conta. Tente novamente.'
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>Cadastre-se para ler milhares de capítulos românticos</Text>
        </View>

        {/* Inputs */}
        <View style={styles.formContainer}>
          <Input
            label="Nome Completo"
            value={nome}
            onChangeText={(text) => {
              setNome(text);
              if (errors.nome) setErrors({ ...errors, nome: undefined });
            }}
            placeholder="Como quer ser chamada?"
            autoCapitalize="words"
            error={errors.nome}
          />

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
            value={senha}
            onChangeText={(text) => {
              setSenha(text);
              if (errors.senha) setErrors({ ...errors, senha: undefined });
            }}
            placeholder="Crie uma senha forte"
            secureTextEntry
            autoCapitalize="none"
            error={errors.senha}
          />

          {/* Submit Button */}
          <Button
            title="Criar Conta"
            onPress={handleCadastro}
            variant="primary"
            loading={isLoading}
            fullWidth
            style={styles.submitButton}
          />
        </View>

        {/* Footer Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Já tem uma conta? </Text>
          <Link href="/(auth)/login" asChild>
            <Text style={styles.linkText}>Faça Login</Text>
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.headline,
    fontSize: 32,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  submitButton: {
    marginTop: Spacing.lg,
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
