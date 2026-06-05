import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import type { PreferenceCreateData } from 'mercadopago/dist/clients/preference/create/types';
import type { PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';
import { prisma } from '../database';
import { getPaymentMethods, renewEnrollment } from './payment.service';

const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || '';
const SUCCESS_URL = process.env.MERCADOPAGO_SUCCESS_URL || 'quantumfit://payment/success';
const FAILURE_URL = process.env.MERCADOPAGO_FAILURE_URL || 'quantumfit://payment/failure';
const PENDING_URL = process.env.MERCADOPAGO_PENDING_URL || 'quantumfit://payment/pending';

const client = new MercadoPagoConfig({
  accessToken: ACCESS_TOKEN,
  options: { timeout: 15000 },
});

const preferenceClient = new Preference(client);
const paymentClient = new Payment(client);

export interface CreatePreferenceInput {
  planId: string;
  planName: string;
  price: number;
  userId: string;
  userEmail: string;
  userName: string;
}

export interface PreferenceResult {
  id: string;
  initPoint: string;
  sandboxInitPoint: string;
}

export async function createPreference(input: CreatePreferenceInput): Promise<PreferenceResult> {
  const isProduction = ACCESS_TOKEN.startsWith('APP_USR-');
  const notificationUrl = process.env.MERCADOPAGO_NOTIFICATION_URL;

  const body: PreferenceCreateData['body'] = {
    items: [
      {
        id: input.planId,
        title: input.planName,
        description: `Membresía QuantumFit - ${input.planName}`,
        quantity: 1,
        unit_price: input.price,
        currency_id: 'ARS',
      },
    ],
    payer: {
      email: input.userEmail,
      name: input.userName.split(' ')[0],
      surname: input.userName.split(' ').slice(1).join(' '),
    },
    binary_mode: true,
    back_urls: {
      success: SUCCESS_URL,
      failure: FAILURE_URL,
      pending: PENDING_URL,
    },
    auto_return: 'approved',
    external_reference: input.userId,
    ...(notificationUrl ? { notification_url: notificationUrl } : {}),
  };

  const preference = await preferenceClient.create({ body });

  if (!preference.id || (!preference.init_point && !preference.sandbox_init_point)) {
    throw new Error('No se pudo crear la preferencia de pago');
  }

  return {
    id: preference.id,
    initPoint: isProduction ? preference.init_point! : preference.sandbox_init_point!,
    sandboxInitPoint: preference.sandbox_init_point || preference.init_point!,
  };
}

export async function processPaymentWebhook(paymentId: string, topic: string): Promise<void> {
  if (topic !== 'payment') return;

  let paymentResponse: PaymentResponse;

  try {
    const result = await paymentClient.get({ id: paymentId }) as PaymentResponse;
    paymentResponse = result;
  } catch {
    return;
  }

  if (paymentResponse.status !== 'approved') return;

  const userId = paymentResponse.external_reference;
  const mpPaymentId = paymentResponse.id?.toString();
  const amount = Number(paymentResponse.transaction_amount) || 0;

  if (!userId) return;

  const existingPayment = await prisma.payment.findFirst({
    where: { mpPaymentId },
  });
  if (existingPayment) return;

  let crystalPaymentMethodId = 1;
  try {
    const methods = await getPaymentMethods();
    if (methods.length > 0) {
      const tarjeta = methods.find(m =>
        m.name.toLowerCase().includes('tarjeta') ||
        m.name.toLowerCase().includes('debito') ||
        m.name.toLowerCase().includes('debito')
      );
      crystalPaymentMethodId = tarjeta?.id || methods[0].id;
    }
  } catch {
  }

  let enrollmentResult: any = null;
  try {
    enrollmentResult = await renewEnrollment(
      crystalPaymentMethodId,
      `MercadoPago - Pago ${mpPaymentId}`,
    );
  } catch {
  }

  const endDate = enrollmentResult?.enrollment?.due_date
    ? new Date(enrollmentResult.enrollment.due_date)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const now = new Date();
  const monthsDiff = (endDate.getFullYear() - now.getFullYear()) * 12
    + (endDate.getMonth() - now.getMonth());

  let subType: 'VIP_MONTHLY' | 'VIP_QUARTERLY' | 'VIP_ANNUAL' = 'VIP_MONTHLY';
  if (monthsDiff >= 12) subType = 'VIP_ANNUAL';
  else if (monthsDiff >= 3) subType = 'VIP_QUARTERLY';

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        userId,
        amount,
        currency: 'ARS',
        paymentType: subType === 'VIP_ANNUAL' ? 'SUBSCRIPTION_ANNUAL' : 'SUBSCRIPTION_VIP',
        status: 'APPROVED',
        mpPaymentId,
        description: `Membresía QuantumFit - Pago MercadoPago`,
        paidAt: new Date(),
        metadata: {
          mpPaymentId,
          enrollmentDueDate: endDate.toISOString(),
        },
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        isVip: true,
        vipSince: now,
      },
    }),
    prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        subscriptionType: subType,
        status: 'ACTIVE',
        price: amount,
        currency: 'ARS',
        billingCycle: subType === 'VIP_ANNUAL' ? 'ANNUAL' : subType === 'VIP_QUARTERLY' ? 'QUARTERLY' : 'MONTHLY',
        startDate: now,
        endDate,
        nextBillingDate: endDate,
      },
      update: {
        subscriptionType: subType,
        status: 'ACTIVE',
        price: amount,
        endDate,
        nextBillingDate: endDate,
        cancelledAt: null,
      },
    }),
  ]);
}
