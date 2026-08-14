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
import { servicioClases, servicioReservas } from '../../servicios/api';
import { useAuth } from '../../contexto/ContextoAuth';
import { EncabezadoPantalla, EstadoCargando, EstadoError, EstadoVacio } from '../../componentes';
import type { PropsPantallaTabPrincipal } from '../../tipos/navegacion';

type PropsPantallaTurnos = PropsPantallaTabPrincipal<'Turnos'>;

interface ItemClase {
  id: string;
  name: string;
  description: string | null;
  instructorName: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  totalSpots: number;
  bookedSpots: number;
  activityType: string;
  difficultyLevel: string;
  location: string | null;
  gymZone: string | null;
}

const actividades = ['Todas', 'CrossFit', 'Yoga', 'HIIT', 'Pilates', 'Boxeo', 'Spinning'];
const dificultades = ['Todos', 'PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'];

export default function PantallaTurnos({ navigation }: PropsPantallaTurnos) {
  const { reservas, cargarReservas } = useAuth();
  const [clases, setClases] = useState<ItemClase[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actividadSeleccionada, setActividadSeleccionada] = useState('Todas');
  const [dificultadSeleccionada, setDificultadSeleccionada] = useState('Todos');
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<ItemClase | null>(null);
  const [modalReservaVisible, setModalReservaVisible] = useState(false);
  const [reservando, setReservando] = useState(false);
  const [idsReservados, setIdsReservados] = useState<string[]>([]);
  const [mostrarMisReservas, setMostrarMisReservas] = useState(false);
  const [idCancelando, setIdCancelando] = useState<string | null>(null);

  useEffect(() => {
    cargarClases();
  }, []);

  const cargarClases = async () => {
    try {
      setError(null);
      const datos = await servicioClases.obtenerTodas();
      setClases(datos || []);
    } catch (err) {
      setError('No se pudieron cargar las clases');
    } finally {
      setCargando(false);
    }
  };

  const alRefrescar = async () => {
    setRefrescando(true);
    await Promise.all([cargarClases(), cargarReservas()]);
    setRefrescando(false);
  };

  const obtenerColorDificultad = (dificultad: string) => {
    switch (dificultad) {
      case 'PRINCIPIANTE':
        return colores.secundario;
      case 'INTERMEDIO':
        return colores.primario;
      case 'AVANZADO':
        return colores.error;
      default:
        return colores.textoSecundario;
    }
  };

  const obtenerEtiquetaDificultad = (nivel: string) => {
    switch (nivel) {
      case 'PRINCIPIANTE': return 'Principiante';
      case 'INTERMEDIO': return 'Intermedio';
      case 'AVANZADO': return 'Avanzado';
      default: return nivel;
    }
  };

  const manejarReservarTurno = async () => {
    if (!turnoSeleccionado) return;
    
    setReservando(true);
    try {
      await servicioClases.reservar(turnoSeleccionado.id);
      setIdsReservados([...idsReservados, turnoSeleccionado.id]);
      setModalReservaVisible(false);
      setTurnoSeleccionado(null);
      await cargarClases();
    } catch (err) {
      Alert.alert('Error', 'No se pudo reservar la clase. Intenta nuevamente.');
    } finally {
      setReservando(false);
    }
  };

  const manejarCancelarReserva = (idReserva: string) => {
    Alert.alert(
      'Cancelar Reserva',
      '¿Estás seguro de que querés cancelar esta reserva?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            setIdCancelando(idReserva);
            try {
              await servicioReservas.cancelar(idReserva);
              await Promise.all([cargarClases(), cargarReservas()]);
            } catch {
              Alert.alert('Error', 'No se pudo cancelar la reserva');
            } finally {
              setIdCancelando(null);
            }
          },
        },
      ]
    );
  };

  const clasesFiltradas = clases.filter(c => {
    const coincideActividad = actividadSeleccionada === 'Todas' || 
      c.activityType.includes(actividadSeleccionada);
    const coincideDificultad = dificultadSeleccionada === 'Todos' || 
      c.difficultyLevel === dificultadSeleccionada;
    return coincideActividad && coincideDificultad;
  });

  const obtenerIconoActividad = (nombre: string) => {
    if (nombre.includes('Yoga') || nombre.includes('Pilates')) return 'fitness';
    if (nombre.includes('Boxeo')) return 'shield';
    return 'barbell';
  };

  if (cargando) {
    return (
      <View style={styles.contenedor}>
        <EncabezadoPantalla titulo="Reservar Turnos" />
        <EstadoCargando mensaje="Cargando clases..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.contenedor}>
        <EncabezadoPantalla titulo="Reservar Turnos" />
        <EstadoError mensaje={error} alReintentar={cargarClases} />
      </View>
    );
  }

  const obtenerHoraDeFecha = (cadenaFecha: string) => {
    const d = new Date(cadenaFecha);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const formatearFecha = (cadenaFecha: string) => {
    const d = new Date(cadenaFecha);
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <View style={styles.contenedor}>
      <EncabezadoPantalla titulo={mostrarMisReservas ? 'Mis Reservas' : 'Reservar Turnos'} />

      <View style={styles.contenedorAlternar}>
        <TouchableOpacity
          style={[styles.botonAlternar, !mostrarMisReservas && styles.botonAlternarActivo]}
          onPress={() => setMostrarMisReservas(false)}
        >
          <Ionicons name="calendar-outline" size={16} color={!mostrarMisReservas ? colores.fondo : colores.textoSecundario} />
          <Text style={[styles.textoBotonAlternar, !mostrarMisReservas && styles.textoBotonAlternarActivo]}>Clases</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.botonAlternar, mostrarMisReservas && styles.botonAlternarActivo]}
          onPress={() => setMostrarMisReservas(true)}
        >
          <Ionicons name="bookmark-outline" size={16} color={mostrarMisReservas ? colores.fondo : colores.textoSecundario} />
          <Text style={[styles.textoBotonAlternar, mostrarMisReservas && styles.textoBotonAlternarActivo]}>Mis Reservas ({reservas.length})</Text>
        </TouchableOpacity>
      </View>

      {mostrarMisReservas ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={alRefrescar} tintColor={colores.primario} />}
        >
          {reservas.length === 0 ? (
            <EstadoVacio icono="bookmark-outline" tamanoIcono={48} titulo="No tenés reservas activas" />
          ) : (
            <View style={styles.listaTurnos}>
              {reservas.map((b: any) => (
                <View key={b.id} style={[styles.tarjetaTurno, { borderColor: colores.primario }]}>
                  <View style={styles.gradienteTurno}>
                    <View style={styles.encabezadoTurno}>
                      <View style={styles.iconoTurno}>
                        <Ionicons name="calendar" size={28} color={colores.primario} />
                      </View>
                      <View style={styles.infoTurno}>
                        <Text style={styles.actividadTurno}>{b.class?.name || 'Reserva'}</Text>
                        <Text style={styles.instructorTurno}>{b.class?.instructorName || ''}</Text>
                        <View style={styles.metaTurno}>
                          <View style={styles.itemMetaTurno}>
                            <Ionicons name="time-outline" size={14} color={colores.textoSecundario} />
                            <Text style={styles.textoMetaTurno}>
                              {b.class?.startTime ? obtenerHoraDeFecha(b.class.startTime) : ''} hs
                            </Text>
                          </View>
                          {b.class?.location && (
                            <View style={styles.itemMetaTurno}>
                              <Ionicons name="location-outline" size={14} color={colores.textoSecundario} />
                              <Text style={styles.textoMetaTurno}>{b.class.location}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.botonCancelar}
                      onPress={() => manejarCancelarReserva(b.id)}
                      disabled={idCancelando === b.id}
                    >
                      {idCancelando === b.id ? (
                        <ActivityIndicator size="small" color={colores.error} />
                      ) : (
                        <>
                          <Ionicons name="close-circle-outline" size={18} color={colores.error} />
                          <Text style={styles.textoBotonCancelar}>Cancelar</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      ) : clasesFiltradas.length === 0 ? (
        <EstadoVacio icono="calendar-outline" tamanoIcono={48} titulo="No hay clases disponibles" />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={alRefrescar} tintColor={colores.primario} />
          }
        >
          {/* Filtros */}
          <View style={styles.contenedorFiltros}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {actividades.map((actividad, indice) => (
                <TouchableOpacity
                  key={indice}
                  style={[
                    styles.chipFiltro,
                    actividadSeleccionada === actividad && styles.chipFiltroSeleccionado,
                  ]}
                  onPress={() => setActividadSeleccionada(actividad)}
                >
                  <Text style={[styles.textoChipFiltro, actividadSeleccionada === actividad && styles.textoChipFiltroSeleccionado]}>
                    {actividad}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {dificultades.map((dificultad, indice) => {
                const estaSeleccionada = dificultadSeleccionada === dificultad;
                return (
                  <TouchableOpacity
                    key={indice}
                    style={[
                      styles.chipFiltro,
                      estaSeleccionada && styles.chipFiltroSeleccionado,
                      { borderColor: estaSeleccionada ? colores.primario : obtenerColorDificultad(dificultad) },
                    ]}
                    onPress={() => setDificultadSeleccionada(dificultad)}
                  >
                    <View style={styles.contenidoChipFiltro}>
                      {estaSeleccionada && (
                        <Ionicons name="checkmark-circle" size={16} color={colores.primario} style={styles.iconoChipFiltro} />
                      )}
                      <Text style={[styles.textoChipFiltro, estaSeleccionada && styles.textoChipFiltroSeleccionado, { color: estaSeleccionada ? colores.primario : obtenerColorDificultad(dificultad) }]}>
                        {dificultad === 'Todos' ? 'Todos' : obtenerEtiquetaDificultad(dificultad)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Lista de Clases */}
          <View style={styles.listaTurnos}>
            {clasesFiltradas.map((c) => {
              const estaReservado = idsReservados.includes(c.id);
              const estaCompleto = c.bookedSpots >= c.totalSpots;
              const disponibilidad = (c.totalSpots - c.bookedSpots) / c.totalSpots;

              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.tarjetaTurno, estaReservado && styles.tarjetaTurnoReservado]}
                  onPress={() => {
                    if (!estaReservado && !estaCompleto) {
                      setTurnoSeleccionado(c);
                      setModalReservaVisible(true);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={estaReservado ? ['rgba(57, 255, 20, 0.1)', 'rgba(0, 0, 0, 0)'] : ['rgba(255, 255, 255, 0.03)', 'rgba(0, 0, 0, 0)']}
                    style={styles.gradienteTurno}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <View style={styles.encabezadoTurno}>
                      <View style={styles.iconoTurno}>
                        <Ionicons
                          name={obtenerIconoActividad(c.name)}
                          size={28}
                          color={estaReservado ? colores.secundario : colores.primario}
                        />
                      </View>
                      <View style={styles.infoTurno}>
                        <Text style={styles.actividadTurno}>{c.name}</Text>
                        <Text style={styles.instructorTurno}>{c.instructorName}</Text>
                        <View style={styles.metaTurno}>
                          <View style={styles.itemMetaTurno}>
                            <Ionicons name="time-outline" size={14} color={colores.textoSecundario} />
                            <Text style={styles.textoMetaTurno}>{obtenerHoraDeFecha(c.startTime)} hs</Text>
                          </View>
                          <View style={styles.itemMetaTurno}>
                            <Ionicons name="hourglass-outline" size={14} color={colores.textoSecundario} />
                            <Text style={styles.textoMetaTurno}>{c.durationMinutes} min</Text>
                          </View>
                          {c.location && (
                            <View style={styles.itemMetaTurno}>
                              <Ionicons name="location-outline" size={14} color={colores.textoSecundario} />
                              <Text style={styles.textoMetaTurno}>{c.location}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      {estaReservado ? (
                        <View style={styles.insigniaReservado}>
                          <Ionicons name="checkmark-circle" size={20} color={colores.secundario} />
                          <Text style={styles.textoInsigniaReservado}>Reservado</Text>
                        </View>
                      ) : estaCompleto ? (
                        <View style={styles.insigniaCompleto}>
                          <Text style={styles.textoInsigniaCompleto}>COMPLETO</Text>
                        </View>
                      ) : (
                        <View style={styles.insigniaLugares}>
                          <Text style={styles.textoInsigniaLugares}>{c.totalSpots - c.bookedSpots} lugares</Text>
                        </View>
                      )}
                    </View>

                    {!estaReservado && !estaCompleto && (
                      <View style={styles.contenedorDisponibilidad}>
                        <View style={styles.barraDisponibilidad}>
                          <View style={[styles.rellenoDisponibilidad, {
                            width: `${disponibilidad * 100}%`,
                            backgroundColor: disponibilidad > 0.5 ? colores.secundario : disponibilidad > 0.3 ? colores.advertencia : colores.error,
                          }]} />
                        </View>
                        <Text style={styles.textoDisponibilidad}>{Math.round(disponibilidad * 100)}% disponible</Text>
                      </View>
                    )}

                    <View style={styles.contenedorDificultad}>
                      <View style={[styles.insigniaDificultad, { borderColor: obtenerColorDificultad(c.difficultyLevel) }]}>
                        <Text style={[styles.textoDificultad, { color: obtenerColorDificultad(c.difficultyLevel) }]}>
                          {obtenerEtiquetaDificultad(c.difficultyLevel)}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Modal de Reserva */}
      <Modal
        visible={modalReservaVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setModalReservaVisible(false);
          setTurnoSeleccionado(null);
        }}
      >
        <View style={styles.superposicionModal}>
          <View style={styles.contenidoModal}>
            {turnoSeleccionado && (
              <>
                <View style={styles.encabezadoModal}>
                  <View style={styles.iconoModal}>
                    <Ionicons name="calendar" size={40} color={colores.primario} />
                  </View>
                  <Text style={styles.tituloModal}>Confirmar Reserva</Text>
                </View>

                <View style={styles.cuerpoModal}>
                  <Text style={styles.actividadModal}>{turnoSeleccionado.name}</Text>
                  
                  <View style={styles.infoModal}>
                    <View style={styles.filaInfoModal}>
                      <Ionicons name="person" size={20} color={colores.textoSecundario} />
                      <Text style={styles.textoInfoModal}>{turnoSeleccionado.instructorName}</Text>
                    </View>
                    <View style={styles.filaInfoModal}>
                      <Ionicons name="calendar" size={20} color={colores.textoSecundario} />
                      <Text style={styles.textoInfoModal}>{formatearFecha(turnoSeleccionado.startTime)}</Text>
                    </View>
                    <View style={styles.filaInfoModal}>
                      <Ionicons name="time" size={20} color={colores.textoSecundario} />
                      <Text style={styles.textoInfoModal}>{obtenerHoraDeFecha(turnoSeleccionado.startTime)} hs ({turnoSeleccionado.durationMinutes} min)</Text>
                    </View>
                    {turnoSeleccionado.location && (
                      <View style={styles.filaInfoModal}>
                        <Ionicons name="location" size={20} color={colores.textoSecundario} />
                        <Text style={styles.textoInfoModal}>{turnoSeleccionado.location}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.puntosModal}>
                    <Ionicons name="trophy" size={20} color={colores.puntos} />
                    <Text style={styles.textoPuntosModal}>Ganarás 75 puntos por asistir</Text>
                  </View>
                </View>

                <View style={styles.accionesModal}>
                  <TouchableOpacity
                    style={styles.botonCancelarModal}
                    onPress={() => { setModalReservaVisible(false); setTurnoSeleccionado(null); }}
                  >
                    <Text style={styles.textoBotonCancelarModal}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.botonConfirmarModal}
                    onPress={manejarReservarTurno}
                    disabled={reservando}
                  >
                    {reservando ? (
                      <ActivityIndicator color={colores.fondo} />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={20} color={colores.fondo} style={styles.iconoConfirmar} />
                        <Text style={styles.textoBotonConfirmarModal}>Confirmar Reserva</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  franjaCalendario: {
    paddingHorizontal: espaciado.xl,
    marginBottom: espaciado.lg,
  },
  tarjetaDia: {
    width: 60,
    height: 80,
    borderRadius: radioBorde.lg,
    backgroundColor: colores.fondoTarjeta,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: espaciado.md,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  tarjetaDiaSeleccionada: {
    backgroundColor: colores.primario,
    borderColor: colores.primario,
  },
  nombreDia: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoSecundario,
    fontWeight: '500',
  },
  nombreDiaSeleccionado: {
    color: colores.fondo,
  },
  numeroDia: {
    fontSize: tipografia.tamanos.xl,
    fontWeight: '700',
    color: colores.textoPrincipal,
    marginTop: espaciado.xs,
  },
  numeroDiaSeleccionado: {
    color: colores.fondo,
  },
  insigniaHoy: {
    position: 'absolute',
    bottom: 6,
    backgroundColor: colores.secundario,
    paddingHorizontal: espaciado.sm,
    paddingVertical: 2,
    borderRadius: radioBorde.sm,
  },
  textoInsigniaHoy: {
    fontSize: 8,
    fontWeight: '700',
    color: colores.fondo,
  },
  contenedorFiltros: {
    paddingHorizontal: espaciado.xl,
    marginBottom: espaciado.lg,
  },
  chipFiltro: {
    paddingHorizontal: espaciado.lg,
    paddingVertical: espaciado.sm,
    borderRadius: radioBorde.full,
    backgroundColor: colores.fondoTarjeta,
    borderWidth: 1,
    borderColor: colores.borde,
    marginRight: espaciado.sm,
    minWidth: 100, // Ancho mínimo para consistencia
    alignItems: 'center', // Centrar texto
    flexDirection: 'row', // Para alinear icono y texto
  },
  contenidoChipFiltro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.xs,
  },
  iconoChipFiltro: {
    marginRight: espaciado.xs,
  },
  chipFiltroSeleccionado: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderColor: colores.primario,
    borderWidth: 2, // Borde más grueso para destacar
    shadowColor: colores.primario,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4, // Sombra para Android
  },
  textoChipFiltro: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoSecundario,
  },
  textoChipFiltroSeleccionado: {
    color: colores.primario,
    fontWeight: '700', // Más grueso para destacar
  },
  listaTurnos: {
    paddingHorizontal: espaciado.xl,
  },
  tarjetaTurno: {
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.xl,
    marginBottom: espaciado.md,
    borderWidth: 1,
    borderColor: colores.borde,
    overflow: 'hidden',
  },
  tarjetaTurnoReservado: {
    borderColor: colores.secundario,
  },
  gradienteTurno: {
    padding: espaciado.lg,
  },
  encabezadoTurno: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconoTurno: {
    width: 50,
    height: 50,
    borderRadius: radioBorde.lg,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: espaciado.md,
  },
  infoTurno: {
    flex: 1,
  },
  actividadTurno: {
    fontSize: tipografia.tamanos.lg,
    fontWeight: '600',
    color: colores.textoPrincipal,
    marginBottom: espaciado.xs,
  },
  instructorTurno: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoSecundario,
    marginBottom: espaciado.sm,
  },
  metaTurno: {
    flexDirection: 'row',
    gap: espaciado.md,
  },
  itemMetaTurno: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.xs,
  },
  textoMetaTurno: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoSecundario,
  },
  insigniaReservado: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.sm,
    borderRadius: radioBorde.full,
    gap: espaciado.xs,
  },
  textoInsigniaReservado: {
    fontSize: tipografia.tamanos.xs,
    fontWeight: '600',
    color: colores.secundario,
  },
  insigniaCompleto: {
    backgroundColor: colores.error,
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.sm,
    borderRadius: radioBorde.full,
  },
  textoInsigniaCompleto: {
    fontSize: tipografia.tamanos.xs,
    fontWeight: '700',
    color: colores.textoPrincipal,
  },
  insigniaLugares: {
    backgroundColor: colores.fondo,
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.sm,
    borderRadius: radioBorde.full,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  textoInsigniaLugares: {
    fontSize: tipografia.tamanos.xs,
    fontWeight: '600',
    color: colores.textoSecundario,
  },
  contenedorDisponibilidad: {
    marginTop: espaciado.md,
  },
  barraDisponibilidad: {
    height: 4,
    backgroundColor: colores.fondo,
    borderRadius: radioBorde.full,
    overflow: 'hidden',
  },
  rellenoDisponibilidad: {
    height: '100%',
    borderRadius: radioBorde.full,
  },
  textoDisponibilidad: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoAtenuado,
    marginTop: espaciado.xs,
  },
  contenedorDificultad: {
    marginTop: espaciado.md,
  },
  insigniaDificultad: {
    alignSelf: 'flex-start',
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.sm,
    borderRadius: radioBorde.full,
    borderWidth: 1,
  },
  textoDificultad: {
    fontSize: tipografia.tamanos.xs,
    fontWeight: '600',
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
  iconoModal: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
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
  actividadModal: {
    fontSize: tipografia.tamanos.lg,
    fontWeight: '600',
    color: colores.textoPrincipal,
    textAlign: 'center',
    marginBottom: espaciado.lg,
  },
  infoModal: {
    marginBottom: espaciado.lg,
  },
  filaInfoModal: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: espaciado.md,
    gap: espaciado.md,
  },
  textoInfoModal: {
    fontSize: tipografia.tamanos.md,
    color: colores.textoSecundario,
    flex: 1,
  },
  puntosModal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: radioBorde.lg,
    padding: espaciado.md,
    gap: espaciado.sm,
  },
  textoPuntosModal: {
    fontSize: tipografia.tamanos.md,
    fontWeight: '600',
    color: colores.puntos,
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
  iconoConfirmar: {
    marginRight: espaciado.sm,
  },
  textoBotonConfirmarModal: {
    fontSize: tipografia.tamanos.md,
    fontWeight: '700',
    color: colores.fondo,
  },
  contenedorAlternar: {
    flexDirection: 'row',
    marginHorizontal: espaciado.xl,
    marginBottom: espaciado.lg,
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.lg,
    padding: espaciado.xs,
  },
  botonAlternar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: espaciado.md,
    borderRadius: radioBorde.md,
    gap: espaciado.sm,
  },
  botonAlternarActivo: {
    backgroundColor: colores.primario,
  },
  textoBotonAlternar: {
    fontSize: tipografia.tamanos.sm,
    fontWeight: '600',
    color: colores.textoSecundario,
  },
  textoBotonAlternarActivo: {
    color: colores.fondo,
  },
  botonCancelar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: espaciado.md,
    paddingVertical: espaciado.sm,
    borderRadius: radioBorde.lg,
    borderWidth: 1,
    borderColor: colores.error,
    gap: espaciado.xs,
  },
  textoBotonCancelar: {
    fontSize: tipografia.tamanos.sm,
    fontWeight: '600',
    color: colores.error,
  },
});
