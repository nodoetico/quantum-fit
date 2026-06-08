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
import { useAuth } from '../../context/AuthContext';
import { rewardsService } from '../../services/api';
import { Reward } from '../../types';
import { ScreenHeader, LoadingState, ErrorState, EmptyState } from '../../components';
import type { MainTabScreenProps } from '../../types/navigation';

type BeneficiosScreenProps = MainTabScreenProps<'Beneficios'>;

export default function BeneficiosScreen({ navigation }: BeneficiosScreenProps) {
  const { user, refreshUser } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [redeemModalVisible, setRedeemModalVisible] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = ['Todos', 'PRODUCTO', 'BEBIDA', 'DESCUENTO', 'PROMOCION'];

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'PRODUCTO': return 'Productos';
      case 'BEBIDA': return 'Bebidas';
      case 'DESCUENTO': return 'Descuentos';
      case 'PROMOCION': return 'Promociones';
      default: return category;
    }
  };

  // Cargar rewards
  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await rewardsService.getAll();
      setRewards(data);
    } catch (err) {
      console.error('loadRewards failed:', err);
      setError('No se pudieron cargar los rewards. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRewards();
    setRefreshing(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'PRODUCTO':
        return 'shirt';
      case 'BEBIDA':
        return 'cafe';
      case 'DESCUENTO':
        return 'pricetag';
      case 'PROMOCION':
        return 'gift';
      default:
        return 'grid';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'PRODUCTO':
        return colors.primary;
      case 'BEBIDA':
        return colors.secondary;
      case 'DESCUENTO':
        return colors.points;
      case 'PROMOCION':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const filteredRewards = rewards.filter(reward => {
    if (selectedCategory === 'Todos') return true;
    return reward.category === selectedCategory;
  });

  const handleRedeem = async () => {
    if (!selectedReward || !user) return;

    if (user.points < selectedReward.pointsCost) {
      return;
    }

    setIsRedeeming(true);
    try {
      await rewardsService.redeem(selectedReward.id);
      await refreshUser();
      setRedeemModalVisible(false);
      setSuccessModalVisible(true);
      await loadRewards();
    } catch (err) {
      console.error('handleRedeem failed:', err);
      Alert.alert('Error', 'Error al canjear el reward. Intenta nuevamente.');
    } finally {
      setIsRedeeming(false);
    }
    setSelectedReward(null);
  };

  const canAfford = user && selectedReward && user.points >= selectedReward.pointsCost;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Beneficios" onBack={() => navigation.goBack()} rightAction={
        <TouchableOpacity style={styles.historyButton} onPress={() => navigation.navigate('HistorialPremios')}>
          <Ionicons name="time-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      } />

      {/* Points Summary */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.pointsCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.pointsContent}>
          <View>
            <Text style={[styles.pointsLabel, { color: '#000000' }]}>Tus Puntos</Text>
            <Text style={styles.pointsValue}>{user?.points.toLocaleString() || 0}</Text>
          </View>
          <View style={styles.pointsIcon}>
            <Ionicons name="trophy" size={40} color={colors.background} />
          </View>
        </View>
        <Text style={styles.pointsSubtitle}>
          Canjea tus puntos por productos, bebidas y descuentos exclusivos
        </Text>
      </LinearGradient>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipSelected,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Ionicons
              name={
                category === 'Todos'
                  ? 'grid'
                  : category === 'PRODUCTO'
                  ? 'shirt'
                  : category === 'BEBIDA'
                  ? 'cafe'
                  : category === 'DESCUENTO'
                  ? 'pricetag'
                  : 'gift'
              }
              size={18}
              color={selectedCategory === category ? colors.background : colors.textSecondary}
              style={styles.categoryIcon}
            />
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextSelected,
              ]}
            >
              {getCategoryLabel(category)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Rewards Grid */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.rewardsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {loading && (
          <LoadingState message="Cargando rewards..." />
        )}
        {error && (
          <ErrorState message={error} onRetry={loadRewards} />
        )}
        {!loading && !error && filteredRewards.length === 0 && (
          <EmptyState icon="gift-outline" iconSize={48} title="No hay rewards disponibles" />
        )}
        {!loading && !error && filteredRewards.length > 0 && filteredRewards.map((reward) => {
          const canAffordReward = user && user.points >= reward.pointsCost;
          const isAvailable = reward.isActive && reward.stockAvailable > 0;

          return (
            <TouchableOpacity
              key={reward.id}
              style={[
                styles.rewardCard,
                !isAvailable && styles.rewardCardRedeemed,
                !canAffordReward && styles.rewardCardDisabled,
              ]}
              onPress={() => {
                if (isAvailable) {
                  setSelectedReward(reward);
                  setRedeemModalVisible(true);
                }
              }}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={
                  !isAvailable
                    ? ['rgba(57, 255, 20, 0.05)', 'rgba(0, 0, 0, 0)']
                    : canAffordReward
                    ? ['rgba(255, 255, 255, 0.03)', 'rgba(0, 0, 0, 0)']
                    : ['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0)']
                }
                style={styles.rewardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.rewardHeader}>
                  <View
                    style={[
                      styles.rewardIconContainer,
                      { backgroundColor: `${getCategoryColor(reward.category)}20` },
                    ]}
                  >
                    <Ionicons
                      name={getCategoryIcon(reward.category)}
                      size={28}
                      color={getCategoryColor(reward.category)}
                    />
                  </View>
                  {!isAvailable && (
                    <View style={styles.redeemedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.secondary} />
                      <Text style={styles.redeemedBadgeText}>Agotado</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.rewardName}>{reward.name}</Text>
                <Text style={styles.rewardDescription} numberOfLines={2}>{reward.description}</Text>

                <View style={styles.rewardFooter}>
                  <View style={styles.pointsCostContainer}>
                    <Ionicons name="trophy" size={16} color={colors.points} />
                    <Text style={styles.pointsCostText}>{reward.pointsCost.toLocaleString()}</Text>
                  </View>
                  <View style={styles.stockContainer}>
                    <Ionicons name="cube-outline" size={14} color={colors.textMuted} />
                    <Text style={styles.stockText}>{reward.stockAvailable} disponibles</Text>
                  </View>
                </View>

                {/* Overlay de "No alcanza" */}
                {!canAffordReward && isAvailable && (
                  <View style={styles.cantAffordOverlay}>
                    <Ionicons name="lock-closed" size={18} color={colors.textMuted} />
                    <Text style={styles.cantAffordText}>
                      {`Te faltan ${(reward.pointsCost - (user?.points || 0)).toLocaleString()} puntos`}
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Redeem Modal */}
      <Modal
        visible={redeemModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setRedeemModalVisible(false);
          setSelectedReward(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedReward && (
              <>
                <View style={styles.modalHeader}>
                  <View
                    style={[
                      styles.modalIconContainer,
                      { backgroundColor: `${getCategoryColor(selectedReward.category)}20` },
                    ]}
                  >
                    <Ionicons
                      name={getCategoryIcon(selectedReward.category)}
                      size={40}
                      color={getCategoryColor(selectedReward.category)}
                    />
                  </View>
                  <Text style={styles.modalTitle}>Canjear Premio</Text>
                </View>

                <View style={styles.modalBody}>
                  <Text style={styles.modalRewardName}>{selectedReward.name}</Text>
                  <Text style={styles.modalRewardDescription}>{selectedReward.description}</Text>

                  <View style={styles.modalPointsInfo}>
                    <View style={styles.modalPointsRow}>
                      <Text style={styles.modalPointsLabel}>Costo</Text>
                      <View style={styles.modalPointsCost}>
                        <Ionicons name="trophy" size={18} color={colors.points} />
                        <Text style={styles.modalPointsCostText}>
                          {selectedReward.pointsCost.toLocaleString()}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.modalPointsRow}>
                      <Text style={styles.modalPointsLabel}>Tu saldo</Text>
                      <View style={styles.modalPointsBalance}>
                        <Ionicons name="trophy" size={18} color={colors.primary} />
                        <Text style={styles.modalPointsBalanceText}>
                          {user?.points.toLocaleString() || 0}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {!canAfford && (
                    <View style={styles.insufficientPointsWarning}>
                      <Ionicons name="warning" size={20} color={colors.warning} />
                      <Text style={styles.insufficientPointsText}>
                        No tienes suficientes puntos
                      </Text>
                    </View>
                  )}

                  <View style={styles.modalTerms}>
                    <Ionicons name="information-circle" size={16} color={colors.textMuted} />
                    <Text style={styles.modalTermsText}>
                      El premio estará disponible para retirar en recepción dentro de 24hs
                    </Text>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => {
                      setRedeemModalVisible(false);
                      setSelectedReward(null);
                    }}
                  >
                    <Text style={styles.modalCancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalConfirmButton,
                      !canAfford && styles.modalConfirmButtonDisabled,
                    ]}
                    onPress={handleRedeem}
                    disabled={isRedeeming || !canAfford}
                  >
                    {isRedeeming ? (
                      <ActivityIndicator color={colors.background} />
                    ) : (
                      <>
                        <Ionicons
                          name="gift"
                          size={20}
                          color={canAfford ? colors.background : colors.textMuted}
                          style={styles.giftIcon}
                        />
                        <Text
                          style={[
                            styles.modalConfirmButtonText,
                            !canAfford && styles.modalConfirmButtonTextDisabled,
                          ]}
                        >
                          Canjear Ahora
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={successModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.successOverlay}>
          <View style={styles.successContent}>
            <View style={styles.successIcon}>
              <LinearGradient
                colors={[colors.secondary, colors.secondaryDark]}
                style={styles.successIconGradient}
              >
                <Ionicons name="checkmark" size={48} color={colors.background} />
              </LinearGradient>
            </View>
            <Text style={styles.successTitle}>¡Canje Exitoso!</Text>
            <Text style={styles.successText}>
              Tu premio ha sido reservado. Pasa por recepción para retirarlo.
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => setSuccessModalVisible(false)}
            >
              <Text style={styles.successButtonText}>¡Genial!</Text>
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
  historyButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointsCard: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.large,
  },
  pointsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pointsLabel: {
    fontSize: typography.sizes.sm,
    color: '#000000', // Texto negro para mejor contraste
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  pointsValue: {
    fontSize: typography.sizes.xxxl,
    fontWeight: '800',
    color: colors.background,
  },
  pointsIcon: {
    opacity: 0.3,
  },
  pointsSubtitle: {
    fontSize: typography.sizes.sm,
    color: '#000000', // Texto negro para mejor contraste con el fondo cyan
    lineHeight: 18,
    fontWeight: '500',
  },
  categoriesContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    minHeight: 55, // Altura mínima para que no se corte
  },
  categoriesContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 44, // Altura mínima consistente
    maxHeight: 44, // Altura máxima para que no crezca
    height: 44, // Altura fija
  },
  categoryChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    // Sin cambios de padding o altura para evitar que se agrande
  },
  categoryIcon: {
    marginRight: spacing.xs,
  },
  categoryText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: '500',
    // Sin maxWidth para que el texto no se corte
  },
  categoryTextSelected: {
    color: colors.background,
    fontWeight: '600',
  },
  rewardsList: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: 100,
  },
  rewardCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    minHeight: 220, // Altura mínima para que haya espacio para todo
    width: '100%', // Ancho completo del contenedor
    position: 'relative', // Para que el overlay se posicione relativo a la tarjeta
  },
  rewardCardRedeemed: {
    borderColor: colors.secondary,
  },
  rewardCardDisabled: {
    opacity: 0.6,
  },
  rewardGradient: {
    padding: spacing.lg,
    minHeight: 220, // Altura mínima para consistencia
    position: 'relative', // Contenido en flujo normal
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  rewardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  redeemedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  redeemedBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.secondary,
  },
  rewardName: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  rewardDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
    minHeight: 36, // Espacio consistente para descripción
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsCostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pointsCostText: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.points,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stockText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  cantAffordOverlay: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  cantAffordText: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    flex: 1,
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
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
  modalRewardName: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  modalRewardDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalPointsInfo: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  modalPointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalPointsLabel: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  modalPointsCost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  modalPointsCostText: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.points,
  },
  modalPointsBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  modalPointsBalanceText: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.primary,
  },
  insufficientPointsWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  insufficientPointsText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.warning,
  },
  modalTerms: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  modalTermsText: {
    flex: 1,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    lineHeight: 16,
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
  modalConfirmButtonDisabled: {
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  giftIcon: {
    marginRight: spacing.sm,
  },
  modalConfirmButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.background,
  },
  modalConfirmButtonTextDisabled: {
    color: colors.textMuted,
  },
  successOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  successContent: {
    width: '100%',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  successIcon: {
    marginBottom: spacing.xl,
  },
  successIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
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
    ...shadows.glow,
  },
  successButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.background,
  },
});
