import { useState, useEffect } from 'react';
import { buffetService } from '../services/api';
import type { BuffetItem } from '../types';
import ImageUpload from '../components/ImageUpload';

const CATEGORIAS = ['batidos', 'licuados', 'cafeteria', 'snacks', 'suplementacion'];

export default function Buffet() {
  const [items, setItems] = useState<BuffetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BuffetItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<BuffetItem>>({
    name: '', description: '', price: 0, category: 'batidos', imageUrl: '', isActive: true, order: 0,
  });

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    try {
      const data = await buffetService.getAll();
      setItems(data);
    } catch { } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await buffetService.update(editing.id, formData);
      } else {
        await buffetService.create(formData);
      }
      resetForm();
      loadItems();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al guardar');
    }
  };

  const handleEdit = (item: BuffetItem) => {
    setEditing(item);
    setFormData(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este item?')) return;
    try {
      await buffetService.delete(id);
      loadItems();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setFormData({ name: '', description: '', price: 0, category: 'batidos', imageUrl: '', isActive: true, order: 0 });
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = { batidos: 'Batidos Proteicos', licuados: 'Licuados', cafeteria: 'Cafetería', snacks: 'Snacks Saludables', suplementacion: 'Suplementación' };
    return labels[cat] || cat;
  };

  if (loading) return <div className="text-center py-8 text-primary-400">Cargando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Buffet</h1>
          <p className="text-primary-300">Administrá el menú del buffet del gimnasio</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium text-sm hover:opacity-90">
          + Nuevo Item
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-dark-100 rounded-lg border border-primary-500/30 p-6 mb-8 space-y-4">
          <h3 className="text-lg font-semibold text-white">{editing ? 'Editar' : 'Nuevo'} Item</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">Nombre *</label>
              <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">Categoría *</label>
              <select value={formData.category || 'batidos'} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500">
                {CATEGORIAS.map((c) => <option key={c} value={c}>{getCategoryLabel(c)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">Precio ($)</label>
              <input type="number" step="0.01" value={formData.price || 0} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-300 mb-1">Descripción</label>
            <textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2} className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <ImageUpload value={formData.imageUrl || ''} onChange={(url) => setFormData({ ...formData, imageUrl: url })} label="URL de Imagen" />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-1">Orden</label>
              <input type="number" value={formData.order || 0} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="w-full bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500" />
            </div>
            <label className="flex items-center gap-2 pt-6">
              <input type="checkbox" checked={formData.isActive !== false} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="accent-primary-500" />
              <span className="text-sm text-primary-300">Activo</span>
            </label>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium text-sm hover:opacity-90">
              {editing ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" onClick={resetForm} className="px-6 py-2 bg-dark-200 text-primary-300 rounded-lg border border-primary-500/30 hover:bg-dark-100">Cancelar</button>
          </div>
        </form>
      )}

      {CATEGORIAS.map((cat) => {
        const catItems = items.filter((i) => i.category === cat);
        if (catItems.length === 0) return null;
        return (
          <div key={cat} className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4 capitalize">{getCategoryLabel(cat)}</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {catItems.map((item) => (
                <div key={item.id} className="bg-dark-100 rounded-lg border border-primary-500/20 p-4 group">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-white">{item.name}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {item.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  {item.description && <p className="text-xs text-primary-300 mb-2">{item.description}</p>}
                  {item.price != null && Number(item.price) > 0 && <p className="text-sm font-semibold text-secondary-500">${Number(item.price).toFixed(2)}</p>}
                  <div className="flex justify-end gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(item)} className="p-1.5 text-primary-400 hover:text-primary-300"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-400 hover:text-red-300"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {items.length === 0 && <div className="text-center py-12 text-primary-400">No hay items en el buffet aún.</div>}
    </div>
  );
}
