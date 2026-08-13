import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { getAccessToken } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api\/?$/, '');

let sharedSocket: Socket | null = null;

function getSocket(): Socket {
  if (!sharedSocket) {
    sharedSocket = io(SOCKET_URL, {
      autoConnect: false,
      auth: (cb) => cb({ token: getAccessToken() }),
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }
  return sharedSocket;
}

/**
 * A single shared socket.io connection. Stays connected for guests too (the server accepts
 * anonymous handshakes) so every visitor receives public content-sync broadcasts; it just
 * reconnects with a fresh token whenever the logged-in user changes, so user-scoped rooms
 * (notifications, chat) pick up the new identity without a page reload.
 */
export function useSocket() {
  const { user } = useAuth();
  const socket = getSocket();
  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    } else {
      // The user identity changed (login/logout) — reconnect so the server re-reads the
      // current access token and re-joins the correct user-scoped rooms.
      socket.disconnect().connect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, user?.id]);

  return { socket, connected };
}
