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

// src/shared/types.ts - Update the NoteTheme interface
export interface NoteTheme {
	id: string;
	name: string;
	background: string;
	textColor: string;
	borderStyle: string;
	icon: string;
	noteStyle?: "default" | "rounded-corners" | "square-corners" | "polaroid" | "post-it" | "cloud";
	animation?: "fade-in" | "slide-in" | "pop-in" | "heartbeat" | "bounce-1";
	fontFamily?: string;
	sticker?: string;
	primaryColor?: string; // For elements like pins or decorations
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
