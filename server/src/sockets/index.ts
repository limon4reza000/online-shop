import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.js';
import { env } from '../config/env.js';

let io: Server | null = null;

export function initSocketServer(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: { origin: env.allowedOrigins, credentials: true },
  });

  const STAFF_ROLES = ['ADMIN', 'MANAGER', 'SUPPORT'];

  // A token is OPTIONAL: logged-out storefront visitors still need a live connection to
  // receive public content-sync broadcasts (product/category/brand/settings updates), they
  // just don't get a user-scoped room. A present-but-invalid token is still rejected.
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next();
    try {
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.sub;
      socket.data.role = payload.role;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId as string | undefined;
    const role = socket.data.role as string | undefined;
    // Every client — guest or logged in — joins the public room so content-sync
    // broadcasts (storefront catalog/settings changes) reach every open tab instantly.
    socket.join('public');
    if (userId) socket.join(`user:${userId}`);
    if (role && STAFF_ROLES.includes(role)) socket.join('admin:chat');

    socket.on('disconnect', () => {
      // no-op — room membership is cleaned up automatically
    });
  });

  return io;
}

export function notifyUser(userId: string, payload: { type: string; title: string; body: string }) {
  io?.to(`user:${userId}`).emit('notification', payload);
}

export function broadcastAdmins(event: string, payload: unknown) {
  io?.to('admin:chat').emit(event, payload);
}

/** True if the given user currently has at least one open socket connection. */
export function isUserOnline(userId: string): boolean {
  const room = io?.sockets.adapter.rooms.get(`user:${userId}`);
  return !!room && room.size > 0;
}

/** True if at least one staff member is currently connected — used to mark a customer's message as delivered. */
export function isAdminOnline(): boolean {
  const room = io?.sockets.adapter.rooms.get('admin:chat');
  return !!room && room.size > 0;
}

export function emitToUser(userId: string, event: string, payload: unknown) {
  io?.to(`user:${userId}`).emit(event, payload);
}

export function emitToAdmins(event: string, payload: unknown) {
  io?.to('admin:chat').emit(event, payload);
}

/**
 * Tells every connected storefront tab (guest or logged in) that a CMS-managed
 * resource changed, so it can invalidate/refetch just that slice of react-query
 * cache instead of the visitor reloading the page. `resource` is a stable string
 * — 'products' | 'categories' | 'brands' | 'settings' | 'popup' | 'search-placeholders' |
 * 'banners' — the frontend maps it to the matching query key(s).
 */
export function broadcastContentUpdate(resource: string) {
  io?.to('public').emit('content:update', { resource, at: Date.now() });
}
