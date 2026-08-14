// Pantalla de Historial de Pagos - Muestra las transacciones desde Crystal MiFit
// y los pagos registrados localmente en QuantumFit.
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, espaciado, tipografia, radioBorde } from '../../constantes/tema';
import { servicioPagos } from '../../servicios/api';
import type { TransaccionCrystal, PagoLocal } from '../../tipos';
import { EncabezadoPantalla, EstadoCargando, EstadoVacio } from '../../componentes';
import type { PropsPantallaStackPrincipal } from '../../tipos/navegacion';

type PropsPantallaHistorialPagos = PropsPantallaStackPrincipal<'HistorialPagos'>;

export default function PantallaHistorialPagos({ navigation }: PropsPantallaHistorialPagos) {
  const [transacciones, setTransacciones] = useState<TransaccionCrystal[]>([]);
  const [pagosLocales, setPagosLocales] = useState<PagoLocal[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [pestanaActiva, setPestanaActiva] = useState<'sistema' | 'quantumfit'>('sistema');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [txs, pagos] = await Promise.all([
        servicioPagos.obtenerTransacciones(50).catch(() => []),
        servicioPagos.obtenerMiHistorialPagos().catch(() => []),
      ]);
      setTransacciones(txs);
      setPagosLocales(pagos);
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

  const formatearFecha = (cadenaFecha: string) => {
    const fecha = new Date(cadenaFecha);
    return fecha.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const obtenerIconoTransaccion = (categoria: string | null) => {
    switch (categoria) {
      case 'Membresías': return 'card';
      case 'Inscripción': return 'school';
      default: return 'receipt';
    }
  };

  const obtenerColorTransaccion = (estaPagado: boolean, deuda: number) => {
    if (estaPagado) return colores.secundario;
    if (deuda > 0) return colores.error;
    return colores.textoSecundario;
  };

  if (cargando && !refrescando) {
    return (
      <View style={styles.contenedor}>
        <EncabezadoPantalla titulo="Historial" alVolver={() => navigation.goBack()} />
        <EstadoCargando />
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <EncabezadoPantalla titulo="Historial" alVolver={() => navigation.goBack()} />

      {/* Tabs */}
      <View style={styles.barraPestanas}>
        <TouchableOpacity
          style={[styles.pestana, pestanaActiva === 'sistema' && styles.pestanaActiva]}
          onPress={() => setPestanaActiva('sistema')}
        >
          <Text style={[styles.textoPestana, pestanaActiva === 'sistema' && styles.textoPestanaActiva]}>
            Sistema
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pestana, pestanaActiva === 'quantumfit' && styles.pestanaActiva]}
          onPress={() => setPestanaActiva('quantumfit')}
        >
          <Text style={[styles.textoPestana, pestanaActiva === 'quantumfit' && styles.textoPestanaActiva]}>
            QuantumFit
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contenidoScroll}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={alRefrescar} tintColor={colores.primario} />
        }
      >
        {pestanaActiva === 'sistema' && (
          transacciones.length > 0 ? (
            transacciones.map((tx) => (
              <View key={tx.id} style={styles.tarjetaTransaccion}>
                <View style={[styles.contenedorIconoTransaccion, {
                  backgroundColor: tx.is_paid
                    ? 'rgba(57, 255, 20, 0.1)'
                    : 'rgba(255, 71, 87, 0.1)',
                }]}>
                  <Ionicons
                    name={obtenerIconoTransaccion(tx.category) as any}
                    size={22}
                    color={obtenerColorTransaccion(tx.is_paid, tx.debt)}
                  />
                </View>
                <View style={styles.informacionTransaccion}>
                  <Text style={styles.tituloTransaccion}>{tx.title}</Text>
                  <Text style={styles.fechaTransaccion}>{formatearFecha(tx.date)}</Text>
                  {tx.category && (
                    <Text style={styles.categoriaTransaccion}>{tx.category}</Text>
                  )}
                </View>
                <View style={styles.contenedorMonto}>
                  <Text style={styles.montoTransaccion}>
                    ${tx.total_amount.toLocaleString('es-AR')}
                  </Text>
                  <Text style={[styles.estadoTransaccion, {
                    color: tx.is_paid ? colores.secundario : colores.error,
                  }]}>
                    {tx.is_paid ? 'Pagado' : tx.debt > 0 ? `Debe $${tx.debt}` : 'Pendiente'}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <EstadoVacio icono="receipt-outline" tamanoIcono={48} titulo="Sin transacciones en el sistema" />
          )
        )}

        {pestanaActiva === 'quantumfit' && (
          pagosLocales.length > 0 ? (
            pagosLocales.map((p) => (
              <View key={p.id} style={styles.tarjetaTransaccion}>
                <View style={[styles.contenedorIconoTransaccion, {
                  backgroundColor: p.status === 'APPROVED'
                    ? 'rgba(57, 255, 20, 0.1)'
                    : 'rgba(255, 215, 0, 0.1)',
                }]}>
                  <Ionicons
                    name="wallet-outline"
                    size={22}
                    color={p.status === 'APPROVED' ? colores.secundario : colores.advertencia}
                  />
                </View>
                <View style={styles.informacionTransaccion}>
                  <Text style={styles.tituloTransaccion}>{p.description || 'Pago QuantumFit'}</Text>
                  <Text style={styles.fechaTransaccion}>
                    {formatearFecha(p.paidAt || p.createdAt)}
                  </Text>
                </View>
                <View style={styles.contenedorMonto}>
                  <Text style={styles.montoTransaccion}>
                    ${p.amount.toLocaleString('es-AR')}
                  </Text>
                  <Text style={[styles.estadoTransaccion, {
                    color: p.status === 'APPROVED' ? colores.secundario : colores.advertencia,
                  }]}>
                    {p.status === 'APPROVED' ? 'Aprobado' : p.status}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <EstadoVacio icono="wallet-outline" tamanoIcono={48} titulo="Sin pagos registrados en QuantumFit" />
          )
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  barraPestanas: {
    flexDirection: 'row',
    marginHorizontal: espaciado.xl,
    marginBottom: espaciado.lg,
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.lg,
    padding: espaciado.xs,
  },
  pestana: {
    flex: 1,
    paddingVertical: espaciado.md,
    alignItems: 'center',
    borderRadius: radioBorde.md,
  },
  pestanaActiva: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
  },
  textoPestana: {
    fontSize: tipografia.tamanos.sm,
    fontWeight: '600',
    color: colores.textoAtenuado,
  },
  textoPestanaActiva: {
    color: colores.primario,
  },
  contenidoScroll: {
    paddingHorizontal: espaciado.xl,
  },
  tarjetaTransaccion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.lg,
    padding: espaciado.lg,
    marginBottom: espaciado.sm,
    borderWidth: 1,
    borderColor: colores.borde,
    gap: espaciado.md,
  },
  contenedorIconoTransaccion: {
    width: 44,
    height: 44,
    borderRadius: radioBorde.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  informacionTransaccion: {
    flex: 1,
  },
  tituloTransaccion: {
    fontSize: tipografia.tamanos.sm,
    fontWeight: '600',
    color: colores.textoPrincipal,
    marginBottom: espaciado.xs,
  },
  fechaTransaccion: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoAtenuado,
    marginBottom: 2,
  },
  categoriaTransaccion: {
    fontSize: tipografia.tamanos.xs,
    color: colores.primario,
    fontWeight: '500',
  },
  contenedorMonto: {
    alignItems: 'flex-end',
  },
  montoTransaccion: {
    fontSize: tipografia.tamanos.md,
    fontWeight: '700',
    color: colores.textoPrincipal,
    marginBottom: espaciado.xs,
  },
  estadoTransaccion: {
    fontSize: tipografia.tamanos.xs,
    fontWeight: '600',
  },
});
