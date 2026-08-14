// Pantalla de Membresía - Muestra el estado de la suscripción y los planes disponibles
// Los precios se obtienen en tiempo real desde el sistema de Crystal MiFit.
// Flujo: App -> Backend QuantumFit -> API Crystal -> Precios reales
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
import { useAuth } from '../../contexto/ContextoAuth';
import { servicioPagos } from '../../servicios/api';
import type { SuscripcionLocal, InscripcionCrystal } from '../../tipos';
import { EncabezadoPantalla, EstadoCargando, EstadoError, EstadoVacio } from '../../componentes';
import type { PropsPantallaStackPrincipal } from '../../tipos/navegacion';

type PropsPantallaMembresia = PropsPantallaStackPrincipal<'Membresia'>;

export default function PantallaMembresia({ navigation }: PropsPantallaMembresia) {
  const { usuario, perfilExterno, refrescarUsuario } = useAuth();
  const [suscripcion, setSuscripcion] = useState<SuscripcionLocal | null>(null);
  const [inscripcion, setInscripcion] = useState<InscripcionCrystal | null>(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Construir planes dinámicamente desde los datos de Crystal
  const obtenerPlanes = () => {
    const precio = inscripcion?.renewal?.price || 0;
    const meses = inscripcion?.renewal?.months || 1;

    if (precio === 0) return [];

    const precioMensual = Math.round(precio / meses);

    return [
      {
        id: 'mensual',
        name: 'Plan Mensual',
        price: precioMensual,
        period: 'mes',
        icon: 'calendar-outline' as const,
        color: colores.primario,
        features: [
          'Acceso completo al gimnasio',
          'Clases grupales ilimitadas',
          'Check-in con puntos y recompensas',
          'Seguimiento de progreso',
        ],
      },
      {
        id: 'trimestral',
        name: 'Plan Trimestral',
        price: Math.round(precioMensual * 2.7),
        period: '3 meses',
        icon: 'calendar' as const,
        color: colores.secundario,
        features: [
          'Todo lo del plan mensual',
          '3 meses por el precio de 2.7',
          'Prioridad en reservas',
          'Acceso a eventos exclusivos',
        ],
        popular: true,
      },
      {
        id: 'anual',
        name: 'Plan Anual',
        price: Math.round(precioMensual * 9.6),
        period: '12 meses',
        icon: 'infinite' as const,
        color: colores.puntos,
        features: [
          'Todo lo del plan trimestral',
          'Ahorra 2 meses vs plan mensual',
          'Suscripción VIP automática',
          'Descuentos en eventos y productos',
        ],
      },
    ];
  };

  // Cargar datos al montar la pantalla
  useEffect(() => {
    cargarDatosSuscripcion();
  }, []);

  const cargarDatosSuscripcion = async () => {
    try {
      setCargando(true);
      setError(null);

      // Cargar suscripción local y estado de Crystal en paralelo
      const [sub, enroll] = await Promise.all([
        servicioPagos.obtenerMiSuscripcion().catch(() => null),
        servicioPagos.obtenerEstadoInscripcion().catch(() => null),
      ]);

      setSuscripcion(sub);
      setInscripcion(enroll);
    } catch (err) {
      setError('No se pudieron cargar los datos de membresía.');
    } finally {
      setCargando(false);
    }
  };

  const alRefrescar = useCallback(async () => {
    setRefrescando(true);
    await cargarDatosSuscripcion();
    await refrescarUsuario();
    setRefrescando(false);
  }, [refrescarUsuario]);

  // Solo mostrar datos de Crystal si el DNI del usuario está vinculado en Crystal
  const tienePerfilCrystal = !!perfilExterno;

  // Determinar si el usuario ya tiene suscripción activa
  const tieneSuscripcionActiva = suscripcion?.hasSubscription
    && suscripcion?.subscription
    && !suscripcion.subscription.isExpired
    && suscripcion.subscription.status === 'ACTIVE';

  // Formatear fecha legible
  const formatearFecha = (cadenaFecha: string | null) => {
    if (!cadenaFecha) return '—';
    const fecha = new Date(cadenaFecha);
    return fecha.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const planes = obtenerPlanes();

  // Navegar al checkout con el plan seleccionado
  const alSeleccionarPlan = (plan: (typeof planes)[0]) => {
    navigation.navigate('Checkout', {
      plan,
      metodosPago: [],
    });
  };

  // ===========================================================================
  // RENDER: Estado cargando
  // ===========================================================================
  if (cargando && !refrescando) {
    return (
      <View style={styles.contenedor}>
        <EncabezadoPantalla titulo="Membresía" alVolver={() => navigation.goBack()} accionDerecha={
          <TouchableOpacity style={styles.botonVolver} onPress={() => navigation.navigate('HistorialPagos')}>
            <Ionicons name="time-outline" size={24} color={colores.textoPrincipal} />
          </TouchableOpacity>
        } />
        <EstadoCargando mensaje="Cargando membresía..." />
      </View>
    );
  }

  if (error && !refrescando) {
    return (
      <View style={styles.contenedor}>
        <EncabezadoPantalla titulo="Membresía" alVolver={() => navigation.goBack()} accionDerecha={
          <TouchableOpacity style={styles.botonVolver} onPress={() => navigation.navigate('HistorialPagos')}>
            <Ionicons name="time-outline" size={24} color={colores.textoPrincipal} />
          </TouchableOpacity>
        } />
        <EstadoError mensaje={error} alReintentar={cargarDatosSuscripcion} />
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <EncabezadoPantalla titulo="Membresía" alVolver={() => navigation.goBack()} accionDerecha={
        <TouchableOpacity style={styles.botonVolver} onPress={() => navigation.navigate('HistorialPagos')}>
          <Ionicons name="time-outline" size={24} color={colores.textoPrincipal} />
        </TouchableOpacity>
      } />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contenidoScroll}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={alRefrescar} tintColor={colores.primario} />
        }
      >
        {/* ================================================================= */}
        {/* SECCIÓN: Estado actual de la suscripción */}
        {/* ================================================================= */}
        {tieneSuscripcionActiva && suscripcion?.subscription && (
          <LinearGradient
            colors={[colores.primario, colores.primarioOscuro]}
            style={styles.tarjetaSuscripcionActiva}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.encabezadoSubActiva}>
              <View style={styles.iconoSubActiva}>
                <Ionicons name="shield-checkmark" size={28} color={colores.fondo} />
              </View>
              <View style={styles.insigniaSubActiva}>
                <Ionicons name="flash" size={14} color={colores.fondo} />
                <Text style={styles.textoInsigniaSubActiva}>VIP ACTIVO</Text>
              </View>
            </View>

            <Text style={styles.tituloSubActiva}>
              {suscripcion.subscription.type === 'VIP_MONTHLY' ? 'Plan Mensual'
                : suscripcion.subscription.type === 'VIP_QUARTERLY' ? 'Plan Trimestral'
                : 'Plan Anual'}
            </Text>

            <View style={styles.detallesSubActiva}>
              <View style={styles.detalleSubActiva}>
                <Ionicons name="calendar-outline" size={16} color={colores.fondo} />
                <Text style={styles.textoDetalleSubActiva}>
                  Vence: {formatearFecha(suscripcion.subscription.endDate)}
                </Text>
              </View>
              <View style={styles.detalleSubActiva}>
                <Ionicons name="repeat-outline" size={16} color={colores.fondo} />
                <Text style={styles.textoDetalleSubActiva}>
                  Ciclo: {suscripcion.subscription.billingCycle === 'MONTHLY' ? 'Mensual'
                    : suscripcion.subscription.billingCycle === 'QUARTERLY' ? 'Trimestral'
                    : 'Anual'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        )}

        {/* ================================================================= */}
        {/* SECCIÓN: Información de Crystal */}
        {/* ================================================================= */}
        {tienePerfilCrystal && inscripcion?.enrollment && (
          <View style={styles.tarjetaInformacion}>
            <View style={styles.filaInformacion}>
              <Ionicons
                name={inscripcion.enrollment.is_expired ? 'close-circle' : 'checkmark-circle'}
                size={20}
                color={inscripcion.enrollment.is_expired ? colores.error : colores.secundario}
              />
              <Text style={styles.textoInformacion}>
                {inscripcion.enrollment.is_expired
                  ? 'Tu membresía en el sistema está vencida'
                  : inscripcion.enrollment.is_enrolled
                  ? 'Membresía activa en el sistema del gimnasio'
                  : 'Sin membresía registrada en el sistema'}
              </Text>
            </View>
            {inscripcion.enrollment.due_date && (
              <View style={styles.filaInformacion}>
                <Ionicons name="calendar-outline" size={20} color={colores.primario} />
                <Text style={styles.textoInformacion}>
                  Vence en sistema: {formatearFecha(inscripcion.enrollment.due_date)}
                </Text>
              </View>
            )}
          </View>
        )}
        {!tienePerfilCrystal && usuario?.dni && (
          <View style={styles.tarjetaInformacion}>
            <View style={styles.filaInformacion}>
              <Ionicons name="information-circle-outline" size={20} color={colores.textoAtenuado} />
              <Text style={styles.textoInformacion}>
                No tenés membresía activa. Elegí un plan para empezar.
              </Text>
            </View>
          </View>
        )}

        {/* ================================================================= */}
        {/* SECCIÓN: Si NO tiene suscripción activa, mostrar planes */}
        {/* ================================================================= */}
        {!tieneSuscripcionActiva && (
          <>
            <View style={styles.encabezadoSeccion}>
              <Text style={styles.tituloSeccion}>Elegí tu plan</Text>
              <Text style={styles.subtituloSeccion}>
                {inscripcion?.renewal?.price
                  ? `Precio desde el sistema del gimnasio: $${inscripcion.renewal.price.toLocaleString('es-AR')}`
                  : 'Activá tu membresía y empezá a disfrutar de todos los beneficios'}
              </Text>
            </View>

            {planes.length > 0 ? (
              planes.map((plan, index) => (
              <TouchableOpacity
                key={plan.id}
                style={styles.tarjetaPlan}
                onPress={() => alSeleccionarPlan(plan)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={
                    plan.popular
                      ? ['rgba(57, 255, 20, 0.08)', 'rgba(0, 0, 0, 0)']
                      : ['rgba(255, 255, 255, 0.03)', 'rgba(0, 0, 0, 0)']
                  }
                  style={styles.gradientePlan}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {/* Badge "Más popular" */}
                  {plan.popular && (
                    <View style={styles.insigniaPopular}>
                      <Ionicons name="star" size={14} color={colores.fondo} />
                      <Text style={styles.textoInsigniaPopular}>Más popular</Text>
                    </View>
                  )}

                  <View style={styles.encabezadoPlan}>
                    <View style={[styles.contenedorIconoPlan, { backgroundColor: `${plan.color}20` }]}>
                      <Ionicons name={plan.icon} size={28} color={plan.color} />
                    </View>
                    <View style={styles.contenedorNombrePlan}>
                      <Text style={styles.nombrePlan}>{plan.name}</Text>
                      <View style={styles.filaPrecioPlan}>
                        <Text style={[styles.precioPlan, { color: plan.color }]}>
                          ${plan.price.toLocaleString()}
                        </Text>
                        <Text style={styles.periodoPlan}>/{plan.period}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Lista de características */}
                  <View style={styles.caracteristicasPlan}>
                    {plan.features.map((caracteristica, i) => (
                      <View key={i} style={styles.caracteristicaPlan}>
                        <Ionicons name="checkmark-circle" size={18} color={colores.secundario} />
                        <Text style={styles.textoCaracteristicaPlan}>{caracteristica}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Botón de selección */}
                  <TouchableOpacity
                    style={[styles.botonSeleccionar, { backgroundColor: plan.color }]}
                    onPress={() => alSeleccionarPlan(plan)}
                  >
                    <Text style={styles.textoBotonSeleccionar}>Seleccionar plan</Text>
                    <Ionicons name="arrow-forward" size={20} color={colores.fondo} />
                  </TouchableOpacity>
                </LinearGradient>
              </TouchableOpacity>
            ))
          ) : (
            <EstadoVacio icono="pricetag-outline" tamanoIcono={48} titulo="No se pudieron obtener los precios del sistema del gimnasio." etiquetaAccion="Reintentar" alAccion={cargarDatosSuscripcion} />
          )}
          </>
        )}

        {/* ================================================================= */}
        {/* SECCIÓN: Si tiene suscripción activa, botón para ver detalle */}
        {/* ================================================================= */}
        {tieneSuscripcionActiva && (
          <View style={styles.contenedorAcciones}>
            <TouchableOpacity
              style={styles.botonAdministrar}
              onPress={() => navigation.navigate('MiSuscripcion')}
            >
              <Ionicons name="settings-outline" size={20} color={colores.primario} />
              <Text style={styles.textoBotonAdministrar}>Administrar suscripción</Text>
              <Ionicons name="chevron-forward" size={20} color={colores.textoAtenuado} />
            </TouchableOpacity>
          </View>
        )}

        {/* Espacio inferior */}
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
  },
  botonVolver: {
    width: 40,
    height: 40,
    borderRadius: radioBorde.full,
    backgroundColor: colores.fondoTarjeta,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Tarjeta de suscripción activa
  tarjetaSuscripcionActiva: {
    borderRadius: radioBorde.xl,
    padding: espaciado.xl,
    marginTop: espaciado.md,
    marginBottom: espaciado.lg,
    ...sombras.grande,
  },
  encabezadoSubActiva: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: espaciado.md,
  },
  iconoSubActiva: {
    width: 48,
    height: 48,
    borderRadius: radioBorde.full,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  insigniaSubActiva: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.xs,
    borderRadius: radioBorde.full,
    gap: espaciado.xs,
  },
  textoInsigniaSubActiva: {
    fontSize: tipografia.tamanos.xs,
    fontWeight: '700',
    color: colores.fondo,
    letterSpacing: 1,
  },
  tituloSubActiva: {
    fontSize: tipografia.tamanos.xxl,
    fontWeight: '800',
    color: colores.fondo,
    marginBottom: espaciado.md,
  },
  detallesSubActiva: {
    gap: espaciado.sm,
  },
  detalleSubActiva: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
  },
  textoDetalleSubActiva: {
    fontSize: tipografia.tamanos.sm,
    color: colores.fondo,
    fontWeight: '600',
  },

  // Info de Crystal
  tarjetaInformacion: {
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.lg,
    padding: espaciado.lg,
    marginBottom: espaciado.lg,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  filaInformacion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.md,
    marginBottom: espaciado.sm,
  },
  textoInformacion: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoSecundario,
    flex: 1,
  },

  // Lista de planes
  encabezadoSeccion: {
    marginTop: espaciado.md,
    marginBottom: espaciado.lg,
  },
  tituloSeccion: {
    fontSize: tipografia.tamanos.xxl,
    fontWeight: '800',
    color: colores.textoPrincipal,
    marginBottom: espaciado.xs,
  },
  subtituloSeccion: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoSecundario,
    lineHeight: 20,
  },

  // Tarjeta de plan
  tarjetaPlan: {
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.xl,
    marginBottom: espaciado.lg,
    borderWidth: 1,
    borderColor: colores.borde,
    overflow: 'hidden',
  },
  gradientePlan: {
    padding: espaciado.xl,
  },
  insigniaPopular: {
    position: 'absolute',
    top: espaciado.md,
    right: espaciado.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.secundario,
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.xs,
    borderRadius: radioBorde.full,
    gap: espaciado.xs,
    zIndex: 1,
  },
  textoInsigniaPopular: {
    fontSize: tipografia.tamanos.xs,
    fontWeight: '700',
    color: colores.fondo,
  },
  encabezadoPlan: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: espaciado.lg,
    gap: espaciado.lg,
  },
  contenedorIconoPlan: {
    width: 56,
    height: 56,
    borderRadius: radioBorde.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contenedorNombrePlan: {
    flex: 1,
  },
  nombrePlan: {
    fontSize: tipografia.tamanos.lg,
    fontWeight: '700',
    color: colores.textoPrincipal,
    marginBottom: espaciado.xs,
  },
  filaPrecioPlan: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  precioPlan: {
    fontSize: tipografia.tamanos.xxl,
    fontWeight: '800',
  },
  periodoPlan: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoAtenuado,
    marginLeft: espaciado.xs,
  },

  // Características
  caracteristicasPlan: {
    gap: espaciado.md,
    marginBottom: espaciado.xl,
  },
  caracteristicaPlan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.md,
  },
  textoCaracteristicaPlan: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoSecundario,
    flex: 1,
    lineHeight: 18,
  },

  // Botón seleccionar
  botonSeleccionar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: espaciado.lg,
    borderRadius: radioBorde.lg,
    gap: espaciado.sm,
    ...sombras.brillo,
  },
  textoBotonSeleccionar: {
    fontSize: tipografia.tamanos.md,
    fontWeight: '700',
    color: colores.fondo,
  },

  // Acciones
  contenedorAcciones: {
    marginTop: espaciado.md,
  },
  botonAdministrar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.lg,
    padding: espaciado.lg,
    gap: espaciado.md,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  textoBotonAdministrar: {
    flex: 1,
    fontSize: tipografia.tamanos.md,
    fontWeight: '600',
    color: colores.textoPrincipal,
  },
});
