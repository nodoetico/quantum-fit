import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, espaciado, radioBorde, tipografia } from '../constantes/tema';

interface PropsEstadoError {
  mensaje: string;
  alReintentar?: () => void;
  icono?: keyof typeof Ionicons.glyphMap;
  tamanoIcono?: number;
}

export default function EstadoError({
  mensaje,
  alReintentar,
  icono = 'alert-circle-outline',
  tamanoIcono = 48,
}: PropsEstadoError) {
  return (
    <View style={styles.contenedor}>
      <Ionicons name={icono} size={tamanoIcono} color={colores.error} />
      <Text style={styles.mensaje}>{mensaje}</Text>
      {alReintentar && (
        <TouchableOpacity style={styles.botonReintentar} onPress={alReintentar}>
          <Text style={styles.textoBotonReintentar}>Reintentar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: espaciado.lg,
    paddingHorizontal: espaciado.xl,
  },
  mensaje: {
    fontSize: tipografia.tamanos.md,
    color: colores.textoSecundario,
    textAlign: 'center',
  },
  botonReintentar: {
    backgroundColor: colores.primario,
    borderRadius: radioBorde.lg,
    paddingVertical: espaciado.md,
    paddingHorizontal: espaciado.xl,
  },
  textoBotonReintentar: {
    fontSize: tipografia.tamanos.md,
    fontWeight: '600',
    color: colores.fondo,
  },
});
