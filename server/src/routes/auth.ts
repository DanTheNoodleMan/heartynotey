// server/src/routes/auth.ts
import express from "express";
import { authService } from "../auth/users";

const router = express.Router();

router.post("/register", async (req, res) => {
	const { username, password } = req.body;
	const result = await authService.register(username, password);
	res.json(result);
});

router.post("/login", async (req, res) => {
	const { username, password } = req.body;
	const result = await authService.login(username, password);
	res.json(result);
});

router.post("/pair", async (req, res) => {
	const { userId, partnerUsername } = req.body;
	const success = await authService.pairUsers(userId, partnerUsername);
	res.json({ success });
});

export default router;

