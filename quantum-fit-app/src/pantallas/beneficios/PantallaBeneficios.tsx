import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colores, espaciado, radioBorde, tipografia, sombras } from '../../constantes/tema';
import { useAuth } from '../../contexto/ContextoAuth';
import { servicioPremios } from '../../servicios/api';
import { Premio } from '../../tipos';
import { EncabezadoPantalla, EstadoCargando, EstadoError, EstadoVacio } from '../../componentes';
import type { PropsPantallaTabPrincipal } from '../../tipos/navegacion';

type PropsPantallaBeneficios = PropsPantallaTabPrincipal<'Beneficios'>;

export default function PantallaBeneficios({ navigation }: PropsPantallaBeneficios) {
  const { usuario, refrescarUsuario } = useAuth();
  const [premios, setPremios] = useState<Premio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
  const [premioSeleccionado, setPremioSeleccionado] = useState<Premio | null>(null);
  const [modalCanjeVisible, setModalCanjeVisible] = useState(false);
  const [canjeando, setCanjeando] = useState(false);
  const [modalExitoVisible, setModalExitoVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categorias = ['Todos', 'PRODUCTO', 'BEBIDA', 'DESCUENTO', 'PROMOCION'];

  const obtenerEtiquetaCategoria = (categoria: string) => {
    switch (categoria) {
      case 'PRODUCTO': return 'Productos';
      case 'BEBIDA': return 'Bebidas';
      case 'DESCUENTO': return 'Descuentos';
      case 'PROMOCION': return 'Promociones';
      default: return categoria;
    }
  };

  // Cargar premios
  useEffect(() => {
    cargarPremios();
  }, []);

  const cargarPremios = async () => {
    try {
      setCargando(true);
      setError(null);
      const datos = await servicioPremios.obtenerTodos();
      setPremios(datos);
    } catch (err) {
      console.error('cargarPremios falló:', err);
      setError('No se pudieron cargar los rewards. Intenta nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  const alRefrescar = async () => {
    setRefrescando(true);
    await cargarPremios();
    setRefrescando(false);
  };

  const obtenerIconoCategoria = (categoria: string) => {
    switch (categoria) {
      case 'PRODUCTO':
        return 'shirt';
      case 'BEBIDA':
        return 'cafe';
      case 'DESCUENTO':
        return 'pricetag';
      case 'PROMOCION':
        return 'gift';
      default:
        return 'grid';
    }
  };

  const obtenerColorCategoria = (categoria: string) => {
    switch (categoria) {
      case 'PRODUCTO':
        return colores.primario;
      case 'BEBIDA':
        return colores.secundario;
      case 'DESCUENTO':
        return colores.puntos;
      case 'PROMOCION':
        return colores.error;
      default:
        return colores.textoSecundario;
    }
  };

  const premiosFiltrados = premios.filter(premio => {
    if (categoriaSeleccionada === 'Todos') return true;
    return premio.category === categoriaSeleccionada;
  });

  const manejarCanjear = async () => {
    if (!premioSeleccionado || !usuario) return;

    if (usuario.points < premioSeleccionado.pointsCost) {
      return;
    }

    setCanjeando(true);
    try {
      await servicioPremios.canjear(premioSeleccionado.id);
      await refrescarUsuario();
      setModalCanjeVisible(false);
      setModalExitoVisible(true);
      await cargarPremios();
    } catch (err) {
      console.error('manejarCanjear falló:', err);
      Alert.alert('Error', 'Error al canjear el reward. Intenta nuevamente.');
    } finally {
      setCanjeando(false);
    }
    setPremioSeleccionado(null);
  };

  const puedePagar = usuario && premioSeleccionado && usuario.points >= premioSeleccionado.pointsCost;

  return (
    <View style={styles.contenedor}>
      <EncabezadoPantalla titulo="Beneficios" alVolver={() => navigation.goBack()} accionDerecha={
        <TouchableOpacity style={styles.botonHistorial} onPress={() => navigation.navigate('HistorialPremios')}>
          <Ionicons name="time-outline" size={24} color={colores.textoPrincipal} />
        </TouchableOpacity>
      } />

      {/* Resumen de Puntos */}
      <LinearGradient
        colors={[colores.primario, colores.primarioOscuro]}
        style={styles.tarjetaPuntos}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.contenidoPuntos}>
          <View>
            <Text style={[styles.etiquetaPuntos, { color: '#000000' }]}>Tus Puntos</Text>
            <Text style={styles.valorPuntos}>{usuario?.points.toLocaleString() || 0}</Text>
          </View>
          <View style={styles.iconoPuntos}>
            <Ionicons name="trophy" size={40} color={colores.fondo} />
          </View>
        </View>
        <Text style={styles.subtituloPuntos}>
          Canjea tus puntos por productos, bebidas y descuentos exclusivos
        </Text>
      </LinearGradient>

      {/* Categorías */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.contenedorCategorias}
        contentContainerStyle={styles.contenidoCategorias}
      >
        {categorias.map((categoria, indice) => (
          <TouchableOpacity
            key={indice}
            style={[
              styles.chipCategoria,
              categoriaSeleccionada === categoria && styles.chipCategoriaSeleccionado,
            ]}
            onPress={() => setCategoriaSeleccionada(categoria)}
          >
            <Ionicons
              name={
                categoria === 'Todos'
                  ? 'grid'
                  : categoria === 'PRODUCTO'
                  ? 'shirt'
                  : categoria === 'BEBIDA'
                  ? 'cafe'
                  : categoria === 'DESCUENTO'
                  ? 'pricetag'
                  : 'gift'
              }
              size={18}
              color={categoriaSeleccionada === categoria ? colores.fondo : colores.textoSecundario}
              style={styles.iconoCategoria}
            />
            <Text
              style={[
                styles.textoCategoria,
                categoriaSeleccionada === categoria && styles.textoCategoriaSeleccionado,
              ]}
            >
              {obtenerEtiquetaCategoria(categoria)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Cuadrícula de Premios */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listaPremios}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={alRefrescar} tintColor={colores.primario} />
        }
      >
        {cargando && (
          <EstadoCargando mensaje="Cargando rewards..." />
        )}
        {error && (
          <EstadoError mensaje={error} alReintentar={cargarPremios} />
        )}
        {!cargando && !error && premiosFiltrados.length === 0 && (
          <EstadoVacio icono="gift-outline" tamanoIcono={48} titulo="No hay rewards disponibles" />
        )}
        {!cargando && !error && premiosFiltrados.length > 0 && premiosFiltrados.map((premio) => {
          const puedePagarPremio = usuario && usuario.points >= premio.pointsCost;
          const estaDisponible = premio.isActive && premio.stockAvailable > 0;

          return (
            <TouchableOpacity
              key={premio.id}
              style={[
                styles.tarjetaPremio,
                !estaDisponible && styles.tarjetaPremioCanjeado,
                !puedePagarPremio && styles.tarjetaPremioDeshabilitado,
              ]}
              onPress={() => {
                if (estaDisponible) {
                  setPremioSeleccionado(premio);
                  setModalCanjeVisible(true);
                }
              }}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={
                  !estaDisponible
                    ? ['rgba(57, 255, 20, 0.05)', 'rgba(0, 0, 0, 0)']
                    : puedePagarPremio
                    ? ['rgba(255, 255, 255, 0.03)', 'rgba(0, 0, 0, 0)']
                    : ['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0)']
                }
                style={styles.gradientePremio}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.encabezadoPremio}>
                  <View
                    style={[
                      styles.contenedorIconoPremio,
                      { backgroundColor: `${obtenerColorCategoria(premio.category)}20` },
                    ]}
                  >
                    <Ionicons
                      name={obtenerIconoCategoria(premio.category)}
                      size={28}
                      color={obtenerColorCategoria(premio.category)}
                    />
                  </View>
                  {!estaDisponible && (
                    <View style={styles.insigniaCanjeado}>
                      <Ionicons name="checkmark-circle" size={16} color={colores.secundario} />
                      <Text style={styles.textoInsigniaCanjeado}>Agotado</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.nombrePremio}>{premio.name}</Text>
                <Text style={styles.descripcionPremio} numberOfLines={2}>{premio.description}</Text>

                <View style={styles.piePremio}>
                  <View style={styles.contenedorCostoPuntos}>
                    <Ionicons name="trophy" size={16} color={colores.puntos} />
                    <Text style={styles.textoCostoPuntos}>{premio.pointsCost.toLocaleString()}</Text>
                  </View>
                  <View style={styles.contenedorStock}>
                    <Ionicons name="cube-outline" size={14} color={colores.textoAtenuado} />
                    <Text style={styles.textoStock}>{premio.stockAvailable} disponibles</Text>
                  </View>
                </View>

                {/* Overlay de "No alcanza" */}
                {!puedePagarPremio && estaDisponible && (
                  <View style={styles.superposicionNoAlcanza}>
                    <Ionicons name="lock-closed" size={18} color={colores.textoAtenuado} />
                    <Text style={styles.textoNoAlcanza}>
                      {`Te faltan ${(premio.pointsCost - (usuario?.points || 0)).toLocaleString()} puntos`}
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Modal de Canje */}
      <Modal
        visible={modalCanjeVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setModalCanjeVisible(false);
          setPremioSeleccionado(null);
        }}
      >
        <View style={styles.superposicionModal}>
          <View style={styles.contenidoModal}>
            {premioSeleccionado && (
              <>
                <View style={styles.encabezadoModal}>
                  <View
                    style={[
                      styles.contenedorIconoModal,
                      { backgroundColor: `${obtenerColorCategoria(premioSeleccionado.category)}20` },
                    ]}
                  >
                    <Ionicons
                      name={obtenerIconoCategoria(premioSeleccionado.category)}
                      size={40}
                      color={obtenerColorCategoria(premioSeleccionado.category)}
                    />
                  </View>
                  <Text style={styles.tituloModal}>Canjear Premio</Text>
                </View>

                <View style={styles.cuerpoModal}>
                  <Text style={styles.nombrePremioModal}>{premioSeleccionado.name}</Text>
                  <Text style={styles.descripcionPremioModal}>{premioSeleccionado.description}</Text>

                  <View style={styles.infoPuntosModal}>
                    <View style={styles.filaPuntosModal}>
                      <Text style={styles.etiquetaPuntosModal}>Costo</Text>
                      <View style={styles.costoPuntosModal}>
                        <Ionicons name="trophy" size={18} color={colores.puntos} />
                        <Text style={styles.textoCostoPuntosModal}>
                          {premioSeleccionado.pointsCost.toLocaleString()}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.filaPuntosModal}>
                      <Text style={styles.etiquetaPuntosModal}>Tu saldo</Text>
                      <View style={styles.saldoPuntosModal}>
                        <Ionicons name="trophy" size={18} color={colores.primario} />
                        <Text style={styles.textoSaldoPuntosModal}>
                          {usuario?.points.toLocaleString() || 0}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {!puedePagar && (
                    <View style={styles.advertenciaPuntosInsuficientes}>
                      <Ionicons name="warning" size={20} color={colores.advertencia} />
                      <Text style={styles.textoPuntosInsuficientes}>
                        No tienes suficientes puntos
                      </Text>
                    </View>
                  )}

                  <View style={styles.terminosModal}>
                    <Ionicons name="information-circle" size={16} color={colores.textoAtenuado} />
                    <Text style={styles.textoTerminosModal}>
                      El premio estará disponible para retirar en recepción dentro de 24hs
                    </Text>
                  </View>
                </View>

                <View style={styles.accionesModal}>
                  <TouchableOpacity
                    style={styles.botonCancelarModal}
                    onPress={() => {
                      setModalCanjeVisible(false);
                      setPremioSeleccionado(null);
                    }}
                  >
                    <Text style={styles.textoBotonCancelarModal}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.botonConfirmarModal,
                      !puedePagar && styles.botonConfirmarModalDeshabilitado,
                    ]}
                    onPress={manejarCanjear}
                    disabled={canjeando || !puedePagar}
                  >
                    {canjeando ? (
                      <ActivityIndicator color={colores.fondo} />
                    ) : (
                      <>
                        <Ionicons
                          name="gift"
                          size={20}
                          color={puedePagar ? colores.fondo : colores.textoAtenuado}
                          style={styles.iconoRegalo}
                        />
                        <Text
                          style={[
                            styles.textoBotonConfirmarModal,
                            !puedePagar && styles.textoBotonConfirmarModalDeshabilitado,
                          ]}
                        >
                          Canjear Ahora
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de Éxito */}
      <Modal
        visible={modalExitoVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalExitoVisible(false)}
      >
        <View style={styles.superposicionExito}>
          <View style={styles.contenidoExito}>
            <View style={styles.iconoExito}>
              <LinearGradient
                colors={[colores.secundario, colores.secundarioOscuro]}
                style={styles.gradienteIconoExito}
              >
                <Ionicons name="checkmark" size={48} color={colores.fondo} />
              </LinearGradient>
            </View>
            <Text style={styles.tituloExito}>¡Canje Exitoso!</Text>
            <Text style={styles.textoExito}>
              Tu premio ha sido reservado. Pasa por recepción para retirarlo.
            </Text>
            <TouchableOpacity
              style={styles.botonExito}
              onPress={() => setModalExitoVisible(false)}
            >
              <Text style={styles.textoBotonExito}>¡Genial!</Text>
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
  botonHistorial: {
    width: 40,
    height: 40,
    borderRadius: radioBorde.full,
    backgroundColor: colores.fondoTarjeta,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tarjetaPuntos: {
    marginHorizontal: espaciado.xl,
    marginTop: espaciado.md,
    borderRadius: radioBorde.xl,
    padding: espaciado.lg,
    ...sombras.grande,
  },
  contenidoPuntos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: espaciado.md,
  },
  etiquetaPuntos: {
    fontSize: tipografia.tamanos.sm,
    color: '#000000', // Texto negro para mejor contraste
    fontWeight: '600',
    marginBottom: espaciado.xs,
  },
  valorPuntos: {
    fontSize: tipografia.tamanos.xxxl,
    fontWeight: '800',
    color: colores.fondo,
  },
  iconoPuntos: {
    opacity: 0.3,
  },
  subtituloPuntos: {
    fontSize: tipografia.tamanos.sm,
    color: '#000000', // Texto negro para mejor contraste con el fondo cyan
    lineHeight: 18,
    fontWeight: '500',
  },
  contenedorCategorias: {
    marginTop: espaciado.lg,
    marginBottom: espaciado.md,
    minHeight: 55, // Altura mínima para que no se corte
  },
  contenidoCategorias: {
    paddingHorizontal: espaciado.xl,
    paddingVertical: espaciado.sm,
  },
  chipCategoria: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.full,
    paddingVertical: espaciado.sm,
    paddingHorizontal: espaciado.lg,
    marginRight: espaciado.sm,
    borderWidth: 1,
    borderColor: colores.borde,
    minHeight: 44, // Altura mínima consistente
    maxHeight: 44, // Altura máxima para que no crezca
    height: 44, // Altura fija
  },
  chipCategoriaSeleccionado: {
    backgroundColor: colores.primario,
    borderColor: colores.primario,
    // Sin cambios de padding o altura para evitar que se agrande
  },
  iconoCategoria: {
    marginRight: espaciado.xs,
  },
  textoCategoria: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoSecundario,
    fontWeight: '500',
    // Sin maxWidth para que el texto no se corte
  },
  textoCategoriaSeleccionado: {
    color: colores.fondo,
    fontWeight: '600',
  },
  listaPremios: {
    paddingHorizontal: espaciado.xl,
    paddingTop: espaciado.lg,
    paddingBottom: 100,
  },
  tarjetaPremio: {
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.xl,
    marginBottom: espaciado.md,
    borderWidth: 1,
    borderColor: colores.borde,
    overflow: 'hidden',
    minHeight: 220, // Altura mínima para que haya espacio para todo
    width: '100%', // Ancho completo del contenedor
    position: 'relative', // Para que el overlay se posicione relativo a la tarjeta
  },
  tarjetaPremioCanjeado: {
    borderColor: colores.secundario,
  },
  tarjetaPremioDeshabilitado: {
    opacity: 0.6,
  },
  gradientePremio: {
    padding: espaciado.lg,
    minHeight: 220, // Altura mínima para consistencia
    position: 'relative', // Contenido en flujo normal
  },
  encabezadoPremio: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: espaciado.md,
  },
  contenedorIconoPremio: {
    width: 50,
    height: 50,
    borderRadius: radioBorde.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insigniaCanjeado: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.sm,
    borderRadius: radioBorde.full,
    gap: espaciado.xs,
  },
  textoInsigniaCanjeado: {
    fontSize: tipografia.tamanos.xs,
    fontWeight: '600',
    color: colores.secundario,
  },
  nombrePremio: {
    fontSize: tipografia.tamanos.md,
    fontWeight: '600',
    color: colores.textoPrincipal,
    marginBottom: espaciado.xs,
    lineHeight: 20,
  },
  descripcionPremio: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoSecundario,
    marginBottom: espaciado.md,
    lineHeight: 20,
    minHeight: 36, // Espacio consistente para descripción
  },
  piePremio: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contenedorCostoPuntos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.xs,
  },
  textoCostoPuntos: {
    fontSize: tipografia.tamanos.lg,
    fontWeight: '700',
    color: colores.puntos,
  },
  contenedorStock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.xs,
  },
  textoStock: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoAtenuado,
  },
  superposicionNoAlcanza: {
    marginTop: espaciado.md,
    paddingTop: espaciado.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: radioBorde.lg,
    padding: espaciado.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaciado.sm,
  },
  textoNoAlcanza: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoAtenuado,
    textAlign: 'center',
    lineHeight: 18,
    flex: 1,
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
    padding: espaciado.xl,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  encabezadoModal: {
    alignItems: 'center',
    marginBottom: espaciado.xl,
  },
  contenedorIconoModal: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: espaciado.md,
  },
  tituloModal: {
    fontSize: tipografia.tamanos.xl,
    fontWeight: '700',
    color: colores.textoPrincipal,
  },
  cuerpoModal: {
    marginBottom: espaciado.xl,
  },
  nombrePremioModal: {
    fontSize: tipografia.tamanos.lg,
    fontWeight: '600',
    color: colores.textoPrincipal,
    textAlign: 'center',
    marginBottom: espaciado.sm,
  },
  descripcionPremioModal: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoSecundario,
    textAlign: 'center',
    lineHeight: 18,
  },
  infoPuntosModal: {
    backgroundColor: colores.fondo,
    borderRadius: radioBorde.lg,
    padding: espaciado.lg,
    marginTop: espaciado.lg,
  },
  filaPuntosModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: espaciado.md,
  },
  etiquetaPuntosModal: {
    fontSize: tipografia.tamanos.md,
    color: colores.textoSecundario,
  },
  costoPuntosModal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.xs,
  },
  textoCostoPuntosModal: {
    fontSize: tipografia.tamanos.lg,
    fontWeight: '700',
    color: colores.puntos,
  },
  saldoPuntosModal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.xs,
  },
  textoSaldoPuntosModal: {
    fontSize: tipografia.tamanos.lg,
    fontWeight: '700',
    color: colores.primario,
  },
  advertenciaPuntosInsuficientes: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: radioBorde.lg,
    padding: espaciado.md,
    marginTop: espaciado.md,
    gap: espaciado.sm,
  },
  textoPuntosInsuficientes: {
    fontSize: tipografia.tamanos.sm,
    fontWeight: '600',
    color: colores.advertencia,
  },
  terminosModal: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colores.fondo,
    borderRadius: radioBorde.lg,
    padding: espaciado.md,
    marginTop: espaciado.lg,
    gap: espaciado.sm,
  },
  textoTerminosModal: {
    flex: 1,
    fontSize: tipografia.tamanos.xs,
    color: colores.textoAtenuado,
    lineHeight: 16,
  },
  accionesModal: {
    flexDirection: 'row',
    gap: espaciado.md,
  },
  botonCancelarModal: {
    flex: 1,
    backgroundColor: colores.fondo,
    borderRadius: radioBorde.lg,
    paddingVertical: espaciado.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colores.borde,
  },
  textoBotonCancelarModal: {
    fontSize: tipografia.tamanos.md,
    fontWeight: '600',
    color: colores.textoPrincipal,
  },
  botonConfirmarModal: {
    flex: 1,
    backgroundColor: colores.primario,
    borderRadius: radioBorde.lg,
    paddingVertical: espaciado.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    ...sombras.brillo,
  },
  botonConfirmarModalDeshabilitado: {
    backgroundColor: colores.fondoTarjeta,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  iconoRegalo: {
    marginRight: espaciado.sm,
  },
  textoBotonConfirmarModal: {
    fontSize: tipografia.tamanos.md,
    fontWeight: '700',
    color: colores.fondo,
  },
  textoBotonConfirmarModalDeshabilitado: {
    color: colores.textoAtenuado,
  },
  superposicionExito: {
    flex: 1,
    backgroundColor: colores.superposicion,
    justifyContent: 'center',
    alignItems: 'center',
    padding: espaciado.xl,
  },
  contenidoExito: {
    width: '100%',
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.xxl,
    padding: espaciado.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colores.borde,
  },
  iconoExito: {
    marginBottom: espaciado.xl,
  },
  gradienteIconoExito: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tituloExito: {
    fontSize: tipografia.tamanos.xxl,
    fontWeight: '700',
    color: colores.textoPrincipal,
    marginBottom: espaciado.md,
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
    ...sombras.brillo,
  },
  textoBotonExito: {
    fontSize: tipografia.tamanos.lg,
    fontWeight: '700',
    color: colores.fondo,
  },
});
