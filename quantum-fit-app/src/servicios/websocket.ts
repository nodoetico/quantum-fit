// Servicio de WebSocket para notificaciones en tiempo real
import io, { Socket } from 'socket.io-client';
import { URL_SOCKET } from '../configuracion/api';

class ServicioWebSocket {
  private socket: Socket | null = null;
  private idUsuario: string | null = null;

  /**
   * Conectar al servidor WebSocket
   */
  conectar(idUsuario: string) {
    if (this.socket?.connected) {
      return;
    }

    this.idUsuario = idUsuario;

    this.socket = io(URL_SOCKET, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: 20,
    });

    this.socket.on('connect', () => {
      // Unirse al canal del usuario
      if (this.idUsuario) {
        this.socket?.emit('join-user', this.idUsuario);
      }
    });

    this.socket.on('disconnect', () => {});

    this.socket.on('connect_error', () => {});

    return this.socket;
  }

  /**
   * Escuchar actualización de puntos
   */
  alActualizarPuntos(callback: (datos: { userId: string; newBalance: number; earned: number }) => void) {
    if (!this.socket) {
      return () => {};
    }

    this.socket.on('points-updated', callback);

    // Retornar función para limpiar listener
    return () => {
      this.socket?.off('points-updated', callback);
    };
  }

  /**
   * Escuchar logro desbloqueado
   */
  alDesbloquearLogro(callback: (datos: { achievement: any; points: number }) => void) {
    if (!this.socket) {
      return () => {};
    }

    this.socket.on('achievement-unlocked', callback);

    return () => {
      this.socket?.off('achievement-unlocked', callback);
    };
  }

  /**
   * Escuchar actualización de racha
   */
  alActualizarRacha(callback: (datos: { current: number; isPerfectWeek: boolean }) => void) {
    if (!this.socket) {
      return () => {};
    }

    this.socket.on('streak-updated', callback);

    return () => {
      this.socket?.off('streak-updated', callback);
    };
  }

  /**
   * Desconectar WebSocket
   */
  desconectar() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.idUsuario = null;
    }
  }

  /**
   * Verificar si está conectado
   */
  estaConectado(): boolean {
    return this.socket?.connected ?? false;
  }
}

// Exportar instancia singleton
export const servicioWebSocket = new ServicioWebSocket();
export default servicioWebSocket;
