import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colores, espaciado, radioBorde, tipografia, sombras } from '../../constantes/tema';
import { useAuth } from '../../contexto/ContextoAuth';
import { ModalTutorial } from '../../componentes';
import type { PropsPantallaTabPrincipal } from '../../tipos/navegacion';

const CLAVE_TUTORIAL_VISTO = 'quantumfit.tutorial.seen';

type PropsPantallaInicio = PropsPantallaTabPrincipal<'Dashboard'>;

export default function PantallaInicio({ navigation }: PropsPantallaInicio) {
  const { usuario, estadisticasSemanales, logros, reservas, refrescarTodo, perfilExterno, asistenciasExternas, membresiasExternas, cargandoExterno } = useAuth();
  const [refrescando, setRefrescando] = React.useState(false);
  const [mostrarTodasEstadisticas, setMostrarTodasEstadisticas] = useState(false);
  const [mostrarTutorial, setMostrarTutorial] = useState(false);

  useEffect(() => {
    verificarTutorialVisto();
  }, []);

  const verificarTutorialVisto = async () => {
    try {
      const visto = await AsyncStorage.getItem(CLAVE_TUTORIAL_VISTO);
      if (!visto && usuario && usuario.level === 1) {
        setMostrarTutorial(true);
      }
    } catch (error) {
      console.error('[Inicio] Error al verificar tutorial:', error);
    }
  };

  const alRefrescar = React.useCallback(async () => {
    setRefrescando(true);
    await refrescarTodo();
    setRefrescando(false);
  }, [refrescarTodo]);

  const obtenerInfoNivel = (nivel: number) => {
    const niveles = [
      { nombre: 'Principiante', icono: '🌱', color: colores.nivelBronce },
      { nombre: 'Intermedio', icono: '💪', color: colores.nivelPlata },
      { nombre: 'Avanzado', icono: '🔥', color: colores.nivelOro },
      { nombre: 'Experto', icono: '⭐', color: colores.nivelPlatino },
      { nombre: 'Élite', icono: '💎', color: colores.nivelDiamante },
      { nombre: 'Leyenda', icono: '👑', color: colores.primario },
    ];
    const indice = Math.min(Math.floor((nivel - 1) / 2), niveles.length - 1);
    return niveles[indice];
  };

  const infoNivel = obtenerInfoNivel(usuario?.level || 1);
  const progresoSiguienteNivel = ((usuario?.level || 1) % 2) * 50 + (usuario?.points || 0) % 1000;

  const frasesMotivacionales = [
    '¡El único mal entrenamiento es el que no ocurrió!',
    'Tu cuerpo puede soportar casi cualquier cosa. Es a tu mente a la que tienes que convencer.',
    'La disciplina es el puente entre metas y logros.',
    'No cuentes los días, haz que los días cuenten.',
    'El dolor que sientes hoy es la fuerza que sentirás mañana.',
  ];

  const fraseAleatoria = frasesMotivacionales[Math.floor(Math.random() * frasesMotivacionales.length)];

  if (!usuario) {
    return (
      <View style={[styles.contenedor, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colores.primario} />
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      {/* Encabezado */}
      <LinearGradient
        colors={[colores.fondoSecundario, colores.fondo]}
        style={styles.encabezado}
      >
        <View style={styles.encabezadoSuperior}>
          <View style={{ flex: 1 }}>
            <Text style={styles.textoSaludo}>Hola,</Text>
            <Text style={styles.nombreUsuario} numberOfLines={1} ellipsizeMode="tail">{usuario.name.split(' ')[0]}!</Text>
          </View>
          <TouchableOpacity
            style={styles.botonNotificaciones}
            onPress={() => navigation.navigate('Notificaciones')}
          >
            <Ionicons name="notifications-outline" size={24} color={colores.textoPrincipal} />
            {(usuario.notificationsCount ?? 0) > 0 && (
              <View style={styles.insigniaNotificaciones}>
                <Text style={styles.textoInsigniaNotificaciones}>{usuario.notificationsCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Cita motivacional */}
        <View style={styles.contenedorCita}>
          <Ionicons name="chatbubbles-outline" size={20} color={colores.primario} style={styles.iconoCita} />
          <Text style={styles.textoCita}>{fraseAleatoria}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.vistaDesplazable}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={alRefrescar}
            tintColor={colores.primario}
          />
        }
      >
        {/* Tarjeta de nivel */}
        <View style={styles.tarjetaNivel}>
          <View style={styles.encabezadoNivel}>
            <View style={styles.infoNivel}>
              <Text style={styles.emojiNivel}>{infoNivel.icono}</Text>
              <View>
                <Text style={styles.nombreNivel}>{infoNivel.nombre}</Text>
                <Text style={styles.numeroNivel}>Nivel {usuario.level}</Text>
              </View>
            </View>
            <View style={styles.contenedorPuntos}>
              <Ionicons name="trophy" size={20} color={colores.puntos} />
              <Text style={styles.textoPuntos}>{usuario.points.toLocaleString()}</Text>
            </View>
          </View>

          {/* Barra de progreso */}
          <View style={styles.contenedorProgreso}>
            <View style={styles.fondoProgreso}>
              <View
                style={[
                  styles.rellenoProgreso,
                  { width: `${progresoSiguienteNivel}%` },
                  { backgroundColor: infoNivel.color },
                ]}
              />
            </View>
            <Text style={styles.textoProgreso}>{progresoSiguienteNivel}% para el siguiente nivel</Text>
          </View>
        </View>

        {/* Cuadrícula de estadísticas */}
        <View style={styles.cuadriculaEstadisticas}>
          {/* Estadísticas principales (siempre visibles) */}
          <View style={styles.tarjetaEstadistica}>
            <View style={[styles.contenedorIconoEstadistica, { backgroundColor: 'rgba(0, 240, 255, 0.1)' }]}>
              <Ionicons name="flame" size={24} color={colores.primario} />
            </View>
            <Text style={styles.valorEstadistica}>{usuario.currentStreak}</Text>
            <Text style={styles.etiquetaEstadistica}>Días de racha</Text>
          </View>

          <View style={styles.tarjetaEstadistica}>
            <View style={[styles.contenedorIconoEstadistica, { backgroundColor: 'rgba(57, 255, 20, 0.1)' }]}>
              <Ionicons name="barbell" size={24} color={colores.secundario} />
            </View>
            <Text style={styles.valorEstadistica}>{usuario.totalWorkouts}</Text>
            <Text style={styles.etiquetaEstadistica}>Entrenamientos</Text>
          </View>

          {/* Estadísticas secundarias (solo si se expande y el usuario no es principiante) */}
          {mostrarTodasEstadisticas && usuario.level > 1 && (
            <>
              <View style={styles.tarjetaEstadistica}>
                <View style={[styles.contenedorIconoEstadistica, { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
                  <Ionicons name="calendar" size={24} color={colores.puntos} />
                </View>
                <Text style={styles.valorEstadistica}>{estadisticasSemanales.currentWeek.workoutsCompleted}</Text>
                <Text style={styles.etiquetaEstadistica}>Esta semana</Text>
              </View>

              <View style={styles.tarjetaEstadistica}>
                <View style={[styles.contenedorIconoEstadistica, { backgroundColor: 'rgba(255, 71, 87, 0.1)' }]}>
                  <Ionicons name="trending-up" size={24} color={colores.error} />
                </View>
                <Text style={styles.valorEstadistica}>{estadisticasSemanales.currentWeek.attendanceRate}%</Text>
                <Text style={styles.etiquetaEstadistica}>Asistencia</Text>
              </View>
            </>
          )}

          {/* Mensaje para principiantes */}
          {mostrarTodasEstadisticas && usuario.level === 1 && (
            <View style={styles.mensajePrincipiante}>
              <Ionicons name="information-circle" size={24} color={colores.primario} />
              <Text style={styles.textoMensajePrincipiante}>
                ¡Comienza a entrenar para ver tus estadísticas semanales!
              </Text>
            </View>
          )}
        </View>

        {/* Botón Ver más/menos */}
        <TouchableOpacity
          style={styles.botonVerTodo}
          onPress={() => setMostrarTodasEstadisticas(!mostrarTodasEstadisticas)}
        >
          <Text style={styles.textoBotonVerTodo}>
            {mostrarTodasEstadisticas ? 'Ver menos' : 'Ver más estadísticas'}
          </Text>
          <Ionicons
            name={mostrarTodasEstadisticas ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colores.primario}
          />
        </TouchableOpacity>

        {/* Próximo Turno */}
        {reservas.length > 0 && (
          <View style={styles.seccion}>
            <View style={styles.encabezadoSeccion}>
              <Text style={styles.tituloSeccion}>Próximo Turno</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Turnos')}>
                <Text style={styles.textoVerTodo}>Ver todos</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.tarjetaTurno}
              onPress={() => navigation.navigate('Turnos')}
            >
              <LinearGradient
                colors={['rgba(0, 240, 255, 0.1)', 'rgba(0, 0, 0, 0)']}
                style={styles.gradienteTurno}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.contenidoTurno}>
                  <View style={styles.iconoTurno}>
                    <Ionicons name="fitness" size={32} color={colores.primario} />
                  </View>
                  <View style={styles.infoTurno}>
                    <Text style={styles.actividadTurno}>Turno Confirmado</Text>
                    <Text style={styles.instructorTurno}>Reserva activa</Text>
                    <View style={styles.detallesTurno}>
                      <Ionicons name="calendar-outline" size={14} color={colores.textoSecundario} />
                      <Text style={styles.fechaTurno}>{reservas.length} reserva(s)</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.estadoTurno}>
                  <View style={styles.insigniaEstado}>
                    <Text style={styles.textoEstado}>Confirmado</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Accesos Rápidos */}
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Accesos Rápidos</Text>
          <View style={styles.accesosRapidos}>
            <TouchableOpacity
              style={styles.accesoRapido}
              onPress={() => navigation.navigate('Turnos')}
            >
              <View style={[styles.iconoAccesoRapido, { backgroundColor: 'rgba(0, 240, 255, 0.15)' }]}>
                <Ionicons name="calendar" size={24} color={colores.primario} />
              </View>
              <Text style={styles.textoAccesoRapido}>Reservar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.accesoRapido}
              onPress={() => navigation.navigate('Beneficios')}
            >
              <View style={[styles.iconoAccesoRapido, { backgroundColor: 'rgba(255, 215, 0, 0.15)' }]}>
                <Ionicons name="gift" size={24} color={colores.puntos} />
              </View>
              <Text style={styles.textoAccesoRapido}>Premios</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.accesoRapido}
              onPress={() => navigation.navigate('Perfil')}
            >
              <View style={[styles.iconoAccesoRapido, { backgroundColor: 'rgba(57, 255, 20, 0.15)' }]}>
                <Ionicons name="person" size={24} color={colores.secundario} />
              </View>
              <Text style={styles.textoAccesoRapido}>Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.accesoRapido}
              onPress={() => navigation.navigate('Ranking')}
            >
              <View style={[styles.iconoAccesoRapido, { backgroundColor: 'rgba(255, 71, 87, 0.15)' }]}>
                <Ionicons name="trophy" size={24} color={colores.error} />
              </View>
              <Text style={styles.textoAccesoRapido}>Ranking</Text>
            </TouchableOpacity>
          </View>
        </View>

        {perfilExterno && (
          <View style={styles.seccion}>
            <View style={styles.encabezadoSeccion}>
              <View style={styles.encabezadoSeccionIzquierda}>
                <View style={styles.iconoCrystal}>
                  <Ionicons name="server-outline" size={18} color={colores.primario} />
                </View>
                <Text style={styles.tituloSeccion}>Crystal</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('DatosCrystal')}>
                <Text style={styles.textoVerTodo}>Ver más</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tarjetaCrystal}>
              <View style={styles.encabezadoTarjetaCrystal}>
                <View style={styles.iconoUsuarioCrystal}>
                  <Text style={styles.inicialesUsuarioCrystal}>
                    {perfilExterno.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </Text>
                </View>
                <View style={styles.infoUsuarioCrystal}>
                  <Text style={styles.nombreUsuarioCrystal}>{perfilExterno.name}</Text>
                  {perfilExterno.dni && (
                    <Text style={styles.dniUsuarioCrystal}>DNI {perfilExterno.dni}</Text>
                  )}
                </View>
              </View>

              <View style={styles.filaEstadisticasCrystal}>
                <View style={styles.estadisticaCrystal}>
                  <Ionicons name="wallet-outline" size={16} color={colores.puntos} />
                  <Text style={styles.valorEstadisticaCrystal}>${perfilExterno.balance?.toLocaleString()}</Text>
                  <Text style={styles.etiquetaEstadisticaCrystal}>Saldo</Text>
                </View>
                <View style={styles.divisorEstadisticaCrystal} />
                <View style={styles.estadisticaCrystal}>
                  <Ionicons name="calendar-outline" size={16} color={colores.primario} />
                  <Text style={styles.valorEstadisticaCrystal}>{asistenciasExternas.length}</Text>
                  <Text style={styles.etiquetaEstadisticaCrystal}>Asistencias</Text>
                </View>
                <View style={styles.divisorEstadisticaCrystal} />
                <View style={styles.estadisticaCrystal}>
                  <Ionicons name="card-outline" size={16} color={colores.secundario} />
                  <Text style={styles.valorEstadisticaCrystal}>{membresiasExternas.length}</Text>
                  <Text style={styles.etiquetaEstadisticaCrystal}>Membresías</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {cargandoExterno && (
          <View style={styles.seccion}>
            <View style={[styles.tarjetaCrystal, { alignItems: 'center', paddingVertical: espaciado.lg }]}>
              <ActivityIndicator size="small" color={colores.primario} />
              <Text style={[styles.dniUsuarioCrystal, { marginTop: espaciado.sm }]}>Sincronizando con Crystal...</Text>
            </View>
          </View>
        )}

        {/* Logros Recientes */}
        {logros.length > 0 && (
          <View style={styles.seccion}>
            <View style={styles.encabezadoSeccion}>
              <Text style={styles.tituloSeccion}>Logros Recientes</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Perfil', { seccion: 'logros' })}>
                <Text style={styles.textoVerTodo}>Ver todos</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {logros.filter(a => a.unlocked).slice(0, 4).map((logro) => (
                <View key={logro.id} style={styles.tarjetaLogro}>
                  <View style={styles.contenedorIconoLogro}>
                    <Text style={styles.emojiLogro}>{logro.icon}</Text>
                  </View>
                  <Text style={styles.nombreLogro}>{logro.name}</Text>
                  <Text style={styles.descripcionLogro}>{logro.description}</Text>
                </View>
              ))}
              {logros.filter(a => !a.unlocked).slice(0, 1).map((logro) => (
                <View key={logro.id} style={styles.tarjetaLogroBloqueado}>
                  <View style={styles.iconoLogroBloqueado}>
                    <Ionicons name="lock-closed" size={24} color={colores.textoAtenuado} />
                  </View>
                  <Text style={styles.nombreLogroBloqueado}>{logro.name}</Text>
                  <Text style={styles.descripcionLogroBloqueado}>{logro.description}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Espaciado inferior */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Botón Flotante de Check-in */}
      <TouchableOpacity
        style={styles.botonCheckIn}
        onPress={() => navigation.navigate('CheckIn')}
        activeOpacity={0.8}
      >
        <Ionicons name="scan" size={28} color={colores.fondo} />
        <Text style={styles.textoBotonCheckIn}>Check-in</Text>
      </TouchableOpacity>

      {/* Modal Tutorial para principiantes */}
      <ModalTutorial
        visible={mostrarTutorial && usuario && usuario.level === 1}
        alCompletar={async () => {
          setMostrarTutorial(false);
          await AsyncStorage.setItem(CLAVE_TUTORIAL_VISTO, 'true');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  encabezado: {
    paddingTop: espaciado.xxl,
    paddingBottom: espaciado.lg,
    paddingHorizontal: espaciado.xl,
  },
  encabezadoSuperior: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: espaciado.lg,
  },
  textoSaludo: {
    fontSize: tipografia.tamanos.md,
    color: colores.textoSecundario,
  },
  nombreUsuario: {
    fontSize: tipografia.tamanos.xxl,
    fontWeight: '700',
    color: colores.textoPrincipal,
  },
  botonNotificaciones: {
    width: 44,
    height: 44,
    borderRadius: radioBorde.full,
    backgroundColor: colores.fondoTarjeta,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  insigniaNotificaciones: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colores.primario,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoInsigniaNotificaciones: {
    fontSize: 10,
    fontWeight: '700',
    color: colores.fondo,
  },
  contenedorCita: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.lg,
    padding: espaciado.lg,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  iconoCita: {
    marginRight: espaciado.sm,
    marginTop: 2,
  },
  textoCita: {
    flex: 1,
    fontSize: tipografia.tamanos.sm,
    color: colores.textoSecundario,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  vistaDesplazable: {
    flex: 1,
  },
  tarjetaNivel: {
    marginHorizontal: espaciado.xl,
    marginTop: espaciado.lg,
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.xl,
    padding: espaciado.lg,
    borderWidth: 1,
    borderColor: colores.borde,
    ...sombras.mediana,
  },
  encabezadoNivel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: espaciado.md,
  },
  infoNivel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.md,
  },
  emojiNivel: {
    fontSize: 36,
  },
  nombreNivel: {
    fontSize: tipografia.tamanos.lg,
    fontWeight: '600',
    color: colores.textoPrincipal,
  },
  numeroNivel: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoSecundario,
  },
  contenedorPuntos: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.sm,
    borderRadius: radioBorde.full,
    gap: espaciado.sm,
  },
  textoPuntos: {
    fontSize: tipografia.tamanos.lg,
    fontWeight: '700',
    color: colores.puntos,
  },
  contenedorProgreso: {
    marginTop: espaciado.sm,
  },
  fondoProgreso: {
    height: 8,
    backgroundColor: colores.fondo,
    borderRadius: radioBorde.full,
    overflow: 'hidden',
  },
  rellenoProgreso: {
    height: '100%',
    borderRadius: radioBorde.full,
  },
  textoProgreso: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoAtenuado,
    marginTop: espaciado.sm,
    textAlign: 'right',
  },
  cuadriculaEstadisticas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: espaciado.xl,
    marginTop: espaciado.lg,
    gap: espaciado.md,
  },
  botonVerTodo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: espaciado.lg,
    gap: espaciado.xs,
  },
  textoBotonVerTodo: {
    fontSize: tipografia.tamanos.sm,
    color: colores.primario,
    fontWeight: '600',
  },
  mensajePrincipiante: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colores.primario}10`,
    borderRadius: radioBorde.lg,
    padding: espaciado.lg,
    gap: espaciado.sm,
    width: '100%',
    marginTop: espaciado.md,
  },
  textoMensajePrincipiante: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoSecundario,
    flex: 1,
  },
  tarjetaEstadistica: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.lg,
    padding: espaciado.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colores.borde,
  },
  contenedorIconoEstadistica: {
    width: 48,
    height: 48,
    borderRadius: radioBorde.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: espaciado.sm,
  },
  valorEstadistica: {
    fontSize: tipografia.tamanos.xl,
    fontWeight: '700',
    color: colores.textoPrincipal,
  },
  etiquetaEstadistica: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoSecundario,
    textAlign: 'center',
  },
  seccion: {
    marginTop: espaciado.xl,
    paddingHorizontal: espaciado.xl,
  },
  encabezadoSeccion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: espaciado.md,
  },
  tituloSeccion: {
    fontSize: tipografia.tamanos.lg,
    fontWeight: '600',
    color: colores.textoPrincipal,
  },
  textoVerTodo: {
    fontSize: tipografia.tamanos.sm,
    color: colores.primario,
  },
  tarjetaTurno: {
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colores.borde,
  },
  gradienteTurno: {
    padding: espaciado.lg,
  },
  contenidoTurno: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconoTurno: {
    width: 60,
    height: 60,
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
  detallesTurno: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fechaTurno: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoSecundario,
    marginLeft: espaciado.xs,
    marginRight: espaciado.md,
  },
  iconoUbicacion: {
    marginLeft: espaciado.xs,
  },
  ubicacionTurno: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoSecundario,
    marginLeft: espaciado.xs,
  },
  estadoTurno: {
    marginTop: espaciado.md,
    alignItems: 'flex-end',
  },
  insigniaEstado: {
    backgroundColor: 'rgba(57, 255, 20, 0.15)',
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.sm,
    borderRadius: radioBorde.full,
  },
  textoEstado: {
    fontSize: tipografia.tamanos.xs,
    fontWeight: '600',
    color: colores.secundario,
  },
  accesosRapidos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  accesoRapido: {
    alignItems: 'center',
    width: '23%',
  },
  iconoAccesoRapido: {
    width: 56,
    height: 56,
    borderRadius: radioBorde.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: espaciado.sm,
  },
  textoAccesoRapido: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoSecundario,
    textAlign: 'center',
  },
  tarjetaLogro: {
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.lg,
    padding: espaciado.lg,
    marginRight: espaciado.md,
    alignItems: 'center',
    width: 120,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  contenedorIconoLogro: {
    width: 50,
    height: 50,
    borderRadius: radioBorde.full,
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: espaciado.sm,
  },
  emojiLogro: {
    fontSize: 28,
  },
  nombreLogro: {
    fontSize: tipografia.tamanos.sm,
    fontWeight: '600',
    color: colores.textoPrincipal,
    textAlign: 'center',
    marginBottom: espaciado.xs,
  },
  descripcionLogro: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoAtenuado,
    textAlign: 'center',
  },
  tarjetaLogroBloqueado: {
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.lg,
    padding: espaciado.lg,
    marginRight: espaciado.md,
    alignItems: 'center',
    width: 120,
    borderWidth: 1,
    borderColor: colores.borde,
    borderStyle: 'dashed',
  },
  iconoLogroBloqueado: {
    width: 50,
    height: 50,
    borderRadius: radioBorde.full,
    backgroundColor: colores.fondo,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: espaciado.sm,
  },
  nombreLogroBloqueado: {
    fontSize: tipografia.tamanos.sm,
    fontWeight: '600',
    color: colores.textoAtenuado,
    textAlign: 'center',
    marginBottom: espaciado.xs,
  },
  descripcionLogroBloqueado: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoAtenuado,
    textAlign: 'center',
  },
  iconoCrystal: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  encabezadoSeccionIzquierda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
  },
  tarjetaCrystal: {
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.xl,
    padding: espaciado.lg,
    borderWidth: 1,
    borderColor: colores.borde,
    gap: espaciado.md,
  },
  encabezadoTarjetaCrystal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.md,
  },
  iconoUsuarioCrystal: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inicialesUsuarioCrystal: {
    fontSize: 16,
    fontWeight: '700',
    color: colores.primario,
  },
  infoUsuarioCrystal: {
    flex: 1,
  },
  nombreUsuarioCrystal: {
    fontSize: tipografia.tamanos.md,
    fontWeight: '600',
    color: colores.textoPrincipal,
  },
  dniUsuarioCrystal: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoAtenuado,
    marginTop: 2,
  },
  filaEstadisticasCrystal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.fondo,
    borderRadius: radioBorde.lg,
    padding: espaciado.md,
  },
  estadisticaCrystal: {
    flex: 1,
    alignItems: 'center',
    gap: espaciado.xs,
  },
  valorEstadisticaCrystal: {
    fontSize: tipografia.tamanos.md,
    fontWeight: '700',
    color: colores.textoPrincipal,
  },
  etiquetaEstadisticaCrystal: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoAtenuado,
  },
  divisorEstadisticaCrystal: {
    width: 1,
    height: 30,
    backgroundColor: colores.borde,
  },
  botonCheckIn: {
    position: 'absolute',
    bottom: espaciado.xl,
    right: espaciado.xl,
    backgroundColor: colores.primario,
    borderRadius: radioBorde.full,
    paddingVertical: espaciado.md,
    paddingHorizontal: espaciado.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
    ...{
      shadowColor: colores.primario,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 10,
    },
  },
  textoBotonCheckIn: {
    fontSize: tipografia.tamanos.md,
    fontWeight: '700',
    color: colores.fondo,
  },
});
