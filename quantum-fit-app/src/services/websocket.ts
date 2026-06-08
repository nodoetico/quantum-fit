// Servicio de WebSocket para notificaciones en tiempo real
import io, { Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config/api';

class WebSocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;

  /**
   * Conectar al servidor WebSocket
   */
  connect(userId: string) {
    if (this.socket?.connected) {
      return;
    }

    this.userId = userId;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: 20,
    });

    this.socket.on('connect', () => {
      // Unirse al canal del usuario
      if (this.userId) {
        this.socket?.emit('join-user', this.userId);
      }
    });

    this.socket.on('disconnect', () => {});

    this.socket.on('connect_error', () => {});

    return this.socket;
  }

  /**
   * Escuchar actualización de puntos
   */
  onPointsUpdated(callback: (data: { userId: string; newBalance: number; earned: number }) => void) {
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
  onAchievementUnlocked(callback: (data: { achievement: any; points: number }) => void) {
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
  onStreakUpdated(callback: (data: { current: number; isPerfectWeek: boolean }) => void) {
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
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
    }
  }

  /**
   * Verificar si está conectado
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

// Exportar instancia singleton
export const websocketService = new WebSocketService();
export default websocketService;
