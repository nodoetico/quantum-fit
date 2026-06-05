import { useState, useEffect } from 'react';
import { landingService } from '../services/api';
import type { LandingContent, Testimonial, Plan, Banner, GalleryImage } from '../types';

// Tabs de secciones
const TABS = [
  { id: 'content', label: 'Contenido' },
  { id: 'testimonials', label: 'Testimonios' },
  { id: 'plans', label: 'Planes' },
  { id: 'banners', label: 'Banners' },
  { id: 'gallery', label: 'Galería' },
];

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('content');

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Gestionar Landing Page</h1>
        <p className="text-primary-300">Administra el contenido visible en la página pública del gimnasio</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white glow-primary'
                : 'bg-dark-200 text-primary-300 hover:text-primary-400 hover:bg-dark-100 border border-primary-500/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido del tab */}
      <div className="bg-dark-200 rounded-xl border border-primary-500/30 p-6">
        {activeTab === 'content' && <ContentSection />}
        {activeTab === 'testimonials' && <TestimonialsSection />}
        {activeTab === 'plans' && <PlansSection />}
        {activeTab === 'banners' && <BannersSection />}
        {activeTab === 'gallery' && <GallerySection />}
      </div>
    </div>
  );
}

// ============================================
// CONTENT SECTION
// ============================================

function ContentSection() {
  const [items, setItems] = useState<LandingContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<LandingContent | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<LandingContent>>({
    section: 'hero', title: '', subtitle: '', description: '', imageUrl: '', ctaText: '', ctaLink: '', isActive: true, order: 0,
  });

  useEffect(() => { loadContent(); }, []);

  const loadContent = async () => {
    try {
      const data = await landingService.getContent();
      setItems(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await landingService.updateContent(editing.id, formData);
      } else {
        await landingService.createContent(formData);
      }
      resetForm();
      loadContent();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar';
      alert(msg);
    }
  };

  const handleEdit = (item: LandingContent) => {
    setEditing(item);
    setFormData(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este contenido?')) return;
    try {
      await landingService.deleteContent(id);
      loadContent();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar';
      alert(msg);
    }
  };

  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setFormData({ section: 'hero', title: '', subtitle: '', description: '', imageUrl: '', ctaText: '', ctaLink: '', isActive: true, order: 0 });
  };

  if (loading) return <div className="text-center py-8 text-primary-400">Cargando...</div>;

  const sections = ['hero', 'about', 'features', 'contact'];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Contenido de la Landing</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
        >
          + Nuevo Contenido
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-dark-100 rounded-lg border border-primary-500/30 p-6 mb-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">{editing ? 'Editar' : 'Nuevo'} Contenido</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">Sección</label>
              <select
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                required
              >
                {sections.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">Orden</label>
              <input
                type="number"
                value={formData.order || 0}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-300 mb-1">Título</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-300 mb-1">Subtítulo</label>
            <input
              type="text"
              value={formData.subtitle || ''}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-300 mb-1">Descripción</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-300 mb-1">URL de Imagen</label>
            <input
              type="text"
              value={formData.imageUrl || ''}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
              placeholder="https://..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">Texto CTA</label>
              <input
                type="text"
                value={formData.ctaText || ''}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">Link CTA</label>
              <input
                type="text"
                value={formData.ctaLink || ''}
                onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive !== false}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="accent-primary-500"
            />
            <span className="text-sm text-primary-300">Activo</span>
          </label>
          <div className="flex gap-3">
            <button type="submit" className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium text-sm hover:opacity-90">
              {editing ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" onClick={resetForm} className="px-6 py-2 bg-dark-200 text-primary-300 rounded-lg border border-primary-500/30 hover:bg-dark-100">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista por secciones */}
      {sections.map((section) => {
        const sectionItems = items.filter((i) => i.section === section);
        if (sectionItems.length === 0) return null;
        return (
          <div key={section} className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 capitalize">{section}</h3>
            <div className="space-y-3">
              {sectionItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-dark-100 rounded-lg p-4 border border-primary-500/20">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{item.title || <span className="text-primary-400 italic">Sin título</span>}</p>
                    <p className="text-sm text-primary-400 truncate">{item.description?.substring(0, 80) || ''}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${item.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {item.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                    <button onClick={() => handleEdit(item)} className="p-2 text-primary-400 hover:text-primary-300 transition-colors" title="Editar">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-red-400 hover:text-red-300 transition-colors" title="Eliminar">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {items.length === 0 && (
        <div className="text-center py-12 text-primary-400">
          No hay contenido aún. Haz clic en "+ Nuevo Contenido" para agregar.
        </div>
      )}
    </div>
  );
}

// ============================================
// TESTIMONIALS SECTION
// ============================================

function TestimonialsSection() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Testimonial>>({
    name: '', role: '', text: '', photoUrl: '', rating: 5, isActive: true, order: 0,
  });

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    try {
      const data = await landingService.getTestimonials();
      setItems(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await landingService.updateTestimonial(editing.id, formData);
      } else {
        await landingService.createTestimonial(formData);
      }
      resetForm();
      loadItems();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar';
      alert(msg);
    }
  };

  const handleEdit = (item: Testimonial) => {
    setEditing(item);
    setFormData(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este testimonio?')) return;
    try {
      await landingService.deleteTestimonial(id);
      loadItems();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar';
      alert(msg);
    }
  };

  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setFormData({ name: '', role: '', text: '', photoUrl: '', rating: 5, isActive: true, order: 0 });
  };

  if (loading) return <div className="text-center py-8 text-primary-400">Cargando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Testimonios</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium text-sm hover:opacity-90"
        >
          + Nuevo Testimonio
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-dark-100 rounded-lg border border-primary-500/30 p-6 mb-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">{editing ? 'Editar' : 'Nuevo'} Testimonio</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">Nombre</label>
              <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">Rol / Descripción</label>
              <input type="text" value={formData.role || ''} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                placeholder="Miembro desde 2024" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-300 mb-1">Texto del Testimonio</label>
            <textarea value={formData.text || ''} onChange={(e) => setFormData({ ...formData, text: e.target.value })} rows={3}
              className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">URL Foto</label>
              <input type="text" value={formData.photoUrl || ''} onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">Rating (1-5)</label>
              <input type="number" min={1} max={5} value={formData.rating || 5} onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">Orden</label>
              <input type="number" value={formData.order || 0} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500" />
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={formData.isActive !== false} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="accent-primary-500" />
            <span className="text-sm text-primary-300">Activo</span>
          </label>
          <div className="flex gap-3">
            <button type="submit" className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium text-sm hover:opacity-90">
              {editing ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" onClick={resetForm} className="px-6 py-2 bg-dark-200 text-primary-300 rounded-lg border border-primary-500/30 hover:bg-dark-100">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between bg-dark-100 rounded-lg p-4 border border-primary-500/20">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                {item.photoUrl && (
                  <img src={item.photoUrl} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
                )}
                <div>
                  <p className="font-medium text-white">{item.name}</p>
                  <p className="text-xs text-primary-400">{item.role}</p>
                </div>
              </div>
              <p className="text-sm text-primary-300 line-clamp-2">{item.text}</p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <span className="text-yellow-400 text-sm">{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${item.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {item.isActive ? 'Activo' : 'Inactivo'}
              </span>
              <button onClick={() => handleEdit(item)} className="p-2 text-primary-400 hover:text-primary-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </button>
              <button onClick={() => handleDelete(item.id)} className="p-2 text-red-400 hover:text-red-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 text-primary-400">No hay testimonios aún.</div>
      )}
    </div>
  );
}

// ============================================
// PLANS SECTION
// ============================================

function PlansSection() {
  const [items, setItems] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Plan>>({
    name: '', description: '', price: 0, period: 'mensual', currency: 'ARS', features: [], isFeatured: false, isActive: true, order: 0,
  });
  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    try {
      const data = await landingService.getPlans();
      setItems(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await landingService.updatePlan(editing.id, formData);
      } else {
        await landingService.createPlan(formData);
      }
      resetForm();
      loadItems();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar';
      alert(msg);
    }
  };

  const handleEdit = (item: Plan) => {
    setEditing(item);
    setFormData(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este plan?')) return;
    try {
      await landingService.deletePlan(id);
      loadItems();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar';
      alert(msg);
    }
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    setFormData({ ...formData, features: [...(formData.features || []), featureInput.trim()] });
    setFeatureInput('');
  };

  const removeFeature = (index: number) => {
    setFormData({ ...formData, features: formData.features?.filter((_, i) => i !== index) });
  };

  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setFormData({ name: '', description: '', price: 0, period: 'mensual', currency: 'ARS', features: [], isFeatured: false, isActive: true, order: 0 });
    setFeatureInput('');
  };

  if (loading) return <div className="text-center py-8 text-primary-400">Cargando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Planes y Precios</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium text-sm hover:opacity-90"
        >
          + Nuevo Plan
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-dark-100 rounded-lg border border-primary-500/30 p-6 mb-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">{editing ? 'Editar' : 'Nuevo'} Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">Nombre</label>
              <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">Precio</label>
              <input type="number" step="0.01" value={formData.price || 0} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">Período</label>
              <select value={formData.period || 'mensual'} onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500">
                <option value="mensual">Mensual</option>
                <option value="trimestral">Trimestral</option>
                <option value="anual">Anual</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-300 mb-1">Descripción</label>
            <textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2}
              className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500" />
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-primary-300 mb-1">Beneficios</label>
            <div className="flex gap-2 mb-2">
              <input type="text" value={featureInput} onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
                className="flex-1 bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                placeholder="Escribe un beneficio y presiona Enter" />
              <button type="button" onClick={addFeature} className="px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30">
                Agregar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.features?.map((f, i) => (
                <span key={i} className="flex items-center gap-1 px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-sm">
                  {f}
                  <button type="button" onClick={() => removeFeature(i)} className="text-red-400 hover:text-red-300 ml-1">×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.isFeatured !== false} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} className="accent-primary-500" />
              <span className="text-sm text-primary-300">Destacado</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.isActive !== false} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="accent-primary-500" />
              <span className="text-sm text-primary-300">Activo</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">Orden</label>
              <input type="number" value={formData.order || 0} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium text-sm hover:opacity-90">
              {editing ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" onClick={resetForm} className="px-6 py-2 bg-dark-200 text-primary-300 rounded-lg border border-primary-500/30 hover:bg-dark-100">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className={`bg-dark-100 rounded-lg border p-5 ${item.isFeatured ? 'border-primary-500/60 glow-primary' : 'border-primary-500/20'}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-white">{item.name}</h3>
                <p className="text-2xl font-bold text-primary-400">${item.price}<span className="text-sm font-normal text-primary-300">/{item.period}</span></p>
              </div>
              {item.isFeatured && <span className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded text-xs font-medium">Destacado</span>}
            </div>
            {item.description && <p className="text-sm text-primary-300 mb-3">{item.description}</p>}
            <ul className="space-y-1 mb-4">
              {item.features.map((f, i) => (
                <li key={i} className="text-sm text-primary-200 flex items-center gap-2">
                  <span className="text-secondary-500">✓</span> {f}
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between pt-3 border-t border-primary-500/20">
              <span className={`px-2 py-1 rounded text-xs font-medium ${item.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {item.isActive ? 'Activo' : 'Inactivo'}
              </span>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(item)} className="p-2 text-primary-400 hover:text-primary-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-red-400 hover:text-red-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 text-primary-400">No hay planes aún.</div>
      )}
    </div>
  );
}

// ============================================
// BANNERS SECTION
// ============================================

function BannersSection() {
  const [items, setItems] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Banner>>({
    title: '', subtitle: '', imageUrl: '', linkUrl: '', linkText: '', isActive: true, order: 0,
  });

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    try {
      const data = await landingService.getBanners();
      setItems(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await landingService.updateBanner(editing.id, formData);
      } else {
        await landingService.createBanner(formData);
      }
      resetForm();
      loadItems();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar';
      alert(msg);
    }
  };

  const handleEdit = (item: Banner) => {
    setEditing(item);
    setFormData(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este banner?')) return;
    try {
      await landingService.deleteBanner(id);
      loadItems();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar';
      alert(msg);
    }
  };

  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setFormData({ title: '', subtitle: '', imageUrl: '', linkUrl: '', linkText: '', isActive: true, order: 0 });
  };

  if (loading) return <div className="text-center py-8 text-primary-400">Cargando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Banners Promocionales</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium text-sm hover:opacity-90"
        >
          + Nuevo Banner
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-dark-100 rounded-lg border border-primary-500/30 p-6 mb-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">{editing ? 'Editar' : 'Nuevo'} Banner</h3>
          <div>
            <label className="block text-sm font-medium text-primary-300 mb-1">Título</label>
            <input type="text" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-300 mb-1">Subtítulo</label>
            <input type="text" value={formData.subtitle || ''} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-300 mb-1">URL de Imagen</label>
            <input type="text" value={formData.imageUrl || ''} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500" required
              placeholder="https://..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">URL de Link</label>
              <input type="text" value={formData.linkUrl || ''} onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">Texto del Link</label>
              <input type="text" value={formData.linkText || ''} onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
                className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.isActive !== false} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="accent-primary-500" />
              <span className="text-sm text-primary-300">Activo</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">Orden</label>
              <input type="number" value={formData.order || 0} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium text-sm hover:opacity-90">
              {editing ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" onClick={resetForm} className="px-6 py-2 bg-dark-200 text-primary-300 rounded-lg border border-primary-500/30 hover:bg-dark-100">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-dark-100 rounded-lg border border-primary-500/20 overflow-hidden">
            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.title} className="w-full h-40 object-cover" />
            )}
            <div className="p-4">
              <h3 className="font-bold text-white">{item.title}</h3>
              {item.subtitle && <p className="text-sm text-primary-300">{item.subtitle}</p>}
              {item.linkText && <p className="text-xs text-primary-400 mt-1">Link: {item.linkText}</p>}
              <div className="flex items-center justify-between mt-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${item.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {item.isActive ? 'Activo' : 'Inactivo'}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(item)} className="p-2 text-primary-400 hover:text-primary-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-red-400 hover:text-red-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 text-primary-400">No hay banners aún.</div>
      )}
    </div>
  );
}

// ============================================
// GALLERY SECTION
// ============================================

function GallerySection() {
  const [items, setItems] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<GalleryImage | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<GalleryImage>>({
    url: '', alt: '', category: 'instalaciones', order: 0, isActive: true,
  });

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    try {
      const data = await landingService.getGallery();
      setItems(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await landingService.updateGalleryImage(editing.id, formData);
      } else {
        await landingService.createGalleryImage(formData);
      }
      resetForm();
      loadItems();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar';
      alert(msg);
    }
  };

  const handleEdit = (item: GalleryImage) => {
    setEditing(item);
    setFormData(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta imagen?')) return;
    try {
      await landingService.deleteGalleryImage(id);
      loadItems();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar';
      alert(msg);
    }
  };

  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setFormData({ url: '', alt: '', category: 'instalaciones', order: 0, isActive: true });
  };

  if (loading) return <div className="text-center py-8 text-primary-400">Cargando...</div>;

  const categories = ['instalaciones', 'clases', 'eventos'];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Galería de Imágenes</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium text-sm hover:opacity-90"
        >
          + Nueva Imagen
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-dark-100 rounded-lg border border-primary-500/30 p-6 mb-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">{editing ? 'Editar' : 'Nueva'} Imagen</h3>
          <div>
            <label className="block text-sm font-medium text-primary-300 mb-1">URL de Imagen</label>
            <input type="text" value={formData.url || ''} onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500" required
              placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-300 mb-1">Descripción (alt)</label>
            <input type="text" value={formData.alt || ''} onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
              className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">Categoría</label>
              <select value={formData.category || 'instalaciones'} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500">
                {categories.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">Orden</label>
              <input type="number" value={formData.order || 0} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500" />
            </div>
            <label className="flex items-center gap-2 pt-6">
              <input type="checkbox" checked={formData.isActive !== false} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="accent-primary-500" />
              <span className="text-sm text-primary-300">Activa</span>
            </label>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium text-sm hover:opacity-90">
              {editing ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" onClick={resetForm} className="px-6 py-2 bg-dark-200 text-primary-300 rounded-lg border border-primary-500/30 hover:bg-dark-100">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Grid de imágenes por categoría */}
      {categories.map((cat) => {
        const catItems = items.filter((i) => i.category === cat);
        if (catItems.length === 0) return null;
        return (
          <div key={cat} className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 capitalize">{cat}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {catItems.map((item) => (
                <div key={item.id} className="relative group bg-dark-100 rounded-lg overflow-hidden border border-primary-500/20">
                  <img src={item.url} alt={item.alt || ''} className="w-full h-36 object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => handleEdit(item)} className="p-2 bg-primary-500/80 text-white rounded-full hover:bg-primary-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                  {item.alt && <p className="p-2 text-xs text-primary-300 truncate">{item.alt}</p>}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {items.length === 0 && (
        <div className="text-center py-12 text-primary-400">No hay imágenes aún.</div>
      )}
    </div>
  );
}
