import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import type { Achievement } from '../../types';
import type { MainTabScreenProps } from '../../types/navigation';

type PerfilScreenProps = MainTabScreenProps<'Perfil'>;

export default function PerfilScreen({ navigation, route }: PerfilScreenProps) {
  const { user, achievements, weeklyStats, activityLog, externalAttendances } = useAuth();
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements' | 'activity'>(route?.params?.tab || 'stats');

  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const getLevelProgress = (level: number) => {
    const pointsForNextLevel = 1000;
    const currentLevelPoints = user.points % pointsForNextLevel;
    return (currentLevelPoints / pointsForNextLevel) * 100;
  };

  const getLevelInfo = (level: number) => {
    const levels = [
      { name: 'Principiante', icon: '🌱', color: colors.levelBronze, minLevel: 1 },
      { name: 'Intermedio', icon: '💪', color: colors.levelSilver, minLevel: 3 },
      { name: 'Avanzado', icon: '🔥', color: colors.levelGold, minLevel: 5 },
      { name: 'Experto', icon: '⭐', color: colors.levelPlatinum, minLevel: 7 },
      { name: 'Élite', icon: '💎', color: colors.levelDiamond, minLevel: 9 },
      { name: 'Leyenda', icon: '👑', color: colors.primary, minLevel: 11 },
    ];
    
    for (let i = levels.length - 1; i >= 0; i--) {
      if (level >= levels[i].minLevel) {
        return levels[i];
      }
    }
    return levels[0];
  };

  const levelInfo = getLevelInfo(user.level);

  // Convertir memberSince a Date si es string
  const memberSinceDate = user.memberSince 
    ? (typeof user.memberSince === 'string' ? new Date(user.memberSince) : user.memberSince)
    : new Date();

  const crystalWorkouts = externalAttendances?.length ?? 0;
  const totalWorkouts = crystalWorkouts > 0 ? crystalWorkouts : (user.totalWorkouts ?? 0);

  const rankDisplay = user.rank && user.rank < 9999 ? `#${user.rank}` : '—';

  const stats = [
    { label: 'Entrenamientos', value: totalWorkouts, icon: 'barbell', color: colors.primary },
    { label: 'Puntos Totales', value: (user.points ?? 0).toLocaleString(), icon: 'trophy', color: colors.points },
    { label: 'Racha Actual', value: `${user.currentStreak ?? 0} días`, icon: 'flame', color: colors.secondary },
    { label: 'Mejor Racha', value: `${user.longestStreak ?? 0} días`, icon: 'star', color: colors.error },
    { label: 'Ranking Global', value: rankDisplay, icon: 'podium', color: colors.levelGold },
    { label: 'Miembro Desde', value: memberSinceDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }), icon: 'calendar', color: colors.textSecondary },
  ];

  const unlockedAchievements = achievements.filter((a: Achievement) => a.unlocked);
  const lockedAchievements = achievements.filter((a: Achievement) => !a.unlocked);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'workout':
        return 'barbell';
      case 'class':
        return 'fitness';
      case 'achievement':
        return 'trophy';
      case 'booking':
        return 'calendar';
      default:
        return 'fitness';
    }
  };

  const getActivityPoints = (type: string) => {
    switch (type) {
      case 'workout':
        return colors.primary;
      case 'class':
        return colors.secondary;
      case 'achievement':
        return colors.points;
      case 'booking':
        return colors.info;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header con Gradiente */}
      <LinearGradient
        colors={[colors.backgroundSecondary, colors.background]}
        style={styles.header}
      >
        {/* Info del Usuario */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>
                {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
              </Text>
            </LinearGradient>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{user.level}</Text>
            </View>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.levelContainer}>
              <Text style={styles.levelName}>{levelInfo.name}</Text>
              <Text style={styles.levelEmoji}>{levelInfo.icon}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Configuracion')}
          >
            <Ionicons name="settings-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Progress Bar de Nivel */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progreso al siguiente nivel</Text>
            <Text style={styles.progressPercent}>{Math.round(getLevelProgress(user.level))}%</Text>
          </View>
          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                { width: `${getLevelProgress(user.level)}%` },
                { backgroundColor: levelInfo.color },
              ]}
            />
          </View>
          <Text style={styles.progressHint}>
            {1000 - (user.points % 1000)} puntos para el nivel {user.level + 1}
          </Text>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'stats' && styles.tabActive]}
          onPress={() => setActiveTab('stats')}
        >
          <Ionicons
            name="stats-chart"
            size={20}
            color={activeTab === 'stats' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'stats' && styles.tabTextActive,
            ]}
          >
            Estadísticas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'achievements' && styles.tabActive]}
          onPress={() => setActiveTab('achievements')}
        >
          <Ionicons
            name="medal"
            size={20}
            color={activeTab === 'achievements' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'achievements' && styles.tabTextActive,
            ]}
          >
            Logros
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'activity' && styles.tabActive]}
          onPress={() => setActiveTab('activity')}
        >
          <Ionicons
            name="time"
            size={20}
            color={activeTab === 'activity' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'activity' && styles.tabTextActive,
            ]}
          >
            Actividad
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenido de las Tabs */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {activeTab === 'stats' && (
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: `${stat.color}15` },
                  ]}
                >
                  <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}

            {/* Weekly Activity Chart */}
            <View style={styles.weeklyChartCard}>
              <Text style={styles.cardTitle}>Actividad Semanal</Text>
              {(() => {
                const today = new Date();
                const dayOfWeek = today.getDay();
                const monday = new Date(today);
                monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
                monday.setHours(0, 0, 0, 0);
                const sunday = new Date(monday);
                sunday.setDate(monday.getDate() + 6);

                const crystalDays = new Set<number>();
                if (externalAttendances?.length > 0) {
                  externalAttendances.forEach((att: any) => {
                    if (!att.date) return;
                    const attDate = new Date(att.date);
                    if (attDate >= monday && attDate <= sunday) {
                      const attDay = attDate.getDay();
                      const idx = attDay === 0 ? 6 : attDay - 1;
                      crystalDays.add(idx);
                    }
                  });
                }

                const hasActivity = crystalDays.size > 0 || (weeklyStats.currentWeek?.activeDaysBitmap ?? 0) > 0;

                if (!hasActivity) {
                  return (
                    <View style={styles.beginnerChart}>
                      <Ionicons name="fitness-outline" size={48} color={colors.textMuted} />
                      <Text style={styles.beginnerChartText}>
                        No hay actividad registrada esta semana.
                      </Text>
                    </View>
                  );
                }

                const bitmap = weeklyStats.currentWeek?.activeDaysBitmap ?? 0;

                return (
                  <View style={styles.weeklyChart}>
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => {
                      const isActive = crystalDays.size > 0
                        ? crystalDays.has(index)
                        : ((bitmap >> index) & 1) === 1;
                      const intensity = isActive ? 1 : 0;

                      return (
                        <View key={index} style={styles.dayColumn}>
                          <View style={styles.barContainer}>
                            <View
                              style={[
                                styles.bar,
                                {
                                  height: `${20 + intensity * 80}%`,
                                  backgroundColor: isActive ? colors.primary : colors.background,
                                  borderColor: isActive ? colors.primary : colors.border,
                                },
                              ]}
                            />
                          </View>
                          <Text
                            style={[
                              styles.dayLabel,
                              isActive && styles.dayLabelActive,
                            ]}
                          >
                            {day}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                );
              })()}
            </View>

            <View style={styles.statsFooter}>
              <TouchableOpacity
                style={styles.footerButton}
                onPress={() => navigation.navigate('Membresia')}
              >
                <View style={[styles.footerIcon, { backgroundColor: 'rgba(0, 240, 255, 0.1)' }]}>
                  <Ionicons name="card-outline" size={20} color={colors.primary} />
                </View>
                <Text style={styles.footerButtonText}>Membresía</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.footerButton}
                onPress={() => navigation.navigate('DatosCrystal')}
              >
                <View style={[styles.footerIcon, { backgroundColor: 'rgba(57, 255, 20, 0.1)' }]}>
                  <Ionicons name="server-outline" size={20} color={colors.secondary} />
                </View>
                <Text style={styles.footerButtonText}>Crystal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.footerButton}
                onPress={() => navigation.navigate('Configuracion')}
              >
                <View style={[styles.footerIcon, { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
                  <Ionicons name="settings-outline" size={20} color={colors.points} />
                </View>
                <Text style={styles.footerButtonText}>Ajustes</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'achievements' && (
          <View style={styles.achievementsContainer}>
            {/* Logros Desbloqueados */}
            <View style={styles.achievementsSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="trophy" size={20} color={colors.points} />
                <Text style={styles.sectionTitle}>
                  Desbloqueados ({unlockedAchievements.length})
                </Text>
              </View>
              <View style={styles.achievementsGrid}>
                {unlockedAchievements.map((achievement: Achievement) => (
                  <View key={achievement.id} style={styles.achievementCard}>
                    <View style={styles.achievementIconUnlocked}>
                      <Text style={styles.achievementIconEmoji}>{achievement.icon}</Text>
                    </View>
                    <Text style={styles.achievementName}>{achievement.name}</Text>
                    <Text style={styles.achievementDescription}>{achievement.description}</Text>
                    <View style={styles.achievementMeta}>
                      <Ionicons name="calendar" size={12} color={colors.textMuted} />
                      <Text style={styles.achievementDate}>
                        {achievement.unlockedAt?.toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Logros Bloqueados */}
            <View style={styles.achievementsSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="lock-closed" size={20} color={colors.textMuted} />
                <Text style={styles.sectionTitle}>
                  Pendientes ({lockedAchievements.length})
                </Text>
              </View>
              <View style={styles.achievementsGrid}>
                {lockedAchievements.map((achievement: Achievement) => (
                  <View key={achievement.id} style={styles.achievementCardLocked}>
                    <View style={styles.achievementIconLocked}>
                      <Ionicons name="lock-closed" size={24} color={colors.textMuted} />
                    </View>
                    <Text style={styles.achievementNameLocked}>{achievement.name}</Text>
                    <Text style={styles.achievementDescriptionLocked}>
                      {achievement.description}
                    </Text>
                    <View style={styles.achievementMeta}>
                      <Ionicons name="trophy" size={12} color={colors.textMuted} />
                      <Text style={styles.achievementPoints}>{achievement.pointsRequired} pts</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {activeTab === 'activity' && (
          <View style={styles.activityContainer}>
            <View style={styles.activityHeader}>
              <Text style={styles.activityTitle}>Historial de Actividad</Text>
            </View>

            <View style={styles.activityList}>
              {externalAttendances && externalAttendances.length > 0 ? (
                [...externalAttendances]
                  .sort((a: any, b: any) => {
                    const dateA = a.date ? new Date(a.date).getTime() : 0;
                    const dateB = b.date ? new Date(b.date).getTime() : 0;
                    return dateB - dateA;
                  })
                  .map((att: any, index: number) => {
                    const attDate = att.date ? new Date(att.date) : null;
                    return (
                      <View key={att.id || index} style={styles.activityItem}>
                        <View style={[styles.activityIcon, { backgroundColor: `${colors.primary}15` }]}>
                          <Ionicons name="fitness" size={20} color={colors.primary} />
                        </View>
                        <View style={styles.activityInfo}>
                          <Text style={styles.activityDescription}>
                            {att.type || 'Entrenamiento'}
                          </Text>
                          <Text style={styles.activityDate}>
                            {attDate
                              ? attDate.toLocaleDateString('es-ES', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Fecha no disponible'}
                          </Text>
                          {att.location ? (
                            <Text style={styles.activityDate}>{att.location}</Text>
                          ) : null}
                        </View>
                      </View>
                    );
                  })
              ) : activityLog && activityLog.length > 0 ? (
                activityLog.map((log: any) => (
                  <View key={log.id} style={styles.activityItem}>
                    <View style={[styles.activityIcon, { backgroundColor: `${getActivityPoints(log.type)}15` }]}>
                      <Ionicons name={getActivityIcon(log.type) as any} size={20} color={getActivityPoints(log.type)} />
                    </View>
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityDescription}>{log.description}</Text>
                      <Text style={styles.activityDate}>
                        {log.date instanceof Date
                          ? log.date.toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'long',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </Text>
                    </View>
                    <View style={styles.activityPoints}>
                      <Text style={styles.activityPointsValue}>+{log.points}</Text>
                      <Ionicons name="trophy" size={14} color={colors.points} />
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.beginnerChart}>
                  <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
                  <Text style={styles.beginnerChartText}>
                    No hay actividad registrada aún.
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Bottom Padding */}
        <View style={{ height: 40 }} />
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.background,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.background,
  },
  profileInfo: {
    flex: 1,
    minWidth: 0, // Permite que el texto se contraiga
  },
  userName: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    gap: spacing.xs,
  },
  levelName: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  levelEmoji: {
    fontSize: 16,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressSection: {
    paddingHorizontal: spacing.xl,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  progressPercent: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  progressBackground: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  progressHint: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.xl,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    borderRadius: borderRadius.md,
  },
  tabActive: {
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
  },
  tabText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  weeklyChartCard: {
    width: '100%',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  beginnerChart: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  beginnerChartText: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    lineHeight: 20,
  },
  cardTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  dayColumn: {
    alignItems: 'center',
  },
  barContainer: {
    width: 24,
    height: 100,
    justifyContent: 'flex-end',
    marginBottom: spacing.sm,
  },
  bar: {
    width: '100%',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  dayLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  dayLabelActive: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  achievementsContainer: {
    marginTop: spacing.sm,
  },
  achievementsSection: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  achievementCard: {
    width: '48%',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  achievementIconUnlocked: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  achievementIconEmoji: {
    fontSize: 32,
  },
  achievementName: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  achievementDescription: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    lineHeight: 16,
  },
  achievementMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  achievementDate: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  achievementCardLocked: {
    width: '48%',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    opacity: 0.7,
  },
  achievementIconLocked: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  achievementNameLocked: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  achievementDescriptionLocked: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.sm,
    lineHeight: 16,
  },
  achievementPoints: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  activityContainer: {
    marginTop: spacing.sm,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  activityTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  activityFilter: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
  },
  activityList: {
    gap: spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activityInfo: {
    flex: 1,
  },
  activityDescription: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  activityDate: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  activityPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  activityPointsValue: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.points,
  },

  statsFooter: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
    width: '100%',
  },
  footerButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  footerIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
