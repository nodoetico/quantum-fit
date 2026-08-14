import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, espaciado, radioBorde, tipografia } from '../constantes/tema';

interface PropsTarjetaEstadistica {
  titulo: string;
  valor: string | number;
  icono: keyof typeof Ionicons.glyphMap;
  color?: string;
  tendencia?: 'subida' | 'bajada' | 'neutral';
  valorTendencia?: string;
  subtitulo?: string;
}

export default function TarjetaEstadistica({
  titulo,
  valor,
  icono,
  color = colores.primario,
  tendencia,
  valorTendencia,
  subtitulo,
}: PropsTarjetaEstadistica) {
  const colorTendencia = tendencia === 'subida' ? colores.secundario : tendencia === 'bajada' ? colores.error : colores.textoAtenuado;
  const iconoTendencia = tendencia === 'subida' ? 'trending-up' : tendencia === 'bajada' ? 'trending-down' : 'remove';

  return (
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <View style={[styles.contenedorIcono, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icono} size={24} color={color} />
        </View>
        {tendencia && (
          <View style={[styles.insigniaTendencia, { backgroundColor: `${colorTendencia}20` }]}>
            <Ionicons name={iconoTendencia} size={14} color={colorTendencia} />
            {valorTendencia && <Text style={[styles.textoTendencia, { color: colorTendencia }]}>{valorTendencia}</Text>}
          </View>
        )}
      </View>

      <View style={styles.contenido}>
        <Text style={styles.valor}>{valor}</Text>
        <Text style={styles.titulo}>{titulo}</Text>
        {subtitulo && <Text style={styles.subtitulo}>{subtitulo}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.xl,
    padding: espaciado.lg,
    borderWidth: 1,
    borderColor: colores.borde,
    minWidth: 140,
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: espaciado.md,
  },
  contenedorIcono: {
    width: 44,
    height: 44,
    borderRadius: radioBorde.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insigniaTendencia: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: espaciado.sm,
    paddingVertical: espaciado.xs,
    borderRadius: radioBorde.full,
    gap: espaciado.xs,
  },
  textoTendencia: {
    fontSize: tipografia.tamanos.xs,
    fontWeight: '600',
  },
  contenido: {
    gap: espaciado.xs,
  },
  valor: {
    fontSize: tipografia.tamanos.xxl,
    fontWeight: '700',
    color: colores.textoPrincipal,
  },
  titulo: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoSecundario,
    fontWeight: '500',
  },
  subtitulo: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoAtenuado,
  },
});
