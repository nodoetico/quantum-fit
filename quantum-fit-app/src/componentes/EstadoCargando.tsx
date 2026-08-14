import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colores, espaciado, tipografia } from '../constantes/tema';

interface PropsEstadoCargando {
  mensaje?: string;
  tamano?: 'small' | 'large';
}

export default function EstadoCargando({ mensaje, tamano = 'large' }: PropsEstadoCargando) {
  return (
    <View style={styles.contenedor}>
      <ActivityIndicator size={tamano} color={colores.primario} />
      {mensaje && <Text style={styles.mensaje}>{mensaje}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: espaciado.xxl * 2,
    gap: espaciado.lg,
  },
  mensaje: {
    fontSize: tipografia.tamanos.md,
    color: colores.textoSecundario,
  },
});
