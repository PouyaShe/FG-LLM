'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketProps {
  roomId?: string;
  userId: string;
}

export function useSocket({ roomId, userId }: UseSocketProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);

      if (roomId) {
        newSocket.emit('join-room', { roomId, userId });
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    setSocket(newSocket);

    return () => {
      if (roomId) {
        newSocket.emit('leave-room', { roomId, userId });
      }
      newSocket.close();
    };
  }, [roomId, userId]);

  const sendMessage = (message: string, type: 'text' | 'image' | 'file' = 'text') => {
    if (socket && roomId) {
      socket.emit('chat-message', { roomId, userId, message, type });
    }
  };

  const sendWhiteboardUpdate = (data: unknown) => {
    if (socket && roomId) {
      socket.emit('whiteboard-update', { roomId, userId, data });
    }
  };

  const toggleAudio = (isAudioOn: boolean) => {
    if (socket && roomId) {
      socket.emit('toggle-audio', { roomId, userId, isAudioOn });
    }
  };

  const toggleVideo = (isVideoOn: boolean) => {
    if (socket && roomId) {
      socket.emit('toggle-video', { roomId, userId, isVideoOn });
    }
  };

  const raiseHand = () => {
    if (socket && roomId) {
      socket.emit('raise-hand', { roomId, userId });
    }
  };

  return {
    socket,
    isConnected,
    sendMessage,
    sendWhiteboardUpdate,
    toggleAudio,
    toggleVideo,
    raiseHand,
  };
}
