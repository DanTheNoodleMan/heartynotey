import { io, Socket } from "socket.io-client";
import { Message } from "./types";

export class WebSocketClient {
	private socket: Socket;
	private userId: string;
	private partnerId: string;
	private messageHandler: (message: Message) => void;

	constructor(userId: string, partnerId: string, onMessage: (message: Message) => void) {
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

		this.socket.on("disconnect", () => {
			console.log("Disconnected from server");
		});

		this.socket.on("receive-message", (message: Message) => {
			this.messageHandler(message);
			console.log("Received message:", message);
		});
	}

	public sendMessage(content: string, type: Message["type"] = "text") {
		const message: Message = {
			type,
			content,
			senderId: this.userId,
			receiverId: this.partnerId,
			timestamp: Date.now(),
		};
		this.socket.emit("send-message", message);
	}

	public disconnect() {
		this.socket.disconnect();
	}
}
