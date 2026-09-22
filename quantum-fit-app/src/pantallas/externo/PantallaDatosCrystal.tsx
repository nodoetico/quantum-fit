import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, espaciado, radioBorde, tipografia } from '../../constantes/tema';
import { useAuth } from '../../contexto/ContextoAuth';
import { servicioMyFit } from '../../servicios/api';
import type { PropsPantallaStackPrincipal } from '../../tipos/navegacion';
import type { TransaccionMyFit } from '../../tipos';

type Props = PropsPantallaStackPrincipal<'DatosCrystal'>;

export default function PantallaDatosCrystal({ navigation }: Props) {
  const { perfilExterno, asistenciasExternas, membresiasExternas, cargandoExterno, cargarDatosExternos } = useAuth();
  const [refrescando, setRefrescando] = useState(false);
  const [transacciones, setTransacciones] = useState<TransaccionMyFit[]>([]);
  const [cargandoTransacciones, setCargandoTransacciones] = useState(false);

  useEffect(() => {
    cargarTransacciones();
  }, []);

  const cargarTransacciones = async () => {
    setCargandoTransacciones(true);
    try {
      const datos = await servicioMyFit.obtenerTransacciones();
      setTransacciones(datos || []);
    } catch (e) {
    } finally {
      setCargandoTransacciones(false);
    }
  };

  const alRefrescar = async () => {
    setRefrescando(true);
    await Promise.all([cargarDatosExternos(), cargarTransacciones()]);
    setRefrescando(false);
  };

  const formatearFecha = (cadenaFecha: string) => {
    const d = new Date(cadenaFecha);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (cargandoExterno && !refrescando) {
    return (
      <View style={styles.contenedor}>
        <View style={styles.encabezado}>
          <TouchableOpacity style={styles.botonVolver} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colores.textoPrincipal} />
          </TouchableOpacity>
          <View style={styles.contenedorTituloEncabezado}>
            <Ionicons name="server-outline" size={20} color={colores.primario} />
            <Text style={styles.tituloEncabezado}>MyFit</Text>
          </View>
          <View style={styles.botonVolver} />
        </View>
        <View style={styles.contenedorSincronizando}>
          <ActivityIndicator size="large" color={colores.primario} />
          <Text style={styles.textoSincronizando}>Sincronizando con MyFit...</Text>
        </View>
      </View>
    );
  }

  if (!perfilExterno && asistenciasExternas.length === 0 && transacciones.length === 0) {
    return (
      <View style={styles.contenedor}>
        <View style={styles.encabezado}>
          <TouchableOpacity style={styles.botonVolver} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colores.textoPrincipal} />
          </TouchableOpacity>
          <View style={styles.contenedorTituloEncabezado}>
            <Ionicons name="server-outline" size={20} color={colores.primario} />
            <Text style={styles.tituloEncabezado}>MyFit</Text>
          </View>
          <View style={styles.botonVolver} />
        </View>
        <View style={styles.contenedorVacio}>
          <View style={styles.iconoVacio}>
            <Ionicons name="cloud-offline-outline" size={48} color={colores.textoAtenuado} />
          </View>
          <Text style={styles.tituloVacio}>Sin datos de MyFit</Text>
          <Text style={styles.subtituloVacio}>Deslizá para reintentar</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <TouchableOpacity style={styles.botonVolver} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colores.textoPrincipal} />
        </TouchableOpacity>
        <View style={styles.contenedorTituloEncabezado}>
          <Ionicons name="server-outline" size={20} color={colores.primario} />
          <Text style={styles.tituloEncabezado}>MyFit</Text>
        </View>
        <View style={styles.botonVolver} />
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={alRefrescar} tintColor={colores.primario} />}
        contentContainerStyle={styles.contenidoDesplazable}
        showsVerticalScrollIndicator={false}
      >
        {perfilExterno && (
          <View style={styles.tarjetaPerfil}>
            <View style={styles.avatarPerfil}>
              <Text style={styles.textoAvatarPerfil}>
                {perfilExterno.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
              </Text>
            </View>
            <Text style={styles.nombrePerfil}>{perfilExterno.name}</Text>
            {perfilExterno.email && (
              <Text style={styles.emailPerfil}>{perfilExterno.email}</Text>
            )}
            <View style={styles.metaPerfil}>
              {perfilExterno.dni && (
                <View style={styles.itemMeta}>
                  <Ionicons name="card-outline" size={14} color={colores.textoAtenuado} />
                  <Text style={styles.textoMeta}>DNI {perfilExterno.dni}</Text>
                </View>
              )}
              {perfilExterno.phone && (
                <View style={styles.itemMeta}>
                  <Ionicons name="call-outline" size={14} color={colores.textoAtenuado} />
                  <Text style={styles.textoMeta}>{perfilExterno.phone}</Text>
                </View>
              )}
            </View>
            {perfilExterno.balance !== undefined && (
              <View style={styles.filaSaldo}>
                <Text style={styles.etiquetaSaldo}>Saldo</Text>
                <Text style={styles.valorSaldo}>${perfilExterno.balance.toLocaleString()}</Text>
              </View>
            )}
          </View>
        )}

        {membresiasExternas.length > 0 && (
          <View style={styles.seccion}>
            <View style={styles.encabezadoSeccion}>
              <Ionicons name="card-outline" size={18} color={colores.secundario} />
              <Text style={styles.tituloSeccion}>Membresías</Text>
            </View>
            {membresiasExternas.map((m: any, i: number) => (
              <View key={i} style={styles.tarjetaMembresia}>
                <View style={styles.encabezadoMembresia}>
                  <View style={[styles.puntoMembresia, {
                    backgroundColor: m.status === 'active' || m.status === 'activa' ? colores.secundario : colores.advertencia
                  }]} />
                  <Text style={styles.tipoMembresia}>{m.name || m.type || m.plan?.name || 'Membresía'}</Text>
                  <View style={[styles.estadoMembresia, {
                    backgroundColor: m.status === 'active' || m.status === 'activa'
                      ? 'rgba(57, 255, 20, 0.15)' : 'rgba(255, 215, 0, 0.15)'
                  }]}>
                    <Text style={[styles.textoEstadoMembresia, {
                      color: m.status === 'active' || m.status === 'activa' ? colores.secundario : colores.advertencia
                    }]}>
                      {m.status || 'Activa'}
                    </Text>
                  </View>
                </View>
                {(m.start_date || m.end_date) && (
                  <View style={styles.fechasMembresia}>
                    {m.start_date && (
                      <View style={styles.itemFecha}>
                        <Ionicons name="calendar-outline" size={13} color={colores.textoAtenuado} />
                        <Text style={styles.textoFecha}>Inicio: {formatearFecha(m.start_date)}</Text>
                      </View>
                    )}
                    {m.end_date && (
                      <View style={styles.itemFecha}>
                        <Ionicons name="calendar-outline" size={13} color={colores.textoAtenuado} />
                        <Text style={styles.textoFecha}>Fin: {formatearFecha(m.end_date)}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {asistenciasExternas.length > 0 && (
          <View style={styles.seccion}>
            <View style={styles.encabezadoSeccion}>
              <Ionicons name="calendar-outline" size={18} color={colores.primario} />
              <Text style={styles.tituloSeccion}>Asistencias ({asistenciasExternas.length})</Text>
            </View>
            <View style={styles.listaAsistencias}>
              {asistenciasExternas.slice(0, 15).map((a: any, i: number) => (
                <View key={i} style={styles.itemAsistencia}>
                  <View style={styles.puntoAsistencia} />
                  <View style={styles.infoAsistencia}>
                    <Text style={styles.fechaAsistencia}>{formatearFecha(a.date || a.checkInTime || a.createdAt)}</Text>
                    {a.location && <Text style={styles.ubicacionAsistencia}>{a.location}</Text>}
                  </View>
                  <Text style={styles.horaAsistencia}>
                    {new Date(a.date || a.checkInTime || a.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {cargandoTransacciones ? (
          <View style={styles.filaCargando}>
            <ActivityIndicator size="small" color={colores.primario} />
            <Text style={styles.textoCargando}>Cargando transacciones...</Text>
          </View>
        ) : transacciones.length > 0 && (
          <View style={styles.seccion}>
            <View style={styles.encabezadoSeccion}>
              <Ionicons name="receipt-outline" size={18} color={colores.puntos} />
              <Text style={styles.tituloSeccion}>Transacciones ({transacciones.length})</Text>
            </View>
            {transacciones.slice(0, 10).map((tx, i) => (
              <View key={tx.id ?? i} style={styles.tarjetaTransaccion}>
                <View style={styles.izquierdaTransaccion}>
                  <Text style={styles.tituloTransaccion}>{tx.title || 'Transacción'}</Text>
                  {tx.date && <Text style={styles.fechaTransaccion}>{formatearFecha(tx.date)}</Text>}
                </View>
                <View style={styles.derechaTransaccion}>
                  {tx.total_amount !== undefined && (
                    <Text style={styles.montoTransaccion}>${tx.total_amount.toLocaleString()}</Text>
                  )}
                  <Text style={[styles.estadoTransaccion, { color: tx.is_paid ? colores.secundario : colores.error }]}>
                    {tx.is_paid ? 'Pagado' : (tx.debt || 0) > 0 ? `Debe $${tx.debt}` : 'Pendiente'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
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
  contenedorSincronizando: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: espaciado.md,
  },
  textoSincronizando: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoSecundario,
  },
  contenedorVacio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: espaciado.md,
  },
  iconoVacio: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colores.fondoTarjeta,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colores.borde,
  },
  tituloVacio: {
    fontSize: tipografia.tamanos.lg,
    fontWeight: '600',
    color: colores.textoPrincipal,
  },
  subtituloVacio: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoAtenuado,
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: espaciado.xl,
    paddingTop: espaciado.xxl,
    paddingBottom: espaciado.md,
    backgroundColor: colores.fondoSecundario,
  },
  botonVolver: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colores.fondoTarjeta,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contenedorTituloEncabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
  },
  tituloEncabezado: {
    fontSize: tipografia.tamanos.lg,
    fontWeight: '700',
    color: colores.textoPrincipal,
  },
  contenidoDesplazable: {
    padding: espaciado.xl,
    paddingTop: espaciado.lg,
  },
  tarjetaPerfil: {
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.xl,
    padding: espaciado.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colores.borde,
    marginBottom: espaciado.xl,
  },
  avatarPerfil: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: espaciado.md,
    borderWidth: 2,
    borderColor: colores.primario,
  },
  textoAvatarPerfil: {
    fontSize: 28,
    fontWeight: '700',
    color: colores.primario,
  },
  nombrePerfil: {
    fontSize: tipografia.tamanos.xl,
    fontWeight: '700',
    color: colores.textoPrincipal,
    marginBottom: espaciado.xs,
  },
  emailPerfil: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoSecundario,
    marginBottom: espaciado.md,
  },
  metaPerfil: {
    flexDirection: 'row',
    gap: espaciado.lg,
    marginBottom: espaciado.lg,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.xs,
  },
  textoMeta: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoAtenuado,
  },
  filaSaldo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingTop: espaciado.md,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
  },
  etiquetaSaldo: {
    fontSize: tipografia.tamanos.md,
    color: colores.textoSecundario,
  },
  valorSaldo: {
    fontSize: tipografia.tamanos.xl,
    fontWeight: '700',
    color: colores.puntos,
  },
  seccion: {
    marginBottom: espaciado.xl,
  },
  encabezadoSeccion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
    marginBottom: espaciado.md,
  },
  tituloSeccion: {
    fontSize: tipografia.tamanos.lg,
    fontWeight: '600',
    color: colores.textoPrincipal,
  },
  tarjetaMembresia: {
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.lg,
    padding: espaciado.lg,
    borderWidth: 1,
    borderColor: colores.borde,
    marginBottom: espaciado.sm,
  },
  encabezadoMembresia: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
    marginBottom: espaciado.sm,
  },
  puntoMembresia: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tipoMembresia: {
    flex: 1,
    fontSize: tipografia.tamanos.md,
    fontWeight: '600',
    color: colores.textoPrincipal,
  },
  estadoMembresia: {
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.xs,
    borderRadius: radioBorde.full,
  },
  textoEstadoMembresia: {
    fontSize: tipografia.tamanos.xs,
    fontWeight: '600',
  },
  fechasMembresia: {
    gap: espaciado.xs,
  },
  itemFecha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.xs,
  },
  textoFecha: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoSecundario,
  },
  listaAsistencias: {
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.lg,
    borderWidth: 1,
    borderColor: colores.borde,
    overflow: 'hidden',
  },
  itemAsistencia: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: espaciado.md,
    paddingHorizontal: espaciado.lg,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
    gap: espaciado.md,
  },
  puntoAsistencia: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colores.primario,
  },
  infoAsistencia: {
    flex: 1,
  },
  fechaAsistencia: {
    fontSize: tipografia.tamanos.sm,
    fontWeight: '500',
    color: colores.textoPrincipal,
  },
  ubicacionAsistencia: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoAtenuado,
    marginTop: 2,
  },
  horaAsistencia: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoAtenuado,
  },
  filaCargando: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaciado.sm,
    paddingVertical: espaciado.xl,
  },
  textoCargando: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoSecundario,
  },
  tarjetaTransaccion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.lg,
    padding: espaciado.lg,
    borderWidth: 1,
    borderColor: colores.borde,
    marginBottom: espaciado.sm,
  },
  izquierdaTransaccion: {
    flex: 1,
    marginRight: espaciado.md,
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
  },
  derechaTransaccion: {
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
