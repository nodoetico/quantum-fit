import { useState, useEffect } from 'react';
import { bookingsService, classesService, authService } from '../services/api';
import { useAuth } from '../context/useAuth';
import type { Booking, User, Class } from '../types';

export default function Reservas() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [createFormData, setCreateFormData] = useState({ userId: '', classId: '' });

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    if (showCreateModal) {
      authService.getUsers().then(setUsers).catch(() => {});
      classesService.getAll({ limit: 100 }).then((r) => setClasses(r.data?.classes || [])).catch(() => {});
    }
  }, [showCreateModal]);

  async function handleCreateBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!createFormData.userId || !createFormData.classId) {
      alert('Seleccioná un usuario y una clase');
      return;
    }
    try {
      await bookingsService.create(createFormData);
      setShowCreateModal(false);
      setCreateFormData({ userId: '', classId: '' });
      await loadBookings();
    } catch {
      alert('Error al crear la reserva');
    }
  }

  async function loadBookings() {
    try {
      const response = await bookingsService.getAll({ limit: 50 });
      setBookings(response.data?.bookings || []);
    } catch {
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(id: string, status: string) {
    try {
      await bookingsService.update(id, { status });
      await loadBookings();
    } catch {
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de eliminar esta reserva?')) return;
    
    try {
      await bookingsService.delete(id);
      await loadBookings();
    } catch {
    }
  }

  const filteredBookings = filter
    ? bookings.filter((b) =>
        b.user?.name.toLowerCase().includes(filter.toLowerCase()) ||
        b.class?.name.toLowerCase().includes(filter.toLowerCase())
      )
    : bookings;

  const statusColors = {
    CONFIRMED: 'bg-secondary-500/20 text-secondary-400 border-secondary-500/50',
    CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/50',
    COMPLETED: 'bg-primary-500/20 text-primary-400 border-primary-500/50',
    NO_SHOW: 'bg-dark-500/20 text-dark-400 border-dark-500/50',
  };

  const statusLabels = {
    CONFIRMED: 'Confirmada',
    CANCELLED: 'Cancelada',
    COMPLETED: 'Completada',
    NO_SHOW: 'No asistió',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Reservas</h1>
          <p className="text-primary-400">Gestión de reservas de clases</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium text-sm hover:opacity-90 whitespace-nowrap"
          >
            + Nueva Reserva
          </button>
          <input
            type="text"
            placeholder="Buscar por usuario o clase..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-dark-400 border border-border rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-dark-200 rounded-xl border border-primary-500/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-100 border-b border-primary-500/30">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">
                  Clase
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">
                  Asistió
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-primary-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-500/20">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-primary-400">
                    No hay reservas encontradas
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-dark-100 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{booking.user?.name}</p>
                        <p className="text-sm text-primary-400">{booking.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{booking.class?.name}</p>
                        <p className="text-sm text-primary-400">{booking.class?.activityType}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-primary-300">
                      {new Date(booking.class?.startTime || booking.bookedAt).toLocaleString('es-AR')}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[booking.status]}`}
                      >
                        {statusLabels[booking.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={booking.attended}
                        onChange={async () => {
                          try {
                            await bookingsService.update(booking.id, { attended: !booking.attended });
                            await loadBookings();
                          } catch {
                          }
                        }}
                        className="w-4 h-4 rounded border-primary-500/50 bg-dark-400 text-primary-500 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                        className="px-3 py-1 bg-dark-400 border border-primary-500/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="CONFIRMED">Confirmada</option>
                        <option value="CANCELLED">Cancelar</option>
                        <option value="COMPLETED">Completada</option>
                        <option value="NO_SHOW">No Show</option>
                      </select>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(booking.id)}
                          className="ml-2 text-red-400 hover:text-red-300 transition-colors"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nueva Reserva */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-dark-200 rounded-2xl border border-primary-500/30 p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-6">Nueva Reserva</h2>
            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-2">Usuario *</label>
                <select
                  value={createFormData.userId}
                  onChange={(e) => setCreateFormData({ ...createFormData, userId: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-dark-400 border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Seleccionar usuario...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-2">Clase *</label>
                <select
                  value={createFormData.classId}
                  onChange={(e) => setCreateFormData({ ...createFormData, classId: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-dark-400 border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Seleccionar clase...</option>
                  {classes.filter((c) => c.isActive).map((c) => (
                    <option key={c.id} value={c.id}>{c.name} - {new Date(c.startTime).toLocaleString('es-AR')}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowCreateModal(false); setCreateFormData({ userId: '', classId: '' }); }}
                  className="flex-1 px-4 py-3 bg-dark-400 hover:bg-dark-300 text-white rounded-lg transition-all">
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-medium rounded-lg transition-all glow-primary">
                  Crear Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
