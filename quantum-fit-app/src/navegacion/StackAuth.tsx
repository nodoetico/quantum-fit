import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colores } from '../constantes/tema';
import type { ListaParametrosStackAuth } from '../tipos/navegacion';

import PantallaLogin from '../pantallas/auth/PantallaLogin';
import PantallaRegistro from '../pantallas/auth/PantallaRegistro';
import PantallaOlvideContrasena from '../pantallas/auth/PantallaOlvideContrasena';

const Stack = createStackNavigator<ListaParametrosStackAuth>();

export default function StackAuth() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colores.fondo },
      }}
    >
      <Stack.Screen name="Login" component={PantallaLogin} />
      <Stack.Screen name="Register" component={PantallaRegistro} />
      <Stack.Screen name="ForgotPassword" component={PantallaOlvideContrasena} />
    </Stack.Navigator>
  );
}
