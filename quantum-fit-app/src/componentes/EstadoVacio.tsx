import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, espaciado, radioBorde, tipografia } from '../constantes/tema';

interface PropsEstadoVacio {
  icono?: keyof typeof Ionicons.glyphMap;
  tamanoIcono?: number;
  titulo: string;
  subtitulo?: string;
  etiquetaAccion?: string;
  alAccion?: () => void;
}

export default function EstadoVacio({
  icono,
  tamanoIcono = 48,
  titulo,
  subtitulo,
  etiquetaAccion,
  alAccion,
}: PropsEstadoVacio) {
  return (
    <View style={styles.contenedor}>
      {icono && <Ionicons name={icono} size={tamanoIcono} color={colores.textoAtenuado} />}
      <Text style={styles.titulo}>{titulo}</Text>
      {subtitulo && <Text style={styles.subtitulo}>{subtitulo}</Text>}
      {etiquetaAccion && alAccion && (
        <TouchableOpacity style={styles.botonAccion} onPress={alAccion}>
          <Text style={styles.textoBotonAccion}>{etiquetaAccion}</Text>
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
    paddingVertical: espaciado.xxl * 2,
  },
  titulo: {
    fontSize: tipografia.tamanos.md,
    color: colores.textoAtenuado,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoAtenuado,
    textAlign: 'center',
  },
  botonAccion: {
    backgroundColor: colores.primario,
    borderRadius: radioBorde.lg,
    paddingVertical: espaciado.md,
    paddingHorizontal: espaciado.xl,
  },
  textoBotonAccion: {
    fontSize: tipografia.tamanos.md,
    fontWeight: '600',
    color: colores.fondo,
  },
});
