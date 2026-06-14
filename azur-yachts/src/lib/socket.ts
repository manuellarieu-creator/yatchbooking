import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket && typeof window !== 'undefined') {
    socket = io({
      path: '/socket.io',
      reconnectionDelay: 1000,
      reconnection: true,
      reconnectionAttempts: 10,
      transports: ['websocket'],
      agent: false, // For next.js build warnings
      upgrade: false,
      rejectUnauthorized: false
    });
  }
  return socket;
};
