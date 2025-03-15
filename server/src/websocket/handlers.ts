// server/src/websocket/handlers.ts
import { Server, Socket } from "socket.io";
import { User, Message } from "./types";
import { authService } from "../auth/users";

const users = new Map<string, User>();

export function handleConnection(io: Server, socket: Socket) {
	console.log(`Client connected: ${socket.id}`);

	socket.on("register", (userId: string, partnerId: string | null) => {
		const user = {
			id: userId,
			partnerId: partnerId || undefined,
			socketId: socket.id,
		};

		users.set(userId, user);
		console.log(`User registered: ${userId}, ${user} with partner: ${partnerId}`);

		// If there's a partner, notify them about the connection
		if (partnerId) {
			const partner = users.get(partnerId);
			if (partner) {
				io.to(partner.socketId).emit("partner-status", userId, true);
			}
		}
	});

	socket.on("send-message", (message: Message) => {
		console.log("Sending message:", message);
		const receiver = users.get(message.receiverId);
		if (receiver) {
			io.to(receiver.socketId).emit("receive-message", message);
		}
	});

	socket.on("disconnect", () => {
		const userId = Array.from(users.entries()).find(([_, user]) => user.socketId === socket.id)?.[0];

		if (userId) {
			const user = users.get(userId);
			if (user?.partnerId) {
				const partner = users.get(user.partnerId);
				if (partner) {
					io.to(partner.socketId).emit("partner-status", userId, false);
				}
			}
			users.delete(userId);
			console.log(`User disconnected: ${userId}`);
		}
	});
}
