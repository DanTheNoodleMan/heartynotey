import React, { useState } from "react";
import { WebSocketClient } from "../utils/websocket";

interface Props {
	onJoinSuccess: (client: WebSocketClient) => void;
	wsClient: WebSocketClient;
	error: string | null;
}

const RoomJoin: React.FC<Props> = ({ onJoinSuccess, wsClient, error: propError }) => {
	const [name, setName] = useState("");
	const [roomId, setRoomId] = useState("");
	const [isCreating, setIsCreating] = useState(true);
	const [localError, setLocalError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!name.trim()) {
			setLocalError("Please enter your name 💕");
			return;
		}

		if (!isCreating && !roomId.trim()) {
			setLocalError("Please enter a room ID ✨");
			return;
		}

		setLocalError("");
		setIsLoading(true);

		try {
			if (isCreating) {
				// Create a new room
				const newRoomId = await wsClient.createRoom(name);
				console.log("Room created with ID:", newRoomId);
				onJoinSuccess(wsClient);
			} else {
				// Join existing room
				await wsClient.joinRoom(roomId, name);
				console.log("Joined room:", roomId);
				onJoinSuccess(wsClient);
			}
		} catch (err) {
			console.error("Error during room operation:", err);
			setLocalError(err instanceof Error ? err.message : "Failed to complete operation 💔");
		} finally {
			setIsLoading(false);
		}
	};

	// Display either the local error or the prop error
	const displayError = localError || propError;

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-pink-50 p-4">
			<div className="text-center mb-8">
				<h1 className="text-3xl font-bold text-pink-600 mb-2">Love Notes</h1>
				<p className="text-gray-600">Connect with your loved one and share sweet messages</p>
			</div>

			<form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
				<h2 className="text-2xl font-bold mb-6 text-center text-pink-600">
					{isCreating ? "Create a New Room" : "Join an Existing Room"}
				</h2>

				{displayError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{displayError}</div>}

				<div className="mb-4">
					<label className="block mb-2 text-gray-700">Your Name:</label>
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none"
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
							className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none"
							required
							placeholder="Enter room ID"
							disabled={isLoading}
						/>
					</div>
				)}

				<button
					type="submit"
					className={`w-full bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 transition-colors mb-4 font-medium cursor-pointer ${
						isLoading ? "opacity-50 cursor-not-allowed" : ""
					}`}
					disabled={isLoading}
				>
					{isLoading ? "Processing..." : isCreating ? "Create Room" : "Join Room"}
				</button>

				<button
					type="button"
					onClick={() => setIsCreating(!isCreating)}
					className="w-full text-pink-500 hover:text-pink-600 transition-colors text-sm cursor-pointer"
					disabled={isLoading}
				>
					{isCreating ? "Have a room ID? Join an existing room" : "Create a new room instead"}
				</button>
			</form>
		</div>
	);
};

export default RoomJoin;
