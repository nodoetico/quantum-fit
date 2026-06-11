// Servicio de Pagos - Comunicación con Crystal MiFit API
// Este servicio actúa como proxy entre la App QuantumFit y el sistema de pagos de Crystal.
// Flujo: App -> Backend QuantumFit -> API Crystal (MiFit) -> Pago procesado
import { getCrystalClient } from './crystal-auth.service';
import { prisma } from '../database';

// ============================================================================
// INTERFACES
// ============================================================================

// Método de pago que devuelve la API de Crystal
export interface CrystalPaymentMethod {
  id: number;
  name: string;
}

// Estado de inscripción que devuelve Crystal
export interface CrystalEnrollment {
  enrollment: {
    is_enrolled: boolean;
    due_date: string | null;
    is_expired: boolean;
    last_payment_date: string | null;
  } | null;
  renewal: {
    price: number;
    months: number;
    next_due_date: string;
  } | null;
}

// Membresía individual desde Crystal
export interface CrystalMembership {
  id: number;
  name: string;
  description: string | null;
  price: number;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  is_active: boolean;
}

// Transacción desde Crystal
export interface CrystalTransaction {
  id: number;
  visual_id: string;
  title: string;
  category: string | null;
  date: string;
  total_amount: number;
  paid_amount: number;
  debt: number;
  is_paid: boolean;
  comments: string | null;
}

// Respuesta de renovación de inscripción
export interface CrystalRenewResponse {
  message: string;
  enrollment: {
    is_enrolled: boolean;
    due_date: string;
    is_expired: boolean;
    last_payment_date: string | null;
  };
  membership?: {
    id: number;
    name: string;
    end_date: string;
    is_active: boolean;
  };
}

// ============================================================================
// CONSULTAS A CRYSTAL
// ============================================================================

/**
 * Obtiene los métodos de pago disponibles en el gimnasio.
 * Estos métodos los configura Crystal en su sistema.
 */
export async function getPaymentMethods(): Promise<CrystalPaymentMethod[]> {
  try {
    const client = await getCrystalClient();
    const response = await client.get('/payment-methods');

    // La API devuelve { data: [...] }
    if (response.data?.data) {
      return response.data.data;
    }

    return [];
  } catch (error: unknown) {
    throw new Error('No se pudieron obtener los métodos de pago');
  }
}

/**
 * Obtiene el estado de inscripción del usuario en Crystal.
 * Si se provee DNI, consulta los datos específicos de ese usuario.
 * @param dni - DNI del usuario (opcional)
 */
export async function getEnrollmentStatus(dni?: string): Promise<CrystalEnrollment> {
  try {
    const client = await getCrystalClient();
    const endpoint = dni ? `/users/by-dni/${dni}/enrollment` : '/user/enrollment';
    const response = await client.get(endpoint);

    return response.data as CrystalEnrollment;
  } catch (error: unknown) {
    if (dni) {
      return { enrollment: null, renewal: null };
    }
    throw new Error('No se pudo obtener el estado de la inscripción');
  }
}


/**
 * Renueva o crea una inscripción en Crystal usando un método de pago.
 * Si el usuario no tiene inscripción previa, la crea desde hoy.
 * Si tiene inscripción vigente, extiende desde su fecha de vencimiento actual.
 * Si está vencida, extiende desde hoy.
 * 
 * @param paymentMethodId - ID del método de pago (obtenido de getPaymentMethods)
 * @param comments - Comentario opcional para el pago
 */
export async function renewEnrollment(
  paymentMethodId: number,
  comments?: string,
): Promise<CrystalRenewResponse> {
  try {
    const client = await getCrystalClient();
    const response = await client.post('/user/enrollment/renew', {
      payment_method_id: paymentMethodId,
      ...(comments ? { comments } : {}),
    });

    return response.data as CrystalRenewResponse;
  } catch (error: unknown) {
    const apiError = error as { response?: { status?: number }; message?: string };
    if (apiError.response?.status === 422) {
      throw new Error('Configuración de inscripción no disponible. Contacta al administrador.');
    }
    throw new Error('Error al procesar el pago. Intenta nuevamente.');
  }
}

/**
 * Renueva una membresía específica en Crystal.
 * 
 * @param membershipId - ID de la membresía a renovar
 * @param paymentMethodId - ID del método de pago
 * @param comments - Comentario opcional
 */
export async function renewMembership(
  membershipId: number,
  paymentMethodId: number,
  comments?: string,
): Promise<CrystalRenewResponse> {
  try {
    const client = await getCrystalClient();
    const response = await client.post('/memberships/renew', {
      membership_id: membershipId,
      payment_method_id: paymentMethodId,
      ...(comments ? { comments } : {}),
    });

    return response.data as CrystalRenewResponse;
  } catch (error: unknown) {
    const apiError = error as { response?: { status?: number }; message?: string };
    if (apiError.response?.status === 422) {
      throw new Error('No se puede renovar esa membresía. Verifica los datos.');
    }
    throw new Error('Error al procesar el pago. Intenta nuevamente.');
  }
}

/**
 * Obtiene el historial de transacciones del usuario en Crystal.
 * Si se provee DNI, consulta las transacciones específicas de ese usuario.
 * 
 * @param perPage - Cantidad de resultados por página (default: 15)
 * @param dni - DNI del usuario (opcional)
 */
export async function getTransactions(
  perPage: number = 15,
  dni?: string,
): Promise<CrystalTransaction[]> {
  try {
    const client = await getCrystalClient();
    const endpoint = dni ? `/users/by-dni/${dni}/transactions` : '/user/transactions';
    const response = await client.get(endpoint, {
      params: { per_page: perPage },
    });

    if (response.data?.data) {
      return response.data.data;
    }

    return [];
  } catch (error: unknown) {
    if (dni) {
      return [];
    }
    throw new Error('No se pudieron obtener las transacciones');
  }
}

// ============================================================================
// SINCRONIZACIÓN LOCAL (QuantumFit DB)
// ============================================================================

/**
 * Sincroniza el estado de la suscripción en nuestra base de datos local
 * después de un pago exitoso en Crystal.
 * 
 * @param userId - ID del usuario en QuantumFit
 * @param subscriptionType - Tipo de suscripción (VIP_MONTHLY, VIP_QUARTERLY, VIP_ANNUAL)
 * @param endDate - Fecha de vencimiento de la suscripción
 * @param price - Precio pagado
 * @param paymentId - ID de pago en Crystal (opcional)
 */
export async function syncSubscriptionLocally(
  userId: string,
  subscriptionType: 'VIP_MONTHLY' | 'VIP_QUARTERLY' | 'VIP_ANNUAL',
  endDate: Date,
  price: number,
  paymentId?: string
): Promise<void> {
  try {
    // Buscar si ya existe una suscripción para este usuario
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    const now = new Date();
    const billingCycle = subscriptionType === 'VIP_MONTHLY' ? 'MONTHLY'
      : subscriptionType === 'VIP_QUARTERLY' ? 'QUARTERLY'
      : 'ANNUAL';

    if (existingSubscription) {
      // Actualizar suscripción existente
      await prisma.subscription.update({
        where: { userId },
        data: {
          status: 'ACTIVE',
          endDate,
          nextBillingDate: endDate,
          price,
          billingCycle,
          subscriptionType,
          updatedAt: now,
        },
      });
    } else {
      // Crear nueva suscripción
      await prisma.subscription.create({
        data: {
          userId,
          subscriptionType,
          status: 'ACTIVE',
          price,
          currency: 'ARS',
          billingCycle,
          startDate: now,
          endDate,
          nextBillingDate: endDate,
        },
      });
    }

    // Marcar al usuario como VIP
    await prisma.user.update({
      where: { id: userId },
      data: {
        isVip: true,
        vipSince: existingSubscription?.startDate || now,
      },
    });

    // Registrar el pago en el historial
    await prisma.payment.create({
      data: {
        userId,
        amount: price,
        currency: 'ARS',
        paymentType: subscriptionType === 'VIP_ANNUAL' ? 'SUBSCRIPTION_ANNUAL' : 'SUBSCRIPTION_VIP',
        status: 'APPROVED',
        mpPaymentId: paymentId || null,
        description: `Suscripción ${getSubscriptionLabel(subscriptionType)}`,
        paidAt: now,
      },
    });

    // Registrar en el activity log
    await prisma.activityLog.create({
      data: {
        userId,
        activityType: 'CHECK_IN_OPEN_GYM', // Reusamos este tipo como genérico
        points: 0,
        pointsBalanceAfter: (await prisma.user.findUnique({ where: { id: userId } }))?.points || 0,
        title: 'Suscripción VIP activada',
        description: `¡Bienvenido a VIP! Tu suscripción ${getSubscriptionLabel(subscriptionType)} está activa hasta el ${endDate.toLocaleDateString()}`,
        referenceType: 'subscription',
        metadata: {
          subscriptionType,
          endDate: endDate.toISOString(),
          price,
          source: 'crystal_mifit',
        },
      },
    });
  } catch (error: unknown) {
    throw new Error('El pago se procesó pero hubo un error al actualizar los datos locales');
  }
}

/**
 * Obtiene el estado actual de la suscripción del usuario desde nuestra BD.
 */
export async function getLocalSubscription(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isVip: true, vipSince: true },
  });

  if (!subscription) {
    return {
      hasSubscription: false,
      isVip: user?.isVip || false,
      vipSince: user?.vipSince || null,
      subscription: null,
    };
  }

  return {
    hasSubscription: true,
    isVip: user?.isVip || false,
    vipSince: user?.vipSince || null,
    subscription: {
      id: subscription.id,
      type: subscription.subscriptionType,
      status: subscription.status,
      price: Number(subscription.price),
      currency: subscription.currency,
      billingCycle: subscription.billingCycle,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      nextBillingDate: subscription.nextBillingDate,
      isExpired: subscription.endDate ? new Date() > subscription.endDate : false,
    },
  };
}

/**
 * Obtiene el historial de pagos del usuario desde nuestra BD.
 */
export async function getLocalPaymentHistory(userId: string) {
  const payments = await prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return payments.map(p => ({
    id: p.id,
    amount: Number(p.amount),
    currency: p.currency,
    type: p.paymentType,
    status: p.status,
    description: p.description,
    paidAt: p.paidAt,
    createdAt: p.createdAt,
  }));
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Devuelve una etiqueta legible para el tipo de suscripción.
 */
function getSubscriptionLabel(type: string): string {
  const labels: Record<string, string> = {
    VIP_MONTHLY: 'Mensual',
    VIP_QUARTERLY: 'Trimestral',
    VIP_ANNUAL: 'Anual',
  };
  return labels[type] || type;
}
