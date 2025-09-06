import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface ProgressStep {
  step: number;
  totalSteps: number;
  percentage: number;
  title: string;
  description: string;
  icon: string;
  timestamp: string;
}

export const useAdventureProgress = (userId: string | null) => {
  const [progress, setProgress] = useState<ProgressStep | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;

    // CRITICAL FIX: Correct WebSocket connection URL
    const socket = io(window.location.origin);

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 Connected to adventure progress socket');
      setIsConnected(true);
      
      // Join the user's adventure generation room
      socket.emit('join-adventure-generation', { userId });
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from adventure progress socket');
      setIsConnected(false);
    });

    socket.on('adventure-progress', (progressData: ProgressStep) => {
      console.log('🎲 Adventure progress update:', progressData);
      setProgress(progressData);
      
      // Auto-hide progress after completion
      if (progressData.percentage === 100) {
        setTimeout(() => {
          setProgress(null);
        }, 3000); // Hide after 3 seconds
      }
    });

    socket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error);
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
      setProgress(null);
      setIsConnected(false);
    };
  }, [userId]);

  const startProgress = () => {
    setProgress(null); // Reset any existing progress
  };

  const clearProgress = () => {
    setProgress(null);
  };

  return {
    progress,
    isConnected,
    startProgress,
    clearProgress,
    socket: socketRef.current,
  };
};