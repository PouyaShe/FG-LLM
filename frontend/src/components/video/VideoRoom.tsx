'use client';

import { LiveKitRoom, VideoConference, RoomAudioRenderer, ControlBar } from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';

interface VideoRoomProps {
  token: string;
  serverUrl: string;
  onDisconnect?: () => void;
}

export default function VideoRoom({ token, serverUrl, onDisconnect }: VideoRoomProps) {
  return (
    <div className="w-full h-full">
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={serverUrl}
        data-lk-theme="default"
        style={{ height: '100%' }}
        onDisconnected={onDisconnect}
      >
        <VideoConference />
        <RoomAudioRenderer />
        <ControlBar 
          controls={{
            microphone: true,
            camera: true,
            chat: false,
            screenShare: true,
            leave: true,
          }}
        />
      </LiveKitRoom>
    </div>
  );
}
