import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, espaciado, radioBorde, tipografia } from '../constantes/tema';

interface PropsEncabezadoPantalla {
  titulo: string;
  alVolver?: () => void;
  accionDerecha?: React.ReactNode;
  style?: ViewStyle;
}

export default function EncabezadoPantalla({ titulo, alVolver, accionDerecha, style }: PropsEncabezadoPantalla) {
  return (
    <View style={[styles.encabezado, style]}>
      {alVolver ? (
        <TouchableOpacity style={styles.botonVolver} onPress={alVolver}>
          <Ionicons name="arrow-back" size={24} color={colores.textoPrincipal} />
        </TouchableOpacity>
      ) : (
        <View style={styles.espaciador} />
      )}
      <Text style={styles.tituloEncabezado}>{titulo}</Text>
      {accionDerecha || <View style={styles.espaciador} />}
    </View>
  );
}

const styles = StyleSheet.create({
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: espaciado.xl,
    paddingBottom: espaciado.lg,
    paddingHorizontal: espaciado.xl,
  },
  botonVolver: {
    width: 40,
    height: 40,
    borderRadius: radioBorde.full,
    backgroundColor: colores.fondoTarjeta,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tituloEncabezado: {
    flex: 1,
    fontSize: tipografia.tamanos.xl,
    fontWeight: '700',
    color: colores.textoPrincipal,
    textAlign: 'center',
  },
  espaciador: {
    width: 40,
  },
});
