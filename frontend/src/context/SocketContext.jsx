import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSlotUpdate, setLastSlotUpdate] = useState(null);
  const [recentLiveEvent, setRecentLiveEvent] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // Connect to Socket.IO backend
    const socketEndpoint = import.meta.env.VITE_API_URL || window.location.origin;
    const socketInstance = io(socketEndpoint, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      // console.log(' Connected to SmartPark live socket network');

      if (user?._id || user?.id) {
        socketInstance.emit('join_user_room', user._id || user.id);
      }
      if (user?.role === 'staff' || user?.role === 'admin') {
        socketInstance.emit('join_staff_room');
      }
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    // Real-time slot status updates (Available, Occupied, Reserved, Maintenance)
    socketInstance.on('slot_updated', (slot) => {
      setLastSlotUpdate(slot);
      setRecentLiveEvent({
        type: 'slot_updated',
        data: slot,
        timestamp: new Date()
      });
    });

    // Real-time vehicle entry
    socketInstance.on('session_started', (data) => {
      setRecentLiveEvent({
        type: 'session_started',
        data,
        timestamp: new Date()
      });
    });

    // Real-time vehicle exit & release
    socketInstance.on('session_ended', (data) => {
      setRecentLiveEvent({
        type: 'session_ended',
        data,
        timestamp: new Date()
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        lastSlotUpdate,
        recentLiveEvent
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
