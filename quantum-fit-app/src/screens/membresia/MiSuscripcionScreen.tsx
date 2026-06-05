// Mi Suscripción - Detalles de la suscripción activa del usuario.
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
import { paymentService } from '../../services/api';
import type { LocalSubscription } from '../../types';
import { ScreenHeader, LoadingState } from '../../components';
import type { MainStackScreenProps } from '../../types/navigation';

type MiSuscripcionScreenProps = MainStackScreenProps<'MiSuscripcion'>;

export default function MiSuscripcionScreen({ navigation }: MiSuscripcionScreenProps) {
  const [subscription, setSubscription] = useState<LocalSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const sub = await paymentService.getMySubscription();
      setSubscription(sub);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'ACTIVE': return colors.secondary;
      case 'PENDING': return colors.warning;
      case 'SUSPENDED': return colors.error;
      case 'CANCELLED': return colors.textMuted;
      case 'EXPIRED': return colors.error;
      default: return colors.textMuted;
    }
  };

  const getStatusLabel = (status: string | undefined) => {
    switch (status) {
      case 'ACTIVE': return 'Activa';
      case 'PENDING': return 'Pendiente';
      case 'SUSPENDED': return 'Suspendida';
      case 'CANCELLED': return 'Cancelada';
      case 'EXPIRED': return 'Vencida';
      default: return 'Desconocido';
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Mi Suscripción" onBack={() => navigation.goBack()} />
        <LoadingState message="Cargando..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Mi Suscripción" onBack={() => navigation.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Tarjeta de estado */}
        <LinearGradient
          colors={
            subscription?.subscription?.status === 'ACTIVE'
              ? [colors.primary, colors.primaryDark]
              : [colors.backgroundCard, colors.backgroundSecondary]
          }
          style={styles.statusCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.statusRow}>
            <View style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(subscription?.subscription?.status) },
            ]} />
            <Text style={[
              styles.statusLabel,
              subscription?.subscription?.status === 'ACTIVE' && { color: colors.background },
            ]}>
              {getStatusLabel(subscription?.subscription?.status)}
            </Text>
          </View>

          {subscription?.subscription && (
            <>
              <Text style={[
                styles.planTitle,
                subscription?.subscription?.status === 'ACTIVE' && { color: colors.background },
              ]}>
                {subscription.subscription.type === 'VIP_MONTHLY' ? 'Plan Mensual'
                  : subscription.subscription.type === 'VIP_QUARTERLY' ? 'Plan Trimestral'
                  : 'Plan Anual'}
              </Text>

              <View style={styles.statusDetails}>
                <View style={styles.statusDetailRow}>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={subscription.subscription.status === 'ACTIVE' ? colors.background : colors.textMuted}
                  />
                  <Text style={[
                    styles.statusDetailText,
                    subscription.subscription.status === 'ACTIVE' && { color: colors.background },
                  ]}>
                    Inicio: {formatDate(subscription.subscription.startDate)}
                  </Text>
                </View>
                {subscription.subscription.endDate && (
                  <View style={styles.statusDetailRow}>
                    <Ionicons
                      name="calendar"
                      size={16}
                      color={subscription.subscription.status === 'ACTIVE' ? colors.background : colors.textMuted}
                    />
                    <Text style={[
                      styles.statusDetailText,
                      subscription.subscription.status === 'ACTIVE' && { color: colors.background },
                    ]}>
                      Vence: {formatDate(subscription.subscription.endDate)}
                    </Text>
                  </View>
                )}
                {subscription.subscription.price > 0 && (
                  <View style={styles.statusDetailRow}>
                    <Ionicons
                      name="pricetag-outline"
                      size={16}
                      color={subscription.subscription.status === 'ACTIVE' ? colors.background : colors.textMuted}
                    />
                    <Text style={[
                      styles.statusDetailText,
                      subscription.subscription.status === 'ACTIVE' && { color: colors.background },
                    ]}>
                      ${subscription.subscription.price.toLocaleString('es-AR')} / {subscription.subscription.billingCycle === 'MONTHLY' ? 'mes'
                        : subscription.subscription.billingCycle === 'QUARTERLY' ? 'trimestre'
                        : 'año'}
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}

          {!subscription?.hasSubscription && (
            <Text style={styles.noSubscriptionText}>
              No tenés una suscripción activa.
            </Text>
          )}
        </LinearGradient>

        {/* Botón para volver a planes */}
        {(!subscription?.hasSubscription || subscription?.subscription?.isExpired) && (
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => navigation.navigate('Membresia')}
          >
            <Ionicons name="rocket-outline" size={20} color={colors.background} />
            <Text style={styles.upgradeButtonText}>Ver planes disponibles</Text>
          </TouchableOpacity>
        )}

        {/* Historial de pagos */}
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate('HistorialPagos')}
        >
          <Ionicons name="time-outline" size={20} color={colors.primary} />
          <Text style={styles.historyButtonText}>Ver historial completo de pagos</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

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
    paddingTop: spacing.md,
  },

  // Tarjeta de estado
  statusCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.large,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  planTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  statusDetails: {
    gap: spacing.sm,
  },
  statusDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusDetailText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  noSubscriptionText: {
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },

  // Botón de upgrade
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.sm,
    ...shadows.glow,
  },
  upgradeButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.background,
  },

  // Botón historial
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  historyButtonText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
