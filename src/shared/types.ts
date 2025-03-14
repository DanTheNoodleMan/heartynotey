export interface Message {
	type: "text" | "sticker" | "drawing";
	content: string;
	senderId: string;
	receiverId: string;
	timestamp: number;
}

export interface User {
	id: string;
	partnerId?: string;
}
