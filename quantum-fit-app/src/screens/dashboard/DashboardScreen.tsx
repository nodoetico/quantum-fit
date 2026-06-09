import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { TutorialModal } from '../../components';
import type { MainTabScreenProps } from '../../types/navigation';

const TUTORIAL_SEEN_KEY = 'quantumfit.tutorial.seen';

type DashboardScreenProps = MainTabScreenProps<'Dashboard'>;

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const { user, weeklyStats, achievements, bookings, refreshAll, externalProfile, externalAttendances, externalMemberships, isExternalLoading } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);
  const [showAllStats, setShowAllStats] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    checkTutorialSeen();
  }, []);

  const checkTutorialSeen = async () => {
    try {
      const seen = await AsyncStorage.getItem(TUTORIAL_SEEN_KEY);
      if (!seen && user && user.level === 1) {
        setShowTutorial(true);
      }
    } catch (error) {
      console.error('[Dashboard] Error al verificar tutorial:', error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  }, [refreshAll]);

  const getLevelInfo = (level: number) => {
    const levels = [
      { name: 'Principiante', icon: '🌱', color: colors.levelBronze },
      { name: 'Intermedio', icon: '💪', color: colors.levelSilver },
      { name: 'Avanzado', icon: '🔥', color: colors.levelGold },
      { name: 'Experto', icon: '⭐', color: colors.levelPlatinum },
      { name: 'Élite', icon: '💎', color: colors.levelDiamond },
      { name: 'Leyenda', icon: '👑', color: colors.primary },
    ];
    const index = Math.min(Math.floor((level - 1) / 2), levels.length - 1);
    return levels[index];
  };

  const levelInfo = getLevelInfo(user?.level || 1);
  const progressToNextLevel = ((user?.level || 1) % 2) * 50 + (user?.points || 0) % 1000;

  const motivationalQuotes = [
    '¡El único mal entrenamiento es el que no ocurrió!',
    'Tu cuerpo puede soportar casi cualquier cosa. Es a tu mente a la que tienes que convencer.',
    'La disciplina es el puente entre metas y logros.',
    'No cuentes los días, haz que los días cuenten.',
    'El dolor que sientes hoy es la fuerza que sentirás mañana.',
  ];

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[colors.backgroundSecondary, colors.background]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingText}>Hola,</Text>
            <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">{user.name.split(' ')[0]}!</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notificaciones')}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
            {(user.notificationsCount ?? 0) > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{user.notificationsCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Motivational Quote */}
        <View style={styles.quoteContainer}>
          <Ionicons name="chatbubbles-outline" size={20} color={colors.primary} style={styles.quoteIcon} />
          <Text style={styles.quoteText}>{randomQuote}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Level Card */}
        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <View style={styles.levelInfo}>
              <Text style={styles.levelEmoji}>{levelInfo.icon}</Text>
              <View>
                <Text style={styles.levelName}>{levelInfo.name}</Text>
                <Text style={styles.levelNumber}>Nivel {user.level}</Text>
              </View>
            </View>
            <View style={styles.pointsContainer}>
              <Ionicons name="trophy" size={20} color={colors.points} />
              <Text style={styles.pointsText}>{user.points.toLocaleString()}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressToNextLevel}%` },
                  { backgroundColor: levelInfo.color },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{progressToNextLevel}% para el siguiente nivel</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Stats principales (siempre visibles) */}
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(0, 240, 255, 0.1)' }]}>
              <Ionicons name="flame" size={24} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{user.currentStreak}</Text>
            <Text style={styles.statLabel}>Días de racha</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(57, 255, 20, 0.1)' }]}>
              <Ionicons name="barbell" size={24} color={colors.secondary} />
            </View>
            <Text style={styles.statValue}>{user.totalWorkouts}</Text>
            <Text style={styles.statLabel}>Entrenamientos</Text>
          </View>

          {/* Stats secundarios (solo si se expande y usuario no es principiante) */}
          {showAllStats && user.level > 1 && (
            <>
              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
                  <Ionicons name="calendar" size={24} color={colors.points} />
                </View>
                <Text style={styles.statValue}>{weeklyStats.currentWeek.workoutsCompleted}</Text>
                <Text style={styles.statLabel}>Esta semana</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: 'rgba(255, 71, 87, 0.1)' }]}>
                  <Ionicons name="trending-up" size={24} color={colors.error} />
                </View>
                <Text style={styles.statValue}>{weeklyStats.currentWeek.attendanceRate}%</Text>
                <Text style={styles.statLabel}>Asistencia</Text>
              </View>
            </>
          )}

          {/* Mensaje para principiantes */}
          {showAllStats && user.level === 1 && (
            <View style={styles.beginnerMessage}>
              <Ionicons name="information-circle" size={24} color={colors.primary} />
              <Text style={styles.beginnerMessageText}>
                ¡Comienza a entrenar para ver tus estadísticas semanales!
              </Text>
            </View>
          )}
        </View>

        {/* Botón Ver más/menos */}
        <TouchableOpacity
          style={styles.seeAllButton}
          onPress={() => setShowAllStats(!showAllStats)}
        >
          <Text style={styles.seeAllButtonText}>
            {showAllStats ? 'Ver menos' : 'Ver más estadísticas'}
          </Text>
          <Ionicons
            name={showAllStats ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.primary}
          />
        </TouchableOpacity>

        {/* Next Booking */}
        {bookings.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Próximo Turno</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Turnos')}>
                <Text style={styles.seeAllText}>Ver todos</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.bookingCard}
              onPress={() => navigation.navigate('Turnos')}
            >
              <LinearGradient
                colors={['rgba(0, 240, 255, 0.1)', 'rgba(0, 0, 0, 0)']}
                style={styles.bookingGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.bookingContent}>
                  <View style={styles.bookingIcon}>
                    <Ionicons name="fitness" size={32} color={colors.primary} />
                  </View>
                  <View style={styles.bookingInfo}>
                    <Text style={styles.bookingActivity}>Turno Confirmado</Text>
                    <Text style={styles.bookingInstructor}>Reserva activa</Text>
                    <View style={styles.bookingDetails}>
                      <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                      <Text style={styles.bookingDate}>{bookings.length} reserva(s)</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.bookingStatus}>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Confirmado</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accesos Rápidos</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('Turnos')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(0, 240, 255, 0.15)' }]}>
                <Ionicons name="calendar" size={24} color={colors.primary} />
              </View>
              <Text style={styles.quickActionText}>Reservar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('Beneficios')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(255, 215, 0, 0.15)' }]}>
                <Ionicons name="gift" size={24} color={colors.points} />
              </View>
              <Text style={styles.quickActionText}>Premios</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('Perfil')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(57, 255, 20, 0.15)' }]}>
                <Ionicons name="person" size={24} color={colors.secondary} />
              </View>
              <Text style={styles.quickActionText}>Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('Ranking')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(255, 71, 87, 0.15)' }]}>
                <Ionicons name="trophy" size={24} color={colors.error} />
              </View>
              <Text style={styles.quickActionText}>Ranking</Text>
            </TouchableOpacity>
          </View>
        </View>

        {externalProfile && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <View style={styles.crystalIcon}>
                  <Ionicons name="server-outline" size={18} color={colors.primary} />
                </View>
                <Text style={styles.sectionTitle}>Crystal</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('DatosCrystal')}>
                <Text style={styles.seeAllText}>Ver más</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.crystalCard}>
              <View style={styles.crystalCardHeader}>
                <View style={styles.crystalUserIcon}>
                  <Text style={styles.crystalUserInitials}>
                    {externalProfile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </Text>
                </View>
                <View style={styles.crystalUserInfo}>
                  <Text style={styles.crystalUserName}>{externalProfile.name}</Text>
                  {externalProfile.dni && (
                    <Text style={styles.crystalUserDni}>DNI {externalProfile.dni}</Text>
                  )}
                </View>
              </View>

              <View style={styles.crystalStatsRow}>
                <View style={styles.crystalStat}>
                  <Ionicons name="wallet-outline" size={16} color={colors.points} />
                  <Text style={styles.crystalStatValue}>${externalProfile.balance?.toLocaleString()}</Text>
                  <Text style={styles.crystalStatLabel}>Saldo</Text>
                </View>
                <View style={styles.crystalStatDivider} />
                <View style={styles.crystalStat}>
                  <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                  <Text style={styles.crystalStatValue}>{externalAttendances.length}</Text>
                  <Text style={styles.crystalStatLabel}>Asistencias</Text>
                </View>
                <View style={styles.crystalStatDivider} />
                <View style={styles.crystalStat}>
                  <Ionicons name="card-outline" size={16} color={colors.secondary} />
                  <Text style={styles.crystalStatValue}>{externalMemberships.length}</Text>
                  <Text style={styles.crystalStatLabel}>Membresías</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {isExternalLoading && (
          <View style={styles.section}>
            <View style={[styles.crystalCard, { alignItems: 'center', paddingVertical: spacing.lg }]}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.crystalUserDni, { marginTop: spacing.sm }]}>Sincronizando con Crystal...</Text>
            </View>
          </View>
        )}

        {/* Recent Achievements */}
        {achievements.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Logros Recientes</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Perfil', { tab: 'achievements' })}>
                <Text style={styles.seeAllText}>Ver todos</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {achievements.filter(a => a.unlocked).slice(0, 4).map((achievement) => (
                <View key={achievement.id} style={styles.achievementCard}>
                  <View style={styles.achievementIcon}>
                    <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
                  </View>
                  <Text style={styles.achievementName}>{achievement.name}</Text>
                  <Text style={styles.achievementDesc}>{achievement.description}</Text>
                </View>
              ))}
              {achievements.filter(a => !a.unlocked).slice(0, 1).map((achievement) => (
                <View key={achievement.id} style={styles.achievementCardLocked}>
                  <View style={styles.achievementIconLocked}>
                    <Ionicons name="lock-closed" size={24} color={colors.textMuted} />
                  </View>
                  <Text style={styles.achievementNameLocked}>{achievement.name}</Text>
                  <Text style={styles.achievementDescLocked}>{achievement.description}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Bottom Padding */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Botón Flotante de Check-in */}
      <TouchableOpacity
        style={styles.checkInButton}
        onPress={() => navigation.navigate('CheckIn')}
        activeOpacity={0.8}
      >
        <Ionicons name="scan" size={28} color={colors.background} />
        <Text style={styles.checkInButtonText}>Check-in</Text>
      </TouchableOpacity>

      {/* Tutorial Modal para principiantes */}
      <TutorialModal
        visible={showTutorial && user && user.level === 1}
        onComplete={async () => {
          setShowTutorial(false);
          await AsyncStorage.setItem(TUTORIAL_SEEN_KEY, 'true');
        }}
      />
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
    paddingHorizontal: spacing.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greetingText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.background,
  },
  quoteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quoteIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  quoteText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  levelCard: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.medium,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  levelEmoji: {
    fontSize: 36,
  },
  levelName: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  levelNumber: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  pointsText: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.points,
  },
  progressContainer: {
    marginTop: spacing.sm,
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
  progressText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
  seeAllButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  beginnerMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.primary}10`,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    width: '100%',
    marginTop: spacing.md,
  },
  beginnerMessageText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  seeAllText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
  },
  bookingCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  bookingGradient: {
    padding: spacing.lg,
  },
  bookingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingIcon: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingActivity: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  bookingInstructor: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  bookingDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingDate: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    marginRight: spacing.md,
  },
  locationIcon: {
    marginLeft: spacing.xs,
  },
  bookingLocation: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  bookingStatus: {
    marginTop: spacing.md,
    alignItems: 'flex-end',
  },
  statusBadge: {
    backgroundColor: 'rgba(57, 255, 20, 0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.secondary,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    width: '23%',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickActionText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  achievementCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginRight: spacing.md,
    alignItems: 'center',
    width: 120,
    borderWidth: 1,
    borderColor: colors.border,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  achievementEmoji: {
    fontSize: 28,
  },
  achievementName: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  achievementDesc: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
  achievementCardLocked: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginRight: spacing.md,
    alignItems: 'center',
    width: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  achievementIconLocked: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.full,
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
  achievementDescLocked: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
  crystalIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  crystalCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  crystalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  crystalUserIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  crystalUserInitials: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  crystalUserInfo: {
    flex: 1,
  },
  crystalUserName: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  crystalUserDni: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  crystalStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  crystalStat: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  crystalStatValue: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  crystalStatLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  crystalStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  checkInButton: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    ...{
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 10,
    },
  },
  checkInButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.background,
  },
});
