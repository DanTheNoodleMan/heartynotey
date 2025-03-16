import React, { useState, useEffect } from "react";
import { WebSocketClient } from "../utils/websocket";

interface Props {
	onJoinSuccess: (client: WebSocketClient) => void;
}

const RoomJoin: React.FC<Props> = ({ onJoinSuccess }) => {
	const [name, setName] = useState("");
	const [roomId, setRoomId] = useState("");
	const [isCreating, setIsCreating] = useState(true);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [client, setClient] = useState<WebSocketClient | null>(null);

	useEffect(() => {
		// Initialize WebSocket client when component mounts
		const newClient = new WebSocketClient();
		setClient(newClient);

		return () => {
			// Cleanup WebSocket connection when component unmounts
			if (newClient) {
				newClient.disconnect();
			}
		};
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Form submitted:", { name, isCreating, roomId });

		if (!client) {
			setError("Connection not initialized");
			return;
		}

		if (!name.trim()) {
			setError("Please enter your name");
			return;
		}

		if (!isCreating && !roomId.trim()) {
			setError("Please enter a room ID");
			return;
		}

		setError("");
		setIsLoading(true);

		try {
			if (isCreating) {
				console.log("Attempting to create room with name:", name);
				const roomId = await client.createRoom(name);
				console.log("Room created successfully with ID:", roomId);

				// Short timeout to ensure room:updated event is processed
				await new Promise((resolve) => setTimeout(resolve, 100));

				if (client.getRoomId()) {
					console.log("Room state confirmed, proceeding to chat");
					onJoinSuccess(client);
				} else {
					throw new Error("Room creation succeeded but room state not updated");
				}
			} else {
				console.log("Attempting to join room:", roomId, "with name:", name);
				await client.joinRoom(roomId, name);
				console.log("Joined room successfully");
				onJoinSuccess(client);
			}
		} catch (err) {
			console.error("Error in room operation:", err);
			setError(err instanceof Error ? err.message : "Failed to process room operation");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-pink-50 p-4">
			<form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
				<h2 className="text-2xl font-bold mb-6 text-center text-pink-600">{isCreating ? "Create New Room" : "Join Room"}</h2>

				{error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

				<div className="mb-4">
					<label className="block mb-2 text-gray-700">Your Name:</label>
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none"
						required
						placeholder="Enter your name"
						disabled={isLoading}
					/>
				</div>

				{!isCreating && (
					<div className="mb-4">
						<label className="block mb-2 text-gray-700">Room ID:</label>
						<input
							type="text"
							value={roomId}
							onChange={(e) => setRoomId(e.target.value)}
							className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none"
							required
							placeholder="Enter room ID"
							disabled={isLoading}
						/>
					</div>
				)}

				<button
					type="submit"
					className={`w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600 transition-colors mb-4 ${
						isLoading ? "opacity-50 cursor-not-allowed" : ""
					}`}
					disabled={isLoading || !client}
				>
					{isLoading ? "Processing..." : isCreating ? "Create Room" : "Join Room"}
				</button>

				<button
					type="button"
					onClick={() => setIsCreating(!isCreating)}
					className="w-full text-pink-500 hover:text-pink-600 transition-colors text-sm"
					disabled={isLoading}
				>
					{isCreating ? "Have a room ID? Join Room" : "Create a new room instead"}
				</button>
			</form>
		</div>
	);
};

export default RoomJoin;
