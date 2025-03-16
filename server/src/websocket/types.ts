export interface User {
	id?: string;
	name: string;
	roomId: string;
}

export interface Room {
	id: string;
	participants: User[];
}

export interface Message {
	type: "text" | "sticker" | "drawing";
	content: string;
	senderName: string;
	timestamp: number;
}

export interface RoomCreateResponse {
	success: boolean;
	roomId?: string;
	error?: string;
}

export interface RoomJoinResponse {
	success: boolean;
	error?: string;
}
