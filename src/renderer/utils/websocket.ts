import { io, Socket } from "socket.io-client";
import { Message } from "./types";

export class WebSocketClient {
	private socket: Socket;
	private userId: string;
	private partnerId: string | null;
	private messageHandler: (message: Message) => void;
	private isConnected: boolean = false;

	constructor(userId: string, partnerId: string | null, onMessage: (message: Message) => void) {
		this.userId = userId;
		this.partnerId = partnerId;
		this.messageHandler = onMessage;
		this.socket = io("http://localhost:3000");
		this.setupListeners();
	}

	private setupListeners() {
		this.socket.on("connect", () => {
			console.log("Connected to server");
			this.socket.emit("register", this.userId, this.partnerId);
		});

		this.socket.on("partner-status", (partnerId: string | null, isOnline: boolean) => {
			this.partnerId = partnerId;
			this.isConnected = isOnline;
			console.log(`Partner status: ${isOnline ? "online" : "offline"}. Partner ID: ${partnerId}`);
		});

		this.socket.on("disconnect", () => {
			console.log("Disconnected from server");
			this.isConnected = false;
		});

		this.socket.on("receive-message", (message: Message) => {
			if (message.senderId === this.partnerId) {
				this.messageHandler(message);
			}
			console.log("Received message:", message);
		});
	}

	public isPartnerConnected(): boolean {
		return this.isConnected && this.partnerId !== null;
	}

	public sendMessage(content: string, type: Message["type"] = "text"): boolean {
		if (!this.partnerId || !this.isConnected) {
			console.log("Cannot send message: No partner connected");
			return false;
		}

		const message: Message = {
			type,
			content,
			senderId: this.userId,
			receiverId: this.partnerId,
			timestamp: Date.now(),
		};
		this.socket.emit("send-message", message);
		return true;
	}

	public disconnect() {
		this.socket.disconnect();
	}
}
