import { useState, useEffect } from 'react';
import { siteConfigService } from '../services/api';
import type { SiteConfig } from '../types';

export default function SiteConfigPage() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await siteConfigService.get();
      setConfig(data);
    } catch {
      setMessage({ type: 'error', text: 'Error al cargar configuración' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof SiteConfig, value: string) => {
    if (!config) return;
    setConfig({ ...config, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    setMessage(null);
    try {
      const updated = await siteConfigService.update({
        siteName: config.siteName,
        slogan: config.slogan,
        description: config.description,
        email: config.email,
        phone: config.phone,
        whatsapp: config.whatsapp,
        instagramUrl: config.instagramUrl,
        youtubeUrl: config.youtubeUrl,
      });
      setConfig(updated);
      setMessage({ type: 'success', text: 'Configuración guardada correctamente' });
    } catch {
      setMessage({ type: 'error', text: 'Error al guardar configuración' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-8 text-primary-400">Cargando...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Configuración del Sitio</h1>
        <p className="text-primary-300">Administrá la información general del gimnasio</p>
      </div>

      {message && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
          message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="bg-dark-100 rounded-lg border border-primary-500/30 p-6 space-y-6">
          <h2 className="text-xl font-semibold text-white">Información General</h2>

          <div>
            <label className="block text-sm font-medium text-primary-300 mb-1">Nombre del sitio</label>
            <input
              type="text"
              value={config?.siteName || ''}
              onChange={(e) => handleChange('siteName', e.target.value)}
              className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-300 mb-1">Slogan</label>
            <input
              type="text"
              value={config?.slogan || ''}
              onChange={(e) => handleChange('slogan', e.target.value)}
              className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-300 mb-1">Descripción</label>
            <textarea
              rows={3}
              value={config?.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500 resize-none"
            />
          </div>
        </div>

        <div className="bg-dark-100 rounded-lg border border-primary-500/30 p-6 space-y-6">
          <h2 className="text-xl font-semibold text-white">Contacto</h2>

          <div>
            <label className="block text-sm font-medium text-primary-300 mb-1">Email</label>
            <input
              type="email"
              value={config?.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-300 mb-1">Teléfono</label>
            <input
              type="text"
              value={config?.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-300 mb-1">WhatsApp (número sin +)</label>
            <input
              type="text"
              value={config?.whatsapp || ''}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
              className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>

        <div className="bg-dark-100 rounded-lg border border-primary-500/30 p-6 space-y-6">
          <h2 className="text-xl font-semibold text-white">Redes Sociales</h2>

          <div>
            <label className="block text-sm font-medium text-primary-300 mb-1">Instagram URL</label>
            <input
              type="url"
              value={config?.instagramUrl || ''}
              onChange={(e) => handleChange('instagramUrl', e.target.value)}
              placeholder="https://instagram.com/..."
              className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-300 mb-1">YouTube URL</label>
            <input
              type="url"
              value={config?.youtubeUrl || ''}
              onChange={(e) => handleChange('youtubeUrl', e.target.value)}
              placeholder="https://youtube.com/..."
              className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
