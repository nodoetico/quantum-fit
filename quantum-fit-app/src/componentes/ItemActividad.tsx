import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colores, espaciado, radioBorde, tipografia } from '../constantes/tema';

interface PropsItemActividad {
  titulo: string;
  descripcion: string;
  puntos: number;
  hora: string;
  icono?: string;
}

export default function ItemActividad({
  titulo,
  descripcion,
  puntos,
  hora,
  icono = 'fitness',
}: PropsItemActividad) {
  return (
    <View style={styles.contenedor}>
      <View style={styles.contenedorIcono}>
        <Text style={styles.icono}>{icono}</Text>
      </View>

      <View style={styles.contenido}>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.descripcion}>{descripcion}</Text>
        <Text style={styles.hora}>{hora}</Text>
      </View>

      <View style={styles.contenedorPuntos}>
        <Text style={styles.puntos}>+{puntos}</Text>
        <Text style={styles.etiquetaPuntos}>pts</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.lg,
    padding: espaciado.md,
    marginBottom: espaciado.md,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  contenedorIcono: {
    width: 44,
    height: 44,
    borderRadius: radioBorde.full,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: espaciado.md,
  },
  icono: {
    fontSize: 24,
  },
  contenido: {
    flex: 1,
  },
  titulo: {
    fontSize: tipografia.tamanos.md,
    fontWeight: '600',
    color: colores.textoPrincipal,
    marginBottom: espaciado.xs,
  },
  descripcion: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoSecundario,
    marginBottom: espaciado.xs,
  },
  hora: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoAtenuado,
  },
  contenedorPuntos: {
    alignItems: 'flex-end',
  },
  puntos: {
    fontSize: tipografia.tamanos.lg,
    fontWeight: '700',
    color: colores.puntos,
  },
  etiquetaPuntos: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoAtenuado,
  },
});
