import axios from 'axios';
import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { emitToAdmins } from '../../sockets/index.js';

const SANDBOX_URL = 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';
const LIVE_URL = 'https://securepay.sslcommerz.com/gwprocess/v4/api.php';

interface InitPaymentInput {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

/**
 * Kicks off an SSLCommerz hosted-checkout session for an order and
 * returns the redirect URL the client should send the browser to.
 * Inert until SSLCOMMERZ_STORE_ID / SSLCOMMERZ_STORE_PASSWORD are set
 * in .env — see .env.example.
 */
export async function initiatePayment(input: InitPaymentInput) {
  if (!env.sslcommerz.enabled) {
    throw ApiError.badRequest('Payment gateway is not configured on this server yet — set SSLCOMMERZ_STORE_ID/PASSWORD in .env');
  }

  const order = await prisma.order.findUnique({ where: { id: input.orderId } });
  if (!order) throw ApiError.notFound('Order not found');

  const payload = {
    store_id: env.sslcommerz.storeId,
    store_passwd: env.sslcommerz.storePassword,
    total_amount: String(input.amount),
    currency: 'BDT',
    tran_id: order.id,
    success_url: `${env.clientUrl.replace('5173', '4000')}/api/payments/success`,
    fail_url: `${env.clientUrl}/checkout?payment=failed`,
    cancel_url: `${env.clientUrl}/checkout?payment=cancelled`,
    ipn_url: `${env.clientUrl.replace('5173', '4000')}/api/payments/ipn`,
    cus_name: input.customerName,
    cus_email: input.customerEmail,
    cus_phone: input.customerPhone,
    cus_add1: 'N/A',
    cus_city: 'Dhaka',
    cus_country: 'Bangladesh',
    shipping_method: 'NO',
    product_name: `Order ${order.id}`,
    product_category: 'General',
    product_profile: 'general',
  };

  const url = env.sslcommerz.isLive ? LIVE_URL : SANDBOX_URL;
  const { data } = await axios.post(url, new URLSearchParams(payload as Record<string, string>).toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (data.status !== 'SUCCESS') {
    throw ApiError.badRequest(data.failedreason || 'Failed to initiate payment session');
  }

  return { gatewayUrl: data.GatewayPageURL as string, sessionKey: data.sessionkey as string };
}

export async function markOrderPaid(orderId: string) {
  await prisma.order.update({ where: { id: orderId }, data: { paymentStatus: 'PAID', status: 'PROCESSING' } });
  emitToAdmins('analytics:update', { reason: 'order:paid', orderId });
}
