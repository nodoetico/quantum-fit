import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colores, espaciado, radioBorde, tipografia } from '../../constantes/tema';
import { useAuth } from '../../contexto/ContextoAuth';
import type { Logro } from '../../tipos';
import type { PropsPantallaTabPrincipal } from '../../tipos/navegacion';

type PropsPantallaPerfil = PropsPantallaTabPrincipal<'Perfil'>;

export default function PantallaPerfil({ navigation, route }: PropsPantallaPerfil) {
  const { usuario, logros, estadisticasSemanales, registroActividad, asistenciasExternas } = useAuth();
  const [pestanaActiva, setPestanaActiva] = useState<'estadisticas' | 'logros' | 'actividad'>(route?.params?.seccion || 'estadisticas');

  if (!usuario) {
    return (
      <View style={[styles.contenedor, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colores.primario} />
      </View>
    );
  }

  const obtenerProgresoNivel = (nivel: number) => {
    const puntosParaSiguienteNivel = 1000;
    const puntosNivelActual = usuario.points % puntosParaSiguienteNivel;
    return (puntosNivelActual / puntosParaSiguienteNivel) * 100;
  };

  const obtenerInfoNivel = (nivel: number) => {
    const niveles = [
      { nombre: 'Principiante', icono: '🌱', color: colores.nivelBronce, nivelMinimo: 1 },
      { nombre: 'Intermedio', icono: '💪', color: colores.nivelPlata, nivelMinimo: 3 },
      { nombre: 'Avanzado', icono: '🔥', color: colores.nivelOro, nivelMinimo: 5 },
      { nombre: 'Experto', icono: '⭐', color: colores.nivelPlatino, nivelMinimo: 7 },
      { nombre: 'Élite', icono: '💎', color: colores.nivelDiamante, nivelMinimo: 9 },
      { nombre: 'Leyenda', icono: '👑', color: colores.primario, nivelMinimo: 11 },
    ];
    
    for (let i = niveles.length - 1; i >= 0; i--) {
      if (nivel >= niveles[i].nivelMinimo) {
        return niveles[i];
      }
    }
    return niveles[0];
  };

  const infoNivel = obtenerInfoNivel(usuario.level);

  // Convertir memberSince a Date si es string
  const fechaMiembroDesde = usuario.memberSince 
    ? (typeof usuario.memberSince === 'string' ? new Date(usuario.memberSince) : usuario.memberSince)
    : new Date();

  const entrenamientosCrystal = asistenciasExternas?.length ?? 0;
  const totalEntrenamientos = entrenamientosCrystal > 0 ? entrenamientosCrystal : (usuario.totalWorkouts ?? 0);

  const textoPuesto = usuario.rank && usuario.rank < 9999 ? `#${usuario.rank}` : '—';

  const estadisticas = [
    { etiqueta: 'Entrenamientos', valor: totalEntrenamientos, icono: 'barbell', color: colores.primario },
    { etiqueta: 'Puntos Totales', valor: (usuario.points ?? 0).toLocaleString(), icono: 'trophy', color: colores.puntos },
    { etiqueta: 'Racha Actual', valor: `${usuario.currentStreak ?? 0} días`, icono: 'flame', color: colores.secundario },
    { etiqueta: 'Mejor Racha', valor: `${usuario.longestStreak ?? 0} días`, icono: 'star', color: colores.error },
    { etiqueta: 'Ranking Global', valor: textoPuesto, icono: 'podium', color: colores.nivelOro },
    { etiqueta: 'Miembro Desde', valor: fechaMiembroDesde.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }), icono: 'calendar', color: colores.textoSecundario },
  ];

  const logrosDesbloqueados = logros.filter((a: Logro) => a.unlocked);
  const logrosBloqueados = logros.filter((a: Logro) => !a.unlocked);

  const obtenerIconoActividad = (tipo: string) => {
    switch (tipo) {
      case 'workout':
        return 'barbell';
      case 'class':
        return 'fitness';
      case 'achievement':
        return 'trophy';
      case 'booking':
        return 'calendar';
      default:
        return 'fitness';
    }
  };

  const obtenerColorPuntosActividad = (tipo: string) => {
    switch (tipo) {
      case 'workout':
        return colores.primario;
      case 'class':
        return colores.secundario;
      case 'achievement':
        return colores.puntos;
      case 'booking':
        return colores.informacion;
      default:
        return colores.textoSecundario;
    }
  };

  return (
    <View style={styles.contenedor}>
      {/* Encabezado con Gradiente */}
      <LinearGradient
        colors={[colores.fondoSecundario, colores.fondo]}
        style={styles.encabezado}
      >
        {/* Info del Usuario */}
        <View style={styles.encabezadoPerfil}>
          <View style={styles.contenedorAvatar}>
            <LinearGradient
              colors={[colores.primario, colores.primarioOscuro]}
              style={styles.gradienteAvatar}
            >
              <Text style={styles.textoAvatar}>
                {usuario.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
              </Text>
            </LinearGradient>
            <View style={styles.insigniaNivel}>
              <Text style={styles.textoInsigniaNivel}>{usuario.level}</Text>
            </View>
          </View>

          <View style={styles.infoPerfil}>
            <Text style={styles.nombreUsuario} numberOfLines={1} ellipsizeMode="tail">{usuario.name}</Text>
            <Text style={styles.emailUsuario}>{usuario.email}</Text>
            <View style={styles.contenedorNivel}>
              <Text style={styles.nombreNivel}>{infoNivel.nombre}</Text>
              <Text style={styles.emojiNivel}>{infoNivel.icono}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.botonAjustes}
            onPress={() => navigation.navigate('Configuracion')}
          >
            <Ionicons name="settings-outline" size={24} color={colores.textoPrincipal} />
          </TouchableOpacity>
        </View>

        {/* Barra de Progreso de Nivel */}
        <View style={styles.seccionProgreso}>
          <View style={styles.encabezadoProgreso}>
            <Text style={styles.etiquetaProgreso}>Progreso al siguiente nivel</Text>
            <Text style={styles.porcentajeProgreso}>{Math.round(obtenerProgresoNivel(usuario.level))}%</Text>
          </View>
          <View style={styles.fondoProgreso}>
            <View
              style={[
                styles.rellenoProgreso,
                { width: `${obtenerProgresoNivel(usuario.level)}%` },
                { backgroundColor: infoNivel.color },
              ]}
            />
          </View>
          <Text style={styles.pistaProgreso}>
            {1000 - (usuario.points % 1000)} puntos para el nivel {usuario.level + 1}
          </Text>
        </View>
      </LinearGradient>

      {/* Pestañas */}
      <View style={styles.contenedorPestanas}>
        <TouchableOpacity
          style={[styles.pestana, pestanaActiva === 'estadisticas' && styles.pestanaActiva]}
          onPress={() => setPestanaActiva('estadisticas')}
        >
          <Ionicons
            name="stats-chart"
            size={20}
            color={pestanaActiva === 'estadisticas' ? colores.primario : colores.textoSecundario}
          />
          <Text
            style={[
              styles.textoPestana,
              pestanaActiva === 'estadisticas' && styles.textoPestanaActiva,
            ]}
          >
            Estadísticas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pestana, pestanaActiva === 'logros' && styles.pestanaActiva]}
          onPress={() => setPestanaActiva('logros')}
        >
          <Ionicons
            name="medal"
            size={20}
            color={pestanaActiva === 'logros' ? colores.primario : colores.textoSecundario}
          />
          <Text
            style={[
              styles.textoPestana,
              pestanaActiva === 'logros' && styles.textoPestanaActiva,
            ]}
          >
            Logros
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pestana, pestanaActiva === 'actividad' && styles.pestanaActiva]}
          onPress={() => setPestanaActiva('actividad')}
        >
          <Ionicons
            name="time"
            size={20}
            color={pestanaActiva === 'actividad' ? colores.primario : colores.textoSecundario}
          />
          <Text
            style={[
              styles.textoPestana,
              pestanaActiva === 'actividad' && styles.textoPestanaActiva,
            ]}
          >
            Actividad
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenido de las Pestañas */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contenido}
      >
        {pestanaActiva === 'estadisticas' && (
          <View style={styles.cuadriculaEstadisticas}>
            {estadisticas.map((stat, indice) => (
              <View key={indice} style={styles.tarjetaEstadistica}>
                <View
                  style={[
                    styles.contenedorIconoEstadistica,
                    { backgroundColor: `${stat.color}15` },
                  ]}
                >
                  <Ionicons name={stat.icono as any} size={24} color={stat.color} />
                </View>
                <Text style={styles.valorEstadistica}>{stat.valor}</Text>
                <Text style={styles.etiquetaEstadistica}>{stat.etiqueta}</Text>
              </View>
            ))}

            {/* Gráfico de Actividad Semanal */}
            <View style={styles.tarjetaGraficoSemanal}>
              <Text style={styles.tituloTarjeta}>Actividad Semanal</Text>
              {(() => {
                const hoy = new Date();
                const diaSemana = hoy.getDay();
                const lunes = new Date(hoy);
                lunes.setDate(hoy.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));
                lunes.setHours(0, 0, 0, 0);
                const domingo = new Date(lunes);
                domingo.setDate(lunes.getDate() + 6);

                const diasCrystal = new Set<number>();
                if (asistenciasExternas?.length > 0) {
                  asistenciasExternas.forEach((att: any) => {
                    if (!att.date) return;
                    const fechaAtt = new Date(att.date);
                    if (fechaAtt >= lunes && fechaAtt <= domingo) {
                      const diaAtt = fechaAtt.getDay();
                      const indice = diaAtt === 0 ? 6 : diaAtt - 1;
                      diasCrystal.add(indice);
                    }
                  });
                }

                const hayActividad = diasCrystal.size > 0 || (estadisticasSemanales.currentWeek?.activeDaysBitmap ?? 0) > 0;

                if (!hayActividad) {
                  return (
                    <View style={styles.graficoPrincipiante}>
                      <Ionicons name="fitness-outline" size={48} color={colores.textoAtenuado} />
                      <Text style={styles.textoGraficoPrincipiante}>
                        No hay actividad registrada esta semana.
                      </Text>
                    </View>
                  );
                }

                const bitmap = estadisticasSemanales.currentWeek?.activeDaysBitmap ?? 0;

                return (
                  <View style={styles.graficoSemanal}>
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((dia, indice) => {
                      const estaActivo = diasCrystal.size > 0
                        ? diasCrystal.has(indice)
                        : ((bitmap >> indice) & 1) === 1;
                      const intensidad = estaActivo ? 1 : 0;

                      return (
                        <View key={indice} style={styles.columnaDia}>
                          <View style={styles.contenedorBarra}>
                            <View
                              style={[
                                styles.barra,
                                {
                                  height: `${20 + intensidad * 80}%`,
                                  backgroundColor: estaActivo ? colores.primario : colores.fondo,
                                  borderColor: estaActivo ? colores.primario : colores.borde,
                                },
                              ]}
                            />
                          </View>
                          <Text
                            style={[
                              styles.etiquetaDia,
                              estaActivo && styles.etiquetaDiaActiva,
                            ]}
                          >
                            {dia}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                );
              })()}
            </View>

            <View style={styles.pieEstadisticas}>
              <TouchableOpacity
                style={styles.botonPie}
                onPress={() => navigation.navigate('Membresia')}
              >
                <View style={[styles.iconoPie, { backgroundColor: 'rgba(0, 240, 255, 0.1)' }]}>
                  <Ionicons name="card-outline" size={20} color={colores.primario} />
                </View>
                <Text style={styles.textoBotonPie}>Membresía</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botonPie}
                onPress={() => navigation.navigate('DatosCrystal')}
              >
                <View style={[styles.iconoPie, { backgroundColor: 'rgba(57, 255, 20, 0.1)' }]}>
                  <Ionicons name="server-outline" size={20} color={colores.secundario} />
                </View>
                <Text style={styles.textoBotonPie}>Crystal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botonPie}
                onPress={() => navigation.navigate('Configuracion')}
              >
                <View style={[styles.iconoPie, { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
                  <Ionicons name="settings-outline" size={20} color={colores.puntos} />
                </View>
                <Text style={styles.textoBotonPie}>Ajustes</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {pestanaActiva === 'logros' && (
          <View style={styles.contenedorLogros}>
            {/* Logros Desbloqueados */}
            <View style={styles.seccionLogros}>
              <View style={styles.encabezadoSeccion}>
                <Ionicons name="trophy" size={20} color={colores.puntos} />
                <Text style={styles.tituloSeccion}>
                  Desbloqueados ({logrosDesbloqueados.length})
                </Text>
              </View>
              <View style={styles.cuadriculaLogros}>
                {logrosDesbloqueados.map((logro: Logro) => (
                  <View key={logro.id} style={styles.tarjetaLogro}>
                    <View style={styles.iconoLogroDesbloqueado}>
                      <Text style={styles.emojiIconoLogro}>{logro.icon}</Text>
                    </View>
                    <Text style={styles.nombreLogro}>{logro.name}</Text>
                    <Text style={styles.descripcionLogro}>{logro.description}</Text>
                    <View style={styles.metaLogro}>
                      <Ionicons name="calendar" size={12} color={colores.textoAtenuado} />
                      <Text style={styles.fechaLogro}>
                        {logro.unlockedAt?.toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Logros Bloqueados */}
            <View style={styles.seccionLogros}>
              <View style={styles.encabezadoSeccion}>
                <Ionicons name="lock-closed" size={20} color={colores.textoAtenuado} />
                <Text style={styles.tituloSeccion}>
                  Pendientes ({logrosBloqueados.length})
                </Text>
              </View>
              <View style={styles.cuadriculaLogros}>
                {logrosBloqueados.map((logro: Logro) => (
                  <View key={logro.id} style={styles.tarjetaLogroBloqueada}>
                    <View style={styles.iconoLogroBloqueado}>
                      <Ionicons name="lock-closed" size={24} color={colores.textoAtenuado} />
                    </View>
                    <Text style={styles.nombreLogroBloqueado}>{logro.name}</Text>
                    <Text style={styles.descripcionLogroBloqueada}>
                      {logro.description}
                    </Text>
                    <View style={styles.metaLogro}>
                      <Ionicons name="trophy" size={12} color={colores.textoAtenuado} />
                      <Text style={styles.puntosLogro}>{logro.pointsRequired} pts</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {pestanaActiva === 'actividad' && (
          <View style={styles.contenedorActividad}>
            <View style={styles.encabezadoActividad}>
              <Text style={styles.tituloActividad}>Historial de Actividad</Text>
            </View>

            <View style={styles.listaActividad}>
              {asistenciasExternas && asistenciasExternas.length > 0 ? (
                [...asistenciasExternas]
                  .sort((a: any, b: any) => {
                    const fechaA = a.date ? new Date(a.date).getTime() : 0;
                    const fechaB = b.date ? new Date(b.date).getTime() : 0;
                    return fechaB - fechaA;
                  })
                  .map((att: any, indice: number) => {
                    const fechaAtt = att.date ? new Date(att.date) : null;
                    return (
                      <View key={att.id || indice} style={styles.itemActividad}>
                        <View style={[styles.iconoActividad, { backgroundColor: `${colores.primario}15` }]}>
                          <Ionicons name="fitness" size={20} color={colores.primario} />
                        </View>
                        <View style={styles.infoActividad}>
                          <Text style={styles.descripcionActividad}>
                            {att.type || 'Entrenamiento'}
                          </Text>
                          <Text style={styles.fechaActividad}>
                            {fechaAtt
                              ? fechaAtt.toLocaleDateString('es-ES', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Fecha no disponible'}
                          </Text>
                          {att.location ? (
                            <Text style={styles.fechaActividad}>{att.location}</Text>
                          ) : null}
                        </View>
                      </View>
                    );
                  })
              ) : registroActividad && registroActividad.length > 0 ? (
                registroActividad.map((log: any) => (
                  <View key={log.id} style={styles.itemActividad}>
                    <View style={[styles.iconoActividad, { backgroundColor: `${obtenerColorPuntosActividad(log.type)}15` }]}>
                      <Ionicons name={obtenerIconoActividad(log.type) as any} size={20} color={obtenerColorPuntosActividad(log.type)} />
                    </View>
                    <View style={styles.infoActividad}>
                      <Text style={styles.descripcionActividad}>{log.description}</Text>
                      <Text style={styles.fechaActividad}>
                        {log.date instanceof Date
                          ? log.date.toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'long',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </Text>
                    </View>
                    <View style={styles.puntosActividad}>
                      <Text style={styles.valorPuntosActividad}>+{log.points}</Text>
                      <Ionicons name="trophy" size={14} color={colores.puntos} />
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.graficoPrincipiante}>
                  <Ionicons name="calendar-outline" size={48} color={colores.textoAtenuado} />
                  <Text style={styles.textoGraficoPrincipiante}>
                    No hay actividad registrada aún.
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Espaciado inferior */}
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
  encabezado: {
    paddingTop: espaciado.xxl,
    paddingBottom: espaciado.lg,
  },
  encabezadoPerfil: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: espaciado.xl,
    marginBottom: espaciado.lg,
    gap: espaciado.md,
  },
  contenedorAvatar: {
    position: 'relative',
  },
  gradienteAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoAvatar: {
    fontSize: 28,
    fontWeight: '700',
    color: colores.fondo,
  },
  insigniaNivel: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colores.primario,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colores.fondo,
  },
  textoInsigniaNivel: {
    fontSize: 12,
    fontWeight: '700',
    color: colores.fondo,
  },
  infoPerfil: {
    flex: 1,
    minWidth: 0, // Permite que el texto se contraiga
  },
  nombreUsuario: {
    fontSize: tipografia.tamanos.xl,
    fontWeight: '700',
    color: colores.textoPrincipal,
    marginBottom: espaciado.xs,
  },
  emailUsuario: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoSecundario,
    marginBottom: espaciado.sm,
  },
  contenedorNivel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.fondoTarjeta,
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.sm,
    borderRadius: radioBorde.full,
    alignSelf: 'flex-start',
    gap: espaciado.xs,
  },
  nombreNivel: {
    fontSize: tipografia.tamanos.sm,
    fontWeight: '600',
    color: colores.textoPrincipal,
  },
  emojiNivel: {
    fontSize: 16,
  },
  botonAjustes: {
    width: 40,
    height: 40,
    borderRadius: radioBorde.full,
    backgroundColor: colores.fondoTarjeta,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seccionProgreso: {
    paddingHorizontal: espaciado.xl,
  },
  encabezadoProgreso: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: espaciado.sm,
  },
  etiquetaProgreso: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoSecundario,
  },
  porcentajeProgreso: {
    fontSize: tipografia.tamanos.sm,
    fontWeight: '700',
    color: colores.primario,
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
  pistaProgreso: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoAtenuado,
    marginTop: espaciado.sm,
  },
  contenedorPestanas: {
    flexDirection: 'row',
    paddingHorizontal: espaciado.xl,
    marginBottom: espaciado.lg,
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.lg,
    marginHorizontal: espaciado.xl,
    padding: espaciado.sm,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  pestana: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: espaciado.sm,
    gap: espaciado.xs,
    borderRadius: radioBorde.md,
  },
  pestanaActiva: {
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
  },
  textoPestana: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoSecundario,
    fontWeight: '500',
  },
  textoPestanaActiva: {
    color: colores.primario,
    fontWeight: '600',
  },
  contenido: {
    paddingHorizontal: espaciado.xl,
  },
  cuadriculaEstadisticas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciado.md,
  },
  tarjetaEstadistica: {
    width: '48%',
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.lg,
    padding: espaciado.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colores.borde,
  },
  contenedorIconoEstadistica: {
    width: 44,
    height: 44,
    borderRadius: radioBorde.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: espaciado.sm,
  },
  valorEstadistica: {
    fontSize: tipografia.tamanos.xl,
    fontWeight: '700',
    color: colores.textoPrincipal,
    marginBottom: espaciado.xs,
  },
  etiquetaEstadistica: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoSecundario,
    textAlign: 'center',
  },
  tarjetaGraficoSemanal: {
    width: '100%',
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.lg,
    padding: espaciado.lg,
    marginTop: espaciado.md,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  graficoPrincipiante: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    gap: espaciado.md,
  },
  textoGraficoPrincipiante: {
    fontSize: tipografia.tamanos.sm,
    color: colores.textoAtenuado,
    textAlign: 'center',
    paddingHorizontal: espaciado.lg,
    lineHeight: 20,
  },
  tituloTarjeta: {
    fontSize: tipografia.tamanos.md,
    fontWeight: '600',
    color: colores.textoPrincipal,
    marginBottom: espaciado.lg,
  },
  graficoSemanal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  columnaDia: {
    alignItems: 'center',
  },
  contenedorBarra: {
    width: 24,
    height: 100,
    justifyContent: 'flex-end',
    marginBottom: espaciado.sm,
  },
  barra: {
    width: '100%',
    borderRadius: radioBorde.sm,
    borderWidth: 1,
  },
  etiquetaDia: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoAtenuado,
  },
  etiquetaDiaActiva: {
    color: colores.textoSecundario,
    fontWeight: '600',
  },
  contenedorLogros: {
    marginTop: espaciado.sm,
  },
  seccionLogros: {
    marginBottom: espaciado.xl,
  },
  encabezadoSeccion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
    marginBottom: espaciado.md,
  },
  tituloSeccion: {
    fontSize: tipografia.tamanos.md,
    fontWeight: '600',
    color: colores.textoPrincipal,
  },
  cuadriculaLogros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciado.md,
  },
  tarjetaLogro: {
    width: '48%',
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.lg,
    padding: espaciado.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colores.borde,
  },
  iconoLogroDesbloqueado: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: espaciado.sm,
  },
  emojiIconoLogro: {
    fontSize: 32,
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
    color: colores.textoSecundario,
    textAlign: 'center',
    marginBottom: espaciado.sm,
    lineHeight: 16,
  },
  metaLogro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.xs,
  },
  fechaLogro: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoAtenuado,
  },
  tarjetaLogroBloqueada: {
    width: '48%',
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.lg,
    padding: espaciado.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colores.borde,
    borderStyle: 'dashed',
    opacity: 0.7,
  },
  iconoLogroBloqueado: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
  descripcionLogroBloqueada: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoAtenuado,
    textAlign: 'center',
    marginBottom: espaciado.sm,
    lineHeight: 16,
  },
  puntosLogro: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoAtenuado,
  },
  contenedorActividad: {
    marginTop: espaciado.sm,
  },
  encabezadoActividad: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: espaciado.lg,
  },
  tituloActividad: {
    fontSize: tipografia.tamanos.md,
    fontWeight: '600',
    color: colores.textoPrincipal,
  },
  filtroActividad: {
    fontSize: tipografia.tamanos.sm,
    color: colores.primario,
  },
  listaActividad: {
    gap: espaciado.md,
  },
  itemActividad: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.lg,
    padding: espaciado.md,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  iconoActividad: {
    width: 40,
    height: 40,
    borderRadius: radioBorde.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: espaciado.md,
  },
  infoActividad: {
    flex: 1,
  },
  descripcionActividad: {
    fontSize: tipografia.tamanos.sm,
    fontWeight: '500',
    color: colores.textoPrincipal,
    marginBottom: espaciado.xs,
  },
  fechaActividad: {
    fontSize: tipografia.tamanos.xs,
    color: colores.textoAtenuado,
  },
  puntosActividad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.xs,
  },
  valorPuntosActividad: {
    fontSize: tipografia.tamanos.md,
    fontWeight: '700',
    color: colores.puntos,
  },

  pieEstadisticas: {
    flexDirection: 'row',
    gap: espaciado.md,
    marginTop: espaciado.md,
    width: '100%',
  },
  botonPie: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colores.fondoTarjeta,
    borderRadius: radioBorde.lg,
    paddingVertical: espaciado.md,
    borderWidth: 1,
    borderColor: colores.borde,
    gap: 4,
  },
  iconoPie: {
    width: 32,
    height: 32,
    borderRadius: radioBorde.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoBotonPie: {
    fontSize: 10,
    fontWeight: '600',
    color: colores.textoSecundario,
  },
});
