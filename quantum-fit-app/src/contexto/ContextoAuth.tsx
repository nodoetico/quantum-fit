import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  servicioAuth,
  servicioCheckIn,
  servicioUsuario,
  servicioReservas,
  servicioPullExterno,
  servicioPagos,
  estaAutenticado as verificarAutenticacion,
  obtenerToken,
} from '../servicios/api';
import { servicioWebSocket } from '../servicios/websocket';
import { Usuario, Reserva, Logro, RegistroActividad, EstadisticasSemanales, SuscripcionLocal } from '../tipos';

// Los campos de este perfil vienen del sistema Crystal (contrato del backend)
interface PerfilExterno {
  id: number;
  name: string;
  email: string;
  dni: string;
  balance: number;
  qr_code: string;
  phone: string | null;
}

interface TipoContextoAuth {
  usuario: Usuario | null;
  autenticado: boolean;
  cargando: boolean;
  errorLogin: string;
  iniciarSesion: (email: string, contrasena: string) => Promise<boolean>;
  registrar: (nombre: string, email: string, contrasena: string, dni: string) => Promise<string | null>;
  cerrarSesion: () => Promise<void>;
  restablecerContrasena: (email: string) => Promise<boolean>;
  completarRestablecimiento: (token: string, contrasena: string) => Promise<boolean>;
  restableciendo: boolean;
  reservas: Reserva[];
  logros: Logro[];
  registroActividad: RegistroActividad[];
  estadisticasSemanales: EstadisticasSemanales;
  refrescarUsuario: () => Promise<void>;
  cargarActividad: () => Promise<void>;
  cargarLogros: () => Promise<void>;
  cargarReservas: () => Promise<void>;
  refrescarTodo: () => Promise<void>;
  realizarCheckIn: (type: 'CLASS' | 'OPEN_GYM' | 'PERSONAL_TRAINER', validationMethod: 'QR_SCAN' | 'STAFF_VALIDATION' | 'GEOFENCE') => Promise<any>;
  perfilExterno: PerfilExterno | null;
  asistenciasExternas: any[];
  membresiasExternas: any[];
  cargarDatosExternos: () => Promise<void>;
  cargandoExterno: boolean;
  suscripcion: SuscripcionLocal | null;
  cargarSuscripcion: () => Promise<void>;
}

const ContextoAuth = createContext<TipoContextoAuth | undefined>(undefined);

export const ProveedorAuth: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [logros, setLogros] = useState<Logro[]>([]);
  const [registroActividad, setRegistroActividad] = useState<RegistroActividad[]>([]);
  const [estadisticasSemanales, setEstadisticasSemanales] = useState<EstadisticasSemanales>({
    currentWeek: {
      year: new Date().getFullYear(),
      week: 1,
      weekStartDate: new Date(),
      weekEndDate: new Date(),
      workoutsCompleted: 0,
      classesAttended: 0,
      totalPoints: 0,
      totalCheckIns: 0,
      attendanceRate: 0,
      activeDays: 0,
      activeDaysBitmap: 0,
      isPerfectWeek: false,
    },
    previousWeeks: [],
    summary: {
      totalWeeks: 0,
      perfectWeeks: 0,
      totalWorkouts: 0,
      totalPoints: 0,
    },
  });
  const [restableciendo, setRestableciendo] = useState(false);
  const [perfilExterno, setPerfilExterno] = useState<PerfilExterno | null>(null);
  const [asistenciasExternas, setAsistenciasExternas] = useState<any[]>([]);
  const [membresiasExternas, setMembresiasExternas] = useState<any[]>([]);
  const [cargandoExterno, setCargandoExterno] = useState(false);
  const [suscripcion, setSuscripcion] = useState<SuscripcionLocal | null>(null);

  useEffect(() => {
    cargarUsuario();
  }, []);

  useEffect(() => {
    if (usuario) {
      servicioWebSocket.conectar(usuario.id);

      const desuscribirPuntos = servicioWebSocket.alActualizarPuntos((datos) => {
        setUsuario(prev => prev ? { ...prev, points: datos.newBalance } : prev);
      });

      const desuscribirLogros = servicioWebSocket.alDesbloquearLogro((datos) => {
        cargarLogros();
      });

      const desuscribirRacha = servicioWebSocket.alActualizarRacha((datos) => {
        setUsuario(prev => prev ? { ...prev, currentStreak: datos.current } : prev);
      });

      return () => {
        desuscribirPuntos();
        desuscribirLogros();
        desuscribirRacha();
        servicioWebSocket.desconectar();
      };
    }
  }, [usuario?.id]);

  const estaTokenVencido = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  const cargarUsuario = async () => {
    try {
      const esAutenticado = await verificarAutenticacion();

      if (esAutenticado) {
        const token = await obtenerToken();
        if (token && estaTokenVencido(token)) {
          await servicioAuth.cerrarSesion();
          setCargando(false);
          return;
        }
        const datosUsuario = await servicioAuth.obtenerUsuarioActual();
        if (datosUsuario) {
          setUsuario(datosUsuario);
          cargarActividad();
          cargarLogros();
          cargarReservas();
          cargarEstadisticasSemanales();
          cargarDatosExternos();
          cargarSuscripcion();
        }
      }
    } catch (error) {
      console.error('Error al cargar el usuario:', error);
    } finally {
      setCargando(false);
    }
  };

  const cargarActividad = async () => {
    try {
      const data = await servicioUsuario.obtenerRegistroActividad(20);
      setRegistroActividad((data?.logs || []).map((log: any) => ({
        ...log,
        date: log.date ? new Date(log.date) : new Date(),
      })));
    } catch (error) {
      console.error('Error al cargar la actividad:', error);
    }
  };

  const cargarLogros = async () => {
    try {
      const data = await servicioUsuario.obtenerLogros();
      setLogros(data?.all || []);
    } catch (error) {
      console.error('Error al cargar los logros:', error);
    }
  };

  const cargarReservas = async () => {
    try {
      const data = await servicioReservas.obtenerMisReservas();
      setReservas(data || []);
    } catch (error) {
      console.error('Error al cargar las reservas:', error);
    }
  };

  const cargarEstadisticasSemanales = async () => {
    try {
      const data = await servicioUsuario.obtenerEstadisticasSemanales();
      if (data) {
        setEstadisticasSemanales(data);
      }
    } catch (error) {
      console.error('Error al cargar las estadísticas semanales:', error);
    }
  };

  const cargarDatosExternos = async (dniOverride?: string) => {
    try {
      setCargandoExterno(true);
      const dni = dniOverride || usuario?.dni || undefined;
      const [perfil, datosMembresias, datosAsistencias] = await Promise.all([
        servicioPullExterno.obtenerPerfil(dni).catch(() => null),
        servicioPullExterno.obtenerMembresias(dni).catch(() => null),
        servicioPullExterno.obtenerAsistencias(dni).catch(() => null),
      ]);
      setPerfilExterno(perfil);
      setMembresiasExternas(datosMembresias?.data || []);
      setAsistenciasExternas(datosAsistencias?.data || []);
    } catch (error) {
      console.error('Error al cargar datos externos:', error);
    } finally {
      setCargandoExterno(false);
    }
  };

  const cargarSuscripcion = async () => {
    try {
      const sub = await servicioPagos.obtenerMiSuscripcion();
      setSuscripcion(sub);
      // Sincronizar isVip del usuario con la suscripción
      if (sub && sub.isVip !== usuario?.isVip) {
        setUsuario(prev => prev ? { ...prev, isVip: sub.isVip, vipSince: sub.vipSince } : prev);
      }
    } catch (error) {
      console.error('Error al cargar la suscripción:', error);
    }
  };

  const [errorLogin, setErrorLogin] = useState<string>('');

  const iniciarSesion = async (email: string, contrasena: string): Promise<boolean> => {
    try {
      setErrorLogin('');
      const datosUsuario = await servicioAuth.iniciarSesion(email, contrasena);
      setUsuario(datosUsuario);
      servicioWebSocket.conectar(datosUsuario.id);
      cargarActividad();
      cargarLogros();
      cargarEstadisticasSemanales();
      cargarDatosExternos();
      cargarSuscripcion();
      return true;
    } catch (error: any) {
      if (error?.code === 'ERR_NETWORK') {
        setErrorLogin('No se puede conectar al servidor. Verificá que:\n1. El backend esté corriendo\n2. El teléfono esté en la misma red WiFi\n3. La IP en .env sea correcta');
      } else if (error?.response?.status === 401) {
        setErrorLogin('Credenciales inválidas');
      } else if (error?.response?.data?.error) {
        setErrorLogin(error.response.data.error);
      } else {
        setErrorLogin('Error de conexión: ' + (error?.message || 'desconocido'));
      }
      return false;
    }
  };

  const registrar = async (nombre: string, email: string, contrasena: string, dni: string): Promise<string | null> => {
    try {
      const datosUsuario = await servicioAuth.registrar(nombre, email, contrasena, dni);
      setUsuario(datosUsuario);
      servicioWebSocket.conectar(datosUsuario.id);
      // Cargar datos externos (Crystal/MiFit) automáticamente post-registro
      cargarDatosExternos(dni);
      cargarSuscripcion();
      return null;
    } catch (error: any) {
      const msg = error?.response?.data?.error || error?.message || 'Error al conectar con el servidor';
      console.error('Error en el registro:', msg);
      return msg;
    }
  };

  const cerrarSesion = async () => {
    try {
      await servicioAuth.cerrarSesion();
      servicioWebSocket.desconectar();
      setUsuario(null);
      setReservas([]);
      setLogros([]);
      setRegistroActividad([]);
      setPerfilExterno(null);
      setAsistenciasExternas([]);
      setMembresiasExternas([]);
      setSuscripcion(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const restablecerContrasena = async (email: string): Promise<boolean> => {
    try {
      setRestableciendo(true);
      await servicioAuth.olvideContrasena(email);
      return true;
    } catch (error) {
      return false;
    } finally {
      setRestableciendo(false);
    }
  };

  const completarRestablecimiento = async (token: string, contrasena: string): Promise<boolean> => {
    try {
      setRestableciendo(true);
      await servicioAuth.restablecerContrasena(token, contrasena);
      return true;
    } catch (error) {
      return false;
    } finally {
      setRestableciendo(false);
    }
  };

  const refrescarUsuario = async () => {
    try {
      const datosUsuario = await servicioUsuario.obtenerPerfil();
      setUsuario(datosUsuario);
    } catch (error) {
      console.error('Error al refrescar el usuario:', error);
    }
  };

  const refrescarTodo = async () => {
    await refrescarUsuario();
    await cargarActividad();
    await cargarLogros();
    await cargarEstadisticasSemanales();
    await cargarDatosExternos();
    await cargarSuscripcion();
  };

  const realizarCheckIn = async (
    type: 'CLASS' | 'OPEN_GYM' | 'PERSONAL_TRAINER',
    validationMethod: 'QR_SCAN' | 'STAFF_VALIDATION' | 'GEOFENCE'
  ) => {
    const result = await servicioCheckIn.crearCheckIn(type, validationMethod);

    if (usuario) {
      setUsuario({
        ...usuario,
        points: result.newBalance,
        currentStreak: result.streak.current,
      });
    }

    return result;
  };

  return (
    <ContextoAuth.Provider
      value={{
        usuario,
        autenticado: !!usuario,
        cargando,
        errorLogin,
        iniciarSesion,
        registrar,
        cerrarSesion,
        restablecerContrasena,
        completarRestablecimiento,
        restableciendo,
        reservas,
        logros,
        registroActividad,
        estadisticasSemanales,
        refrescarUsuario,
        cargarActividad,
        cargarLogros,
        cargarReservas,
        refrescarTodo,
        realizarCheckIn,
        perfilExterno,
        asistenciasExternas,
        membresiasExternas,
        cargarDatosExternos,
        cargandoExterno,
        suscripcion,
        cargarSuscripcion,
      }}
    >
      {children}
    </ContextoAuth.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(ContextoAuth);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un ProveedorAuth');
  }
  return context;
};
