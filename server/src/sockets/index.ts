import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.js';
import { env } from '../config/env.js';

let io: Server | null = null;

export function initSocketServer(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: { origin: env.clientUrl, credentials: true },
  });

  // Every connected client joins a private room keyed by user id, so
  // notifications can be pushed to exactly one user without a broadcast.
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('Authentication required'));
    try {
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.sub;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId as string;
    socket.join(`user:${userId}`);

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
  io?.to('admins').emit(event, payload);
}
