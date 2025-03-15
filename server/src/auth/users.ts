import crypto from "crypto";
import { AuthResponse } from "../websocket/types";

interface StoredUser {
	userId: string;
	username: string;
	passwordHash: string;
	partnerId?: string;
	partnerUsername?: string;
}

// In a real app, this would be in a database
const users = new Map<string, StoredUser>();

export const authService = {
	async register(username: string, password: string): Promise<AuthResponse> {
		if (Array.from(users.values()).some((u) => u.username === username)) {
			return { success: false, error: "Username already taken" };
		}

		const userId = crypto.randomUUID();
		const passwordHash = crypto.createHash("sha256").update(password).digest("hex");

		const user = {
			userId,
			username,
			passwordHash,
		};

		users.set(userId, user);

		return {
			success: true,
			userId,
			username, // Include username in response
			partnerId: undefined,
			partnerUsername: undefined,
		};
	},

	async login(username: string, password: string): Promise<AuthResponse> {
		const user = Array.from(users.values()).find((u) => u.username === username);
		if (!user) {
			return { success: false, error: "User not found" };
		}

		const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
		if (passwordHash !== user.passwordHash) {
			return { success: false, error: "Invalid password" };
		}

		return {
			success: true,
			userId: user.userId,
			username: user.username,
			partnerId: user.partnerId,
			partnerUsername: user.partnerUsername,
		};
	},

	async pairUsers(userId: string, partnerUsername: string): Promise<AuthResponse> {
		const user = users.get(userId);
		const partner = Array.from(users.values()).find((u) => u.username === partnerUsername);

		if (!user) {
			return { success: false, error: "User not found" };
		}

		if (!partner) {
			return { success: false, error: "Partner not found" };
		}

		user.partnerId = partner.userId;
		user.partnerUsername = partner.username;
		partner.partnerId = user.userId;
		partner.partnerUsername = user.username;

		users.set(userId, user);
		users.set(partner.userId, partner);

		console.log("Paired users:", {
			user1: { id: user.userId, username: user.username, partnerId: user.partnerId },
			user2: { id: partner.userId, username: partner.username, partnerId: partner.partnerId },
		});

		return {
			success: true,
			userId: user.userId,
			username: user.username,
			partnerId: partner.userId,
			partnerUsername: partner.username,
		};
	},

	getUserPartnerId(userId: string): string | undefined {
		return users.get(userId)?.partnerId;
	},
	getUserByUsername(username: string): StoredUser | undefined {
		return Array.from(users.values()).find((u) => u.username === username);
	},
};
