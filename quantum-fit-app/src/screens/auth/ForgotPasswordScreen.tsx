import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import type { AuthScreenProps } from '../../types/navigation';

type ForgotPasswordScreenProps = AuthScreenProps<'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [step, setStep] = useState<'email' | 'sent' | 'reset' | 'done'>('email');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [manualToken, setManualToken] = useState('');
  const { resetPassword, completeResetPassword, isResetting } = useAuth();

  const handleRequestToken = async () => {
    setError('');

    if (!email) {
      setError('Por favor ingresa tu email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Ingresa un email válido');
      return;
    }

    const ok = await resetPassword(email);
    if (ok) {
      setStep('sent');
    } else {
      setError('Error al procesar la solicitud');
    }
  };

  const validatePassword = (pw: string): string | null => {
    if (pw.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
    if (!/[A-Z]/.test(pw)) return 'Debe contener al menos una mayúscula';
    if (!/[a-z]/.test(pw)) return 'Debe contener al menos una minúscula';
    if (!/[0-9]/.test(pw)) return 'Debe contener al menos un número';
    return null;
  };

  const handleResetPassword = async () => {
    setError('');

    const pwError = validatePassword(password);
    if (pwError) {
      setError(pwError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    const token = resetToken || manualToken;
    if (!token) {
      setError('Ingresá el código de restablecimiento');
      return;
    }

    const success = await completeResetPassword(token, password);
    if (success) {
      setStep('done');
    } else {
      setError('Código inválido o expirado. Solicitá uno nuevo.');
    }
  };

  const handleGoToReset = () => {
    setResetToken(manualToken);
    setStep('reset');
  };

  if (step === 'done') {
    return (
      <LinearGradient
        colors={[colors.background, colors.backgroundSecondary]}
        style={styles.container}
      >
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={60} color={colors.secondary} />
          </View>
          <Text style={styles.successTitle}>¡Contraseña actualizada!</Text>
          <Text style={styles.successText}>
            Tu contraseña se restableció correctamente.
          </Text>

          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.sendButtonText}>IR AL INICIO DE SESIÓN</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[colors.background, colors.backgroundSecondary]}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerContainer}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {step === 'email' && (
            <>
              <View style={styles.iconContainer}>
                <View style={styles.iconPlaceholder}>
                  <Ionicons name="lock-closed" size={50} color={colors.primary} />
                </View>
              </View>

              <View style={styles.contentContainer}>
                <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
                <Text style={styles.subtitle}>
                  Ingresa tu email para restablecer tu contraseña.
                </Text>

                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={handleRequestToken}
                  disabled={isResetting}
                >
                  {isResetting ? (
                    <ActivityIndicator color={colors.background} />
                  ) : (
                    <>
                      <Ionicons name="send" size={20} color={colors.background} style={styles.sendIcon} />
                      <Text style={styles.sendButtonText}>ENVIAR ENLACE</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.loginButtonText}>Volver al inicio de sesión</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {step === 'sent' && (
            <>
              <View style={styles.iconContainer}>
                <View style={styles.iconPlaceholder}>
                  <Ionicons name="mail-unread" size={50} color={colors.primary} />
                </View>
              </View>

              <View style={styles.contentContainer}>
                <Text style={styles.title}>Revisá tu email</Text>
                <Text style={styles.subtitle}>
                  Si existe una cuenta asociada a {email}, vas a recibir instrucciones para restablecer tu contraseña.
                </Text>

                <View style={styles.inputContainer}>
                  <Ionicons name="key-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Código de restablecimiento"
                    placeholderTextColor={colors.textMuted}
                    value={manualToken}
                    onChangeText={setManualToken}
                    autoCapitalize="none"
                  />
                </View>
                <TouchableOpacity
                  style={[styles.sendButton, !manualToken && styles.buttonDisabled]}
                  onPress={handleGoToReset}
                  disabled={!manualToken}
                >
                  <Ionicons name="key" size={20} color={colors.background} style={styles.sendIcon} />
                  <Text style={styles.sendButtonText}>INGRESAR CÓDIGO DE RESETEO</Text>
                </TouchableOpacity>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={() => setStep('email')}
                >
                  <Text style={styles.loginButtonText}>Volver al paso anterior</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {step === 'reset' && (
            <>
              <View style={styles.iconContainer}>
                <View style={styles.iconPlaceholder}>
                  <Ionicons name="key" size={50} color={colors.primary} />
                </View>
              </View>

              <View style={styles.contentContainer}>
                <Text style={styles.title}>Nueva contraseña</Text>
                <Text style={styles.subtitle}>
                  Ingresá tu nueva contraseña para {email}
                </Text>

                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nueva contraseña"
                    placeholderTextColor={colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirmar contraseña"
                    placeholderTextColor={colors.textMuted}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                </View>

                <Text style={styles.hintText}>
                  Mínimo 8 caracteres, mayúscula, minúscula y número.
                </Text>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={handleResetPassword}
                  disabled={isResetting}
                >
                  {isResetting ? (
                    <ActivityIndicator color={colors.background} />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color={colors.background} style={styles.sendIcon} />
                      <Text style={styles.sendButtonText}>RESTABLECER</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={() => setStep('sent')}
                >
                  <Text style={styles.loginButtonText}>Volver al paso anterior</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: spacing.xxl,
  },
  headerContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  contentContainer: {
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  inputIcon: {
    marginRight: spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.lg,
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  hintText: {
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    ...shadows.glow,
    marginBottom: spacing.md,
  },
  sendIcon: {
    marginRight: spacing.sm,
  },
  sendButtonText: {
    color: colors.background,
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    letterSpacing: 2,
  },
  loginButton: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  loginButtonText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
  },
  linkButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  linkButtonText: {
    color: colors.primary,
    fontSize: typography.sizes.sm,
    textDecorationLine: 'underline',
  },
  smallButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow,
  },
  smallButtonText: {
    color: colors.background,
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    letterSpacing: 2,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  successTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  successText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
});
