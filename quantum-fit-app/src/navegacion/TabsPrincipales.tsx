import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colores, espaciado, radioBorde } from '../constantes/tema';
import type { ListaParametrosTabsPrincipales } from '../tipos/navegacion';

import PantallaInicio from '../pantallas/dashboard/PantallaInicio';
import PantallaTurnos from '../pantallas/turnos/PantallaTurnos';
import PantallaBeneficios from '../pantallas/beneficios/PantallaBeneficios';
import PantallaPerfil from '../pantallas/perfil/PantallaPerfil';
import PantallaRanking from '../pantallas/dashboard/PantallaRanking';

const Tab = createBottomTabNavigator<ListaParametrosTabsPrincipales>();

export default function TabsPrincipales() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.barraTabs,
        tabBarActiveTintColor: colores.primario,
        tabBarInactiveTintColor: colores.textoAtenuado,
        tabBarLabelStyle: styles.etiquetaTabs,
        tabBarIcon: ({ focused, color, size }) => {
          let nombreIcono: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            nombreIcono = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Turnos') {
            nombreIcono = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Beneficios') {
            nombreIcono = focused ? 'gift' : 'gift-outline';
          } else if (route.name === 'Ranking') {
            nombreIcono = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Perfil') {
            nombreIcono = focused ? 'person' : 'person-outline';
          } else {
            nombreIcono = 'fitness';
          }

          return (
            <View style={[styles.contenedorIcono, focused && styles.contenedorIconoActivo]}>
              <Ionicons name={nombreIcono} size={size} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={PantallaInicio}
        options={{ tabBarLabel: 'Inicio' }}
      />
      <Tab.Screen
        name="Turnos"
        component={PantallaTurnos}
        options={{ tabBarLabel: 'Turnos' }}
      />
      <Tab.Screen
        name="Beneficios"
        component={PantallaBeneficios}
        options={{ tabBarLabel: 'Premios' }}
      />
      <Tab.Screen
        name="Ranking"
        component={PantallaRanking}
        options={{ tabBarLabel: 'Ranking' }}
      />
      <Tab.Screen
        name="Perfil"
        component={PantallaPerfil}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  barraTabs: {
    backgroundColor: colores.fondoTarjeta,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
    height: 85,
    paddingTop: espaciado.sm,
    paddingBottom: espaciado.lg,
  },
  etiquetaTabs: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: espaciado.xs,
  },
  contenedorIcono: {
    width: 36,
    height: 36,
    borderRadius: radioBorde.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contenedorIconoActivo: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
  },
});
