import { useState, useEffect } from 'react';
import { rewardsService, usersService } from '../services/api';
import { useAuth } from '../context/useAuth';
import type { Reward, RedeemedReward, User } from '../types';
import ImageUpload from '../components/ImageUpload';

type Tab = 'rewards' | 'redemptions';

const categoryLabels: Record<string, string> = {
  PRODUCTO: 'Producto',
  BEBIDA: 'Bebida',
  DESCUENTO: 'Descuento',
  PROMOCION: 'Promoción',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
  FULFILLED: 'Entregado',
  CANCELLED: 'Cancelado',
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  APPROVED: 'bg-secondary-500/20 text-secondary-400 border-secondary-500/50',
  FULFILLED: 'bg-primary-500/20 text-primary-400 border-primary-500/50',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/50',
};

const defaultForm = {
  name: '',
  description: '',
  pointsCost: 100,
  category: 'PRODUCTO' as const,
  stockTotal: 10,
  imageUrl: '',
  isFeatured: false,
};

export default function Premios() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const [tab, setTab] = useState<Tab>('rewards');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<RedeemedReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Reward>>(defaultForm);
  const [redemptionFilter, setRedemptionFilter] = useState('');
  const [showRedemptionForm, setShowRedemptionForm] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [redemptionForm, setRedemptionForm] = useState({ userId: '', rewardId: '', notes: '' });

  useEffect(() => {
    if (tab === 'rewards') {
      setIsLoading(true);
      rewardsService.getAll({ limit: 50 })
        .then(response => setRewards(response.data?.rewards || []))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(true);
      const p: Record<string, unknown> = { limit: 50 };
      if (redemptionFilter) p.status = redemptionFilter;
      rewardsService.getRedemptions(p)
        .then(response => setRedemptions(response.data?.redemptions || []))
        .finally(() => setIsLoading(false));
    }
  }, [tab, redemptionFilter]);

  useEffect(() => {
    if (showRedemptionForm) {
      usersService.getUsers().then(setUsers).catch(() => {});
    }
  }, [showRedemptionForm]);

  async function loadRewards() {
    setIsLoading(true);
    try {
      const response = await rewardsService.getAll({ limit: 50 });
      setRewards(response.data?.rewards || []);
    } catch {
    } finally {
      setIsLoading(false);
    }
  }

  async function loadRedemptions() {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { limit: 50 };
      if (redemptionFilter) params.status = redemptionFilter;
      const response = await rewardsService.getRedemptions(params);
      setRedemptions(response.data?.redemptions || []);
    } catch {
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setFormData(defaultForm);
    setEditingId(null);
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        await rewardsService.update(editingId, formData);
      } else {
        await rewardsService.create(formData);
      }
      resetForm();
      await loadRewards();
    } catch {
    }
  }

  function handleEdit(reward: Reward) {
    setFormData({
      name: reward.name,
      description: reward.description || '',
      pointsCost: reward.pointsCost,
      category: reward.category,
      stockTotal: reward.stockTotal,
      imageUrl: reward.imageUrl || '',
      isFeatured: reward.isFeatured,
    });
    setEditingId(reward.id);
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de eliminar este premio?')) return;
    try {
      await rewardsService.delete(id);
      await loadRewards();
    } catch {
    }
  }

  async function handleToggleActive(reward: Reward) {
    try {
      await rewardsService.update(reward.id, { isActive: !reward.isActive });
      await loadRewards();
    } catch {
    }
  }

  async function handleRedemptionStatus(id: string, status: string) {
    try {
      await rewardsService.updateRedemptionStatus(id, status);
      await loadRedemptions();
    } catch {
    }
  }

  async function handleCreateRedemption(e: React.FormEvent) {
    e.preventDefault();
    try {
      await rewardsService.createRedemption(redemptionForm);
      setShowRedemptionForm(false);
      setRedemptionForm({ userId: '', rewardId: '', notes: '' });
      await loadRedemptions();
    } catch {
    }
  }

  async function handleDeleteRedemption(id: string) {
    if (!confirm('¿Eliminar este canje? Se revertirán los puntos y el stock.')) return;
    try {
      await rewardsService.deleteRedemption(id);
      await loadRedemptions();
    } catch {
    }
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
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Premios</h1>
        <p className="text-primary-400">Gestión de premios y canjes</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab('rewards')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            tab === 'rewards' ? 'bg-primary-600 text-white' : 'text-primary-400 hover:text-white'
          }`}
        >
          Premios
        </button>
        <button
          onClick={() => setTab('redemptions')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            tab === 'redemptions' ? 'bg-primary-600 text-white' : 'text-primary-400 hover:text-white'
          }`}
        >
          Canjes
        </button>
      </div>

      {tab === 'rewards' && (
        <>
          {isAdmin && (
            <div className="flex justify-end">
              <button
                onClick={() => { resetForm(); setShowForm(!showForm); }}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-all flex items-center gap-2"
              >
                <span className="text-xl">{showForm ? '✕' : '+'}</span>
                {showForm ? 'Cerrar' : 'Nuevo Premio'}
              </button>
            </div>
          )}

          {/* Form */}
          {showForm && (
            <div className="bg-dark-200 rounded-xl border border-primary-500/30 p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                {editingId ? 'Editar Premio' : 'Nuevo Premio'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-300 mb-1">Nombre del premio *</label>
                    <input type="text" placeholder="Ej: Batido Proteico" value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })} required
                      className="w-full px-4 py-2 bg-dark-400 border border-primary-500/30 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-300 mb-1">Categoría</label>
                    <select value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as Reward['category'] })}
                      className="w-full px-4 py-2 bg-dark-400 border border-primary-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="PRODUCTO">Producto</option>
                      <option value="BEBIDA">Bebida</option>
                      <option value="DESCUENTO">Descuento</option>
                      <option value="PROMOCION">Promoción</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-300 mb-1">Costo en puntos *</label>
                    <input type="number" placeholder="Ej: 100" value={formData.pointsCost}
                      onChange={(e) => setFormData({ ...formData, pointsCost: parseInt(e.target.value) || 0 })} required min="1"
                      className="w-full px-4 py-2 bg-dark-400 border border-primary-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-300 mb-1">Stock total</label>
                    <input type="number" placeholder="Ej: 10" value={formData.stockTotal}
                      onChange={(e) => setFormData({ ...formData, stockTotal: parseInt(e.target.value) || 0 })} min="0"
                      className="w-full px-4 py-2 bg-dark-400 border border-primary-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div className="md:col-span-2">
                    <ImageUpload value={formData.imageUrl || ''} onChange={(url) => setFormData({ ...formData, imageUrl: url })} label="Imagen del premio" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-white pt-6">
                      <input type="checkbox" checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                        className="w-4 h-4 rounded border-primary-500/50 bg-dark-400 text-primary-500 focus:ring-primary-500" />
                      Destacado
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1">Descripción</label>
                  <textarea placeholder="Descripción opcional del premio" value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3}
                    className="w-full px-4 py-2 bg-dark-400 border border-primary-500/30 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-all">
                    {editingId ? 'Actualizar' : 'Guardar'}
                  </button>
                  <button type="button" onClick={resetForm} className="px-6 py-2 bg-dark-600 hover:bg-dark-500 text-white font-medium rounded-lg transition-all">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Rewards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.length === 0 ? (
              <p className="text-primary-400 col-span-full text-center py-12">No hay premios creados</p>
            ) : (
              rewards.map((reward) => (
                <div
                  key={reward.id}
                  className={`bg-dark-200 rounded-xl border ${
                    reward.isActive ? 'border-primary-500/30' : 'border-red-900/50'
                  } p-6`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{reward.name}</h3>
                      <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-primary-500/20 text-primary-400 mt-1">
                        {categoryLabels[reward.category]}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-primary-400 mb-4">
                    <p>⭐ {reward.pointsCost} puntos</p>
                    <p>📦 Stock: {reward.stockAvailable}/{reward.stockTotal}</p>
                    {reward.isFeatured && <p className="text-secondary-400">★ Destacado</p>}
                  </div>
                  <p className="text-sm text-primary-400 mb-4 line-clamp-2">{reward.description}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(reward)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isAdmin
                          ? 'flex-1 bg-primary-600/10 text-primary-400 hover:bg-primary-600/20'
                          : 'bg-primary-600/10 text-primary-400 hover:bg-primary-600/20'
                      }`}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleToggleActive(reward)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        reward.isActive
                          ? 'bg-yellow-600/10 text-yellow-400 hover:bg-yellow-600/20'
                          : 'bg-green-600/10 text-green-400 hover:bg-green-600/20'
                      }`}
                    >
                      {reward.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(reward.id)}
                        className="px-3 py-2 bg-red-600/10 text-red-400 hover:bg-red-600/20 rounded-lg text-sm font-medium transition-all"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {tab === 'redemptions' && (
        <>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-2">
              {['', 'PENDING', 'APPROVED', 'FULFILLED', 'CANCELLED'].map((s) => (
                <button
                  key={s}
                  onClick={() => { setRedemptionFilter(s); setTimeout(loadRedemptions, 0); }}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    redemptionFilter === s ? 'bg-primary-600 text-white' : 'bg-dark-200 text-primary-400 hover:text-white'
                  }`}
                >
                  {s ? statusLabels[s] : 'Todos'}
                </button>
              ))}
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowRedemptionForm(!showRedemptionForm)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-all flex items-center gap-2"
              >
                <span className="text-xl">{showRedemptionForm ? '✕' : '+'}</span>
                {showRedemptionForm ? 'Cerrar' : 'Nuevo Canje'}
              </button>
            )}
          </div>

          {showRedemptionForm && (
            <div className="bg-dark-200 rounded-xl border border-primary-500/30 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Nuevo Canje Manual</h2>
              <form onSubmit={handleCreateRedemption} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-300 mb-1">Usuario *</label>
                    <select value={redemptionForm.userId}
                      onChange={(e) => setRedemptionForm({ ...redemptionForm, userId: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-dark-400 border border-primary-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Seleccionar usuario</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.name} ({u.email}) — {u.points} pts</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-300 mb-1">Premio *</label>
                    <select value={redemptionForm.rewardId}
                      onChange={(e) => setRedemptionForm({ ...redemptionForm, rewardId: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-dark-400 border border-primary-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Seleccionar premio</option>
                      {rewards.filter((r) => r.isActive && r.stockAvailable > 0).map((rw) => (
                        <option key={rw.id} value={rw.id}>{rw.name} — {rw.pointsCost} pts (stock: {rw.stockAvailable})</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-primary-300 mb-1">Notas (opcional)</label>
                    <input type="text" placeholder="Motivo del canje manual" value={redemptionForm.notes}
                      onChange={(e) => setRedemptionForm({ ...redemptionForm, notes: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-400 border border-primary-500/30 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-all">
                    Crear Canje
                  </button>
                  <button type="button" onClick={() => { setShowRedemptionForm(false); setRedemptionForm({ userId: '', rewardId: '', notes: '' }); }}
                    className="px-6 py-2 bg-dark-600 hover:bg-dark-500 text-white font-medium rounded-lg transition-all">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-dark-200 rounded-xl border border-primary-500/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-100 border-b border-primary-500/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-primary-300 uppercase">Usuario</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-primary-300 uppercase">Premio</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-primary-300 uppercase">Puntos</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-primary-300 uppercase">Estado</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-primary-300 uppercase">Código</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-primary-300 uppercase">Fecha</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-primary-300 uppercase">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-500/20">
                  {redemptions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-primary-400">
                        No hay canjes registrados
                      </td>
                    </tr>
                  ) : (
                    redemptions.map((r) => (
                      <tr key={r.id} className="hover:bg-dark-100 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-white font-medium">{r.user?.name}</p>
                          <p className="text-sm text-primary-400">{r.user?.email}</p>
                        </td>
                        <td className="px-6 py-4 text-white">{r.reward?.name}</td>
                        <td className="px-6 py-4 text-primary-300">{r.pointsSpent}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[r.status]}`}>
                            {statusLabels[r.status]}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-primary-300">{r.pickupCode}</td>
                        <td className="px-6 py-4 text-primary-300">
                          {new Date(r.redeemedAt).toLocaleDateString('es-AR')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-1 justify-end">
                            {r.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleRedemptionStatus(r.id, 'APPROVED')}
                                  className="px-2 py-1 bg-secondary-600/10 text-secondary-400 hover:bg-secondary-600/20 rounded text-xs font-medium"
                                >
                                  Aprobar
                                </button>
                                <button
                                  onClick={() => handleRedemptionStatus(r.id, 'CANCELLED')}
                                  className="px-2 py-1 bg-red-600/10 text-red-400 hover:bg-red-600/20 rounded text-xs font-medium"
                                >
                                  Cancelar
                                </button>
                              </>
                            )}
                            {r.status === 'APPROVED' && (
                              <button
                                onClick={() => handleRedemptionStatus(r.id, 'FULFILLED')}
                                className="px-2 py-1 bg-primary-600/10 text-primary-400 hover:bg-primary-600/20 rounded text-xs font-medium"
                              >
                                Marcar entregado
                              </button>
                            )}
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteRedemption(r.id)}
                                className="px-2 py-1 bg-red-600/10 text-red-400 hover:bg-red-600/20 rounded text-xs font-medium"
                                title="Eliminar canje"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
