// Mi Suscripción - Detalles de la suscripción activa del usuario.
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colores, espaciado, tipografia, radioBorde, sombras } from '../../constantes/tema';
import { servicioPagos } from '../../servicios/api';
import type { SuscripcionLocal } from '../../tipos';
import { EncabezadoPantalla, EstadoCargando } from '../../componentes';
import type { PropsPantallaStackPrincipal } from '../../tipos/navegacion';

type PropsPantallaMiSuscripcion = PropsPantallaStackPrincipal<'MiSuscripcion'>;

export default function PantallaMiSuscripcion({ navigation }: PropsPantallaMiSuscripcion) {
  const [suscripcion, setSuscripcion] = useState<SuscripcionLocal | null>(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const sub = await servicioPagos.obtenerMiSuscripcion();
      setSuscripcion(sub);
    } catch (err) {
    } finally {
      setCargando(false);
    }
  };

  const alRefrescar = useCallback(async () => {
    setRefrescando(true);
    await cargarDatos();
    setRefrescando(false);
  }, []);

  const formatearFecha = (cadenaFecha: string | null) => {
    if (!cadenaFecha) return '—';
    return new Date(cadenaFecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const obtenerColorEstado = (estado: string | undefined) => {
    switch (estado) {
      case 'ACTIVE': return colores.secundario;
      case 'PENDING': return colores.advertencia;
      case 'SUSPENDED': return colores.error;
      case 'CANCELLED': return colores.textoAtenuado;
      case 'EXPIRED': return colores.error;
      default: return colores.textoAtenuado;
    }
  };

  const obtenerEtiquetaEstado = (estado: string | undefined) => {
    switch (estado) {
      case 'ACTIVE': return 'Activa';
      case 'PENDING': return 'Pendiente';
      case 'SUSPENDED': return 'Suspendida';
      case 'CANCELLED': return 'Cancelada';
      case 'EXPIRED': return 'Vencida';
      default: return 'Desconocido';
    }
  };

  if (cargando && !refrescando) {
    return (
      <View style={styles.contenedor}>
        <EncabezadoPantalla titulo="Mi Suscripción" alVolver={() => navigation.goBack()} />
        <EstadoCargando mensaje="Cargando..." />
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <EncabezadoPantalla titulo="Mi Suscripción" alVolver={() => navigation.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contenidoScroll}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={alRefrescar} tintColor={colores.primario} />
        }
      >
        {/* Tarjeta de estado */}
        <LinearGradient
          colors={
            suscripcion?.subscription?.status === 'ACTIVE'
              ? [colores.primario, colores.primarioOscuro]
              : [colores.fondoTarjeta, colores.fondoSecundario]
          }
          style={styles.tarjetaEstado}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.filaEstado}>
            <View style={[
              styles.puntoEstado,
              { backgroundColor: obtenerColorEstado(suscripcion?.subscription?.status) },
            ]} />
            <Text style={[
              styles.etiquetaEstado,
              suscripcion?.subscription?.status === 'ACTIVE' && { color: colores.fondo },
            ]}>
              {obtenerEtiquetaEstado(suscripcion?.subscription?.status)}
            </Text>
          </View>

          {suscripcion?.subscription && (
            <>
              <Text style={[
                styles.tituloPlan,
                suscripcion?.subscription?.status === 'ACTIVE' && { color: colores.fondo },
              ]}>
                {suscripcion.subscription.type === 'VIP_MONTHLY' ? 'Plan Mensual'
                  : suscripcion.subscription.type === 'VIP_QUARTERLY' ? 'Plan Trimestral'
                  : 'Plan Anual'}
              </Text>

              <View style={styles.detallesEstado}>
                <View style={styles.filaDetalleEstado}>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={suscripcion.subscription.status === 'ACTIVE' ? colores.fondo : colores.textoAtenuado}
                  />
                  <Text style={[
                    styles.textoDetalleEstado,
                    suscripcion.subscription.status === 'ACTIVE' && { color: colores.fondo },
                  ]}>
                    Inicio: {formatearFecha(suscripcion.subscription.startDate)}
                  </Text>
                </View>
                {suscripcion.subscription.endDate && (
                  <View style={styles.filaDetalleEstado}>
                    <Ionicons
                      name="calendar"
                      size={16}
                      color={suscripcion.subscription.status === 'ACTIVE' ? colores.fondo : colores.textoAtenuado}
                    />
                    <Text style={[
                      styles.textoDetalleEstado,
                      suscripcion.subscription.status === 'ACTIVE' && { color: colores.fondo },
                    ]}>
                      Vence: {formatearFecha(suscripcion.subscription.endDate)}
                    </Text>
                  </View>
                )}
                {suscripcion.subscription.price > 0 && (
                  <View style={styles.filaDetalleEstado}>
                    <Ionicons
                      name="pricetag-outline"
                      size={16}
                      color={suscripcion.subscription.status === 'ACTIVE' ? colores.fondo : colores.textoAtenuado}
                    />
                    <Text style={[
                      styles.textoDetalleEstado,
                      suscripcion.subscription.status === 'ACTIVE' && { color: colores.fondo },
                    ]}>
                      ${suscripcion.subscription.price.toLocaleString('es-AR')} / {suscripcion.subscription.billingCycle === 'MONTHLY' ? 'mes'
                        : suscripcion.subscription.billingCycle === 'QUARTERLY' ? 'trimestre'
                        : 'año'}
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}

          {!suscripcion?.hasSubscription && (
            <Text style={styles.textoSinSuscripcion}>
              No tenés una suscripción activa.
            </Text>
          )}
        </LinearGradient>

        {/* Botón para volver a planes */}
        {(!suscripcion?.hasSubscription || suscripcion?.subscription?.isExpired) && (
          <TouchableOpacity
            style={styles.botonVerPlanes}
            onPress={() => navigation.navigate('Membresia')}
          >
            <Ionicons name="rocket-outline" size={20} color={colores.fondo} />
            <Text style={styles.textoBotonVerPlanes}>Ver planes disponibles</Text>
          </TouchableOpacity>
        )}

        {/* Historial de pagos */}
        <TouchableOpacity
          style={styles.botonHistorial}
          onPress={() => navigation.navigate('HistorialPagos')}
        >
          <Ionicons name="time-outline" size={20} color={colores.primario} />
          <Text style={styles.textoBotonHistorial}>Ver historial completo de pagos</Text>
          <Ionicons name="chevron-forward" size={20} color={colores.textoAtenuado} />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ============================================================================
// ESTILOS
// ============================================================================

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenidoScroll: {
    paddingHorizontal: espaciado.xl,
    paddingTop: espaciado.md,
  },

  // Tarjeta de estado
  tarjetaEstado: {
    borderRadius: radioBorde.xl,
    padding: espaciado.xl,
    marginBottom: espaciado.lg,
    ...sombras.grande,
  },
  filaEstado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
    marginBottom: espaciado.md,
  },
  puntoEstado: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  etiquetaEstado: {
    fontSize: tipografia.tamanos.sm,
    fontWeight: '600',
    color: colores.textoSecundario,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tituloPlan: {
    fontSize: tipografia.tamanos.xxl,
    fontWeight: '800',
    color: colores.textoPrincipal,
    marginBottom: espaciado.lg,
  },
  detallesEstado: {
    gap: espaciado.sm,
  },
  filaDetalleEstado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
  },
  textoDetalleEstado: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoSecundario,
  },
  textoSinSuscripcion: {
    fontSize: tipografia.tamanos.md,
    color: colores.textoAtenuado,
    textAlign: 'center',
    marginTop: espaciado.md,
  },

  // Botón de upgrade
  botonVerPlanes: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.primario,
    borderRadius: radioBorde.lg,
    paddingVertical: espaciado.lg,
    marginBottom: espaciado.xl,
    gap: espaciado.sm,
    ...sombras.brillo,
  },
  textoBotonVerPlanes: {
    fontSize: tipografia.tamanos.md,
    fontWeight: '700',
    color: colores.fondo,
  },

  // Botón historial
  botonHistorial: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.lg,
    padding: espaciado.lg,
    borderWidth: 1,
    borderColor: colores.borde,
    gap: espaciado.md,
  },
  textoBotonHistorial: {
    flex: 1,
    fontSize: tipografia.tamanos.sm,
    fontWeight: '600',
    color: colores.textoPrincipal,
  },
});
