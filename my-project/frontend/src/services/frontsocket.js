import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (roomId, nickname) => {
    if (!roomId || !nickname || roomId === 'undefined' || nickname === 'undefined') {
      console.error('❌ Invalid roomId or nickname passed to initSocket:', { roomId, nickname });
      return null;
    }
  
    if (socket && socket.connected) {
      console.log('🔌 Socket already connected. Skipping reconnection.');
      return socket;
    }
  
    console.log('🚀 Initializing socket with:', { roomId, nickname });
  
    socket = io('http://localhost:5000', {
      query: { roomId, nickname },
    });
  
    socket.on('connect', () => {
      console.log(`✅ Connected to room: ${roomId} as ${nickname}`);
    });
  
    socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      socket = null;
    });
  
    return socket;
  };
  

export const getSocket = () => socket;
