'use client';

import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';
import { useWhiteboard } from '@/hooks/useWhiteboard';

interface WhiteboardProps {
  roomId: string;
  userId: string;
}

export default function Whiteboard({ roomId, userId }: WhiteboardProps) {
  const { doc, isConnected } = useWhiteboard({ roomId, userId });

  if (!doc) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading whiteboard...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full tldraw__editor">
      <Tldraw
        persistenceKey={`whiteboard-${roomId}`}
        onMount={(editor) => {
          // Initialize Yjs binding here if needed
          console.log('Tldraw mounted', editor);
        }}
      />
      {!isConnected && (
        <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded">
          Connecting to whiteboard...
        </div>
      )}
    </div>
  );
}
