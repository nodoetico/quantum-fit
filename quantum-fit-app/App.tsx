import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProveedorAuth } from './src/contexto/ContextoAuth';
import NavegadorApp from './src/navegacion/NavegadorApp';
import { colores } from './src/constantes/tema';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ProveedorAuth>
          <NavegadorApp />
          <StatusBar style="light" />
        </ProveedorAuth>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
});
