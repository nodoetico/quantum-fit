import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { mercadopagoService } from '../../services/api';
import { ScreenHeader, ErrorState } from '../../components';
import type { MainStackScreenProps } from '../../types/navigation';

type CheckoutScreenProps = MainStackScreenProps<'Checkout'>;

export default function CheckoutScreen({ navigation, route }: CheckoutScreenProps) {
  const { plan } = route?.params || {};
  const { refreshUser } = useAuth();

  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      if (url.includes('payment/success') || url.includes('payment_id')) {
        setShowSuccess(true);
        refreshUser();
      } else if (url.includes('payment/failure') || url.includes('payment_failed')) {
        setErrorMessage('El pago fue cancelado o no se pudo procesar.');
        setShowError(true);
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, []);

  if (!plan) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Confirmar pago" onBack={() => navigation.goBack()} />
        <ErrorState message="No se seleccionó ningún plan" onRetry={() => navigation.goBack()} />
      </View>
    );
  }

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-AR')}`;
  };

  const handlePayWithCard = async () => {
    setIsProcessing(true);
    try {
      const pref = await mercadopagoService.createPreference(
        plan.id,
        plan.name,
        plan.price,
      );

      const url = pref.initPoint || pref.sandboxInitPoint;

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        setErrorMessage('No se pudo abrir MercadoPago. Intenta de nuevo.');
        setShowError(true);
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.error || 'Error al conectar con MercadoPago. Intenta de nuevo.',
      );
      setShowError(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayAtReception = async () => {
    Alert.alert(
      'Pago en recepción',
      'Aboná el plan seleccionado en recepción del gimnasio. Tu membresía se activará al confirmar el pago.',
      [
        { text: 'Entendido', style: 'default' },
      ],
    );
  };

  const plans = {
    features: plan.features || [],
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Confirmar pago" onBack={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={[colors.backgroundCard, colors.backgroundSecondary]}
          style={styles.planSummaryCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.planSummaryHeader}>
            <View style={[styles.planIconBox, { backgroundColor: `${plan.color}20` }]}>
              <Ionicons name={plan.icon as any} size={32} color={plan.color} />
            </View>
            <View style={styles.planSummaryInfo}>
              <Text style={styles.planSummaryName}>{plan.name}</Text>
              <Text style={[styles.planSummaryPrice, { color: plan.color }]}>
                {formatPrice(plan.price)}
                <Text style={styles.planSummaryPeriod}>/{plan.period}</Text>
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {plans.features.map((feature: string, i: number) => (
            <View key={i} style={styles.planSummaryFeature}>
              <Ionicons name="checkmark-circle" size={16} color={colors.secondary} />
              <Text style={styles.planSummaryFeatureText}>{feature}</Text>
            </View>
          ))}
        </LinearGradient>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Elegí cómo pagar</Text>
          <Text style={styles.sectionSubtitle}>
            Pagá con tarjeta de crédito/débito ahora o en efectivo en recepción
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.paymentOption, styles.paymentOptionPrimary]}
          onPress={handlePayWithCard}
          disabled={isProcessing}
          activeOpacity={0.7}
        >
          <View style={styles.paymentOptionIconContainer}>
            <Ionicons name="card" size={28} color={colors.primary} />
          </View>
          <View style={styles.paymentOptionInfo}>
            <Text style={styles.paymentOptionTitle}>Pagar con tarjeta</Text>
            <Text style={styles.paymentOptionDesc}>
              Crédito o débito • Procesado por MercadoPago
            </Text>
          </View>
          <View style={styles.mpBadge}>
            <Text style={styles.mpBadgeText}>MP</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.paymentOption}
          onPress={handlePayAtReception}
          activeOpacity={0.7}
        >
          <View style={[styles.paymentOptionIconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
            <Ionicons name="cash" size={28} color={colors.textSecondary} />
          </View>
          <View style={styles.paymentOptionInfo}>
            <Text style={styles.paymentOptionTitle}>Pagar en recepción</Text>
            <Text style={styles.paymentOptionDesc}>
              Efectivo o transferencia • Activación manual
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.bottomBarInfo}>
          <Text style={styles.bottomBarLabel}>Total a pagar</Text>
          <Text style={styles.bottomBarPrice}>{formatPrice(plan.price)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
          onPress={handlePayWithCard}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <>
              <Ionicons name="lock-closed" size={18} color={colors.background} />
              <Text style={styles.payButtonText}>Pagar con tarjeta</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={showSuccess}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={[colors.secondary, colors.secondaryDark]}
              style={styles.successIconCircle}
            >
              <Ionicons name="checkmark" size={48} color={colors.background} />
            </LinearGradient>

            <Text style={styles.successTitle}>¡Pago exitoso!</Text>
            <Text style={styles.successText}>
              Tu {plan.name} está activo. Ya podés disfrutar de todos los beneficios.
            </Text>

            <TouchableOpacity
              style={styles.successButton}
              onPress={async () => {
                setShowSuccess(false);
                await refreshUser();
                navigation.navigate('Membresia');
              }}
            >
              <Text style={styles.successButtonText}>¡Perfecto!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showError}
        transparent
        animationType="fade"
        onRequestClose={() => setShowError(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.successIconCircle, { backgroundColor: 'rgba(255, 71, 87, 0.1)' }]}>
              <Ionicons name="close" size={48} color={colors.error} />
            </View>

            <Text style={[styles.successTitle, { color: colors.error }]}>Error al procesar el pago</Text>
            <Text style={styles.successText}>{errorMessage}</Text>

            <TouchableOpacity
              style={[styles.successButton, { backgroundColor: colors.error }]}
              onPress={() => setShowError(false)}
            >
              <Text style={styles.successButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },

  planSummaryCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  planSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  planIconBox: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planSummaryInfo: {
    flex: 1,
  },
  planSummaryName: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  planSummaryPrice: {
    fontSize: typography.sizes.xxl,
    fontWeight: '800',
  },
  planSummaryPeriod: {
    fontSize: typography.sizes.sm,
    fontWeight: '400',
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  planSummaryFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  planSummaryFeatureText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    flex: 1,
  },

  sectionHeader: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },

  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.lg,
  },
  paymentOptionPrimary: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
  },
  paymentOptionIconContainer: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentOptionInfo: {
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  paymentOptionDesc: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    lineHeight: 16,
  },
  mpBadge: {
    backgroundColor: '#00BFFF',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  mpBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.background,
    letterSpacing: 0.5,
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  bottomBarInfo: {
    flex: 0,
  },
  bottomBarLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  bottomBarPrice: {
    fontSize: typography.sizes.xl,
    fontWeight: '800',
    color: colors.primary,
  },
  payButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
    ...shadows.glow,
  },
  payButtonDisabled: {
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  payButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.background,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  successIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  successTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  successText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  successButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    width: '100%',
    alignItems: 'center',
    ...shadows.glow,
  },
  successButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.background,
  },
});
