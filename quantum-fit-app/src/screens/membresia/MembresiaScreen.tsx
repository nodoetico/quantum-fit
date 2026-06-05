// Pantalla de Membresía - Muestra el estado de la suscripción y los planes disponibles
// Los precios se obtienen en tiempo real desde el sistema de Crystal MiFit.
// Flujo: App -> Backend QuantumFit -> API Crystal -> Precios reales
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { paymentService } from '../../services/api';
import type { LocalSubscription, CrystalEnrollment } from '../../types';
import { ScreenHeader, LoadingState, ErrorState, EmptyState } from '../../components';
import type { MainStackScreenProps } from '../../types/navigation';

type MembresiaScreenProps = MainStackScreenProps<'Membresia'>;

export default function MembresiaScreen({ navigation }: MembresiaScreenProps) {
  const { refreshUser } = useAuth();
  const [subscription, setSubscription] = useState<LocalSubscription | null>(null);
  const [enrollment, setEnrollment] = useState<CrystalEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Construir planes dinámicamente desde los datos de Crystal
  const getPlans = () => {
    const price = enrollment?.renewal?.price || 0;
    const months = enrollment?.renewal?.months || 1;

    if (price === 0) return [];

    const monthlyPrice = Math.round(price / months);

    return [
      {
        id: 'mensual',
        name: 'Plan Mensual',
        price: monthlyPrice,
        period: 'mes',
        icon: 'calendar-outline' as const,
        color: colors.primary,
        features: [
          'Acceso completo al gimnasio',
          'Clases grupales ilimitadas',
          'Check-in con puntos y recompensas',
          'Seguimiento de progreso',
        ],
      },
      {
        id: 'trimestral',
        name: 'Plan Trimestral',
        price: Math.round(monthlyPrice * 2.7),
        period: '3 meses',
        icon: 'calendar' as const,
        color: colors.secondary,
        features: [
          'Todo lo del plan mensual',
          '3 meses por el precio de 2.7',
          'Prioridad en reservas',
          'Acceso a eventos exclusivos',
        ],
        popular: true,
      },
      {
        id: 'anual',
        name: 'Plan Anual',
        price: Math.round(monthlyPrice * 9.6),
        period: '12 meses',
        icon: 'infinite' as const,
        color: colors.points,
        features: [
          'Todo lo del plan trimestral',
          'Ahorra 2 meses vs plan mensual',
          'Suscripción VIP automática',
          'Descuentos en eventos y productos',
        ],
      },
    ];
  };

  // Cargar datos al montar la pantalla
  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar suscripción local y estado de Crystal en paralelo
      const [sub, enroll] = await Promise.all([
        paymentService.getMySubscription().catch(() => null),
        paymentService.getEnrollmentStatus().catch(() => null),
      ]);

      setSubscription(sub);
      setEnrollment(enroll);
    } catch (err) {
      setError('No se pudieron cargar los datos de membresía.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSubscriptionData();
    await refreshUser();
    setRefreshing(false);
  }, [refreshUser]);

  // Determinar si el usuario ya tiene suscripción activa
  const hasActiveSubscription = subscription?.hasSubscription
    && subscription?.subscription
    && !subscription.subscription.isExpired
    && subscription.subscription.status === 'ACTIVE';

  // Formatear fecha legible
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const plans = getPlans();

  // Navegar al checkout con el plan seleccionado
  const handleSelectPlan = (plan: (typeof plans)[0]) => {
    navigation.navigate('Checkout', {
      plan,
      paymentMethods: [],
    });
  };

  // ===========================================================================
  // RENDER: Estado cargando
  // ===========================================================================
  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Membresía" onBack={() => navigation.goBack()} rightAction={
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('HistorialPagos')}>
            <Ionicons name="time-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        } />
        <LoadingState message="Cargando membresía..." />
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Membresía" onBack={() => navigation.goBack()} rightAction={
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('HistorialPagos')}>
            <Ionicons name="time-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        } />
        <ErrorState message={error} onRetry={loadSubscriptionData} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Membresía" onBack={() => navigation.goBack()} rightAction={
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('HistorialPagos')}>
          <Ionicons name="time-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      } />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* ================================================================= */}
        {/* SECCIÓN: Estado actual de la suscripción */}
        {/* ================================================================= */}
        {hasActiveSubscription && subscription?.subscription && (
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.activeSubscriptionCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.activeSubHeader}>
              <View style={styles.activeSubIcon}>
                <Ionicons name="shield-checkmark" size={28} color={colors.background} />
              </View>
              <View style={styles.activeSubBadge}>
                <Ionicons name="flash" size={14} color={colors.background} />
                <Text style={styles.activeSubBadgeText}>VIP ACTIVO</Text>
              </View>
            </View>

            <Text style={styles.activeSubTitle}>
              {subscription.subscription.type === 'VIP_MONTHLY' ? 'Plan Mensual'
                : subscription.subscription.type === 'VIP_QUARTERLY' ? 'Plan Trimestral'
                : 'Plan Anual'}
            </Text>

            <View style={styles.activeSubDetails}>
              <View style={styles.activeSubDetail}>
                <Ionicons name="calendar-outline" size={16} color={colors.background} />
                <Text style={styles.activeSubDetailText}>
                  Vence: {formatDate(subscription.subscription.endDate)}
                </Text>
              </View>
              <View style={styles.activeSubDetail}>
                <Ionicons name="repeat-outline" size={16} color={colors.background} />
                <Text style={styles.activeSubDetailText}>
                  Ciclo: {subscription.subscription.billingCycle === 'MONTHLY' ? 'Mensual'
                    : subscription.subscription.billingCycle === 'QUARTERLY' ? 'Trimestral'
                    : 'Anual'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        )}

        {/* ================================================================= */}
        {/* SECCIÓN: Información de Crystal */}
        {/* ================================================================= */}
        {enrollment?.enrollment && (
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons
                name={enrollment.enrollment.is_expired ? 'close-circle' : 'checkmark-circle'}
                size={20}
                color={enrollment.enrollment.is_expired ? colors.error : colors.secondary}
              />
              <Text style={styles.infoText}>
                {enrollment.enrollment.is_expired
                  ? 'Tu membresía en el sistema está vencida'
                  : enrollment.enrollment.is_enrolled
                  ? 'Membresía activa en el sistema del gimnasio'
                  : 'Sin membresía registrada en el sistema'}
              </Text>
            </View>
            {enrollment.enrollment.due_date && (
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                <Text style={styles.infoText}>
                  Vence en sistema: {formatDate(enrollment.enrollment.due_date)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ================================================================= */}
        {/* SECCIÓN: Si NO tiene suscripción activa, mostrar planes */}
        {/* ================================================================= */}
        {!hasActiveSubscription && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Elegí tu plan</Text>
              <Text style={styles.sectionSubtitle}>
                {enrollment?.renewal?.price
                  ? `Precio desde el sistema del gimnasio: $${enrollment.renewal.price.toLocaleString('es-AR')}`
                  : 'Activá tu membresía y empezá a disfrutar de todos los beneficios'}
              </Text>
            </View>

            {plans.length > 0 ? (
              plans.map((plan, index) => (
              <TouchableOpacity
                key={plan.id}
                style={styles.planCard}
                onPress={() => handleSelectPlan(plan)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={
                    plan.popular
                      ? ['rgba(57, 255, 20, 0.08)', 'rgba(0, 0, 0, 0)']
                      : ['rgba(255, 255, 255, 0.03)', 'rgba(0, 0, 0, 0)']
                  }
                  style={styles.planGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {/* Badge "Más popular" */}
                  {plan.popular && (
                    <View style={styles.popularBadge}>
                      <Ionicons name="star" size={14} color={colors.background} />
                      <Text style={styles.popularBadgeText}>Más popular</Text>
                    </View>
                  )}

                  <View style={styles.planHeader}>
                    <View style={[styles.planIconContainer, { backgroundColor: `${plan.color}20` }]}>
                      <Ionicons name={plan.icon} size={28} color={plan.color} />
                    </View>
                    <View style={styles.planNameContainer}>
                      <Text style={styles.planName}>{plan.name}</Text>
                      <View style={styles.planPriceRow}>
                        <Text style={[styles.planPrice, { color: plan.color }]}>
                          ${plan.price.toLocaleString()}
                        </Text>
                        <Text style={styles.planPeriod}>/{plan.period}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Lista de características */}
                  <View style={styles.planFeatures}>
                    {plan.features.map((feature, i) => (
                      <View key={i} style={styles.planFeature}>
                        <Ionicons name="checkmark-circle" size={18} color={colors.secondary} />
                        <Text style={styles.planFeatureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Botón de selección */}
                  <TouchableOpacity
                    style={[styles.selectButton, { backgroundColor: plan.color }]}
                    onPress={() => handleSelectPlan(plan)}
                  >
                    <Text style={styles.selectButtonText}>Seleccionar plan</Text>
                    <Ionicons name="arrow-forward" size={20} color={colors.background} />
                  </TouchableOpacity>
                </LinearGradient>
              </TouchableOpacity>
            ))
          ) : (
            <EmptyState icon="pricetag-outline" iconSize={48} title="No se pudieron obtener los precios del sistema del gimnasio." actionLabel="Reintentar" onAction={loadSubscriptionData} />
          )}
          </>
        )}

        {/* ================================================================= */}
        {/* SECCIÓN: Si tiene suscripción activa, botón para ver detalle */}
        {/* ================================================================= */}
        {hasActiveSubscription && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.manageButton}
              onPress={() => navigation.navigate('MiSuscripcion')}
            >
              <Ionicons name="settings-outline" size={20} color={colors.primary} />
              <Text style={styles.manageButtonText}>Administrar suscripción</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Espacio inferior */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ============================================================================
// ESTILOS
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Tarjeta de suscripción activa
  activeSubscriptionCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.large,
  },
  activeSubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  activeSubIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeSubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  activeSubBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.background,
    letterSpacing: 1,
  },
  activeSubTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: '800',
    color: colors.background,
    marginBottom: spacing.md,
  },
  activeSubDetails: {
    gap: spacing.sm,
  },
  activeSubDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  activeSubDetailText: {
    fontSize: typography.sizes.sm,
    color: colors.background,
    fontWeight: '600',
  },

  // Info de Crystal
  infoCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    flex: 1,
  },

  // Lista de planes
  sectionHeader: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Tarjeta de plan
  planCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  planGradient: {
    padding: spacing.xl,
  },
  popularBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    zIndex: 1,
  },
  popularBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.background,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.lg,
  },
  planIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planNameContainer: {
    flex: 1,
  },
  planName: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: typography.sizes.xxl,
    fontWeight: '800',
  },
  planPeriod: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },

  // Características
  planFeatures: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  planFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  planFeatureText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },

  // Botón seleccionar
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.glow,
  },
  selectButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.background,
  },

  // Acciones
  actionsContainer: {
    marginTop: spacing.md,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  manageButtonText: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
