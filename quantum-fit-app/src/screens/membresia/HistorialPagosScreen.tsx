// Pantalla de Historial de Pagos - Muestra las transacciones desde Crystal MiFit
// y los pagos registrados localmente en QuantumFit.
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { paymentService } from '../../services/api';
import type { CrystalTransaction, LocalPayment } from '../../types';
import { ScreenHeader, LoadingState, EmptyState } from '../../components';
import type { MainStackScreenProps } from '../../types/navigation';

type HistorialPagosScreenProps = MainStackScreenProps<'HistorialPagos'>;

export default function HistorialPagosScreen({ navigation }: HistorialPagosScreenProps) {
  const [transactions, setTransactions] = useState<CrystalTransaction[]>([]);
  const [localPayments, setLocalPayments] = useState<LocalPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'crystal' | 'local'>('crystal');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [txs, pays] = await Promise.all([
        paymentService.getTransactions(50).catch(() => []),
        paymentService.getMyPaymentHistory().catch(() => []),
      ]);
      setTransactions(txs);
      setLocalPayments(pays);
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTransactionIcon = (category: string | null) => {
    switch (category) {
      case 'Membresías': return 'card';
      case 'Inscripción': return 'school';
      default: return 'receipt';
    }
  };

  const getTransactionColor = (isPaid: boolean, debt: number) => {
    if (isPaid) return colors.secondary;
    if (debt > 0) return colors.error;
    return colors.textSecondary;
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Historial" onBack={() => navigation.goBack()} />
        <LoadingState />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Historial" onBack={() => navigation.goBack()} />

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'crystal' && styles.tabActive]}
          onPress={() => setActiveTab('crystal')}
        >
          <Text style={[styles.tabText, activeTab === 'crystal' && styles.tabTextActive]}>
            Sistema
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'local' && styles.tabActive]}
          onPress={() => setActiveTab('local')}
        >
          <Text style={[styles.tabText, activeTab === 'local' && styles.tabTextActive]}>
            QuantumFit
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {activeTab === 'crystal' && (
          transactions.length > 0 ? (
            transactions.map((tx) => (
              <View key={tx.id} style={styles.txCard}>
                <View style={[styles.txIconContainer, {
                  backgroundColor: tx.is_paid
                    ? 'rgba(57, 255, 20, 0.1)'
                    : 'rgba(255, 71, 87, 0.1)',
                }]}>
                  <Ionicons
                    name={getTransactionIcon(tx.category) as any}
                    size={22}
                    color={getTransactionColor(tx.is_paid, tx.debt)}
                  />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txTitle}>{tx.title}</Text>
                  <Text style={styles.txDate}>{formatDate(tx.date)}</Text>
                  {tx.category && (
                    <Text style={styles.txCategory}>{tx.category}</Text>
                  )}
                </View>
                <View style={styles.txAmountContainer}>
                  <Text style={styles.txAmount}>
                    ${tx.total_amount.toLocaleString('es-AR')}
                  </Text>
                  <Text style={[styles.txStatus, {
                    color: tx.is_paid ? colors.secondary : colors.error,
                  }]}>
                    {tx.is_paid ? 'Pagado' : tx.debt > 0 ? `Debe $${tx.debt}` : 'Pendiente'}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <EmptyState icon="receipt-outline" iconSize={48} title="Sin transacciones en el sistema" />
          )
        )}

        {activeTab === 'local' && (
          localPayments.length > 0 ? (
            localPayments.map((p) => (
              <View key={p.id} style={styles.txCard}>
                <View style={[styles.txIconContainer, {
                  backgroundColor: p.status === 'APPROVED'
                    ? 'rgba(57, 255, 20, 0.1)'
                    : 'rgba(255, 215, 0, 0.1)',
                }]}>
                  <Ionicons
                    name="wallet-outline"
                    size={22}
                    color={p.status === 'APPROVED' ? colors.secondary : colors.warning}
                  />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txTitle}>{p.description || 'Pago QuantumFit'}</Text>
                  <Text style={styles.txDate}>
                    {formatDate(p.paidAt || p.createdAt)}
                  </Text>
                </View>
                <View style={styles.txAmountContainer}>
                  <Text style={styles.txAmount}>
                    ${p.amount.toLocaleString('es-AR')}
                  </Text>
                  <Text style={[styles.txStatus, {
                    color: p.status === 'APPROVED' ? colors.secondary : colors.warning,
                  }]}>
                    {p.status === 'APPROVED' ? 'Aprobado' : p.status}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <EmptyState icon="wallet-outline" iconSize={48} title="Sin pagos registrados en QuantumFit" />
          )
        )}

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
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  tabActive: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
  },
  tabText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.primary,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  txIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  txDate: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginBottom: 2,
  },
  txCategory: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    fontWeight: '500',
  },
  txAmountContainer: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  txStatus: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
});
