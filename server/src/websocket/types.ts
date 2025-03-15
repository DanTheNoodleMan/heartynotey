export interface User {
	id: string;
	partnerId?: string;
	socketId: string;
}

export interface Message {
	type: "text" | "sticker" | "drawing";
	content: string;
	senderId: string;
	receiverId: string;
	timestamp: number;
}

export interface UserCredentials {
	username: string;
	password: string;
}

export interface AuthResponse {
	success: boolean;
	userId?: string;
	username?: string;
	error?: string;
	partnerId?: any;
	partnerUsername?: any;
}
