import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { rankingService } from '../../services/api';
import { ScreenHeader, LoadingState, ErrorState, EmptyState } from '../../components';
import type { MainTabScreenProps } from '../../types/navigation';

type RankingScreenProps = MainTabScreenProps<'Ranking'>;

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  level: number;
  points: number;
  currentStreak: number;
  totalWorkouts: number;
  avatarUrl: string | null;
}

const getRankEmoji = (rank: number) => {
  if (rank === 1) return { emoji: '🥇', color: colors.levelGold };
  if (rank === 2) return { emoji: '🥈', color: colors.levelSilver };
  if (rank === 3) return { emoji: '🥉', color: colors.levelBronze };
  return { emoji: null, color: colors.textSecondary };
};

const getLevelEmoji = (level: number) => {
  if (level >= 10) return '👑';
  if (level >= 7) return '💎';
  if (level >= 5) return '🔥';
  if (level >= 3) return '💪';
  return '🌱';
};

export default function RankingScreen({ navigation }: RankingScreenProps) {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setError(null);
      const data = await rankingService.getLeaderboard();
      setLeaderboard(data || []);
    } catch (err) {
      setError('No se pudo cargar el ranking');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  };

  const userEntry = leaderboard.find(e => e.id === user?.id);
  const currentRank = userEntry?.rank || null;

  if (loading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Ranking" />
        <LoadingState message="Cargando ranking..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Ranking" />
        <ErrorState message={error} onRetry={loadLeaderboard} />
      </View>
    );
  }

  const top3 = leaderboard.slice(0, 3);

  const podiumConfig: Record<number, { position: 'first' | 'second' | 'third'; style: any; avatarStyle: any; blockStyle: any }> = {
    0: {
      position: 'first',
      style: { marginTop: 0 },
      avatarStyle: styles.goldAvatar,
      blockStyle: styles.goldBlock,
    },
    1: {
      position: 'second',
      style: { marginTop: 30 },
      avatarStyle: styles.silverAvatar,
      blockStyle: styles.silverBlock,
    },
    2: {
      position: 'third',
      style: { marginTop: 50 },
      avatarStyle: styles.bronzeAvatar,
      blockStyle: styles.bronzeBlock,
    },
  };

  const podiumOrder = top3.length === 3
    ? [1, 0, 2]
    : top3.length === 2
    ? [0, 1]
    : [0];

  return (
    <View style={styles.container}>
      <ScreenHeader title="Ranking" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {leaderboard.length > 0 && (
          <View style={styles.podiumContainer}>
            {podiumOrder.map((i) => {
              const entry = top3[i];
              const cfg = podiumConfig[i];
              const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
              return (
                <View key={entry.id} style={[styles.podiumColumn, cfg.style]}>
                  <View style={[styles.podiumAvatar, cfg.avatarStyle]}>
                    <Text style={styles.podiumAvatarText}>{medal}</Text>
                  </View>
                  <Text style={[styles.podiumName, i === 0 && styles.podiumNameFirst]} numberOfLines={1}>
                    {entry.name}
                  </Text>
                  <Text style={[styles.podiumPoints, i === 0 && styles.podiumPointsFirst]}>
                    {entry.points.toLocaleString()} pts
                  </Text>
                  <View style={[styles.podiumBlock, cfg.blockStyle]} />
                </View>
              );
            })}
          </View>
        )}

        {user && (
          <LinearGradient
            colors={[`${colors.primary}30`, `${colors.primary}10`]}
            style={styles.yourRankCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.yourRankContent}>
              <View style={styles.yourRankInfo}>
                <Text style={styles.yourRankLabel}>Tu Posición</Text>
                {currentRank ? (
                  <View style={styles.yourRankBadge}>
                    <Text style={styles.yourRankNumber}>#{currentRank}</Text>
                  </View>
                ) : (
                  <View style={[styles.yourRankBadge, { backgroundColor: colors.textMuted }]}>
                    <Text style={styles.yourRankNumber}>--</Text>
                  </View>
                )}
              </View>
              <View style={styles.yourRankStats}>
                <View style={styles.yourRankStat}>
                  <Ionicons name="trophy" size={20} color={colors.points} />
                  <Text style={styles.yourRankStatValue}>{user?.points.toLocaleString()}</Text>
                  <Text style={styles.yourRankStatLabel}>puntos</Text>
                </View>
                <View style={styles.yourRankStat}>
                  <Ionicons name="trending-up" size={20} color={colors.primary} />
                  <Text style={styles.yourRankStatValue}>Nivel {user?.level}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        )}

        <View style={styles.leaderboardList}>
          <Text style={styles.sectionTitle}>Clasificación Global</Text>

          {leaderboard.length === 0 && (
            <EmptyState icon="trophy-outline" iconSize={48} title="No hay usuarios en el ranking aún" />
          )}

          {leaderboard.map((entry) => {
            const isUser = entry.id === user?.id;
            const rankInfo = getRankEmoji(entry.rank);

            return (
              <View
                key={entry.id}
                style={[
                  styles.leaderboardItem,
                  isUser && styles.leaderboardItemUser,
                ]}
              >
                <View style={styles.leaderboardRank}>
                  <Text style={[
                    styles.leaderboardRankText,
                    entry.rank === 1 && styles.leaderboardRankGold,
                    entry.rank === 2 && styles.leaderboardRankSilver,
                    entry.rank === 3 && styles.leaderboardRankBronze,
                  ]}>
                    {rankInfo.emoji || `#${entry.rank}`}
                  </Text>
                </View>

                <View style={styles.leaderboardAvatar}>
                  <Text style={styles.leaderboardAvatarText}>{getLevelEmoji(entry.level)}</Text>
                </View>

                <View style={styles.leaderboardInfo}>
                  <Text style={[styles.leaderboardName, isUser && styles.leaderboardNameUser]}>
                    {entry.name}
                  </Text>
                  <Text style={styles.leaderboardLevel}>Nivel {entry.level}</Text>
                </View>

                <View style={styles.leaderboardPoints}>
                  <Text style={[styles.leaderboardPointsText, isUser && styles.leaderboardPointsUser]}>
                    {entry.points.toLocaleString()}
                  </Text>
                  <Ionicons name="trophy" size={16} color={isUser ? colors.primary : colors.points} />
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  podiumColumn: {
    alignItems: 'center',
  },
  podiumAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 3,
  },
  goldAvatar: {
    backgroundColor: `${colors.levelGold}20`,
    borderColor: colors.levelGold,
  },
  silverAvatar: {
    backgroundColor: `${colors.levelSilver}20`,
    borderColor: colors.levelSilver,
  },
  bronzeAvatar: {
    backgroundColor: `${colors.levelBronze}20`,
    borderColor: colors.levelBronze,
  },
  podiumAvatarText: {
    fontSize: 32,
  },
  podiumName: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 80,
  },
  podiumNameFirst: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  podiumPoints: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  podiumPointsFirst: {
    fontWeight: '600',
    color: colors.points,
  },
  podiumBlock: {
    width: 70,
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
  },
  goldBlock: {
    height: 100,
    backgroundColor: `${colors.levelGold}30`,
    borderWidth: 2,
    borderColor: colors.levelGold,
  },
  silverBlock: {
    height: 70,
    backgroundColor: `${colors.levelSilver}30`,
    borderWidth: 2,
    borderColor: colors.levelSilver,
  },
  bronzeBlock: {
    height: 50,
    backgroundColor: `${colors.levelBronze}30`,
    borderWidth: 2,
    borderColor: colors.levelBronze,
  },
  yourRankCard: {
    marginHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: `${colors.primary}40`,
  },
  yourRankContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  yourRankInfo: {
    flex: 1,
  },
  yourRankLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  yourRankBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  yourRankNumber: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.background,
  },
  yourRankStats: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  yourRankStat: {
    alignItems: 'center',
  },
  yourRankStatValue: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  yourRankStatLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  leaderboardList: {
    paddingHorizontal: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  leaderboardItemUser: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  leaderboardRank: {
    width: 30,
    alignItems: 'center',
  },
  leaderboardRankText: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  leaderboardRankGold: {
    color: colors.levelGold,
  },
  leaderboardRankSilver: {
    color: colors.levelSilver,
  },
  leaderboardRankBronze: {
    color: colors.levelBronze,
  },
  leaderboardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  leaderboardAvatarText: {
    fontSize: 20,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  leaderboardNameUser: {
    color: colors.primary,
  },
  leaderboardLevel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  leaderboardPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  leaderboardPointsText: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.points,
  },
  leaderboardPointsUser: {
    color: colors.primary,
  },
});
