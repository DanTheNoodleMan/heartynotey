import crypto from "crypto";
import { AuthResponse } from "../websocket/types";

interface StoredUser {
	userId: string;
	username: string;
	passwordHash: string;
	partnerId?: string;
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

		users.set(userId, {
			userId,
			username,
			passwordHash,
		});

		return { success: true, userId };
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

		return { success: true, userId: user.userId };
	},

	async pairUsers(userId: string, partnerUsername: string): Promise<boolean> {
		const user = users.get(userId);
		const partner = Array.from(users.values()).find((u) => u.username === partnerUsername);

		if (!user || !partner) return false;

		user.partnerId = partner.userId;
		partner.partnerId = user.userId;

		users.set(userId, user);
		users.set(partner.userId, partner);

		return true;
	},

	getUserPartnerId(userId: string): string | undefined {
		return users.get(userId)?.partnerId;
	},
};
