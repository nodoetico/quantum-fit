import { useState, useEffect } from 'react';
import { authService } from '../services/api';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types';

export default function Usuarios() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
    isVip: false,
  });

  const canManage = currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER';

  useEffect(() => {
    if (!canManage) {
      navigate('/dashboard');
      return;
    }
    loadUsers();
  }, [canManage, navigate]);

  async function loadUsers() {
    try {
      const response = await authService.getUsers();
      setUsers(response);
    } catch {
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    try {
      await authService.createUser(formData);
      setShowCreateModal(false);
      setFormData({ name: '', email: '', password: '', role: 'USER', isVip: false });
      await loadUsers();
    } catch {
      alert('Error al crear usuario');
    }
  }

  async function handleRoleChange(userId: string, newRole: string) {
    if (currentUser?.role !== 'ADMIN') {
      alert('Solo los administradores pueden cambiar roles');
      return;
    }
    if (!confirm(`¿Estás seguro de cambiar el rol a ${newRole}?`)) return;

    try {
      await authService.updateUserRole(userId, newRole);
      await loadUsers();
    } catch {
      alert('Error al actualizar el rol');
    }
  }

  async function handleDelete(userId: string) {
    if (currentUser?.role !== 'ADMIN') {
      alert('Solo los administradores pueden eliminar usuarios');
      return;
    }
    if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) return;

    try {
      await authService.deleteUser(userId);
      await loadUsers();
    } catch {
      alert('Error al eliminar usuario');
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(filter.toLowerCase()) ||
                         user.email.toLowerCase().includes(filter.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleColors: Record<string, string> = {
    USER: 'bg-primary-500/20 text-primary-400 border-primary-500/50',
    ADMIN: 'bg-red-500/20 text-red-400 border-red-500/50',
    MANAGER: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    STAFF: 'bg-secondary-500/20 text-secondary-400 border-secondary-500/50',
    VIP: 'bg-pink-500/20 text-pink-400 border-pink-500/50',
  };

  if (!canManage) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-primary-400">No tienes permisos para ver esta sección.</p>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-white mb-2">Usuarios</h1>
          <p className="text-primary-400">Gestión de usuarios y permisos</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-medium rounded-lg transition-all glow-primary"
          >
            + Nuevo Usuario
          </button>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 bg-dark-400 border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todos los roles</option>
            <option value="USER">Usuario</option>
            <option value="VIP">VIP</option>
            <option value="STAFF">Staff</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
          </select>
          <input
            type="text"
            placeholder="Buscar usuario..."
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
                <th className="px-6 py-4 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Puntos</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Miembro desde</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-primary-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-500/20">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-primary-400">
                    No hay usuarios encontrados
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-dark-100 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.name}</p>
                          <p className="text-sm text-primary-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.isActive
                          ? 'bg-secondary-500/20 text-secondary-400 border border-secondary-500/50'
                          : 'bg-red-500/20 text-red-400 border border-red-500/50'
                      }`}>
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                      {user.isVip && (
                        <span className="ml-2 px-3 py-1 rounded-full text-xs font-medium bg-pink-500/20 text-pink-400 border border-pink-500/50">
                          VIP
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-white font-medium">{user.points}</td>
                    <td className="px-6 py-4 text-primary-300 text-sm">
                      {new Date(user.memberSince).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-6 py-4">
                      {currentUser?.role === 'ADMIN' ? (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium border ${roleColors[user.role] || roleColors.USER}`}
                        >
                          <option value="USER">Usuario</option>
                          <option value="VIP">VIP</option>
                          <option value="STAFF">Staff</option>
                          <option value="MANAGER">Manager</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      ) : (
                        <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${roleColors[user.role] || roleColors.USER}`}>
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {currentUser?.role === 'ADMIN' && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-400 hover:text-red-300 transition-colors p-2"
                          title="Eliminar usuario"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-dark-200 rounded-lg border border-primary-500/30 p-4 text-center">
          <p className="text-2xl font-bold text-white">{users.length}</p>
          <p className="text-sm text-primary-400">Total</p>
        </div>
        <div className="bg-dark-200 rounded-lg border border-primary-500/30 p-4 text-center">
          <p className="text-2xl font-bold text-primary-400">
            {users.filter((u) => u.role === 'USER').length}
          </p>
          <p className="text-sm text-primary-400">Usuarios</p>
        </div>
        <div className="bg-dark-200 rounded-lg border border-primary-500/30 p-4 text-center">
          <p className="text-2xl font-bold text-pink-400">
            {users.filter((u) => u.isVip).length}
          </p>
          <p className="text-sm text-primary-400">VIP</p>
        </div>
        <div className="bg-dark-200 rounded-lg border border-primary-500/30 p-4 text-center">
          <p className="text-2xl font-bold text-secondary-400">
            {users.filter((u) => u.role === 'STAFF' || u.role === 'MANAGER' || u.role === 'ADMIN').length}
          </p>
          <p className="text-sm text-primary-400">Staff</p>
        </div>
        <div className="bg-dark-200 rounded-lg border border-primary-500/30 p-4 text-center">
          <p className="text-2xl font-bold text-green-400">
            {users.filter((u) => u.isActive).length}
          </p>
          <p className="text-sm text-primary-400">Activos</p>
        </div>
      </div>

      {/* Modal para crear usuario */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-dark-200 rounded-2xl border border-primary-500/30 p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-6">Crear Nuevo Usuario</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-2">Nombre completo</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required
                  className="w-full px-4 py-3 bg-dark-400 border border-border rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ej: Juan Pérez" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-2">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required
                  className="w-full px-4 py-3 bg-dark-400 border border-border rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="juan@ejemplo.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-2">Contraseña temporal</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required minLength={6}
                  className="w-full px-4 py-3 bg-dark-400 border border-border rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-2">Rol</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-400 border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="USER">Usuario</option>
                  <option value="STAFF">Staff</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isVip" checked={formData.isVip}
                  onChange={(e) => setFormData({ ...formData, isVip: e.target.checked })}
                  className="w-4 h-4 rounded border-primary-500 bg-dark-400 text-primary-500 focus:ring-primary-500" />
                <label htmlFor="isVip" className="text-sm text-primary-300">Es usuario VIP</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 bg-dark-400 hover:bg-dark-300 text-white rounded-lg transition-all">
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-medium rounded-lg transition-all glow-primary">
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
