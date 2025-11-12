import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { userData } = useSelector((state) => state.user); // Get user data from Redux

  useEffect(() => {
    // Create socket connection
    const socketInstance = io('http://localhost:3000', {
      withCredentials: true,
    });

    // Set up event listeners
    socketInstance.on('connect', () => {
      console.log('Connected to socket server');
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setConnected(false);
    });

    // Save socket instance
    setSocket(socketInstance);

    // Clean up on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // New useEffect: Register user with socket when connection is ready AND user data is available
  useEffect(() => {
    if (connected && socket && userData?._id) {
        console.log(`Attempting to register user ${userData._id} with socket`);
        socket.emit('register', userData._id);
    }
  }, [connected, socket, userData]);


  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};