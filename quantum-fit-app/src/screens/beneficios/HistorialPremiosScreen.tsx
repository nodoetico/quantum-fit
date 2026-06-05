import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { rewardsService } from '../../services/api';
import { ScreenHeader, LoadingState, ErrorState, EmptyState } from '../../components';
import type { MainStackScreenProps } from '../../types/navigation';

type Props = MainStackScreenProps<'HistorialPremios'>;

interface RedeemedReward {
  id: string;
  rewardId: string;
  status: string;
  pointsSpent: number;
  pickupCode: string;
  pickupDeadline: string | null;
  pickedUpAt: string | null;
  redeemedAt: string;
  reward: {
    id: string;
    name: string;
    description: string | null;
    pointsCost: number;
    category: string;
    imageUrl: string | null;
  };
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const statusConfig: { [key: string]: { label: string; color: string; icon: keyof typeof Ionicons.glyphMap } } = {
  PENDING: { label: 'Pendiente', color: colors.warning, icon: 'time-outline' },
  APPROVED: { label: 'Aprobado', color: colors.primary, icon: 'checkmark-circle-outline' },
  FULFILLED: { label: 'Entregado', color: colors.success, icon: 'checkmark-done-outline' },
  CANCELLED: { label: 'Cancelado', color: colors.error, icon: 'close-circle-outline' },
};

export default function HistorialPremiosScreen({ navigation }: Props) {
  const [rewards, setRewards] = useState<RedeemedReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await rewardsService.getMyRewards();
      setRewards(data || []);
    } catch (error) {
      setError('No se pudo cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Historial de Premios"
        onBack={() => navigation.goBack()}
        style={{ paddingTop: spacing.xxl, paddingBottom: spacing.md, backgroundColor: colors.backgroundSecondary }}
      />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={loadHistory} icon="cloud-offline-outline" iconSize={64} />
      ) : rewards.length === 0 ? (
        <EmptyState
          icon="gift-outline"
          iconSize={64}
          title="Sin premios canjeados aún"
          actionLabel="Ver premios disponibles"
          onAction={() => navigation.navigate('MainTabs', { screen: 'Beneficios' })}
        />
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          contentContainerStyle={styles.list}
        >
          {rewards.map((item) => {
            const status = statusConfig[item.status] || statusConfig.PENDING;
            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.rewardInfo}>
                    <Text style={styles.rewardName}>{item.reward.name}</Text>
                    <Text style={styles.rewardCategory}>{item.reward.category}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                    <Ionicons name={status.icon} size={14} color={status.color} />
                    <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                  </View>
                </View>

                <View style={styles.details}>
                  <View style={styles.detailRow}>
                    <Ionicons name="pricetag-outline" size={16} color={colors.textMuted} />
                    <Text style={styles.detailText}>{item.pointsSpent} puntos</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
                    <Text style={styles.detailText}>{formatDate(item.redeemedAt)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="qr-code-outline" size={16} color={colors.textMuted} />
                    <Text style={styles.detailText}>Código: {item.pickupCode}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardName: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  rewardCategory: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
  details: {
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});
