import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, espaciado, radioBorde, tipografia } from '../../constantes/tema';
import { servicioUsuario } from '../../servicios/api';
import { EncabezadoPantalla, EstadoCargando, EstadoError, EstadoVacio } from '../../componentes';
import type { PropsPantallaStackPrincipal } from '../../tipos/navegacion';

type Props = PropsPantallaStackPrincipal<'Notificaciones'>;

interface ItemNotificacion {
  id: string;
  title: string;
  description: string;
  activityType: string;
  points: number;
  createdAt: string;
}

const obtenerIconoActividad = (tipo: string): keyof typeof Ionicons.glyphMap => {
  switch (tipo) {
    case 'CHECK_IN_CLASS': return 'calendar';
    case 'CHECK_IN_OPEN_GYM': return 'fitness';
    case 'CHECK_IN_PT': return 'body';
    case 'ACHIEVEMENT_UNLOCKED': return 'trophy';
    case 'STREAK_BONUS': return 'flame';
    case 'REWARD_REDEEMED': return 'gift';
    case 'REFERRAL_BONUS': return 'people';
    default: return 'notifications';
  }
};

const obtenerColorActividad = (tipo: string): string => {
  switch (tipo) {
    case 'CHECK_IN_CLASS': return colores.primario;
    case 'CHECK_IN_OPEN_GYM': return colores.secundario;
    case 'CHECK_IN_PT': return colores.informacion;
    case 'ACHIEVEMENT_UNLOCKED': return colores.puntos;
    case 'STREAK_BONUS': return colores.advertencia;
    case 'REWARD_REDEEMED': return colores.error;
    case 'REFERRAL_BONUS': return colores.secundario;
    default: return colores.textoSecundario;
  }
};

function agruparPorFecha(items: ItemNotificacion[]): { fecha: string; items: ItemNotificacion[] }[] {
  const grupos: { [key: string]: ItemNotificacion[] } = {};
  for (const item of items) {
    const fecha = new Date(item.createdAt).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    if (!grupos[fecha]) grupos[fecha] = [];
    grupos[fecha].push(item);
  }
  return Object.entries(grupos).map(([fecha, items]) => ({ fecha, items }));
}

function formatearHora(cadenaFecha: string): string {
  const d = new Date(cadenaFecha);
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

export default function PantallaNotificaciones({ navigation }: Props) {
  const [notificaciones, setNotificaciones] = useState<ItemNotificacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  const cargarNotificaciones = async () => {
    try {
      const data = await servicioUsuario.obtenerRegistroActividad(100);
      setNotificaciones(data?.logs || data || []);
    } catch (error) {
      setError('No se pudieron cargar las notificaciones');
    } finally {
      setCargando(false);
    }
  };

  const alRefrescar = async () => {
    setRefrescando(true);
    await cargarNotificaciones();
    setRefrescando(false);
  };

  const agrupadas = agruparPorFecha(notificaciones);

  return (
    <View style={styles.contenedor}>
      <EncabezadoPantalla
        titulo="Notificaciones"
        alVolver={() => navigation.goBack()}
        style={{ paddingTop: espaciado.xxl, paddingBottom: espaciado.md, backgroundColor: colores.fondoSecundario }}
      />

      {cargando ? (
        <EstadoCargando />
      ) : error ? (
        <EstadoError mensaje={error} alReintentar={cargarNotificaciones} icono="cloud-offline-outline" tamanoIcono={64} />
      ) : notificaciones.length === 0 ? (
        <EstadoVacio icono="notifications-off-outline" tamanoIcono={64} titulo="Sin notificaciones" />
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={alRefrescar} tintColor={colores.primario} />}
          contentContainerStyle={styles.lista}
        >
          {agrupadas.map((grupo) => (
            <View key={grupo.fecha}>
              <Text style={styles.encabezadoFecha}>{grupo.fecha}</Text>
              {grupo.items.map((item) => (
                <View key={item.id} style={styles.tarjetaNotificacion}>
                  <View style={[styles.contenedorIcono, { backgroundColor: obtenerColorActividad(item.activityType) + '20' }]}>
                    <Ionicons name={obtenerIconoActividad(item.activityType)} size={20} color={obtenerColorActividad(item.activityType)} />
                  </View>
                  <View style={styles.contenidoNotif}>
                    <Text style={styles.tituloNotif}>{item.title}</Text>
                    <Text style={styles.descripcionNotif}>{item.description}</Text>
                    <Text style={styles.horaNotif}>{formatearHora(item.createdAt)}</Text>
                  </View>
                  {item.points > 0 && (
                    <View style={styles.insigniaPuntos}>
                      <Text style={styles.textoPuntos}>+{item.points}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  lista: {
    padding: espaciado.xl,
    paddingBottom: espaciado.xxxl,
  },
  encabezadoFecha: {
    fontSize: tipografia.tamanos.sm,
    fontWeight: '600',
    color: colores.textoAtenuado,
    textTransform: 'capitalize',
    marginBottom: espaciado.sm,
    marginTop: espaciado.lg,
  },
  tarjetaNotificacion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.lg,
    padding: espaciado.md,
    marginBottom: espaciado.sm,
    gap: espaciado.md,
  },
  contenedorIcono: {
    width: 40,
    height: 40,
    borderRadius: radioBorde.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contenidoNotif: {
    flex: 1,
  },
  tituloNotif: {
    fontSize: tipografia.tamanos.sm,
    fontWeight: '600',
    color: colores.textoPrincipal,
  },
  descripcionNotif: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoSecundario,
    marginTop: 2,
  },
  horaNotif: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoAtenuado,
    marginTop: 4,
  },
  insigniaPuntos: {
    backgroundColor: colores.puntos + '20',
    paddingHorizontal: espaciado.sm,
    paddingVertical: espaciado.xs,
    borderRadius: radioBorde.full,
  },
  textoPuntos: {
    fontSize: tipografia.tamanos.xs,
    fontWeight: '700',
    color: colores.puntos,
  },
});
