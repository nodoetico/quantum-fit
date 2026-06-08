import React, { useState, useEffect } from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

import SplashScreen from './SplashScreen';
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import type { MainStackParamList } from '../types/navigation';

const linking: LinkingOptions<MainStackParamList> = {
  prefixes: ['quantumfit://', 'https://quantumfit.app'],
  config: {
    screens: {
      MainTabs: {
        screens: {
          Dashboard: 'dashboard',
          Turnos: 'turnos',
          Beneficios: 'beneficios',
          Ranking: 'ranking',
          Perfil: 'perfil',
        },
      },
      Notificaciones: 'notificaciones',
      HistorialPremios: 'historial-premios',
      Configuracion: 'configuracion',
      CheckIn: 'checkin',
      DatosCrystal: 'datos-crystal',
      Membresia: 'membresia',
      Checkout: 'checkout',
      MiSuscripcion: 'mi-suscripcion',
      HistorialPagos: 'historial-pagos',
    },
  },
};

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const [splashTimedOut, setSplashTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSplashTimedOut(true), 10000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading && !splashTimedOut) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer linking={linking}>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
