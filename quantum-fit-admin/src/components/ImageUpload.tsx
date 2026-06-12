import { useState, useRef, useEffect } from 'react';
import { API_URL } from '../config/api';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, label = 'Imagen' }: ImageUploadProps) {
  const [preview, setPreview] = useState(value || '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(value || '');
  }, [value]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: formData,
      });

      let result: { success?: boolean; data?: { url?: string }; error?: string };
      try {
        result = await response.json();
      } catch {
        throw new Error(`Error del servidor (${response.status})`);
      }

      if (!response.ok || !result?.success) {
        throw new Error(result?.error || `Error del servidor (${response.status})`);
      }

      const url = result.data.url;
      setPreview(url);
      onChange(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al subir imagen';
      alert(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-primary-300 mb-1">
        {label}
        <span className="text-dark-400 font-normal ml-1">(JPG, PNG, GIF, WebP, SVG — máx 10MB)</span>
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value || ''}
          onChange={(e) => {
            setPreview(e.target.value);
            onChange(e.target.value);
          }}
          placeholder="https://..."
          className="flex-1 bg-dark-200 border border-primary-500/30 rounded-lg px-3 py-2 text-white placeholder-dark-400 focus:outline-none focus:border-primary-500"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-3 py-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 text-sm whitespace-nowrap disabled:opacity-50"
        >
          {uploading ? 'Subiendo...' : 'Subir archivo'}
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      {preview && (
        <div className="mt-2">
          <img src={preview} alt="Preview" className="h-24 w-24 object-cover rounded-lg border border-primary-500/30" onError={() => setPreview('')} />
        </div>
      )}
    </div>
  );
}
