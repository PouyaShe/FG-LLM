'use client';

import { Room, useCreateLiveKitRoom } from '@livekit/components-react';
import { LiveKitRoom, Track } from 'livekit-client';
import { useEffect, useState } from 'react';

interface UseLiveKitProps {
  token: string;
  serverUrl: string;
  options?: {
    video?: boolean;
    audio?: boolean;
  };
}

export function useLiveKit({ token, serverUrl, options = {} }: UseLiveKitProps) {
  const [room, setRoom] = useState<LiveKitRoom | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!token || !serverUrl) return;

    const lkRoom = new LiveKitRoom({
      video: options.video ?? true,
      audio: options.audio ?? true,
      adaptiveStream: true,
      dynacast: true,
    });

    lkRoom.on('disconnected', () => {
      setIsConnected(false);
      setRoom(null);
    });

    lkRoom.on('connected', () => {
      setIsConnected(true);
      setRoom(lkRoom);
    });

    lkRoom.on('participantConnected', (participant) => {
      console.log('Participant connected:', participant.identity);
    });

    lkRoom.on('participantDisconnected', (participant) => {
      console.log('Participant disconnected:', participant.identity);
    });

    lkRoom.connect(serverUrl, token).catch((err) => {
      console.error('Failed to connect to LiveKit:', err);
      setError(err as Error);
    });

    return () => {
      lkRoom.disconnect();
    };
  }, [token, serverUrl, options.video, options.audio]);

  return { room, isConnected, error };
}

export async function getLiveKitToken(roomName: string, participantName: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/livekit/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomName, participantName }),
    });

    if (!response.ok) {
      throw new Error('Failed to get LiveKit token');
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Error getting LiveKit token:', error);
    throw error;
  }
}
