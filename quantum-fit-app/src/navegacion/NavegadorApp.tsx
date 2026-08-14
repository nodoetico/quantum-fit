import React, { useState, useEffect } from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { useAuth } from '../contexto/ContextoAuth';

import PantallaSplash from './PantallaSplash';
import StackAuth from './StackAuth';
import StackPrincipal from './StackPrincipal';
import type { ListaParametrosStackPrincipal } from '../tipos/navegacion';

// IMPORTANTE: las rutas de los deep links no cambian para no romper los enlaces existentes
const enlaces: LinkingOptions<ListaParametrosStackPrincipal> = {
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

export default function NavegadorApp() {
  const { autenticado, cargando } = useAuth();
  const [splashAgotado, setSplashAgotado] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSplashAgotado(true), 10000);
    return () => clearTimeout(timer);
  }, []);

  if (cargando && !splashAgotado) {
    return <PantallaSplash />;
  }

  return (
    <NavigationContainer linking={enlaces}>
      {autenticado ? <StackPrincipal /> : <StackAuth />}
    </NavigationContainer>
  );
}
