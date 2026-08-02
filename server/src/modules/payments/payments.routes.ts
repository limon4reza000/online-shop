import { Router } from 'express';
import { z } from 'zod';
import { protect } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { env } from '../../config/env.js';
import * as paymentsService from './payments.service.js';

export const paymentsRouter = Router();

const initSchema = z.object({
  orderId: z.string(),
  amount: z.number().positive(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  customerPhone: z.string(),
});

// Customer: start an SSLCommerz hosted checkout session for an existing order.
paymentsRouter.post('/initiate', protect, validateBody(initSchema), asyncHandler(async (req, res) => {
  const result = await paymentsService.initiatePayment(req.body);
  sendSuccess(res, result, 'Payment session created');
}));

// SSLCommerz redirects the customer's browser here after a successful hosted payment.
paymentsRouter.post('/success', asyncHandler(async (req, res) => {
  const tranId = req.body.tran_id as string | undefined;
  if (tranId) await paymentsService.markOrderPaid(tranId);
  res.redirect(`${env.clientUrl}/order-success?orderId=${tranId ?? ''}`);
}));

// SSLCommerz server-to-server Instant Payment Notification webhook.
paymentsRouter.post('/ipn', asyncHandler(async (req, res) => {
  const tranId = req.body.tran_id as string | undefined;
  const status = req.body.status as string | undefined;
  if (tranId && status === 'VALID') await paymentsService.markOrderPaid(tranId);
  res.sendStatus(200);
}));
