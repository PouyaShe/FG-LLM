'use client';

import { useEffect, useState, useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

interface UseWhiteboardProps {
  roomId: string;
  userId: string;
}

export function useWhiteboard({ roomId, userId }: UseWhiteboardProps) {
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!roomId || !userId) return;

    const ydoc = new Y.Doc();
    const wsUrl = process.env.NEXT_PUBLIC_WHITEBOARD_WS_URL || 'ws://localhost:1234';
    const roomName = `whiteboard-${roomId}`;

    const yprovider = new WebsocketProvider(wsUrl, roomName, ydoc, {
      connect: true,
    });

    yprovider.on('status', (event: { status: string }) => {
      setIsConnected(event.status === 'connected');
    });

    yprovider.on('connection-close', () => {
      console.log('Whiteboard WebSocket closed');
      setIsConnected(false);
    });

    setDoc(ydoc);
    setProvider(yprovider);

    return () => {
      yprovider.destroy();
      ydoc.destroy();
    };
  }, [roomId, userId]);

  const getAwareness = useCallback(() => {
    return provider?.awareness;
  }, [provider]);

  const updateUserStatus = useCallback((data: Record<string, unknown>) => {
    if (provider?.awareness) {
      provider.awareness.setLocalStateField('user', {
        id: userId,
        ...data,
      });
    }
  }, [provider, userId]);

  return {
    doc,
    provider,
    isConnected,
    getAwareness,
    updateUserStatus,
  };
}
