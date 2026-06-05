import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../constants/theme';
import type { MainTabParamList } from '../types/navigation';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import TurnosScreen from '../screens/turnos/TurnosScreen';
import BeneficiosScreen from '../screens/beneficios/BeneficiosScreen';
import PerfilScreen from '../screens/perfil/PerfilScreen';
import RankingScreen from '../screens/dashboard/RankingScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Turnos') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Beneficios') {
            iconName = focused ? 'gift' : 'gift-outline';
          } else if (route.name === 'Ranking') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'fitness';
          }

          return (
            <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
              <Ionicons name={iconName} size={size} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Inicio' }}
      />
      <Tab.Screen
        name="Turnos"
        component={TurnosScreen}
        options={{ tabBarLabel: 'Turnos' }}
      />
      <Tab.Screen
        name="Beneficios"
        component={BeneficiosScreen}
        options={{ tabBarLabel: 'Premios' }}
      />
      <Tab.Screen
        name="Ranking"
        component={RankingScreen}
        options={{ tabBarLabel: 'Ranking' }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 85,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerFocused: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
  },
});
