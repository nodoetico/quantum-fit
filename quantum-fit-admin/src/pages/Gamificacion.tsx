import { useState, useEffect } from 'react';
import { pointsConfigService } from '../services/api';
import type { PointsConfig } from '../types';

const categoryLabels: Record<string, string> = {
  checkin: 'Check-ins',
  streak: 'Rachas y Bonos',
  referral: 'Referidos',
};

const categoryIcons: Record<string, string> = {
  checkin: '📋',
  streak: '🔥',
  referral: '👥',
};

export default function Gamificacion() {
  const [configs, setConfigs] = useState<PointsConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => { loadConfigs(); }, []);

  const loadConfigs = async () => {
    try {
      const data = await pointsConfigService.getAll();
      setConfigs(data);
    } catch { } finally { setLoading(false); }
  };

  const handlePointsChange = async (item: PointsConfig, newPoints: number) => {
    setSaving(item.id);
    try {
      const updated = await pointsConfigService.upsert({
        activityKey: item.activityKey,
        label: item.label,
        points: newPoints,
        category: item.category,
        isActive: item.isActive,
      });
      setConfigs((prev) => prev.map((c) => (c.id === item.id ? updated : c)));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(null);
    }
  };

  const handleToggleActive = async (item: PointsConfig) => {
    setSaving(item.id);
    try {
      const updated = await pointsConfigService.upsert({
        activityKey: item.activityKey,
        label: item.label,
        points: item.points,
        category: item.category,
        isActive: !item.isActive,
      });
      setConfigs((prev) => prev.map((c) => (c.id === item.id ? updated : c)));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al actualizar');
    } finally {
      setSaving(null);
    }
  };

  const handleSeedDefaults = async () => {
    if (!confirm('¿Restaurar configuraciones por defecto? Esto no eliminará configuraciones existentes.')) return;
    setSeeding(true);
    try {
      const data = await pointsConfigService.seedDefaults();
      setConfigs(data);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al restaurar defaults');
    } finally {
      setSeeding(false);
    }
  };

  if (loading) return <div className="text-center py-8 text-primary-400">Cargando...</div>;

  const grouped = configs.reduce<Record<string, PointsConfig[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gamificación</h1>
          <p className="text-primary-300">Configurá los puntajes otorgados por cada actividad</p>
        </div>
        <button onClick={handleSeedDefaults} disabled={seeding}
          className="px-4 py-2 bg-dark-200 text-primary-300 rounded-lg border border-primary-500/30 hover:bg-dark-100 font-medium text-sm disabled:opacity-50">
          {seeding ? 'Restaurando...' : 'Restaurar Defaults'}
        </button>
      </div>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <span>{categoryIcons[category] || '📌'}</span>
            {categoryLabels[category] || category}
          </h2>
          <div className="bg-dark-100 rounded-lg border border-primary-500/30 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary-500/20">
                  <th className="text-left px-6 py-3 text-xs font-medium text-primary-400 uppercase tracking-wider">Actividad</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-primary-400 uppercase tracking-wider">Puntos</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-primary-400 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-500/10">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-dark-200/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-white">{item.label}</span>
                      <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-dark-200 text-primary-400 font-mono">{item.activityKey}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <label htmlFor={`points-${item.id}`} className="sr-only">Puntos para {item.label}</label>
                        <input
                          id={`points-${item.id}`}
                          type="number"
                          defaultValue={item.points}
                          min={0}
                          onBlur={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val) && val !== item.points) {
                              handlePointsChange(item, val);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                          className="w-24 bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-primary-500"
                        />
                        {saving === item.id && <span className="text-xs text-primary-400">guardando...</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleActive(item)}
                        disabled={saving === item.id}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                          item.isActive
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        }`}
                      >
                        {item.isActive ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {configs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-primary-400 mb-4">No hay configuraciones de puntaje aún.</p>
          <button onClick={handleSeedDefaults} disabled={seeding}
            className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium text-sm hover:opacity-90 disabled:opacity-50">
            Crear configuraciones por defecto
          </button>
        </div>
      )}
    </div>
  );
}
