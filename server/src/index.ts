import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { handleConnection } from "./websocket/handlers";
import authRoutes from './routes/auth';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: "*", // In production, set this to your app's domain
		methods: ["GET", "POST"],
	},
});

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);

// Basic health check endpoint
app.get("/health", (req, res) => {
	res.status(200).json({ status: "ok" });
});

// WebSocket connection handling
io.on("connection", (socket) => handleConnection(io, socket));

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
