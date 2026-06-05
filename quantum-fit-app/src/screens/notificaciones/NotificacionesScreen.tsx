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
import { userService } from '../../services/api';
import { ScreenHeader, LoadingState, ErrorState, EmptyState } from '../../components';
import type { MainStackScreenProps } from '../../types/navigation';

type Props = MainStackScreenProps<'Notificaciones'>;

interface NotificacionItem {
  id: string;
  title: string;
  description: string;
  activityType: string;
  points: number;
  createdAt: string;
}

const getActivityIcon = (type: string): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'CHECK_IN_CLASS': return 'calendar';
    case 'CHECK_IN_OPEN_GYM': return 'fitness';
    case 'CHECK_IN_PT': return 'body';
    case 'ACHIEVEMENT_UNLOCKED': return 'trophy';
    case 'STREAK_BONUS': return 'flame';
    case 'REWARD_REDEEMED': return 'gift';
    case 'REFERRAL_BONUS': return 'people';
    default: return 'notifications';
  }
};

const getActivityColor = (type: string): string => {
  switch (type) {
    case 'CHECK_IN_CLASS': return colors.primary;
    case 'CHECK_IN_OPEN_GYM': return colors.secondary;
    case 'CHECK_IN_PT': return colors.info;
    case 'ACHIEVEMENT_UNLOCKED': return colors.points;
    case 'STREAK_BONUS': return colors.warning;
    case 'REWARD_REDEEMED': return colors.error;
    case 'REFERRAL_BONUS': return colors.secondary;
    default: return colors.textSecondary;
  }
};

function groupByDate(items: NotificacionItem[]): { date: string; items: NotificacionItem[] }[] {
  const groups: { [key: string]: NotificacionItem[] } = {};
  for (const item of items) {
    const date = new Date(item.createdAt).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(item);
  }
  return Object.entries(groups).map(([date, items]) => ({ date, items }));
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

export default function NotificacionesScreen({ navigation }: Props) {
  const [notificaciones, setNotificaciones] = useState<NotificacionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotificaciones();
  }, []);

  const loadNotificaciones = async () => {
    try {
      const data = await userService.getActivityLog(100);
      setNotificaciones(data?.logs || data || []);
    } catch (error) {
      setError('No se pudieron cargar las notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotificaciones();
    setRefreshing(false);
  };

  const grouped = groupByDate(notificaciones);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Notificaciones"
        onBack={() => navigation.goBack()}
        style={{ paddingTop: spacing.xxl, paddingBottom: spacing.md, backgroundColor: colors.backgroundSecondary }}
      />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={loadNotificaciones} icon="cloud-offline-outline" iconSize={64} />
      ) : notificaciones.length === 0 ? (
        <EmptyState icon="notifications-off-outline" iconSize={64} title="Sin notificaciones" />
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          contentContainerStyle={styles.list}
        >
          {grouped.map((group) => (
            <View key={group.date}>
              <Text style={styles.dateHeader}>{group.date}</Text>
              {group.items.map((item) => (
                <View key={item.id} style={styles.notificationCard}>
                  <View style={[styles.iconContainer, { backgroundColor: getActivityColor(item.activityType) + '20' }]}>
                    <Ionicons name={getActivityIcon(item.activityType)} size={20} color={getActivityColor(item.activityType)} />
                  </View>
                  <View style={styles.notifContent}>
                    <Text style={styles.notifTitle}>{item.title}</Text>
                    <Text style={styles.notifDescription}>{item.description}</Text>
                    <Text style={styles.notifTime}>{formatTime(item.createdAt)}</Text>
                  </View>
                  {item.points > 0 && (
                    <View style={styles.pointsBadge}>
                      <Text style={styles.pointsText}>+{item.points}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ))}
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
  dateHeader: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'capitalize',
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  notifDescription: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  notifTime: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 4,
  },
  pointsBadge: {
    backgroundColor: colors.points + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  pointsText: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.points,
  },
});
