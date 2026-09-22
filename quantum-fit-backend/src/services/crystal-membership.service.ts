// Servicio de Membresía MyFit (Crystal) - Sesión del socio
// Modelo espejo: cada socio se autentica en MyFit con su propia cuenta (email+password),
// el backend obtiene su token de sesión y lo guarda cifrado, y opera sobre los datos reales del socio.
import axios, { AxiosInstance } from 'axios';
import { prisma } from '../database';
import { encryptToken, decryptToken } from '../utils/crypto';

const EXTERNAL_API_BASE_URL = process.env.EXTERNAL_API_URL || 'https://crystal.getmifit.app';

// ============================================================================
// INTERFACES (según documentación Mifit API)
// ============================================================================

export interface MyFitUser {
  id: number;
  name: string;
  email: string;
  dni?: string | null;
  balance: number;
  qr_code?: string;
  phone?: string | null;
  gender?: string | null;
  blood_type?: string | null;
  emergency_contact?: {
    name: string;
    phone: string;
    email?: string;
    relationship?: string;
    address?: string;
  } | null;
}

export interface MyFitMembershipPlan {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  is_renewable?: boolean;
  is_visible_in_app?: boolean;
}

export interface MyFitUserMembership {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  start_date?: string;
  end_date?: string;
  start_time?: string | null;
  end_time?: string | null;
  is_active?: boolean;
  is_renewable?: boolean;
  is_visible_in_app?: boolean;
}

export interface MyFitEnrollment {
  enrollment: {
    is_enrolled: boolean;
    due_date?: string | null;
    is_expired?: boolean;
    last_payment_date?: string | null;
  } | null;
  renewal?: {
    price: number;
    months: number;
    next_due_date?: string;
  } | null;
}

export interface MyFitAttendance {
  id?: number;
  company?: string | null;
  comments?: string | null;
  created_at?: string;
  // Campos alternativos que algunas variantes de la API podrían devolver
  date?: string;
  time?: string;
  type?: string;
  location?: string;
}

export interface MyFitTransaction {
  id?: number;
  visual_id?: string;
  title?: string;
  category?: string | null;
  date?: string;
  total_amount?: number;
  paid_amount?: number;
  debt?: number;
  is_paid?: boolean;
  comments?: string | null;
}

// ============================================================================
// TIPO DE ERROR DE MYFIT (para mapear códigos HTTP)
// ============================================================================

export class MyFitError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'MyFitError';
    this.status = status;
  }
}

// ============================================================================
// CLIENTE CON EL TOKEN DE SESIÓN DEL SOCIO
// ============================================================================

function createMemberClient(token: string): AxiosInstance {
  return axios.create({
    baseURL: `${EXTERNAL_API_BASE_URL}/api`,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
}

// ============================================================================
// GUARDADO / RECUPERACIÓN DEL TOKEN DEL SOCIO (cifrado en BD)
// ============================================================================

export async function getMemberToken(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { crystalTokenEncrypted: true },
  });
  if (!user?.crystalTokenEncrypted) return null;
  try {
    return decryptToken(user.crystalTokenEncrypted);
  } catch (err: unknown) {
    console.error('[MyFit] No se pudo descifrar token de sesión:', err instanceof Error ? err.message : 'Error');
    return null;
  }
}

export async function clearMemberToken(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { crystalTokenEncrypted: null },
  }).catch(() => {});
}

// ============================================================================
// LOGIN / LINK DE LA CUENTA MYFIT DEL SOCIO
// ============================================================================

interface LoginResponse {
  token?: string;
  access_token?: string;
  user?: Omit<MyFitUser, 'dni'> & { dni?: string | null };
}

export interface MyFitLoginInput {
  email?: string;
  dni?: string;
  password: string;
}

/**
 * Valida las credenciales del socio en MyFit y devuelve su token de sesión + usuario.
 * POST /api/login — la spec acepta `email` o `dni` (al menos uno) además de `password`.
 */
export async function loginMyFitMember(input: MyFitLoginInput): Promise<{ token: string; user?: MyFitUser }> {
  if (!input.email && !input.dni) {
    throw new MyFitError('Se requiere el email o el DNI de la cuenta MyFit.', 400);
  }
  let response;
  try {
    response = await axios.post(
      `${EXTERNAL_API_BASE_URL}/api/login`,
      {
        ...(input.email ? { email: input.email } : {}),
        ...(input.dni ? { dni: input.dni } : {}),
        password: input.password,
      },
      { timeout: 10000, headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } }
    );
  } catch (err: any) {
    const status = err?.response?.status || 0;
    if (status === 401 || status === 422) {
      throw new MyFitError('Credenciales de MyFit inválidas. Verificá tus datos del gimnasio.', status);
    }
    console.error('[MyFit] Error de conexión al login:', err instanceof Error ? err.message : 'Error');
    throw new MyFitError('No se pudo conectar con el sistema MyFit del gimnasio. Intentá nuevamente.', 502);
  }

  const data = response.data as LoginResponse;
  let token: string | null = data?.token || data?.access_token || null;

  // Algunas variantes envuelven el token en data.data
  if (!token && data && (data as any).data) {
    token = (data as any).data?.token || (data as any).data?.access_token || null;
  }

  if (!token) {
    console.error('[MyFit] Respuesta de login sin token:', JSON.stringify(data));
    throw new MyFitError('El sistema MyFit no devolvió una sesión válida.', 502);
  }

  return { token, user: data?.user };
}

/**
 * Vincula la cuenta MyFit del socio: valida credenciales, guarda el token cifrado y el email.
 * Si el socio ya tiene cuenta MiFit y coincide su DNI, la app podrá mostrar sus datos reales.
 * Acepta `email` o `dni` como identificador (según la spec de /api/login).
 */
export async function linkMyFitAccount(
  userId: string,
  input: MyFitLoginInput
): Promise<{ linked: boolean; user?: MyFitUser }> {
  const { token, user } = await loginMyFitMember(input);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { crystalEmail: input.email ? input.email.toLowerCase() : null, crystalTokenEncrypted: null },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { crystalTokenEncrypted: encryptToken(token) },
    }),
  ]);

  return { linked: true, user };
}

// ============================================================================
// REGISTRO / LOGOUT / PASSWORDS (escritura en MyFit)
// ============================================================================

export interface RegisterMyFitInput {
  name: string;
  dni: string;
  email?: string;
  phone?: string;
  password: string;
}

/**
 * POST /api/register - crea la cuenta del socio en MyFit.
 */
export async function registerMyFitMember(data: RegisterMyFitInput): Promise<void> {
  try {
    await axios.post(
      `${EXTERNAL_API_BASE_URL}/api/register`,
      {
        name: data.name,
        dni: data.dni,
        ...(data.email ? { email: data.email } : {}),
        ...(data.phone ? { phone: data.phone } : {}),
        password: data.password,
      },
      { timeout: 10000, headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } }
    );
  } catch (err: any) {
    const status = err?.response?.status || 0;
    if (status === 422) {
      throw new MyFitError('No se pudo crear la cuenta en MyFit. Probablemente el DNI/email ya existe.', 422);
    }
    console.error('[MyFit] Error al registrar en MyFit:', err instanceof Error ? err.message : 'Error');
    throw new MyFitError('No se pudo crear la cuenta en el sistema MyFit.', 502);
  }
}

/**
 * POST /api/logout - cierra la sesión del socio en MyFit y borra el token guardado.
 */
export async function logoutMyFitMember(userId: string): Promise<{ loggedOut: boolean }> {
  const token = await getMemberToken(userId);
  if (token) {
    try {
      await createMemberClient(token).post('/logout');
    } catch {
      // Si el token ya expiró, no importa: igual limpiamos localmente
    }
  }
  await clearMemberToken(userId);
  await prisma.user.update({
    where: { id: userId },
    data: { crystalEmail: null },
  }).catch(() => {});
  return { loggedOut: true };
}

/**
 * POST /api/forgot-password - solicita restablecer la contraseña de MyFit.
 * Acepta dni o email.
 */
export async function forgotMyFitPassword(input: { dni?: string; email?: string }): Promise<void> {
  if (!input.dni && !input.email) {
    throw new MyFitError('Se requiere el DNI o el email.', 400);
  }
  try {
    await axios.post(
      `${EXTERNAL_API_BASE_URL}/api/forgot-password`,
      { ...(input.dni ? { dni: input.dni } : {}), ...(input.email ? { email: input.email } : {}) },
      { timeout: 10000, headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } }
    );
  } catch (err: any) {
    const status = err?.response?.status || 0;
    if (status === 422) {
      throw new MyFitError('No se pudo enviar el restablecimiento. Verificá los datos.', 422);
    }
    console.error('[MyFit] Error en forgot-password:', err instanceof Error ? err.message : 'Error');
    throw new MyFitError('No se pudo solicitar el restablecimiento de contraseña.', 502);
  }
}

export interface ResetMyFitPasswordInput {
  token: string;
  email: string;
  password: string;
  passwordConfirmation?: string;
}

/**
 * POST /api/reset-password - restablece la contraseña de MyFit con el token recibido.
 */
export async function resetMyFitPassword(data: ResetMyFitPasswordInput): Promise<void> {
  if (data.passwordConfirmation && data.password !== data.passwordConfirmation) {
    throw new MyFitError('Las contraseñas no coinciden.', 400);
  }
  try {
    await axios.post(
      `${EXTERNAL_API_BASE_URL}/api/reset-password`,
      {
        token: data.token,
        email: data.email,
        password: data.password,
        ...(data.passwordConfirmation ? { password_confirmation: data.passwordConfirmation } : {}),
      },
      { timeout: 10000, headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } }
    );
  } catch (err: any) {
    const status = err?.response?.status || 0;
    if (status === 422) {
      throw new MyFitError('El token es inválido o expiró.', 422);
    }
    console.error('[MyFit] Error en reset-password:', err instanceof Error ? err.message : 'Error');
    throw new MyFitError('No se pudo restablecer la contraseña.', 502);
  }
}

/**
 * POST /api/user/change-password - cambia la contraseña del socio en MyFit.
 * Requiere la sesión del socio (token guardado).
 */
export async function changeMyFitPassword(
  userId: string,
  input: { currentPassword: string; password: string; passwordConfirmation?: string }
): Promise<void> {
  const token = await getMemberToken(userId);
  if (!token) {
    throw new MyFitError('Tu cuenta no está vinculada con MyFit.', 401);
  }
  if (input.passwordConfirmation && input.password !== input.passwordConfirmation) {
    throw new MyFitError('Las contraseñas no coinciden.', 400);
  }
  try {
    await createMemberClient(token).post('/user/change-password', {
      current_password: input.currentPassword,
      password: input.password,
      password_confirmation: input.passwordConfirmation || input.password,
    });
  } catch (err: any) {
    const status = err?.response?.status || 0;
    if (status === 422 || status === 401) {
      throw new MyFitError('La contraseña actual es incorrecta o el token expiró. Volvé a vincular tu cuenta.', status);
    }
    console.error('[MyFit] Error en change-password:', err instanceof Error ? err.message : 'Error');
    throw new MyFitError('No se pudo cambiar la contraseña.', 502);
  }
}

// ============================================================================
// LECTURA DE DATOS REALES DEL SOCIO (con su sesión)
// ============================================================================

async function getWithMember<T>(userId: string, path: string): Promise<T> {
  const token = await getMemberToken(userId);
  if (!token) {
    throw new MyFitError('Tu cuenta no está vinculada con MyFit. Vinculá tu cuenta para ver tus datos.', 401);
  }
  try {
    const client = createMemberClient(token);
    const response = await client.get<{ data?: T } | T>(path);
    const body = response.data as any;
    return (body?.data !== undefined ? body.data : body) as T;
  } catch (err: any) {
    const status = err?.response?.status || 0;
    if (status === 401) {
      throw new MyFitError('La sesión de MyFit expiró. Volvé a vincular tu cuenta.', 401);
    }
    console.error(`[MyFit] Error en GET ${path}:`, err instanceof Error ? err.message : 'Error');
    throw new MyFitError('No se pudieron obtener los datos de MyFit.', 502);
  }
}

/** GET /api/user/me - perfil real del socio. */
export async function getMyFitProfile(userId: string): Promise<MyFitUser> {
  return getWithMember<MyFitUser>(userId, '/user/me');
}

/** GET /api/user/memberships - membresías reales del socio. */
export async function getMyFitUserMemberships(userId: string): Promise<MyFitUserMembership[]> {
  return getWithMember<MyFitUserMembership[]>(userId, '/user/memberships');
}

/** GET /api/user/attendances - asistencias reales del socio. */
export async function getMyFitAttendances(userId: string): Promise<MyFitAttendance[]> {
  return getWithMember<MyFitAttendance[]>(userId, '/user/attendances');
}

/** GET /api/user/transactions - transacciones reales del socio. */
export async function getMyFitTransactions(userId: string): Promise<MyFitTransaction[]> {
  return getWithMember<MyFitTransaction[]>(userId, '/user/transactions');
}

/** GET /api/user/enrollment - estado de inscripción/vencimiento del socio. */
export async function getMyFitEnrollment(userId: string): Promise<MyFitEnrollment> {
  return getWithMember<MyFitEnrollment>(userId, '/user/enrollment');
}

// ============================================================================
// PLANES / CONTRATACIÓN DE MEMBRESÍA (escritura)
// ============================================================================

/** GET /api/memberships - lista los planes disponibles (visibles en app). */
export async function listMyFitMembershipPlans(userId: string): Promise<MyFitMembershipPlan[]> {
  const token = await getMemberToken(userId);
  if (!token) {
    throw new MyFitError('Tu cuenta no está vinculada con MyFit.', 401);
  }
  try {
    const client = createMemberClient(token);
    const response = await client.get<{ data?: MyFitMembershipPlan[] }>('/memberships');
    return response.data?.data || [];
  } catch (err: any) {
    const status = err?.response?.status || 0;
    if (status === 401) {
      throw new MyFitError('La sesión de MyFit expiró. Volvé a vincular tu cuenta.', 401);
    }
    console.error('[MyFit] Error al listar planes:', err instanceof Error ? err.message : 'Error');
    throw new MyFitError('No se pudieron obtener los planes disponibles.', 502);
  }
}

export interface ContractMembershipInput {
  membershipId: number;
  paymentMethodId: number;
  comments?: string;
}

/**
 * POST /api/memberships - contrata una membresía en MyFit.
 * Retorna datos del plan contratado (incluido el vencimiento).
 */
export async function contractMyFitMembership(
  userId: string,
  input: ContractMembershipInput
): Promise<{ message?: string; membership?: MyFitUserMembership }> {
  const token = await getMemberToken(userId);
  if (!token) {
    throw new MyFitError('Tu cuenta no está vinculada con MyFit.', 401);
  }
  try {
    const client = createMemberClient(token);
    const response = await client.post<{ message?: string; membership?: MyFitUserMembership }>('/memberships', {
      membership_id: input.membershipId,
      payment_method_id: input.paymentMethodId,
      ...(input.comments ? { comments: input.comments } : {}),
    });
    return response.data;
  } catch (err: any) {
    const status = err?.response?.status || 0;
    if (status === 422) {
      throw new MyFitError('No se pudo contratar el plan (plan no disponible, ya tenés otro activo o método de pago inválido).', 422);
    }
    if (status === 401) {
      throw new MyFitError('La sesión de MyFit expiró. Volvé a vincular tu cuenta.', 401);
    }
    console.error('[MyFit] Error al contratar membresía:', err instanceof Error ? err.message : 'Error');
    throw new MyFitError('No se pudo contratar la membresía.', 502);
  }
}

// ============================================================================
// ESCRITURA DE PERFIL / CONTACTO DE EMERGENCIA
// ============================================================================

/**
 * PATCH /api/user/profile - actualiza datos del perfil del socio en MyFit.
 * La spec exige `name` y `email` en el body: si no vienen, se reutilizan los actuales de MyFit
 * para no fallar con 422 ni pisar datos.
 */
export async function updateMyFitProfile(
  userId: string,
  data: { name?: string; email?: string; dni?: string; phone?: string; gender?: string; bloodType?: string }
): Promise<void> {
  const token = await getMemberToken(userId);
  if (!token) {
    throw new MyFitError('Tu cuenta no está vinculada con MyFit.', 401);
  }
  try {
    const client = createMemberClient(token);
    const current = data.name && data.email
      ? null
      : await client.get<MyFitUser>('/user/me').then(r => r.data).catch(() => null);
    await client.patch('/user/profile', {
      name: data.name ?? current?.name,
      email: data.email ?? current?.email,
      dni: data.dni,
      phone: data.phone,
      gender: data.gender,
      blood_type: data.bloodType,
    });
  } catch (err: any) {
    const status = err?.response?.status || 0;
    if (status === 401) {
      throw new MyFitError('La sesión de MyFit expiró. Volvé a vincular tu cuenta.', 401);
    }
    console.error('[MyFit] Error al actualizar perfil:', err instanceof Error ? err.message : 'Error');
    throw new MyFitError('No se pudo actualizar el perfil en MyFit.', 502);
  }
}

/**
 * PATCH /api/user/emergency-contact - actualiza el contacto de emergencia en MyFit.
 */
export async function updateMyFitEmergencyContact(
  userId: string,
  data: { name: string; phone: string; email?: string; relationship?: string; address?: string }
): Promise<void> {
  const token = await getMemberToken(userId);
  if (!token) {
    throw new MyFitError('Tu cuenta no está vinculada con MyFit.', 401);
  }
  try {
    await createMemberClient(token).patch('/user/emergency-contact', {
      name: data.name,
      phone: data.phone,
      email: data.email,
      relationship: data.relationship,
      address: data.address,
    });
  } catch (err: any) {
    const status = err?.response?.status || 0;
    if (status === 401) {
      throw new MyFitError('La sesión de MyFit expiró. Volvé a vincular tu cuenta.', 401);
    }
    console.error('[MyFit] Error al actualizar contacto de emergencia:', err instanceof Error ? err.message : 'Error');
    throw new MyFitError('No se pudo actualizar el contacto de emergencia.', 502);
  }
}

// ============================================================================
// AYUDA: estado de la vinculación
// ============================================================================

export async function getMyFitLinkStatus(userId: string): Promise<{
  linked: boolean;
  email?: string | null;
  profile?: MyFitUser | null;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { crystalEmail: true, crystalTokenEncrypted: true },
  });
  const linked = !!user?.crystalTokenEncrypted;
  return { linked, email: user?.crystalEmail || null, profile: linked ? await getMyFitProfile(userId).catch(() => null) : null };
}
