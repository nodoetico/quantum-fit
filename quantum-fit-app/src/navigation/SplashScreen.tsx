import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../constants/theme';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>QUANTUM</Text>
      <Text style={styles.subtitle}>FIT</Text>
      <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 8,
  },
  subtitle: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.secondary,
    letterSpacing: 12,
    marginTop: -8,
  },
  loader: {
    marginTop: 48,
  },
});
