import { useState, useEffect } from 'react';
import { bookingsService, classesService, authService } from '../services/api';
import { useAuth } from '../context/useAuth';
import type { Class, Booking, User } from '../types';

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    vipUsers: 0,
    totalBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalClasses: 0,
    activeClasses: 0,
    avgOccupancy: 0,
    todayCheckins: 0,
  });
  const [upcomingClasses, setUpcomingClasses] = useState<Class[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [bookingsStats, classesStats, upcomingRes, recentRes] = await Promise.all([
          bookingsService.getStats(),
          classesService.getStats(),
          classesService.getAll({ isActive: true, limit: 5 }),
          bookingsService.getAll({ limit: 5 }),
        ]);

        let usersCount = { data: { total: 0 } };
        let allUsers: User[] = [];
        if (isAdmin) {
          const [countRes, usersRes] = await Promise.all([
            authService.getUsersCount(),
            authService.getUsers(),
          ]);
          usersCount = countRes;
          allUsers = usersRes || [];
        }

        setStats({
          totalUsers: usersCount.data?.total || 0,
          activeUsers: allUsers.filter((u) => u.isActive).length,
          vipUsers: allUsers.filter((u) => u.isVip).length,
          totalBookings: bookingsStats.data?.total || 0,
          confirmedBookings: bookingsStats.data?.byStatus?.confirmed || 0,
          completedBookings: bookingsStats.data?.byStatus?.completed || 0,
          cancelledBookings: bookingsStats.data?.byStatus?.cancelled || 0,
          totalClasses: classesStats.data?.total || 0,
          activeClasses: classesStats.data?.active || 0,
          avgOccupancy: classesStats.data?.avgOccupancy || 0,
          todayCheckins: 0,
        });

        setUpcomingClasses(
          (upcomingRes.data?.classes || [])
            .filter((c: Class) => new Date(c.startTime) > new Date())
            .slice(0, 5)
        );

        setRecentBookings(recentRes.data?.bookings || []);
      } catch {
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
  }, [isAdmin]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Panel de control</h1>
        <p className="text-gray-400">Resumen general del gimnasio</p>
      </div>

      {/* Stats Cards - Fila 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Usuarios Totales"
          value={stats.totalUsers}
          subtitle={`${stats.activeUsers} activos · ${stats.vipUsers} VIP`}
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
          }
        />
<StatCard
          title="Ocupación Promedio"
          value={`${stats.avgOccupancy}%`}
          subtitle="Capacidad utilizada"
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
          }
        />
        <StatCard
          title="Reservas Totales"
          value={stats.totalBookings}
          subtitle={`${stats.confirmedBookings} confirmadas · ${stats.completedBookings} completadas`}
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5v-5z"/>
            </svg>
          }
        />
        <StatCard
          title="Ocupación Promedio"
          value={`${stats.avgOccupancy}%`}
          subtitle="Capacidad utilizada"
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          }
        />
      </div>

      {/* Stats Cards - Fila 2: Detalle de reservas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStatCard
          title="Confirmadas"
          value={stats.confirmedBookings}
          color="bg-neutral-800 text-white"
        />
        <MiniStatCard
          title="Completadas"
          value={stats.completedBookings}
          color="bg-neutral-800 text-white"
        />
        <MiniStatCard
          title="Canceladas"
          value={stats.cancelledBookings}
          color="bg-neutral-800 text-white"
        />
        <MiniStatCard
          title="Usuarios Activos"
          value={stats.activeUsers}
          color="bg-neutral-800 text-white"
        />
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas Clases */}
        <div className="bg-neutral-900 rounded-xl border border-neutral-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Próximas Clases</h2>
          {upcomingClasses.length === 0 ? (
            <p className="text-gray-400 text-sm">No hay clases próximas</p>
          ) : (
            <div className="space-y-3">
              {upcomingClasses.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg border border-neutral-700">
                  <div>
                    <p className="text-white font-medium">{c.name}</p>
                    <p className="text-sm text-gray-300">{c.instructorName} &middot; {c.activityType}</p>
                    <p className="text-xs text-gray-400">{c.bookedSpots}/{c.totalSpots} lugares</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm">{new Date(c.startTime).toLocaleDateString('es-AR')}</p>
                    <p className="text-gray-300 text-xs">
                      {new Date(c.startTime).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Últimas Reservas */}
        <div className="bg-neutral-900 rounded-xl border border-neutral-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Últimas Reservas</h2>
          {recentBookings.length === 0 ? (
            <p className="text-gray-400 text-sm">No hay reservas recientes</p>
          ) : (
            <div className="space-y-3">
              {recentBookings.slice(0, 5).map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg border border-neutral-700">
                  <div>
                    <p className="text-white font-medium">{b.user?.name}</p>
                    <p className="text-sm text-gray-300">{b.class?.name}</p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium border border-neutral-600 bg-neutral-700 text-white">
                    {b.status === 'CONFIRMED' ? 'Confirmada' :
                     b.status === 'CANCELLED' ? 'Cancelada' :
                     b.status === 'COMPLETED' ? 'Completada' : 'No asistió'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon }: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-neutral-900 rounded-xl border border-neutral-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-300 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className="w-12 h-12 rounded-lg flex items-center justify-center border border-neutral-600 bg-neutral-800 text-white">
          {icon}
        </div>
      </div>
    </div>
  );
}

function MiniStatCard({ title, value, color }: {
  title: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-neutral-900 rounded-xl border border-neutral-700 p-4 flex items-center justify-between">
      <p className="text-sm text-gray-300">{title}</p>
      <span className={`px-3 py-1 rounded-lg text-lg font-bold ${color}`}>
        {value}
      </span>
    </div>
  );
}
