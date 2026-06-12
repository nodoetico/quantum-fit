// Servicio de PULL - Consulta datos desde el sistema externo (Crystal MiFit)
import { getCrystalClient, getCrystalToken } from './crystal-auth.service';
import { prisma } from '../database';
import { notifyUser } from './notification.service';
import { recalculateUserLevel } from './level.service';
import { getPointsForActivity } from './points-config.service';

const EXTERNAL_API_BASE_URL = process.env.EXTERNAL_API_URL || 'https://crystal.getmifit.app';

// ============================================================================
// INTERFACES DE RESPUESTA DEL SISTEMA EXTERNO
// ============================================================================

interface ExternalUser {
  id: number;
  name: string;
  email: string;
  dni: string;
  balance: number;
  qr_code: string;
  phone: string | null;
  gender: string | null;
  blood_type: string | null;
  emergency_contact: {
    name: string;
    phone: string;
    email?: string;
    relationship?: string;
    address?: string;
  } | null;
}

interface ExternalMembership {
  id: number;
  // Add fields based on actual API response
  plan?: {
    name: string;
  };
  start_date?: string;
  end_date?: string;
  status?: string;
  auto_renew?: boolean;
}

interface ExternalAttendance {
  id: number;
  date?: string;
  time?: string;
  type?: string;
  location?: string;
}

interface ExternalTransaction {
  id: number;
  date?: string;
  amount?: number;
  type?: string;
  description?: string;
}

// API returns {data: T} or {data: T[], links: {}, meta: {}}
interface ExternalApiResponse<T> {
  data: T;
  links?: unknown;
  meta?: unknown;
}

// ============================================================================
// FUNCIONES DE CONSULTA (PULL)
// ============================================================================

/**
 * Obtiene el perfil del usuario desde el sistema externo
 * @param dni - DNI del usuario a consultar (opcional, si no se provee usa el admin)
 */
export async function pullUserProfile(dni?: string): Promise<ExternalUser | null> {
  try {
    const client = await getCrystalClient();
    const endpoint = dni ? `/users/by-dni/${dni}` : '/user/me';
    const response = await client.get<ExternalUser>(endpoint);
    
    if (response.data) {
      return response.data;
    }
    return null;
  } catch (error: unknown) {
    console.error('[ExternalPull] Error al obtener perfil:', error instanceof Error ? error.message : 'Error');
    return null;
  }
}

/**
 * Obtiene las membresías de un usuario desde el sistema externo
 * @param dni - DNI del usuario (opcional)
 */
export async function pullUserMemberships(dni?: string): Promise<ExternalMembership[]> {
  try {
    const client = await getCrystalClient();
    const endpoint = dni ? `/users/by-dni/${dni}/memberships` : '/user/memberships';
    const response = await client.get<ExternalApiResponse<ExternalMembership[]>>(endpoint);
    
    if (response.data?.data) {
      return response.data.data;
    }
    return [];
  } catch (error: unknown) {
    console.error('[ExternalPull] Error al obtener membresías:', error instanceof Error ? error.message : 'Error');
    return [];
  }
}

/**
 * Obtiene las asistencias de un usuario desde el sistema externo
 * @param dni - DNI del usuario (opcional)
 */
export async function pullUserAttendances(startDate?: string, endDate?: string, dni?: string): Promise<ExternalAttendance[]> {
  try {
    const client = await getCrystalClient();
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const endpoint = dni ? `/users/by-dni/${dni}/attendances` : '/user/attendances';
    const response = await client.get<ExternalApiResponse<ExternalAttendance[]>>(endpoint, { params });
    
    if (response.data?.data) {
      return response.data.data;
    }
    return [];
  } catch (error: unknown) {
    console.error('[ExternalPull] Error al obtener asistencias:', error instanceof Error ? error.message : 'Error');
    return [];
  }
}

/**
 * Obtiene las transacciones de un usuario desde el sistema externo
 * @param dni - DNI del usuario (opcional)
 */
export async function pullUserTransactions(startDate?: string, endDate?: string, dni?: string): Promise<ExternalTransaction[]> {
  try {
    const client = await getCrystalClient();
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const endpoint = dni ? `/users/by-dni/${dni}/transactions` : '/user/transactions';
    const response = await client.get<ExternalApiResponse<ExternalTransaction[]>>(endpoint, { params });
    
    if (response.data?.data) {
      return response.data.data;
    }
    return [];
  } catch (error: unknown) {
    console.error('[ExternalPull] Error al obtener transacciones:', error instanceof Error ? error.message : 'Error');
    return [];
  }
}

// ============================================================================
// SINCRONIZACIÓN AUTOMÁTICA (PULL + UPDATE LOCAL)
// ============================================================================

/**
 * Sincroniza membresías de un usuario desde el sistema externo
 */
export async function syncMembershipsFromExternal(user: { id: string; dni?: string | null }, dni?: string): Promise<{
  synced: number;
  memberships: ExternalMembership[];
}> {
  const userDni = dni || user.dni;
  if (!userDni) {
    return { synced: 0, memberships: [] };
  }

  const externalMemberships = await pullUserMemberships(userDni);
  
  for (const extMembership of externalMemberships) {
    try {
      const existing = await prisma.subscription.findFirst({
        where: {
          userId: user.id,
        }
      });

      if (existing) {
        await prisma.subscription.update({
          where: { id: existing.id },
          data: {
            status: extMembership.status === 'active' ? 'ACTIVE' : 
                      extMembership.status === 'expired' ? 'EXPIRED' : 'CANCELLED',
            endDate: extMembership.end_date ? new Date(extMembership.end_date) : undefined,
          }
        });
      } else {
        await prisma.subscription.create({
          data: {
            userId: user.id,
            subscriptionType: 'VIP_MONTHLY',
            status: extMembership.status === 'active' ? 'ACTIVE' : 
                    extMembership.status === 'expired' ? 'EXPIRED' : 'CANCELLED',
            startDate: extMembership.start_date ? new Date(extMembership.start_date) : new Date(),
            endDate: extMembership.end_date ? new Date(extMembership.end_date) : new Date(),
            price: 0,
            currency: 'ARS',
            billingCycle: 'MONTHLY',
          }
        });
      }
    } catch (syncErr: unknown) {
      console.error('[ExternalPull] Error al sincronizar membresía:', syncErr instanceof Error ? syncErr.message : 'Error');
    }
  }

  return {
    synced: externalMemberships.length,
    memberships: externalMemberships,
  };
}

/**
 * Sincroniza asistencias desde el sistema externo (PULL + CREATE missing check-ins)
 */
export async function syncAttendancesFromExternal(user: { id: string; dni?: string | null; points: number; totalPointsEarned: number }, startDate?: string, endDate?: string, dni?: string): Promise<{
  synced: number;
  created: number;
  attendances: ExternalAttendance[];
}> {
  const userDni = dni || user.dni;
  if (!userDni) {
    return { synced: 0, created: 0, attendances: [] };
  }

  const externalAttendances = await pullUserAttendances(startDate, endDate, userDni);
  let created = 0;

  for (const attendance of externalAttendances) {
    try {
      const attendanceDate = attendance.date ? new Date(attendance.date) : new Date();
      
      const existingCheckIn = await prisma.checkIn.findFirst({
        where: {
          userId: user.id,
          checkInTime: attendanceDate,
        }
      });

      if (!existingCheckIn && attendance.type !== 'exit') {
        const pointsToAdd = await getPointsForActivity('CHECK_IN_OPEN_GYM').catch(() => 50);

        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            points: { increment: pointsToAdd },
            totalPointsEarned: { increment: pointsToAdd },
            lastActive: new Date(),
          },
        });

        await prisma.checkIn.create({
          data: {
            userId: user.id,
            checkInType: 'OPEN_GYM',
            pointsEarned: pointsToAdd,
            validationMethod: 'EXTERNAL_SYSTEM',
            checkInTime: attendanceDate,
            gymLocation: attendance.location || 'Sede Externa',
          }
        });

        await recalculateUserLevel(user.id);

        notifyUser(user.id, 'points-updated', {
          userId: user.id,
          newBalance: updatedUser.points,
          earned: pointsToAdd,
        });

        created++;
      }
    } catch (syncErr: unknown) {
      console.error('[ExternalPull] Error al sincronizar asistencia:', syncErr instanceof Error ? syncErr.message : 'Error');
    }
  }

  return {
    synced: externalAttendances.length,
    created,
    attendances: externalAttendances,
  };
}

// ============================================================================
// FUNCIÓN DE PRUEBA DE CONEXIÓN
// ============================================================================

/**
 * Verifica la conectividad con el sistema externo
 */
export async function testExternalConnection(): Promise<{
  success: boolean;
  message: string;
  apiUrl: string;
}> {
  try {
    const token = await getCrystalToken();
    
    if (!token) {
      return {
        success: false,
        message: 'No se pudo obtener el Bearer token',
        apiUrl: EXTERNAL_API_BASE_URL,
      };
    }

    const client = await getCrystalClient();
    await client.get('/user/me');
    
    return {
      success: true,
      message: 'Conexión exitosa con el sistema externo',
      apiUrl: EXTERNAL_API_BASE_URL,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: `Error de conexión: ${error instanceof Error ? error.message : 'Error'}`,
      apiUrl: EXTERNAL_API_BASE_URL,
    };
  }
}
