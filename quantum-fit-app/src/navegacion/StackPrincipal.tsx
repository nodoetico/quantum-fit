import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colores } from '../constantes/tema';
import type { ListaParametrosStackPrincipal } from '../tipos/navegacion';

import TabsPrincipales from './TabsPrincipales';

import PantallaNotificaciones from '../pantallas/notificaciones/PantallaNotificaciones';
import PantallaHistorialPremios from '../pantallas/beneficios/PantallaHistorialPremios';
import PantallaConfiguracion from '../pantallas/configuracion/PantallaConfiguracion';
import PantallaCheckIn from '../pantallas/checkin/PantallaCheckIn';
import PantallaDatosCrystal from '../pantallas/externo/PantallaDatosCrystal';
import PantallaVinculacionMyFit from '../pantallas/externo/PantallaVinculacionMyFit';
import PantallaMembresia from '../pantallas/membresia/PantallaMembresia';
import PantallaCheckout from '../pantallas/membresia/PantallaCheckout';
import PantallaMiSuscripcion from '../pantallas/membresia/PantallaMiSuscripcion';
import PantallaHistorialPagos from '../pantallas/membresia/PantallaHistorialPagos';

const Stack = createStackNavigator<ListaParametrosStackPrincipal>();

export default function StackPrincipal() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colores.fondo },
      }}
    >
      <Stack.Screen name="MainTabs" component={TabsPrincipales} />
      <Stack.Screen
        name="Notificaciones"
        component={PantallaNotificaciones}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HistorialPremios"
        component={PantallaHistorialPremios}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Configuracion"
        component={PantallaConfiguracion}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CheckIn"
        component={PantallaCheckIn}
        options={{
          headerShown: true,
          title: 'Check-in',
        }}
      />
      <Stack.Screen
        name="DatosCrystal"
        component={PantallaDatosCrystal}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="VinculacionMyFit"
        component={PantallaVinculacionMyFit}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Membresia"
        component={PantallaMembresia}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Checkout"
        component={PantallaCheckout}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MiSuscripcion"
        component={PantallaMiSuscripcion}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HistorialPagos"
        component={PantallaHistorialPagos}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
