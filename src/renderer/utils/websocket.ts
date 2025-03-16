import { io, Socket } from 'socket.io-client';
import { Message, User, Room } from '../../shared/types';

export class WebSocketClient {
  public socket: Socket;
  private user: User | null = null;
  private room: Room | null = null;
  private messageHandler: ((message: Message) => void) | null = null;
  private connected: boolean = false;

  constructor() {
    console.log('Initializing WebSocket client');
    this.socket = io('http://localhost:3000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 20000,
      transports: ['websocket'],
      autoConnect: true,
      forceNew: true
    });
    this.setupListeners();
  }

  private setupListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server with ID:', this.socket.id);
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      this.connected = false;
    });

    this.socket.on('room:updated', (room: Room) => {
      console.log('Room updated:', room);
      this.room = room;
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

  private async waitForConnection(timeout: number = 5000): Promise<void> {
    if (this.connected) return;

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, timeout);

      this.socket.once('connect', () => {
        clearTimeout(timer);
        resolve();
      });
    });
  }

  public async createRoom(name: string): Promise<string> {
    console.log('Attempting to create room with name:', name);
    
    try {
      await this.waitForConnection();
      
      return new Promise((resolve, reject) => {
        // Set up room:updated listener before sending create request
        const handleRoomUpdate = (room: Room) => {
          console.log('Received room:updated in createRoom:', room);
          this.room = room;
          // Remove the listener to avoid duplicates
          this.socket.off('room:updated', handleRoomUpdate);
        };
        
        this.socket.on('room:updated', handleRoomUpdate);
        
        this.socket.emit('room:create', { name }, (response: { success: boolean; roomId?: string; error?: string }) => {
          console.log('Room creation response:', response);
          if (response.success && response.roomId) {
            this.user = { id: this.socket.id, name, roomId: response.roomId };
            resolve(response.roomId);
          } else {
            this.socket.off('room:updated', handleRoomUpdate);
            reject(new Error(response.error || 'Failed to create room'));
          }
        });
      });
    } catch (error) {
      console.error('Error in createRoom:', error);
      throw error;
    }
  }

  public async joinRoom(roomId: string, name: string): Promise<void> {
    console.log('Attempting to join room:', roomId, 'with name:', name);
    
    try {
      await this.waitForConnection();
      
      return new Promise((resolve, reject) => {
        // Set up room:updated listener before sending join request
        const handleRoomUpdate = (room: Room) => {
          console.log('Received room:updated in joinRoom:', room);
          this.room = room;
          // Remove the listener to avoid duplicates
          this.socket.off('room:updated', handleRoomUpdate);
        };
        
        this.socket.on('room:updated', handleRoomUpdate);
        
        this.socket.emit('room:join', { roomId, name }, (response: { success: boolean; error?: string }) => {
          console.log('Room join response:', response);
          if (response.success) {
            this.user = { id: this.socket.id, name, roomId };
            resolve();
          } else {
            this.socket.off('room:updated', handleRoomUpdate);
            reject(new Error(response.error || 'Failed to join room'));
          }
        });
      });
    } catch (error) {
      console.error('Error in joinRoom:', error);
      throw error;
    }
  }

  public onMessage(handler: (message: Message) => void) {
    this.messageHandler = handler;
  }

  public sendMessage(content: string, type: Message['type'] = 'text'): boolean {
    if (!this.user || !this.room) {
      console.log('Cannot send message: Not in a room');
      return false;
    }

    const message: Message = {
      type,
      content,
      senderName: this.user.name,
      timestamp: Date.now(),
    };

    console.log('Sending message:', message);
    this.socket.emit('send:message', message);
    return true;
  }

  public getRoomId(): string | null {
    return this.room?.id || null;
  }

  public getPartnerName(): string | null {
    if (!this.user || !this.room) return null;
    const partner = this.room.participants.find(p => p.id !== this.user!.id);
    return partner?.name || null;
  }

  public disconnect() {
    this.socket.disconnect();
  }
}