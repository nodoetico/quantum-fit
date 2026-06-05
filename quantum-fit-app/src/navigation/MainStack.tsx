import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../constants/theme';
import type { MainStackParamList } from '../types/navigation';

import MainTabs from './MainTabs';

import NotificacionesScreen from '../screens/notificaciones/NotificacionesScreen';
import HistorialPremiosScreen from '../screens/beneficios/HistorialPremiosScreen';
import ConfiguracionScreen from '../screens/configuracion/ConfiguracionScreen';
import CheckInScreen from '../screens/checkin/CheckInScreen';
import DatosCrystalScreen from '../screens/externo/DatosCrystalScreen';
import MembresiaScreen from '../screens/membresia/MembresiaScreen';
import CheckoutScreen from '../screens/membresia/CheckoutScreen';
import MiSuscripcionScreen from '../screens/membresia/MiSuscripcionScreen';
import HistorialPagosScreen from '../screens/membresia/HistorialPagosScreen';

const Stack = createStackNavigator<MainStackParamList>();

export default function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="Notificaciones"
        component={NotificacionesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HistorialPremios"
        component={HistorialPremiosScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Configuracion"
        component={ConfiguracionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CheckIn" 
        component={CheckInScreen}
        options={{
          headerShown: true,
          title: 'Check-in',
        }}
      />
      <Stack.Screen
        name="DatosCrystal"
        component={DatosCrystalScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Membresia"
        component={MembresiaScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MiSuscripcion"
        component={MiSuscripcionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HistorialPagos"
        component={HistorialPagosScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
