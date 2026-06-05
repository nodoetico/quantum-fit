import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../constants/theme';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
}

export default function ErrorState({
  message,
  onRetry,
  icon = 'alert-circle-outline',
  iconSize = 48,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={iconSize} color={colors.error} />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  message: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  retryButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.background,
  },
});
