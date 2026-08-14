import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colores, espaciado, radioBorde, tipografia } from '../../constantes/tema';
import { useAuth } from '../../contexto/ContextoAuth';
import { servicioRanking } from '../../servicios/api';
import { EncabezadoPantalla, EstadoCargando, EstadoError, EstadoVacio } from '../../componentes';
import type { PropsPantallaTabPrincipal } from '../../tipos/navegacion';

type PropsPantallaRanking = PropsPantallaTabPrincipal<'Ranking'>;

interface EntradaClasificacion {
  rank: number;
  id: string;
  name: string;
  level: number;
  points: number;
  currentStreak: number;
  totalWorkouts: number;
  avatarUrl: string | null;
}

const obtenerEmojiPuesto = (puesto: number) => {
  if (puesto === 1) return { emoji: '🥇', color: colores.nivelOro };
  if (puesto === 2) return { emoji: '🥈', color: colores.nivelPlata };
  if (puesto === 3) return { emoji: '🥉', color: colores.nivelBronce };
  return { emoji: null, color: colores.textoSecundario };
};

const obtenerEmojiNivel = (nivel: number) => {
  if (nivel >= 10) return '👑';
  if (nivel >= 7) return '💎';
  if (nivel >= 5) return '🔥';
  if (nivel >= 3) return '💪';
  return '🌱';
};

export default function PantallaRanking({ navigation }: PropsPantallaRanking) {
  const { usuario } = useAuth();
  const [clasificacion, setClasificacion] = useState<EntradaClasificacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarClasificacion();
  }, []);

  const cargarClasificacion = async () => {
    try {
      setError(null);
      const datos = await servicioRanking.obtenerTablaPosiciones();
      setClasificacion(datos || []);
    } catch (err) {
      setError('No se pudo cargar el ranking');
    } finally {
      setCargando(false);
    }
  };

  const alRefrescar = async () => {
    setRefrescando(true);
    await cargarClasificacion();
    setRefrescando(false);
  };

  const entradaUsuario = clasificacion.find(e => e.id === usuario?.id);
  const puestoActual = entradaUsuario?.rank || null;

  if (cargando) {
    return (
      <View style={styles.contenedor}>
        <EncabezadoPantalla titulo="Ranking" />
        <EstadoCargando mensaje="Cargando ranking..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.contenedor}>
        <EncabezadoPantalla titulo="Ranking" />
        <EstadoError mensaje={error} alReintentar={cargarClasificacion} />
      </View>
    );
  }

  const top3 = clasificacion.slice(0, 3);

  const configuracionPodio: Record<number, { position: 'first' | 'second' | 'third'; style: any; avatarStyle: any; blockStyle: any }> = {
    0: {
      position: 'first',
      style: { marginTop: 0 },
      avatarStyle: styles.avatarOro,
      blockStyle: styles.bloqueOro,
    },
    1: {
      position: 'second',
      style: { marginTop: 30 },
      avatarStyle: styles.avatarPlata,
      blockStyle: styles.bloquePlata,
    },
    2: {
      position: 'third',
      style: { marginTop: 50 },
      avatarStyle: styles.avatarBronce,
      blockStyle: styles.bloqueBronce,
    },
  };

  const ordenPodio = top3.length === 3
    ? [1, 0, 2]
    : top3.length === 2
    ? [0, 1]
    : [0];

  return (
    <View style={styles.contenedor}>
      <EncabezadoPantalla titulo="Ranking" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={alRefrescar} tintColor={colores.primario} />
        }
      >
        {clasificacion.length > 0 && (
          <View style={styles.contenedorPodio}>
            {ordenPodio.map((i) => {
              const entrada = top3[i];
              const config = configuracionPodio[i];
              const medalla = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
              return (
                <View key={entrada.id} style={[styles.columnaPodio, config.style]}>
                  <View style={[styles.avatarPodio, config.avatarStyle]}>
                    <Text style={styles.textoAvatarPodio}>{medalla}</Text>
                  </View>
                  <Text style={[styles.nombrePodio, i === 0 && styles.nombrePodioPrimero]} numberOfLines={1}>
                    {entrada.name}
                  </Text>
                  <Text style={[styles.puntosPodio, i === 0 && styles.puntosPodioPrimero]}>
                    {entrada.points.toLocaleString()} pts
                  </Text>
                  <View style={[styles.bloquePodio, config.blockStyle]} />
                </View>
              );
            })}
          </View>
        )}

        {usuario && (
          <LinearGradient
            colors={[`${colores.primario}30`, `${colores.primario}10`]}
            style={styles.tarjetaTuPuesto}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.contenidoTuPuesto}>
              <View style={styles.infoTuPuesto}>
                <Text style={styles.etiquetaTuPuesto}>Tu Posición</Text>
                {puestoActual ? (
                  <View style={styles.insigniaTuPuesto}>
                    <Text style={styles.numeroTuPuesto}>#{puestoActual}</Text>
                  </View>
                ) : (
                  <View style={[styles.insigniaTuPuesto, { backgroundColor: colores.textoAtenuado }]}>
                    <Text style={styles.numeroTuPuesto}>--</Text>
                  </View>
                )}
              </View>
              <View style={styles.estadisticasTuPuesto}>
                <View style={styles.estadisticaTuPuesto}>
                  <Ionicons name="trophy" size={20} color={colores.puntos} />
                  <Text style={styles.valorEstadisticaTuPuesto}>{usuario?.points.toLocaleString()}</Text>
                  <Text style={styles.etiquetaEstadisticaTuPuesto}>puntos</Text>
                </View>
                <View style={styles.estadisticaTuPuesto}>
                  <Ionicons name="trending-up" size={20} color={colores.primario} />
                  <Text style={styles.valorEstadisticaTuPuesto}>Nivel {usuario?.level}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        )}

        <View style={styles.listaClasificacion}>
          <Text style={styles.tituloSeccion}>Clasificación Global</Text>

          {clasificacion.length === 0 && (
            <EstadoVacio icono="trophy-outline" tamanoIcono={48} titulo="No hay usuarios en el ranking aún" />
          )}

          {clasificacion.map((entrada) => {
            const esUsuario = entrada.id === usuario?.id;
            const infoPuesto = obtenerEmojiPuesto(entrada.rank);

            return (
              <View
                key={entrada.id}
                style={[
                  styles.itemClasificacion,
                  esUsuario && styles.itemClasificacionUsuario,
                ]}
              >
                <View style={styles.puestoClasificacion}>
                  <Text style={[
                    styles.textoPuestoClasificacion,
                    entrada.rank === 1 && styles.puestoClasificacionOro,
                    entrada.rank === 2 && styles.puestoClasificacionPlata,
                    entrada.rank === 3 && styles.puestoClasificacionBronce,
                  ]}>
                    {infoPuesto.emoji || `#${entrada.rank}`}
                  </Text>
                </View>

                <View style={styles.avatarClasificacion}>
                  <Text style={styles.textoAvatarClasificacion}>{obtenerEmojiNivel(entrada.level)}</Text>
                </View>

                <View style={styles.infoClasificacion}>
                  <Text style={[styles.nombreClasificacion, esUsuario && styles.nombreClasificacionUsuario]}>
                    {entrada.name}
                  </Text>
                  <Text style={styles.nivelClasificacion}>Nivel {entrada.level}</Text>
                </View>

                <View style={styles.puntosClasificacion}>
                  <Text style={[styles.textoPuntosClasificacion, esUsuario && styles.puntosClasificacionUsuario]}>
                    {entrada.points.toLocaleString()}
                  </Text>
                  <Ionicons name="trophy" size={16} color={esUsuario ? colores.primario : colores.puntos} />
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenedorPodio: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: espaciado.xl,
    paddingTop: espaciado.lg,
    paddingBottom: espaciado.xl,
    gap: espaciado.md,
  },
  columnaPodio: {
    alignItems: 'center',
  },
  avatarPodio: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: espaciado.sm,
    borderWidth: 3,
  },
  avatarOro: {
    backgroundColor: `${colores.nivelOro}20`,
    borderColor: colores.nivelOro,
  },
  avatarPlata: {
    backgroundColor: `${colores.nivelPlata}20`,
    borderColor: colores.nivelPlata,
  },
  avatarBronce: {
    backgroundColor: `${colores.nivelBronce}20`,
    borderColor: colores.nivelBronce,
  },
  textoAvatarPodio: {
    fontSize: 32,
  },
  nombrePodio: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoSecundario,
    textAlign: 'center',
    maxWidth: 80,
  },
  nombrePodioPrimero: {
    fontWeight: '600',
    color: colores.textoPrincipal,
  },
  puntosPodio: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoAtenuado,
    marginTop: espaciado.xs,
  },
  puntosPodioPrimero: {
    fontWeight: '600',
    color: colores.puntos,
  },
  bloquePodio: {
    width: 70,
    marginTop: espaciado.md,
    borderRadius: radioBorde.md,
  },
  bloqueOro: {
    height: 100,
    backgroundColor: `${colores.nivelOro}30`,
    borderWidth: 2,
    borderColor: colores.nivelOro,
  },
  bloquePlata: {
    height: 70,
    backgroundColor: `${colores.nivelPlata}30`,
    borderWidth: 2,
    borderColor: colores.nivelPlata,
  },
  bloqueBronce: {
    height: 50,
    backgroundColor: `${colores.nivelBronce}30`,
    borderWidth: 2,
    borderColor: colores.nivelBronce,
  },
  tarjetaTuPuesto: {
    marginHorizontal: espaciado.xl,
    borderRadius: radioBorde.xl,
    padding: espaciado.lg,
    marginBottom: espaciado.xl,
    borderWidth: 1,
    borderColor: `${colores.primario}40`,
  },
  contenidoTuPuesto: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoTuPuesto: {
    flex: 1,
  },
  etiquetaTuPuesto: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoSecundario,
    marginBottom: espaciado.sm,
  },
  insigniaTuPuesto: {
    alignSelf: 'flex-start',
    backgroundColor: colores.primario,
    paddingHorizontal: espaciado.lg,
    paddingVertical: espaciado.sm,
    borderRadius: radioBorde.full,
  },
  numeroTuPuesto: {
    fontSize: tipografia.tamanos.xl,
    fontWeight: '700',
    color: colores.fondo,
  },
  estadisticasTuPuesto: {
    flexDirection: 'row',
    gap: espaciado.lg,
  },
  estadisticaTuPuesto: {
    alignItems: 'center',
  },
  valorEstadisticaTuPuesto: {
    fontSize: tipografia.tamanos.md,
    fontWeight: '700',
    color: colores.textoPrincipal,
  },
  etiquetaEstadisticaTuPuesto: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoAtenuado,
    marginTop: espaciado.xs,
  },
  listaClasificacion: {
    paddingHorizontal: espaciado.xl,
  },
  tituloSeccion: {
    fontSize: tipografia.tamanos.lg,
    fontWeight: '600',
    color: colores.textoPrincipal,
    marginBottom: espaciado.lg,
  },
  itemClasificacion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.lg,
    padding: espaciado.md,
    marginBottom: espaciado.sm,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  itemClasificacionUsuario: {
    borderColor: colores.primario,
    backgroundColor: `${colores.primario}10`,
  },
  puestoClasificacion: {
    width: 30,
    alignItems: 'center',
  },
  textoPuestoClasificacion: {
    fontSize: tipografia.tamanos.md,
    fontWeight: '700',
    color: colores.textoSecundario,
  },
  puestoClasificacionOro: {
    color: colores.nivelOro,
  },
  puestoClasificacionPlata: {
    color: colores.nivelPlata,
  },
  puestoClasificacionBronce: {
    color: colores.nivelBronce,
  },
  avatarClasificacion: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colores.fondo,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: espaciado.md,
  },
  textoAvatarClasificacion: {
    fontSize: 20,
  },
  infoClasificacion: {
    flex: 1,
  },
  nombreClasificacion: {
    fontSize: tipografia.tamanos.md,
    fontWeight: '600',
    color: colores.textoPrincipal,
  },
  nombreClasificacionUsuario: {
    color: colores.primario,
  },
  nivelClasificacion: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoSecundario,
    marginTop: espaciado.xs,
  },
  puntosClasificacion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.xs,
  },
  textoPuntosClasificacion: {
    fontSize: tipografia.tamanos.md,
    fontWeight: '700',
    color: colores.puntos,
  },
  puntosClasificacionUsuario: {
    color: colores.primario,
  },
});
