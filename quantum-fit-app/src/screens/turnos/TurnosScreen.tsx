import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';
import { classesService, bookingsService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ScreenHeader, LoadingState, ErrorState, EmptyState } from '../../components';
import type { MainTabScreenProps } from '../../types/navigation';

type TurnosScreenProps = MainTabScreenProps<'Turnos'>;

interface ClassItem {
  id: string;
  name: string;
  description: string | null;
  instructorName: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  totalSpots: number;
  bookedSpots: number;
  activityType: string;
  difficultyLevel: string;
  location: string | null;
  gymZone: string | null;
}

const activities = ['Todas', 'CrossFit', 'Yoga', 'HIIT', 'Pilates', 'Boxeo', 'Spinning'];
const difficulties = ['Todos', 'PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'];

export default function TurnosScreen({ navigation }: TurnosScreenProps) {
  const { bookings, loadUserBookings } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState('Todas');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Todos');
  const [selectedTurno, setSelectedTurno] = useState<ClassItem | null>(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookedIds, setBookedIds] = useState<string[]>([]);
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setError(null);
      const data = await classesService.getAll();
      setClasses(data || []);
    } catch (err) {
      setError('No se pudieron cargar las clases');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadClasses(), loadUserBookings()]);
    setRefreshing(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'PRINCIPIANTE':
        return colors.secondary;
      case 'INTERMEDIO':
        return colors.primary;
      case 'AVANZADO':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case 'PRINCIPIANTE': return 'Principiante';
      case 'INTERMEDIO': return 'Intermedio';
      case 'AVANZADO': return 'Avanzado';
      default: return level;
    }
  };

  const handleBookTurno = async () => {
    if (!selectedTurno) return;
    
    setIsBooking(true);
    try {
      await classesService.book(selectedTurno.id);
      setBookedIds([...bookedIds, selectedTurno.id]);
      setBookingModalVisible(false);
      setSelectedTurno(null);
      await loadClasses();
    } catch (err) {
      Alert.alert('Error', 'No se pudo reservar la clase. Intenta nuevamente.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    Alert.alert(
      'Cancelar Reserva',
      '¿Estás seguro de que querés cancelar esta reserva?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            setCancellingId(bookingId);
            try {
              await bookingsService.cancel(bookingId);
              await Promise.all([loadClasses(), loadUserBookings()]);
            } catch {
              Alert.alert('Error', 'No se pudo cancelar la reserva');
            } finally {
              setCancellingId(null);
            }
          },
        },
      ]
    );
  };

  const filteredClasses = classes.filter(c => {
    const matchesActivity = selectedActivity === 'Todas' || 
      c.activityType.includes(selectedActivity);
    const matchesDifficulty = selectedDifficulty === 'Todos' || 
      c.difficultyLevel === selectedDifficulty;
    return matchesActivity && matchesDifficulty;
  });

  const getActivityIcon = (name: string) => {
    if (name.includes('Yoga') || name.includes('Pilates')) return 'fitness';
    if (name.includes('Boxeo')) return 'shield';
    return 'barbell';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Reservar Turnos" />
        <LoadingState message="Cargando clases..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Reservar Turnos" />
        <ErrorState message={error} onRetry={loadClasses} />
      </View>
    );
  }

  const getTimeFromDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title={showMyBookings ? 'Mis Reservas' : 'Reservar Turnos'} />

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, !showMyBookings && styles.toggleButtonActive]}
          onPress={() => setShowMyBookings(false)}
        >
          <Ionicons name="calendar-outline" size={16} color={!showMyBookings ? colors.background : colors.textSecondary} />
          <Text style={[styles.toggleButtonText, !showMyBookings && styles.toggleButtonTextActive]}>Clases</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, showMyBookings && styles.toggleButtonActive]}
          onPress={() => setShowMyBookings(true)}
        >
          <Ionicons name="bookmark-outline" size={16} color={showMyBookings ? colors.background : colors.textSecondary} />
          <Text style={[styles.toggleButtonText, showMyBookings && styles.toggleButtonTextActive]}>Mis Reservas ({bookings.length})</Text>
        </TouchableOpacity>
      </View>

      {showMyBookings ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          {bookings.length === 0 ? (
            <EmptyState icon="bookmark-outline" iconSize={48} title="No tenés reservas activas" />
          ) : (
            <View style={styles.turnosList}>
              {bookings.map((b: any) => (
                <View key={b.id} style={[styles.turnoCard, { borderColor: colors.primary }]}>
                  <View style={styles.turnoGradient}>
                    <View style={styles.turnoHeader}>
                      <View style={styles.turnoIcon}>
                        <Ionicons name="calendar" size={28} color={colors.primary} />
                      </View>
                      <View style={styles.turnoInfo}>
                        <Text style={styles.turnoActivity}>{b.class?.name || 'Reserva'}</Text>
                        <Text style={styles.turnoInstructor}>{b.class?.instructorName || ''}</Text>
                        <View style={styles.turnoMeta}>
                          <View style={styles.turnoMetaItem}>
                            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                            <Text style={styles.turnoMetaText}>
                              {b.class?.startTime ? getTimeFromDate(b.class.startTime) : ''} hs
                            </Text>
                          </View>
                          {b.class?.location && (
                            <View style={styles.turnoMetaItem}>
                              <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                              <Text style={styles.turnoMetaText}>{b.class.location}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => handleCancelBooking(b.id)}
                      disabled={cancellingId === b.id}
                    >
                      {cancellingId === b.id ? (
                        <ActivityIndicator size="small" color={colors.error} />
                      ) : (
                        <>
                          <Ionicons name="close-circle-outline" size={18} color={colors.error} />
                          <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      ) : filteredClasses.length === 0 ? (
        <EmptyState icon="calendar-outline" iconSize={48} title="No hay clases disponibles" />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          {/* Filters */}
          <View style={styles.filtersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {activities.map((activity, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.filterChip,
                    selectedActivity === activity && styles.filterChipSelected,
                  ]}
                  onPress={() => setSelectedActivity(activity)}
                >
                  <Text style={[styles.filterChipText, selectedActivity === activity && styles.filterChipTextSelected]}>
                    {activity}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {difficulties.map((difficulty, index) => {
                const isSelected = selectedDifficulty === difficulty;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.filterChip,
                      isSelected && styles.filterChipSelected,
                      { borderColor: isSelected ? colors.primary : getDifficultyColor(difficulty) },
                    ]}
                    onPress={() => setSelectedDifficulty(difficulty)}
                  >
                    <View style={styles.filterChipContent}>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={16} color={colors.primary} style={styles.filterChipIcon} />
                      )}
                      <Text style={[styles.filterChipText, isSelected && styles.filterChipTextSelected, { color: isSelected ? colors.primary : getDifficultyColor(difficulty) }]}>
                        {difficulty === 'Todos' ? 'Todos' : getDifficultyLabel(difficulty)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Classes List */}
          <View style={styles.turnosList}>
            {filteredClasses.map((c) => {
              const isBooked = bookedIds.includes(c.id);
              const isFull = c.bookedSpots >= c.totalSpots;
              const availability = (c.totalSpots - c.bookedSpots) / c.totalSpots;

              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.turnoCard, isBooked && styles.turnoCardBooked]}
                  onPress={() => {
                    if (!isBooked && !isFull) {
                      setSelectedTurno(c);
                      setBookingModalVisible(true);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={isBooked ? ['rgba(57, 255, 20, 0.1)', 'rgba(0, 0, 0, 0)'] : ['rgba(255, 255, 255, 0.03)', 'rgba(0, 0, 0, 0)']}
                    style={styles.turnoGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <View style={styles.turnoHeader}>
                      <View style={styles.turnoIcon}>
                        <Ionicons
                          name={getActivityIcon(c.name)}
                          size={28}
                          color={isBooked ? colors.secondary : colors.primary}
                        />
                      </View>
                      <View style={styles.turnoInfo}>
                        <Text style={styles.turnoActivity}>{c.name}</Text>
                        <Text style={styles.turnoInstructor}>{c.instructorName}</Text>
                        <View style={styles.turnoMeta}>
                          <View style={styles.turnoMetaItem}>
                            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                            <Text style={styles.turnoMetaText}>{getTimeFromDate(c.startTime)} hs</Text>
                          </View>
                          <View style={styles.turnoMetaItem}>
                            <Ionicons name="hourglass-outline" size={14} color={colors.textSecondary} />
                            <Text style={styles.turnoMetaText}>{c.durationMinutes} min</Text>
                          </View>
                          {c.location && (
                            <View style={styles.turnoMetaItem}>
                              <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                              <Text style={styles.turnoMetaText}>{c.location}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      {isBooked ? (
                        <View style={styles.bookedBadge}>
                          <Ionicons name="checkmark-circle" size={20} color={colors.secondary} />
                          <Text style={styles.bookedBadgeText}>Reservado</Text>
                        </View>
                      ) : isFull ? (
                        <View style={styles.fullBadge}>
                          <Text style={styles.fullBadgeText}>COMPLETO</Text>
                        </View>
                      ) : (
                        <View style={styles.spotsBadge}>
                          <Text style={styles.spotsBadgeText}>{c.totalSpots - c.bookedSpots} lugares</Text>
                        </View>
                      )}
                    </View>

                    {!isBooked && !isFull && (
                      <View style={styles.availabilityContainer}>
                        <View style={styles.availabilityBar}>
                          <View style={[styles.availabilityFill, {
                            width: `${availability * 100}%`,
                            backgroundColor: availability > 0.5 ? colors.secondary : availability > 0.3 ? colors.warning : colors.error,
                          }]} />
                        </View>
                        <Text style={styles.availabilityText}>{Math.round(availability * 100)}% disponible</Text>
                      </View>
                    )}

                    <View style={styles.difficultyContainer}>
                      <View style={[styles.difficultyBadge, { borderColor: getDifficultyColor(c.difficultyLevel) }]}>
                        <Text style={[styles.difficultyText, { color: getDifficultyColor(c.difficultyLevel) }]}>
                          {getDifficultyLabel(c.difficultyLevel)}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Booking Modal */}
      <Modal
        visible={bookingModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setBookingModalVisible(false);
          setSelectedTurno(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedTurno && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalIcon}>
                    <Ionicons name="calendar" size={40} color={colors.primary} />
                  </View>
                  <Text style={styles.modalTitle}>Confirmar Reserva</Text>
                </View>

                <View style={styles.modalBody}>
                  <Text style={styles.modalActivity}>{selectedTurno.name}</Text>
                  
                  <View style={styles.modalInfo}>
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="person" size={20} color={colors.textSecondary} />
                      <Text style={styles.modalInfoText}>{selectedTurno.instructorName}</Text>
                    </View>
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="calendar" size={20} color={colors.textSecondary} />
                      <Text style={styles.modalInfoText}>{formatDate(selectedTurno.startTime)}</Text>
                    </View>
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="time" size={20} color={colors.textSecondary} />
                      <Text style={styles.modalInfoText}>{getTimeFromDate(selectedTurno.startTime)} hs ({selectedTurno.durationMinutes} min)</Text>
                    </View>
                    {selectedTurno.location && (
                      <View style={styles.modalInfoRow}>
                        <Ionicons name="location" size={20} color={colors.textSecondary} />
                        <Text style={styles.modalInfoText}>{selectedTurno.location}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.modalPoints}>
                    <Ionicons name="trophy" size={20} color={colors.points} />
                    <Text style={styles.modalPointsText}>Ganarás 75 puntos por asistir</Text>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => { setBookingModalVisible(false); setSelectedTurno(null); }}
                  >
                    <Text style={styles.modalCancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalConfirmButton}
                    onPress={handleBookTurno}
                    disabled={isBooking}
                  >
                    {isBooking ? (
                      <ActivityIndicator color={colors.background} />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={20} color={colors.background} style={styles.confirmIcon} />
                        <Text style={styles.modalConfirmButtonText}>Confirmar Reserva</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  calendarStrip: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  dayCard: {
    width: 60,
    height: 80,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayName: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  dayNameSelected: {
    color: colors.background,
  },
  dayNumber: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  dayNumberSelected: {
    color: colors.background,
  },
  todayBadge: {
    position: 'absolute',
    bottom: 6,
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  todayBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.background,
  },
  filtersContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    minWidth: 100, // Ancho mínimo para consistencia
    alignItems: 'center', // Centrar texto
    flexDirection: 'row', // Para alinear icono y texto
  },
  filterChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  filterChipIcon: {
    marginRight: spacing.xs,
  },
  filterChipSelected: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderColor: colors.primary,
    borderWidth: 2, // Borde más grueso para destacar
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4, // Sombra para Android
  },
  filterChipText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  filterChipTextSelected: {
    color: colors.primary,
    fontWeight: '700', // Más grueso para destacar
  },
  turnosList: {
    paddingHorizontal: spacing.xl,
  },
  turnoCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  turnoCardBooked: {
    borderColor: colors.secondary,
  },
  turnoGradient: {
    padding: spacing.lg,
  },
  turnoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  turnoIcon: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  turnoInfo: {
    flex: 1,
  },
  turnoActivity: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  turnoInstructor: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  turnoMeta: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  turnoMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  turnoMetaText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  bookedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  bookedBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.secondary,
  },
  fullBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  fullBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  spotsBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  spotsBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  availabilityContainer: {
    marginTop: spacing.md,
  },
  availabilityBar: {
    height: 4,
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  availabilityFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  availabilityText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  difficultyContainer: {
    marginTop: spacing.md,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  difficultyText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
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
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalBody: {
    marginBottom: spacing.xl,
  },
  modalActivity: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  modalInfo: {
    marginBottom: spacing.lg,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  modalInfoText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    flex: 1,
  },
  modalPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  modalPointsText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.points,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalCancelButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    ...shadows.glow,
  },
  confirmIcon: {
    marginRight: spacing.sm,
  },
  modalConfirmButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.background,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
  toggleButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  toggleButtonTextActive: {
    color: colors.background,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.error,
    gap: spacing.xs,
  },
  cancelButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.error,
  },
});
