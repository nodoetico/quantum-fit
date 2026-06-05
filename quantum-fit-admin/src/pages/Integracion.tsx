import { useState, useEffect } from 'react';
import { integrationService, authService } from '../services/api';
import type { User } from '../types';

interface MiFitProfile {
  id: number;
  name: string;
  email: string;
  dni: string;
  balance: number;
  phone: string | null;
  gender: string | null;
  blood_type: string | null;
}

interface MiFitData {
  profile: MiFitProfile | null;
  memberships: unknown[];
  attendances: unknown[];
  transactions: unknown[];
}

export default function Integracion() {
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [miFitData, setMiFitData] = useState<MiFitData | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  useEffect(() => {
    loadStatus();
    loadMiFitData();
    loadUsers();
  }, []);

  async function loadStatus() {
    try {
      const res = await integrationService.getStatus();
      setStatus(res);
    } catch {
      setStatus({ success: false, message: 'Error al conectar con el servidor' });
    } finally {
      setIsLoadingStatus(false);
    }
  }

  async function loadMiFitData() {
    setIsLoadingData(true);
    try {
      const res = await integrationService.getProfile();
      if (res.success) setMiFitData(res.data);
    } catch {
      setMiFitData(null);
    } finally {
      setIsLoadingData(false);
    }
  }

  async function loadUsers() {
    try {
      const usersList = await authService.getUsers();
      setUsers(usersList || []);
    } catch {
      setUsers([]);
    }
  }

  async function handleSync() {
    if (!selectedUser) return;
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await integrationService.syncUser(selectedUser.id);
      if (res.success) {
        setSyncResult(`Sincronización completada: ${res.data.memberships.synced} membresías, ${res.data.attendances.created} asistencias nuevas`);
      } else {
        setSyncResult(`Error: ${res.error || 'desconocido'}`);
      }
    } catch (err: unknown) {
      setSyncResult(`Error: ${(err as { message?: string })?.message || 'desconocido'}`);
    } finally {
      setIsSyncing(false);
    }
  }

  const filteredUsers = searchTerm
    ? users.filter((u) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Integración MiFit</h1>
        <p className="text-primary-400">Sincronización con Crystal Desarrollo S.R.L.</p>
      </div>

      {/* Estado de conexión */}
      <div className="bg-dark-200 rounded-xl border border-primary-500/30 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Estado de conexión</h2>
        {isLoadingStatus ? (
          <div className="animate-pulse h-6 bg-dark-400 rounded w-48" />
        ) : (
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${status?.success ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-white">{status?.message || 'Desconocido'}</span>
          </div>
        )}
      </div>

      {/* Datos del usuario MiFit */}
      <div className="bg-dark-200 rounded-xl border border-primary-500/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Usuario conectado en MiFit</h2>
          <button
            onClick={loadMiFitData}
            disabled={isLoadingData}
            className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-all disabled:opacity-50"
          >
            {isLoadingData ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>
        {isLoadingData ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-dark-400 rounded w-64" />
            <div className="h-4 bg-dark-400 rounded w-48" />
            <div className="h-4 bg-dark-400 rounded w-32" />
          </div>
        ) : miFitData?.profile ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-primary-400">Nombre</p>
              <p className="text-white font-medium">{miFitData.profile.name}</p>
            </div>
            <div>
              <p className="text-sm text-primary-400">Email</p>
              <p className="text-white font-medium">{miFitData.profile.email}</p>
            </div>
            <div>
              <p className="text-sm text-primary-400">DNI</p>
              <p className="text-white font-medium">{miFitData.profile.dni}</p>
            </div>
            <div>
              <p className="text-sm text-primary-400">Saldo</p>
              <p className="text-white font-medium">${miFitData.profile.balance}</p>
            </div>
            <div>
              <p className="text-sm text-primary-400">Membresías</p>
              <p className="text-white font-medium">{miFitData.memberships.length}</p>
            </div>
            <div>
              <p className="text-sm text-primary-400">Asistencias</p>
              <p className="text-white font-medium">{miFitData.attendances.length}</p>
            </div>
          </div>
        ) : (
          <p className="text-dark-400">No se pudieron cargar los datos</p>
        )}
      </div>

      {/* Buscar y sincronizar usuario local */}
      <div className="bg-dark-200 rounded-xl border border-primary-500/30 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Sincronizar usuario local</h2>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Buscar usuario por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-dark-400 border border-primary-500/30 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {searchTerm && filteredUsers.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-dark-200 border border-primary-500/30 rounded-lg shadow-xl max-h-60 overflow-y-auto">
              {filteredUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => { setSelectedUser(u); setSearchTerm(''); }}
                  className={`w-full text-left px-4 py-3 hover:bg-dark-100 transition-colors ${
                    selectedUser?.id === u.id ? 'bg-primary-600/20' : ''
                  }`}
                >
                  <p className="text-white font-medium">{u.name}</p>
                  <p className="text-sm text-primary-400">{u.email} · {u.role}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedUser && (
          <div className="bg-dark-100 rounded-lg p-4 border border-primary-500/30 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{selectedUser.name}</p>
                <p className="text-sm text-primary-400">{selectedUser.email} · DNI: {selectedUser.id}</p>
              </div>
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-600/50 text-white font-medium rounded-lg transition-all flex items-center gap-2"
              >
                {isSyncing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Sincronizando...
                  </>
                ) : (
                  'Sincronizar'
                )}
              </button>
            </div>
          </div>
        )}

        {syncResult && (
          <div className={`p-3 rounded-lg text-sm ${
            syncResult.startsWith('Error') ? 'bg-red-600/10 text-red-400' : 'bg-green-600/10 text-green-400'
          }`}>
            {syncResult}
          </div>
        )}
      </div>
    </div>
  );
}
