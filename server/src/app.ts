import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import path from 'node:path';
import { env } from './config/env.js';
import { configurePassport } from './config/passport.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';

import { authRouter } from './modules/auth/auth.routes.js';
import { productsRouter } from './modules/products/products.routes.js';
import { categoriesRouter, categoriesAdminRouter } from './modules/categories/categories.routes.js';
import { brandsRouter } from './modules/brands/brands.routes.js';
import { ordersRouter } from './modules/orders/orders.routes.js';
import { couponsRouter } from './modules/coupons/coupons.routes.js';
import { reviewsRouter } from './modules/reviews/reviews.routes.js';
import { addressesRouter } from './modules/addresses/addresses.routes.js';
import { wishlistRouter } from './modules/wishlist/wishlist.routes.js';
import { notificationsRouter } from './modules/notifications/notifications.routes.js';
import { bannersRouter } from './modules/banners/banners.routes.js';
import { uploadRouter } from './modules/upload/upload.routes.js';
import { usersRouter } from './modules/users/users.routes.js';
import { analyticsRouter } from './modules/analytics/analytics.routes.js';
import { paymentsRouter } from './modules/payments/payments.routes.js';
import { searchPlaceholdersRouter, searchPlaceholdersAdminRouter } from './modules/searchPlaceholders/searchPlaceholders.routes.js';

export function createApp() {
  const app = express();

  configurePassport();

  app.use(helmet());
  app.use(cors({ origin: env.clientUrl, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(passport.initialize());
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
  app.use('/uploads', express.static(path.resolve('uploads')));

  // Basic abuse protection on auth endpoints (brute-force / OTP spam).
  app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 50, standardHeaders: true, legacyHeaders: false }));

  app.get('/api/health', (_req, res) => res.json({ success: true, message: 'নিত্যঘর API is running' }));

  app.use('/api/auth', authRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/admin/categories', categoriesAdminRouter);
  app.use('/api/brands', brandsRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/coupons', couponsRouter);
  app.use('/api/reviews', reviewsRouter);
  app.use('/api/addresses', addressesRouter);
  app.use('/api/wishlist', wishlistRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/banners', bannersRouter);
  app.use('/api/upload', uploadRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/payments', paymentsRouter);
  app.use('/api/search-placeholders', searchPlaceholdersRouter);
  app.use('/api/admin/search-placeholders', searchPlaceholdersAdminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
