import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { externalPullService } from '../../services/api';
import type { MainStackScreenProps } from '../../types/navigation';

type Props = MainStackScreenProps<'DatosCrystal'>;

interface Transaction {
  id: number;
  title: string;
  date: string;
  total_amount: number;
  is_paid: boolean;
  debt: number;
  category: string | null;
}

export default function DatosCrystalScreen({ navigation }: Props) {
  const { user, externalProfile, externalAttendances, externalMemberships, isExternalLoading, loadExternalData } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoadingTx(true);
    try {
      const dni = user?.dni || undefined;
      const data = await externalPullService.getTransactions(dni);
      setTransactions(data?.data || []);
    } catch (e) {
    } finally {
      setLoadingTx(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadExternalData(), loadTransactions()]);
    setRefreshing(false);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (isExternalLoading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Ionicons name="server-outline" size={20} color={colors.primary} />
            <Text style={styles.headerTitle}>Datos Crystal</Text>
          </View>
          <View style={styles.backButton} />
        </View>
        <View style={styles.syncContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.syncText}>Sincronizando con Crystal...</Text>
        </View>
      </View>
    );
  }

  if (!externalProfile && externalAttendances.length === 0 && transactions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Ionicons name="server-outline" size={20} color={colors.primary} />
            <Text style={styles.headerTitle}>Datos Crystal</Text>
          </View>
          <View style={styles.backButton} />
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="cloud-offline-outline" size={48} color={colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>Sin datos de Crystal</Text>
          <Text style={styles.emptySubtitle}>Deslizá para reintentar</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="server-outline" size={20} color={colors.primary} />
          <Text style={styles.headerTitle}>Datos Crystal</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {externalProfile && (
          <View style={styles.profileCard}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {externalProfile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
              </Text>
            </View>
            <Text style={styles.profileName}>{externalProfile.name}</Text>
            {externalProfile.email && (
              <Text style={styles.profileEmail}>{externalProfile.email}</Text>
            )}
            <View style={styles.profileMeta}>
              {externalProfile.dni && (
                <View style={styles.metaItem}>
                  <Ionicons name="card-outline" size={14} color={colors.textMuted} />
                  <Text style={styles.metaText}>DNI {externalProfile.dni}</Text>
                </View>
              )}
              {externalProfile.phone && (
                <View style={styles.metaItem}>
                  <Ionicons name="call-outline" size={14} color={colors.textMuted} />
                  <Text style={styles.metaText}>{externalProfile.phone}</Text>
                </View>
              )}
            </View>
            {externalProfile.balance !== undefined && (
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>Saldo</Text>
                <Text style={styles.balanceValue}>${externalProfile.balance.toLocaleString()}</Text>
              </View>
            )}
          </View>
        )}

        {externalMemberships.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="card-outline" size={18} color={colors.secondary} />
              <Text style={styles.sectionTitle}>Membresías</Text>
            </View>
            {externalMemberships.map((m: any, i: number) => (
              <View key={i} style={styles.membershipCard}>
                <View style={styles.membershipHeader}>
                  <View style={[styles.membershipDot, {
                    backgroundColor: m.status === 'active' || m.status === 'activa' ? colors.secondary : colors.warning
                  }]} />
                  <Text style={styles.membershipType}>{m.name || m.type || m.plan?.name || 'Membresía'}</Text>
                  <View style={[styles.membershipStatus, {
                    backgroundColor: m.status === 'active' || m.status === 'activa'
                      ? 'rgba(57, 255, 20, 0.15)' : 'rgba(255, 215, 0, 0.15)'
                  }]}>
                    <Text style={[styles.membershipStatusText, {
                      color: m.status === 'active' || m.status === 'activa' ? colors.secondary : colors.warning
                    }]}>
                      {m.status || 'Activa'}
                    </Text>
                  </View>
                </View>
                {(m.start_date || m.end_date) && (
                  <View style={styles.membershipDates}>
                    {m.start_date && (
                      <View style={styles.dateItem}>
                        <Ionicons name="calendar-outline" size={13} color={colors.textMuted} />
                        <Text style={styles.dateText}>Inicio: {formatDate(m.start_date)}</Text>
                      </View>
                    )}
                    {m.end_date && (
                      <View style={styles.dateItem}>
                        <Ionicons name="calendar-outline" size={13} color={colors.textMuted} />
                        <Text style={styles.dateText}>Fin: {formatDate(m.end_date)}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {externalAttendances.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar-outline" size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>Asistencias ({externalAttendances.length})</Text>
            </View>
            <View style={styles.attendanceList}>
              {externalAttendances.slice(0, 15).map((a: any, i: number) => (
                <View key={i} style={styles.attendanceItem}>
                  <View style={styles.attendanceDot} />
                  <View style={styles.attendanceInfo}>
                    <Text style={styles.attendanceDate}>{formatDate(a.date || a.checkInTime || a.createdAt)}</Text>
                    {a.location && <Text style={styles.attendanceLocation}>{a.location}</Text>}
                  </View>
                  <Text style={styles.attendanceTime}>
                    {new Date(a.date || a.checkInTime || a.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {loadingTx ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Cargando transacciones...</Text>
          </View>
        ) : transactions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="receipt-outline" size={18} color={colors.points} />
              <Text style={styles.sectionTitle}>Transacciones ({transactions.length})</Text>
            </View>
            {transactions.slice(0, 10).map((tx: Transaction) => (
              <View key={tx.id} style={styles.txCard}>
                <View style={styles.txLeft}>
                  <Text style={styles.txTitle}>{tx.title}</Text>
                  <Text style={styles.txDate}>{formatDate(tx.date)}</Text>
                </View>
                <View style={styles.txRight}>
                  <Text style={styles.txAmount}>${tx.total_amount.toLocaleString()}</Text>
                  <Text style={[styles.txStatus, { color: tx.is_paid ? colors.secondary : colors.error }]}>
                    {tx.is_paid ? 'Pagado' : tx.debt > 0 ? `Debe $${tx.debt}` : 'Pendiente'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
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
  syncContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  syncText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
    backgroundColor: colors.backgroundSecondary,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingTop: spacing.lg,
  },
  profileCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  profileAvatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  profileName: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  profileEmail: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  profileMeta: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  balanceLabel: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  balanceValue: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.points,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  membershipCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  membershipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  membershipDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  membershipType: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  membershipStatus: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  membershipStatusText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
  membershipDates: {
    gap: spacing.xs,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dateText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  attendanceList: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  attendanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  attendanceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  attendanceInfo: {
    flex: 1,
  },
  attendanceDate: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  attendanceLocation: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  attendanceTime: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  loadingText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  txCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  txLeft: {
    flex: 1,
    marginRight: spacing.md,
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
  },
  txRight: {
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
