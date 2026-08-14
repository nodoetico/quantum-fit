import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colores, espaciado, tipografia, radioBorde, sombras } from '../../constantes/tema';
import { useAuth } from '../../contexto/ContextoAuth';
import { servicioMercadoPago } from '../../servicios/api';
import { EncabezadoPantalla, EstadoError } from '../../componentes';
import type { PropsPantallaStackPrincipal } from '../../tipos/navegacion';

type PropsPantallaCheckout = PropsPantallaStackPrincipal<'Checkout'>;

export default function PantallaCheckout({ navigation, route }: PropsPantallaCheckout) {
  const { plan } = route?.params || {};
  const { refrescarUsuario } = useAuth();

  const [procesando, setProcesando] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);
  const [mostrarError, setMostrarError] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  useEffect(() => {
    const manejarDeepLink = ({ url }: { url: string }) => {
      if (url.includes('payment/success') || url.includes('payment_id')) {
        setMostrarExito(true);
        refrescarUsuario();
      } else if (url.includes('payment/failure') || url.includes('payment_failed')) {
        setMensajeError('El pago fue cancelado o no se pudo procesar.');
        setMostrarError(true);
      }
    };

    const suscripcion = Linking.addEventListener('url', manejarDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url) manejarDeepLink({ url });
    });

    return () => suscripcion.remove();
  }, []);

  if (!plan) {
    return (
      <View style={styles.contenedor}>
        <EncabezadoPantalla titulo="Confirmar pago" alVolver={() => navigation.goBack()} />
        <EstadoError mensaje="No se seleccionó ningún plan" alReintentar={() => navigation.goBack()} />
      </View>
    );
  }

  const formatearPrecio = (precio: number) => {
    return `$${precio.toLocaleString('es-AR')}`;
  };

  const pagarConTarjeta = async () => {
    setProcesando(true);
    try {
      const pref = await servicioMercadoPago.crearPreferencia(
        plan.id,
        plan.name,
        plan.price,
      );

      const url = pref.initPoint || pref.sandboxInitPoint;

      const soportado = await Linking.canOpenURL(url);
      if (soportado) {
        await Linking.openURL(url);
      } else {
        setMensajeError('No se pudo abrir MercadoPago. Intenta de nuevo.');
        setMostrarError(true);
      }
    } catch (err: any) {
      setMensajeError(
        err?.response?.data?.error || 'Error al conectar con MercadoPago. Intenta de nuevo.',
      );
      setMostrarError(true);
    } finally {
      setProcesando(false);
    }
  };

  const pagarEnRecepcion = async () => {
    Alert.alert(
      'Pago en recepción',
      'Aboná el plan seleccionado en recepción del gimnasio. Tu membresía se activará al confirmar el pago.',
      [
        { text: 'Entendido', style: 'default' },
      ],
    );
  };

  const planes = {
    features: plan.features || [],
  };

  return (
    <View style={styles.contenedor}>
      <EncabezadoPantalla titulo="Confirmar pago" alVolver={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contenidoScroll}>
        <LinearGradient
          colors={[colores.fondoTarjeta, colores.fondoSecundario]}
          style={styles.tarjetaResumenPlan}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.encabezadoResumenPlan}>
            <View style={[styles.cajaIconoPlan, { backgroundColor: `${plan.color}20` }]}>
              <Ionicons name={plan.icon as any} size={32} color={plan.color} />
            </View>
            <View style={styles.informacionResumenPlan}>
              <Text style={styles.nombreResumenPlan}>{plan.name}</Text>
              <Text style={[styles.precioResumenPlan, { color: plan.color }]}>
                {formatearPrecio(plan.price)}
                <Text style={styles.periodoResumenPlan}>/{plan.period}</Text>
              </Text>
            </View>
          </View>

          <View style={styles.divisor} />

          {planes.features.map((caracteristica: string, i: number) => (
            <View key={i} style={styles.caracteristicaResumenPlan}>
              <Ionicons name="checkmark-circle" size={16} color={colores.secundario} />
              <Text style={styles.textoCaracteristicaResumenPlan}>{caracteristica}</Text>
            </View>
          ))}
        </LinearGradient>

        <View style={styles.encabezadoSeccion}>
          <Text style={styles.tituloSeccion}>Elegí cómo pagar</Text>
          <Text style={styles.subtituloSeccion}>
            Pagá con tarjeta de crédito/débito ahora o en efectivo en recepción
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.opcionPago, styles.opcionPagoPrimaria]}
          onPress={pagarConTarjeta}
          disabled={procesando}
          activeOpacity={0.7}
        >
          <View style={styles.contenedorIconoOpcionPago}>
            <Ionicons name="card" size={28} color={colores.primario} />
          </View>
          <View style={styles.informacionOpcionPago}>
            <Text style={styles.tituloOpcionPago}>Pagar con tarjeta</Text>
            <Text style={styles.descripcionOpcionPago}>
              Crédito o débito • Procesado por MercadoPago
            </Text>
          </View>
          <View style={styles.insigniaMp}>
            <Text style={styles.textoInsigniaMp}>MP</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.opcionPago}
          onPress={pagarEnRecepcion}
          activeOpacity={0.7}
        >
          <View style={[styles.contenedorIconoOpcionPago, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
            <Ionicons name="cash" size={28} color={colores.textoSecundario} />
          </View>
          <View style={styles.informacionOpcionPago}>
            <Text style={styles.tituloOpcionPago}>Pagar en recepción</Text>
            <Text style={styles.descripcionOpcionPago}>
              Efectivo o transferencia • Activación manual
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colores.textoAtenuado} />
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.barraInferior}>
        <View style={styles.informacionBarraInferior}>
          <Text style={styles.etiquetaBarraInferior}>Total a pagar</Text>
          <Text style={styles.precioBarraInferior}>{formatearPrecio(plan.price)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.botonPagar, procesando && styles.botonPagarDeshabilitado]}
          onPress={pagarConTarjeta}
          disabled={procesando}
        >
          {procesando ? (
            <ActivityIndicator color={colores.fondo} />
          ) : (
            <>
              <Ionicons name="lock-closed" size={18} color={colores.fondo} />
              <Text style={styles.textoBotonPagar}>Pagar con tarjeta</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={mostrarExito}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.superposicionModal}>
          <View style={styles.contenidoModal}>
            <LinearGradient
              colors={[colores.secundario, colores.secundarioOscuro]}
              style={styles.circuloIconoExito}
            >
              <Ionicons name="checkmark" size={48} color={colores.fondo} />
            </LinearGradient>

            <Text style={styles.tituloExito}>¡Pago exitoso!</Text>
            <Text style={styles.textoExito}>
              Tu {plan.name} está activo. Ya podés disfrutar de todos los beneficios.
            </Text>

            <TouchableOpacity
              style={styles.botonExito}
              onPress={async () => {
                setMostrarExito(false);
                await refrescarUsuario();
                navigation.navigate('Membresia');
              }}
            >
              <Text style={styles.textoBotonExito}>¡Perfecto!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={mostrarError}
        transparent
        animationType="fade"
        onRequestClose={() => setMostrarError(false)}
      >
        <View style={styles.superposicionModal}>
          <View style={styles.contenidoModal}>
            <View style={[styles.circuloIconoExito, { backgroundColor: 'rgba(255, 71, 87, 0.1)' }]}>
              <Ionicons name="close" size={48} color={colores.error} />
            </View>

            <Text style={[styles.tituloExito, { color: colores.error }]}>Error al procesar el pago</Text>
            <Text style={styles.textoExito}>{mensajeError}</Text>

            <TouchableOpacity
              style={[styles.botonExito, { backgroundColor: colores.error }]}
              onPress={() => setMostrarError(false)}
            >
              <Text style={styles.textoBotonExito}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenidoScroll: {
    paddingHorizontal: espaciado.xl,
    paddingTop: espaciado.md,
  },

  tarjetaResumenPlan: {
    borderRadius: radioBorde.xl,
    padding: espaciado.xl,
    marginBottom: espaciado.lg,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  encabezadoResumenPlan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.lg,
    marginBottom: espaciado.lg,
  },
  cajaIconoPlan: {
    width: 60,
    height: 60,
    borderRadius: radioBorde.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  informacionResumenPlan: {
    flex: 1,
  },
  nombreResumenPlan: {
    fontSize: tipografia.tamanos.lg,
    fontWeight: '700',
    color: colores.textoPrincipal,
    marginBottom: espaciado.xs,
  },
  precioResumenPlan: {
    fontSize: tipografia.tamanos.xxl,
    fontWeight: '800',
  },
  periodoResumenPlan: {
    fontSize: tipografia.tamanos.sm,
    fontWeight: '400',
    color: colores.textoAtenuado,
  },
  divisor: {
    height: 1,
    backgroundColor: colores.borde,
    marginBottom: espaciado.md,
  },
  caracteristicaResumenPlan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
    marginBottom: espaciado.sm,
  },
  textoCaracteristicaResumenPlan: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoSecundario,
    flex: 1,
  },

  encabezadoSeccion: {
    marginBottom: espaciado.lg,
  },
  tituloSeccion: {
    fontSize: tipografia.tamanos.lg,
    fontWeight: '700',
    color: colores.textoPrincipal,
    marginBottom: espaciado.xs,
  },
  subtituloSeccion: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoSecundario,
  },

  opcionPago: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.lg,
    padding: espaciado.lg,
    marginBottom: espaciado.md,
    borderWidth: 1,
    borderColor: colores.borde,
    gap: espaciado.lg,
  },
  opcionPagoPrimaria: {
    borderColor: colores.primario,
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
  },
  contenedorIconoOpcionPago: {
    width: 52,
    height: 52,
    borderRadius: radioBorde.xl,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  informacionOpcionPago: {
    flex: 1,
  },
  tituloOpcionPago: {
    fontSize: tipografia.tamanos.md,
    fontWeight: '600',
    color: colores.textoPrincipal,
    marginBottom: espaciado.xs,
  },
  descripcionOpcionPago: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoAtenuado,
    lineHeight: 16,
  },
  insigniaMp: {
    backgroundColor: '#00BFFF',
    borderRadius: radioBorde.sm,
    paddingHorizontal: espaciado.sm,
    paddingVertical: espaciado.xs,
  },
  textoInsigniaMp: {
    fontSize: 10,
    fontWeight: '800',
    color: colores.fondo,
    letterSpacing: 0.5,
  },

  barraInferior: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.fondoTarjeta,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
    paddingHorizontal: espaciado.xl,
    paddingTop: espaciado.lg,
    paddingBottom: espaciado.xxl,
    gap: espaciado.lg,
  },
  informacionBarraInferior: {
    flex: 0,
  },
  etiquetaBarraInferior: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoAtenuado,
    marginBottom: espaciado.xs,
  },
  precioBarraInferior: {
    fontSize: tipografia.tamanos.xl,
    fontWeight: '800',
    color: colores.primario,
  },
  botonPagar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.primario,
    borderRadius: radioBorde.lg,
    paddingVertical: espaciado.lg,
    gap: espaciado.sm,
    ...sombras.brillo,
  },
  botonPagarDeshabilitado: {
    backgroundColor: colores.fondoTarjeta,
    borderWidth: 1,
    borderColor: colores.borde,
    shadowOpacity: 0,
    elevation: 0,
  },
  textoBotonPagar: {
    fontSize: tipografia.tamanos.md,
    fontWeight: '700',
    color: colores.fondo,
  },

  superposicionModal: {
    flex: 1,
    backgroundColor: colores.superposicion,
    justifyContent: 'center',
    alignItems: 'center',
    padding: espaciado.xl,
  },
  contenidoModal: {
    width: '100%',
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.xxl,
    padding: espaciado.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colores.borde,
  },
  circuloIconoExito: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: espaciado.xl,
  },
  tituloExito: {
    fontSize: tipografia.tamanos.xxl,
    fontWeight: '700',
    color: colores.textoPrincipal,
    marginBottom: espaciado.md,
    textAlign: 'center',
  },
  textoExito: {
    fontSize: tipografia.tamanos.md,
    color: colores.textoSecundario,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: espaciado.xl,
  },
  botonExito: {
    backgroundColor: colores.primario,
    borderRadius: radioBorde.lg,
    paddingVertical: espaciado.lg,
    paddingHorizontal: espaciado.xxl,
    width: '100%',
    alignItems: 'center',
    ...sombras.brillo,
  },
  textoBotonExito: {
    fontSize: tipografia.tamanos.lg,
    fontWeight: '700',
    color: colores.fondo,
  },
});
