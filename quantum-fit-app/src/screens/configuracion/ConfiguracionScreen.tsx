import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { ScreenHeader } from '../../components';
import type { MainStackScreenProps } from '../../types/navigation';

type Props = MainStackScreenProps<'Configuracion'>;

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
}

function SettingItem({ icon, label, onPress, color }: SettingItemProps) {
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={[styles.settingIcon, { backgroundColor: (color || colors.primary) + '20' }]}>
        <Ionicons name={icon} size={20} color={color || colors.primary} />
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function ConfiguracionScreen({ navigation }: Props) {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Configuración"
        onBack={() => navigation.goBack()}
        style={{ paddingTop: spacing.xxl, paddingBottom: spacing.md, backgroundColor: colors.backgroundSecondary }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.profileName}>{user?.name}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CUENTA</Text>
          <SettingItem
            icon="person-outline"
            label="Editar Perfil"
            color={colors.primary}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Perfil' })}
          />
          <SettingItem
            icon="card-outline"
            label="Mi Suscripción"
            color={colors.secondary}
            onPress={() => navigation.navigate('MiSuscripcion')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREFERENCIAS</Text>
          <SettingItem
            icon="notifications-outline"
            label="Notificaciones"
            color={colors.warning}
            onPress={() => navigation.navigate('Notificaciones')}
          />
          <SettingItem
            icon="lock-closed-outline"
            label="Privacidad"
            color={colors.info}
            onPress={() => Alert.alert(
              'Privacidad',
              'QuantumFit respeta tu privacidad. No compartimos tus datos personales con terceros sin tu consentimiento.\n\nPodés gestionar tus datos desde tu perfil o contactarnos en nodoetico@gmail.com.',
              [{ text: 'Entendido' }]
            )}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SOPORTE</Text>
          <SettingItem
            icon="help-circle-outline"
            label="Ayuda"
            color={colors.points}
            onPress={() => Alert.alert(
              'Ayuda',
              'Si tenés alguna duda o problema con la app, escribinos a:\n\nnodoetico@gmail.com\n\nTe responderemos a la brevedad.',
              [{ text: 'Entendido' }]
            )}
          />
          <SettingItem
            icon="information-circle-outline"
            label="Acerca de"
            color={colors.textMuted}
            onPress={() => Alert.alert(
              'QuantumFit',
              'Versión 1.0.0\n\nSistema de gestión de gimnasio con gamificación.\n\nDesarrollado por Nodo Etico.\n© 2026',
              [{ text: 'Entendido' }]
            )}
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Versión 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxxl,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  profileName: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  profileEmail: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.error + '15',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  logoutText: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.error,
  },
  version: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
    marginTop: spacing.xl,
  },
});
