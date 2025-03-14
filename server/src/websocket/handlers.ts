import { Server, Socket } from "socket.io";
import { User, Message } from "./types";

const users = new Map<string, User>();

export function handleConnection(io: Server, socket: Socket) {
	console.log(`Client connected: ${socket.id}`);

	socket.on("register", (userId: string, partnerId: string) => {
		users.set(userId, {
			id: userId,
			partnerId,
			socketId: socket.id,
		});
		console.log(`User registered: ${userId} with partner: ${partnerId}`);
	});

	socket.on("send-message", (message: Message) => {
		const receiver = users.get(message.receiverId);
		if (receiver) {
			io.to(receiver.socketId).emit("receive-message", message);
		}
	});

	socket.on("disconnect", () => {
		const userId = Array.from(users.entries()).find(([_, user]) => user.socketId === socket.id)?.[0];

		if (userId) {
			users.delete(userId);
			console.log(`User disconnected: ${userId}`);
		}
	});
}
