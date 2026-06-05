import { useState, useEffect } from 'react';
import { classesService } from '../services/api';
import { useAuth } from '../context/useAuth';
import type { Class } from '../types';

export default function Clases() {
  const { user } = useAuth();
  const canCreate = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Class>>({
    name: '',
    description: '',
    instructorName: '',
    startTime: '',
    endTime: '',
    totalSpots: 20,
    activityType: '',
    difficultyLevel: 'INTERMEDIO',
    location: '',
  });

  useEffect(() => {
    loadClasses();
  }, []);

  async function loadClasses() {
    try {
      const response = await classesService.getAll({ limit: 50 });
      setClasses(response.data?.classes || []);
    } catch {
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setShowForm(false);
    setFormData({
      name: '',
      description: '',
      instructorName: '',
      startTime: '',
      endTime: '',
      totalSpots: 20,
      activityType: '',
      difficultyLevel: 'INTERMEDIO',
      location: '',
    });
  }

  function handleEdit(clase: Class) {
    setFormData({
      name: clase.name,
      description: clase.description || '',
      instructorName: clase.instructorName,
      startTime: clase.startTime.slice(0, 16),
      endTime: clase.endTime.slice(0, 16),
      totalSpots: clase.totalSpots,
      activityType: clase.activityType,
      difficultyLevel: clase.difficultyLevel,
      location: clase.location || '',
    });
    setEditingId(clase.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        await classesService.update(editingId, formData);
      } else {
        await classesService.create(formData);
      }
      resetForm();
      await loadClasses();
    } catch {
    }
  }

  async function toggleActive(id: string, currentStatus: boolean) {
    try {
      await classesService.update(id, { isActive: !currentStatus });
      await loadClasses();
    } catch {
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de eliminar esta clase?')) return;
    try {
      await classesService.delete(id);
      await loadClasses();
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Clases</h1>
          <p className="text-primary-400">Gestión de clases y cursos</p>
        </div>
        {canCreate && (
          <button
            onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-all flex items-center gap-2"
          >
            <span className="text-xl">{showForm ? '✕' : '+'}</span>
            {showForm ? 'Cerrar' : 'Nueva Clase'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-dark-200 rounded-xl border border-primary-500/30 p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            {editingId ? 'Editar Clase' : 'Nueva Clase'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nombre de la clase"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="px-4 py-2 bg-dark-400 border border-primary-500/30 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                placeholder="Instructor"
                value={formData.instructorName}
                onChange={(e) => setFormData({ ...formData, instructorName: e.target.value })}
                required
                className="px-4 py-2 bg-dark-400 border border-primary-500/30 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                placeholder="Tipo de actividad (ej: CrossFit, Yoga, Pilates)"
                value={formData.activityType}
                onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                required
                className="px-4 py-2 bg-dark-400 border border-primary-500/30 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <select
                value={formData.difficultyLevel}
                onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value as Class['difficultyLevel'] })}
                className="px-4 py-2 bg-dark-400 border border-primary-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="PRINCIPIANTE">Principiante</option>
                <option value="INTERMEDIO">Intermedio</option>
                <option value="AVANZADO">Avanzado</option>
              </select>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
                className="px-4 py-2 bg-dark-400 border border-primary-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
                className="px-4 py-2 bg-dark-400 border border-primary-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="number"
                placeholder="Cantidad de lugares"
                value={formData.totalSpots}
                onChange={(e) => setFormData({ ...formData, totalSpots: parseInt(e.target.value) })}
                required
                min="1"
                className="px-4 py-2 bg-dark-400 border border-primary-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                placeholder="Ubicación (opcional)"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="px-4 py-2 bg-dark-400 border border-primary-500/30 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <textarea
              placeholder="Descripción (opcional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-dark-400 border border-primary-500/30 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-all"
              >
                {editingId ? 'Actualizar' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-dark-600 hover:bg-dark-500 text-white font-medium rounded-lg transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.length === 0 ? (
          <p className="text-dark-400 col-span-full text-center py-12">No hay clases creadas</p>
        ) : (
          classes.map((clase) => (
            <div
              key={clase.id}
              className={`bg-dark-200 rounded-xl border ${clase.isActive ? 'border-primary-500/30' : 'border-red-900/50'} p-6`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{clase.name}</h3>
                  <p className="text-sm text-primary-400">{clase.activityType}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    clase.difficultyLevel === 'PRINCIPIANTE'
                      ? 'bg-green-600/10 text-green-400'
                      : clase.difficultyLevel === 'INTERMEDIO'
                      ? 'bg-yellow-600/10 text-yellow-400'
                      : 'bg-red-600/10 text-red-400'
                  }`}
                >
                  {clase.difficultyLevel}
                </span>
              </div>
              <div className="space-y-2 text-sm text-dark-400 mb-4">
                <p>👨‍🏫 {clase.instructorName}</p>
                <p>📅 {new Date(clase.startTime).toLocaleString('es-AR')}</p>
                <p>👥 {clase.bookedSpots}/{clase.totalSpots} lugares ocupados</p>
              </div>
              <div className="flex gap-2">
                {canCreate && (
                  <button
                    onClick={() => handleEdit(clase)}
                    className="flex-1 px-3 py-2 bg-primary-600/10 text-primary-400 hover:bg-primary-600/20 rounded-lg text-sm font-medium transition-all"
                  >
                    Editar
                  </button>
                )}
                <button
                  onClick={() => toggleActive(clase.id, clase.isActive)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    clase.isActive
                      ? 'bg-yellow-600/10 text-yellow-400 hover:bg-yellow-600/20'
                      : 'bg-green-600/10 text-green-400 hover:bg-green-600/20'
                  }`}
                >
                  {clase.isActive ? 'Desactivar' : 'Activar'}
                </button>
                {canCreate && (
                  <button
                    onClick={() => handleDelete(clase.id)}
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
    </div>
  );
}
