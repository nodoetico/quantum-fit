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
import { servicioPremios } from '../../servicios/api';
import { EncabezadoPantalla, EstadoCargando, EstadoError, EstadoVacio } from '../../componentes';
import type { PropsPantallaStackPrincipal } from '../../tipos/navegacion';

type Props = PropsPantallaStackPrincipal<'HistorialPremios'>;

interface PremioCanjeado {
  id: string;
  rewardId: string;
  status: string;
  pointsSpent: number;
  pickupCode: string;
  pickupDeadline: string | null;
  pickedUpAt: string | null;
  redeemedAt: string;
  reward: {
    id: string;
    name: string;
    description: string | null;
    pointsCost: number;
    category: string;
    imageUrl: string | null;
  };
}

function formatearFecha(cadenaFecha: string): string {
  const d = new Date(cadenaFecha);
  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const configEstado: { [key: string]: { etiqueta: string; color: string; icono: keyof typeof Ionicons.glyphMap } } = {
  PENDING: { etiqueta: 'Pendiente', color: colores.advertencia, icono: 'time-outline' },
  APPROVED: { etiqueta: 'Aprobado', color: colores.primario, icono: 'checkmark-circle-outline' },
  FULFILLED: { etiqueta: 'Entregado', color: colores.exito, icono: 'checkmark-done-outline' },
  CANCELLED: { etiqueta: 'Cancelado', color: colores.error, icono: 'close-circle-outline' },
};

export default function PantallaHistorialPremios({ navigation }: Props) {
  const [premios, setPremios] = useState<PremioCanjeado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      setCargando(true);
      const datos = await servicioPremios.obtenerMisPremios();
      setPremios(datos || []);
    } catch (error) {
      setError('No se pudo cargar el historial');
    } finally {
      setCargando(false);
    }
  };

  const alRefrescar = async () => {
    setRefrescando(true);
    await cargarHistorial();
    setRefrescando(false);
  };

  return (
    <View style={styles.contenedor}>
      <EncabezadoPantalla
        titulo="Historial de Premios"
        alVolver={() => navigation.goBack()}
        style={{ paddingTop: espaciado.xxl, paddingBottom: espaciado.md, backgroundColor: colores.fondoSecundario }}
      />

      {cargando ? (
        <EstadoCargando />
      ) : error ? (
        <EstadoError mensaje={error} alReintentar={cargarHistorial} icono="cloud-offline-outline" tamanoIcono={64} />
      ) : premios.length === 0 ? (
        <EstadoVacio
          icono="gift-outline"
          tamanoIcono={64}
          titulo="Sin premios canjeados aún"
          etiquetaAccion="Ver premios disponibles"
          alAccion={() => navigation.navigate('MainTabs', { screen: 'Beneficios' })}
        />
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={alRefrescar} tintColor={colores.primario} />}
          contentContainerStyle={styles.lista}
        >
          {premios.map((item) => {
            const estado = configEstado[item.status] || configEstado.PENDING;
            return (
              <View key={item.id} style={styles.tarjeta}>
                <View style={styles.encabezadoTarjeta}>
                  <View style={styles.infoPremio}>
                    <Text style={styles.nombrePremio}>{item.reward.name}</Text>
                    <Text style={styles.categoriaPremio}>{item.reward.category}</Text>
                  </View>
                  <View style={[styles.insigniaEstado, { backgroundColor: estado.color + '20' }]}>
                    <Ionicons name={estado.icono} size={14} color={estado.color} />
                    <Text style={[styles.textoEstado, { color: estado.color }]}>{estado.etiqueta}</Text>
                  </View>
                </View>

                <View style={styles.detalles}>
                  <View style={styles.filaDetalle}>
                    <Ionicons name="pricetag-outline" size={16} color={colores.textoAtenuado} />
                    <Text style={styles.textoDetalle}>{item.pointsSpent} puntos</Text>
                  </View>
                  <View style={styles.filaDetalle}>
                    <Ionicons name="calendar-outline" size={16} color={colores.textoAtenuado} />
                    <Text style={styles.textoDetalle}>{formatearFecha(item.redeemedAt)}</Text>
                  </View>
                  <View style={styles.filaDetalle}>
                    <Ionicons name="qr-code-outline" size={16} color={colores.textoAtenuado} />
                    <Text style={styles.textoDetalle}>Código: {item.pickupCode}</Text>
                  </View>
                </View>
              </View>
            );
          })}
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
  tarjeta: {
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.lg,
    padding: espaciado.lg,
    marginBottom: espaciado.md,
  },
  encabezadoTarjeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: espaciado.md,
  },
  infoPremio: {
    flex: 1,
  },
  nombrePremio: {
    fontSize: tipografia.tamanos.md,
    fontWeight: '700',
    color: colores.textoPrincipal,
  },
  categoriaPremio: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoAtenuado,
    marginTop: 2,
  },
  insigniaEstado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: espaciado.sm,
    paddingVertical: espaciado.xs,
    borderRadius: radioBorde.full,
  },
  textoEstado: {
    fontSize: tipografia.tamanos.xs,
    fontWeight: '600',
  },
  detalles: {
    gap: espaciado.sm,
  },
  filaDetalle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
  },
  textoDetalle: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoSecundario,
  },
});
