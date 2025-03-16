import { io, Socket } from 'socket.io-client';
import { Message, User, Room } from '../../shared/types';

export class WebSocketClient {
  public socket: Socket;
  private user: User | null = null;
  private roomId: string | null = null;
  private messageHandler: ((message: Message) => void) | null = null;

  constructor() {
    console.log('Initializing WebSocket client');
    this.socket = io('http://localhost:3000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      timeout: 10000,
      autoConnect: true
    });
    
    this.setupListeners();
  }

  private setupListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server with ID:', this.socket.id);
      
      // If we were in a room before, try to rejoin
      if (this.user && this.roomId) {
        console.log('Attempting to rejoin room after reconnection');
        this.socket.emit('room:rejoin', {
          roomId: this.roomId,
          name: this.user.name
        });
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    this.socket.on('room:updated', (room: Room) => {
      console.log('Room updated:', room);
      this.roomId = room.id;
    });

    this.socket.on('receive:message', (message: Message) => {
      console.log('Received message:', message);
      if (this.messageHandler) {
        this.messageHandler(message);
      }
    });

    this.socket.on('error', (error: any) => {
      console.error('WebSocket error:', error);
    });
  }

  public async createRoom(name: string): Promise<string> {
    console.log('Creating room with name:', name);
    
    return new Promise((resolve, reject) => {
      this.socket.emit('room:create', { name }, (response: { success: boolean; roomId?: string; error?: string }) => {
        console.log('Room creation response:', response);
        
        if (response.success && response.roomId) {
          this.user = { id: this.socket.id!, name, roomId: response.roomId };
          this.roomId = response.roomId;
          resolve(response.roomId);
        } else {
          reject(new Error(response.error || 'Failed to create room'));
        }
      });
    });
  }

  public async joinRoom(roomId: string, name: string): Promise<void> {
    console.log('Joining room:', roomId, 'with name:', name);
    
    return new Promise((resolve, reject) => {
      this.socket.emit('room:join', { roomId, name }, (response: { success: boolean; error?: string }) => {
        console.log('Room join response:', response);
        
        if (response.success) {
          this.user = { id: this.socket.id!, name, roomId };
          this.roomId = roomId;
          resolve();
        } else {
          reject(new Error(response.error || 'Failed to join room'));
        }
      });
    });
  }

  public onMessage(handler: (message: Message) => void) {
    this.messageHandler = handler;
  }

  public sendMessage(content: string, type: Message['type'] = 'text'): boolean {
    if (!this.user || !this.roomId) {
      console.error('Cannot send message: Not in a room');
      return false;
    }

    const message: Message = {
      type,
      content,
      senderName: this.user.name,
      timestamp: Date.now(),
    };

    console.log('Sending message:', message);
    this.socket.emit('send:message', message, this.roomId);
    return true;
  }

  public getRoomId(): string | null {
    return this.roomId;
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}