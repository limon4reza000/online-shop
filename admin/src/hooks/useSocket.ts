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

/** A single shared socket.io connection, kept alive only while a user is logged in,
 * reconnecting automatically (with a fresh token) if the connection drops. */
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
    if (user) {
      if (!socket.connected) socket.connect();
    } else {
      socket.disconnect();
    }
  }, [socket, user]);

  return { socket, connected };
}
