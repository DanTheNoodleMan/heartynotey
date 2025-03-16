// src/shared/types.ts
export interface User {
	id: string; // Socket ID
	name: string;
	roomId: string;
  }
  
  export interface Room {
	id: string;
	createdAt: number; // Timestamp
	participants: User[];
  }
  
  export interface Message {
	type: "text" | "sticker" | "drawing";
	content: string;
	senderName: string;
	timestamp: number;
  }
  
  // Types used for WebSocket responses
  export interface RoomResponse {
	success: boolean;
	roomId?: string;
	error?: string;
  }