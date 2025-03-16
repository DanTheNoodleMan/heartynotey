import { Server, Socket } from 'socket.io';
import { User, Room, Message } from './types';
import { randomUUID } from 'crypto';
import { logger } from '../utils/logger';

// Store rooms in memory (in production, consider using Redis)
const rooms = new Map<string, Room>();

export function handleConnection(io: Server, socket: Socket) {
  logger.info(`Client connected: ${socket.id}`);

  // Create a new room
  socket.on('room:create', (data: { name: string }, callback) => {
    logger.info(`Room creation request from ${socket.id}, name: ${data.name}`);
    
    try {
      const roomId = randomUUID().substring(0, 8); // Shorter, friendlier ID
      
      const user: User = { 
        id: socket.id, 
        name: data.name, 
        roomId 
      };
      
      const room: Room = {
        id: roomId,
        createdAt: Date.now(),
        participants: [user]
      };
      
      // Store the room in memory
      rooms.set(roomId, room);
      
      // Join the socket to the room
      socket.join(roomId);
      
      // Send success response
      callback({ success: true, roomId });
      
      // Emit room update to all participants
      io.to(roomId).emit('room:updated', room);
      
      logger.info(`Room created: ${roomId} by user ${data.name} (${socket.id})`);
    } catch (error) {
      logger.error('Error creating room:', error);
      callback({ success: false, error: 'Failed to create room' });
    }
  });

  // Join an existing room
  socket.on('room:join', (data: { roomId: string; name: string }, callback) => {
    logger.info(`Join room request from ${socket.id}, room: ${data.roomId}, name: ${data.name}`);
    
    try {
      // Check if room exists
      const room = rooms.get(data.roomId);
      if (!room) {
        logger.warn(`Room not found: ${data.roomId}`);
        callback({ success: false, error: 'Room not found' });
        return;
      }

      // Check if user with same name already exists in the room
      const nameExists = room.participants.some(p => p.name === data.name);
      if (nameExists) {
        logger.warn(`Name ${data.name} already taken in room ${data.roomId}`);
        callback({ success: false, error: 'Name already taken in this room' });
        return;
      }

      // Add user to room
      const user: User = { 
        id: socket.id, 
        name: data.name, 
        roomId: data.roomId 
      };
      
      room.participants.push(user);
      
      // Join the socket to the room
      socket.join(data.roomId);
      
      // Send success response
      callback({ success: true });
      
      // Emit room update to all participants
      io.to(data.roomId).emit('room:updated', room);
      
      logger.info(`User ${data.name} (${socket.id}) joined room ${data.roomId}`);
    } catch (error) {
      logger.error('Error joining room:', error);
      callback({ success: false, error: 'Failed to join room' });
    }
  });

  // Handle reconnection to a room
  socket.on('room:rejoin', (data: { roomId: string; name: string }) => {
    logger.info(`Rejoin room request from ${socket.id}, room: ${data.roomId}, name: ${data.name}`);
    
    const room = rooms.get(data.roomId);
    if (!room) {
      logger.warn(`Cannot rejoin - Room not found: ${data.roomId}`);
      return;
    }
    
    // Update the user's socket ID if they exist in the room
    const userIndex = room.participants.findIndex(p => p.name === data.name);
    if (userIndex >= 0) {
      room.participants[userIndex].id = socket.id;
      
      // Join the socket to the room
      socket.join(data.roomId);
      
      // Emit room update to all participants
      io.to(data.roomId).emit('room:updated', room);
      
      logger.info(`User ${data.name} (${socket.id}) rejoined room ${data.roomId}`);
    }
  });

  // Handle sending messages in a room
  socket.on('send:message', (message: Message, roomId: string) => {
    const room = rooms.get(roomId);
    if (!room) {
      logger.warn(`Cannot send message - Room not found: ${roomId}`);
      return;
    }
    
    // Check if user is in the room
    const userExists = room.participants.some(p => p.id === socket.id);
    if (!userExists) {
      logger.warn(`User ${socket.id} not in room ${roomId}`);
      return;
    }
    
    logger.info(`Message sent in room ${roomId} by ${message.senderName}`);
    
    // Broadcast message to all participants
    io.to(roomId).emit('receive:message', message);
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
    
    // Find all rooms the user is in
    for (const [roomId, room] of rooms.entries()) {
      const userIndex = room.participants.findIndex(p => p.id === socket.id);
      if (userIndex >= 0) {
        // Keep track of the user that left
        const user = room.participants[userIndex];
        
        // Remove user from participants
        room.participants.splice(userIndex, 1);
        
        logger.info(`User ${user.name} (${socket.id}) removed from room ${roomId}`);
        
        // If room is empty, schedule deletion after timeout
        if (room.participants.length === 0) {
          logger.info(`Room ${roomId} is now empty, scheduling deletion`);
          
          setTimeout(() => {
            const currentRoom = rooms.get(roomId);
            if (currentRoom && currentRoom.participants.length === 0) {
              rooms.delete(roomId);
              logger.info(`Deleted empty room ${roomId}`);
            }
          }, 3600000); // 1 hour
        } else {
          // Notify remaining participants
          io.to(roomId).emit('room:updated', room);
        }
      }
    }
  });
}