import { Server, Socket } from 'socket.io';
import { User, Room, Message } from './types';
import { randomUUID } from 'crypto';

const rooms = new Map<string, Room>();

export function handleConnection(io: Server, socket: Socket) {
  console.log(`Client connected: ${socket.id}`);

  socket.on('room:create', (data: { name: string }, callback) => {
    console.log('Received room:create event:', data);
    try {
      const roomId = randomUUID();
      console.log('Generated room ID:', roomId);
      
      const user: User = { id: socket.id, name: data.name, roomId };
      console.log('Created user:', user);
      
      const room: Room = {
        id: roomId,
        participants: [user]
      };
      console.log('Created room:', room);
      
      rooms.set(roomId, room);
      socket.join(roomId);
      
      console.log('Sending success response');
      callback({ success: true, roomId });
      
      // Emit room update to the creator immediately
      socket.emit('room:updated', room);
      console.log('Emitted room:updated event to creator');
    } catch (error) {
      console.error('Error creating room:', error);
      callback({ success: false, error: 'Failed to create room' });
    }
  });

  socket.on('room:join', async (data: { roomId: string; name: string }, callback) => {
    console.log('Received room:join event:', data);
    try {
      const room = rooms.get(data.roomId);
      if (!room) {
        console.log('Room not found:', data.roomId);
        callback({ success: false, error: 'Room not found' });
        return;
      }

      if (room.participants.length >= 2) {
        console.log('Room is full:', data.roomId);
        callback({ success: false, error: 'Room is full' });
        return;
      }

      const user: User = { id: socket.id, name: data.name, roomId: data.roomId };
      room.participants.push(user);
      
      socket.join(data.roomId);
      callback({ success: true });
      
      // Notify all participants about the update
      io.to(data.roomId).emit('room:updated', room);
      console.log('User joined room:', { user, room });
    } catch (error) {
      console.error('Error joining room:', error);
      callback({ success: false, error: 'Failed to join room' });
    }
  });

  socket.on('send:message', (message: Message) => {
    let roomId: string | undefined;
    
    // Find the room this socket belongs to
    for (const [rid, room] of rooms.entries()) {
      if (room.participants.some(p => p.id === socket.id)) {
        roomId = rid;
        break;
      }
    }

    if (roomId) {
      console.log('Broadcasting message in room:', roomId, message);
      io.to(roomId).emit('receive:message', message);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    
    // Find the room this socket belongs to
    for (const [roomId, room] of rooms.entries()) {
      const index = room.participants.findIndex(p => p.id === socket.id);
      if (index !== -1) {
        // Remove the participant but keep the room
        room.participants.splice(index, 1);
        console.log(`Removed participant from room ${roomId}. Remaining participants:`, room.participants.length);
        
        // Only delete the room if it's been empty for a while (optional)
        if (room.participants.length === 0) {
          // Set a timeout to delete the room after 1 hour of inactivity
          setTimeout(() => {
            const currentRoom = rooms.get(roomId);
            if (currentRoom && currentRoom.participants.length === 0) {
              rooms.delete(roomId);
              console.log(`Deleted empty room ${roomId} after timeout`);
            }
          }, 60 * 60 * 1000); // 1 hour
        } else {
          // Notify remaining participants about the update
          io.to(roomId).emit('room:updated', room);
        }
        break;
      }
    }
  });
}