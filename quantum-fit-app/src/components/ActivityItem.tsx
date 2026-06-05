import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../constants/theme';

interface ActivityItemProps {
  title: string;
  description: string;
  points: number;
  time: string;
  icon?: string;
}

export default function ActivityItem({
  title,
  description,
  points,
  time,
  icon = 'fitness',
}: ActivityItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <Text style={styles.time}>{time}</Text>
      </View>
      
      <View style={styles.pointsContainer}>
        <Text style={styles.points}>+{points}</Text>
        <Text style={styles.pointsLabel}>pts</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  time: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  points: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.points,
  },
  pointsLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
});
