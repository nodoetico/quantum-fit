// Servicio de autenticación compartido para Crystal MiFit API
// Unifica los dos getBearerToken() que estaban duplicados en external-pull.service.ts y payment.service.ts
import axios, { AxiosInstance } from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const EXTERNAL_API_BASE_URL = process.env.EXTERNAL_API_URL || 'https://crystal.getmifit.app';
const TOKEN_REFRESH_INTERVAL = 60 * 60 * 1000; // 1 hora

let bearerToken: string | null = null;
let lastTokenRefresh: number | null = null;

const TOKEN_CACHE_FILE = path.resolve(__dirname, '../../data/crystal-token.json');

function loadTokenFromDisk(): { token: string; timestamp: number } | null {
  try {
    if (fs.existsSync(TOKEN_CACHE_FILE)) {
      const data = JSON.parse(fs.readFileSync(TOKEN_CACHE_FILE, 'utf-8'));
      return data;
    }
  } catch {
  }
  return null;
}

function saveTokenToDisk(token: string) {
  try {
    const dir = path.dirname(TOKEN_CACHE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TOKEN_CACHE_FILE, JSON.stringify({ token, timestamp: Date.now() }), 'utf-8');
  } catch {
  }
}

export async function getCrystalToken(): Promise<string | null> {
  const now = Date.now();

  if (bearerToken && lastTokenRefresh && (now - lastTokenRefresh) < TOKEN_REFRESH_INTERVAL) {
    return bearerToken;
  }

  const diskCache = loadTokenFromDisk();
  if (diskCache && diskCache.token && (now - diskCache.timestamp) < TOKEN_REFRESH_INTERVAL) {
    bearerToken = diskCache.token;
    lastTokenRefresh = diskCache.timestamp;
    return bearerToken;
  }

  const email = process.env.EXTERNAL_USER_EMAIL;
  const password = process.env.EXTERNAL_USER_PASSWORD;

  if (!email || !password) {
    console.error('[CrystalAuth] EXTERNAL_USER_EMAIL y EXTERNAL_USER_PASSWORD deben estar configurados en .env');
    return null;
  }

  try {
    const response = await axios.post(
      `${EXTERNAL_API_BASE_URL}/api/login`,
      { email, password },
      {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      }
    );

    const data = response.data;

    let token: string | null = null;
    if (data?.token) token = data.token;
    else if (data?.access_token) token = data.access_token;
    else if (data?.data?.token) token = data.data.token;
    else if (data?.data?.access_token) token = data.data.access_token;

    if (!token) {
      console.error('[CrystalAuth] No se pudo extraer token de la respuesta de login');
      return null;
    }

    bearerToken = token;
    lastTokenRefresh = now;
    saveTokenToDisk(token);
    return token;
  } catch (error: unknown) {
    const apiError = error as { response?: { status?: number; data?: { token?: string } } };
    if (apiError.response?.status === 302 || apiError.response?.status === 301) {
      const data = apiError.response.data;
      if (data?.token) {
        bearerToken = data.token;
        lastTokenRefresh = now;
        saveTokenToDisk(data.token);
        return bearerToken;
      }
    }
    console.error('[CrystalAuth] Error al obtener token:', error instanceof Error ? error.message : 'Error desconocido');
    return null;
  }
}

export async function getCrystalClient(): Promise<AxiosInstance> {
  const token = await getCrystalToken();

  return axios.create({
    baseURL: `${EXTERNAL_API_BASE_URL}/api`,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  });
}
