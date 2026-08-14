import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colores } from '../constantes/tema';

export default function PantallaSplash() {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>QUANTUM</Text>
      <Text style={styles.subtitulo}>FIT</Text>
      <ActivityIndicator size="large" color={colores.primario} style={styles.cargador} />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 48,
    fontWeight: '900',
    color: colores.primario,
    letterSpacing: 8,
  },
  subtitulo: {
    fontSize: 48,
    fontWeight: '900',
    color: colores.secundario,
    letterSpacing: 12,
    marginTop: -8,
  },
  cargador: {
    marginTop: 48,
  },
});
