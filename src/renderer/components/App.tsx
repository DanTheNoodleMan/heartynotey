import React, { useState, useEffect, useCallback } from "react";
import { WebSocketClient } from "../utils/websocket";
import { Room } from "../../shared/types";
import RoomJoin from "./RoomJoin";
import MessageSender from "./MessageSender";
import DrawingCanvas from "./DrawingCanvas";
import RoomInfo from "./RoomInfo";

const MessageIcon = () => (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
		<path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
	</svg>
);

const DrawIcon = () => (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
		<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
	</svg>
);

const App: React.FC = () => {
	const [wsClient, setWsClient] = useState<WebSocketClient | null>(null);
	const [activeTab, setActiveTab] = useState<"message" | "drawing">("message");
	const [roomId, setRoomId] = useState<string | null>(null);
	const [room, setRoom] = useState<Room | null>(null);
	const [connected, setConnected] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Create WebSocket client
		const newClient = new WebSocketClient();
		setWsClient(newClient);

		return () => {
			// Clean up
			if (newClient) {
				newClient.disconnect();
			}
		};
	}, []);

	// Setup event listeners when client is available
	useEffect(() => {
		if (!wsClient) return;

		const handleConnect = () => {
			console.log("WebSocket connected");
			setConnected(true);
			setError(null);
		};

		const handleDisconnect = () => {
			console.log("WebSocket disconnected");
			setConnected(false);
			setError("Disconnected from server. Trying to reconnect...");
		};

		const handleRoomUpdate = (updatedRoom: Room) => {
			console.log("Room updated:", updatedRoom);
			setRoom(updatedRoom);

			// Check if we're still in the room - if not, reset UI state
			const isStillInRoom = updatedRoom.participants.some((p) => p.id === wsClient.socket.id);

			if (!isStillInRoom) {
				console.log("No longer in room, resetting state");
				setRoomId(null);
				setRoom(null);
				setError("You have been disconnected from the room");
			}
		};

		wsClient.socket.on("connect", handleConnect);
		wsClient.socket.on("disconnect", handleDisconnect);
		wsClient.socket.on("room:updated", handleRoomUpdate);

		return () => {
			wsClient.socket.off("connect", handleConnect);
			wsClient.socket.off("disconnect", handleDisconnect);
			wsClient.socket.off("room:updated", handleRoomUpdate);
		};
	}, [wsClient]);

	const handleJoinSuccess = useCallback((client: WebSocketClient) => {
		console.log("Join/Create success callback triggered");
		const newRoomId = client.getRoomId();
		console.log("Setting room ID:", newRoomId);

		if (newRoomId) {
			setRoomId(newRoomId);
			setError(null);

			client.onMessage((message) => {
				console.log("Received message:", message);

				// Only show notes from other users
				if (message.senderName !== client.socket.id) {
					console.log("Showing note from other user:", message);
					window.electron.showNote(message);
				} else {
					console.log("Ignoring own message");
				}
			});
		} else {
			setError("Failed to get room ID");
		}
	}, []);

	const handleLeaveRoom = useCallback(() => {
		if (wsClient) {
			wsClient.disconnect();

			// Create a new WebSocket client
			const newClient = new WebSocketClient();
			setWsClient(newClient);

			// Reset state
			setRoomId(null);
			setRoom(null);
		}
	}, [wsClient]);

	if (!wsClient) {
		return <div className="p-4">Initializing application...</div>;
	}

	if (!roomId) {
		return <RoomJoin onJoinSuccess={handleJoinSuccess} wsClient={wsClient} error={error} />;
	}

	return (
		<div className="min-h-screen bg-love-gradient">
			<div className="max-w-3xl mx-auto p-6">
				<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-love p-6 space-y-6">
					<RoomInfo roomId={roomId} room={room} />
					<button
						onClick={handleLeaveRoom}
						className="px-4 py-2 bg-pink-100 text-pink-700 rounded hover:bg-pink-200 transition-colors cursor-pointer"
					>
						Leave Room
					</button>
					<div className="flex justify-center gap-4 p-2">
						<button
							onClick={() => setActiveTab("message")}
							className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 cursor-pointer
                ${
					activeTab === "message"
						? "bg-pink-500 text-white shadow-md transform scale-105"
						: "bg-pink-100 text-pink-700 hover:bg-pink-200"
				}`}
						>
							<MessageIcon />
							<span>Message</span>
						</button>

						<button
							onClick={() => setActiveTab("drawing")}
							className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 cursor-pointer
                ${
					activeTab === "drawing"
						? "bg-pink-500 text-white shadow-md transform scale-105"
						: "bg-pink-100 text-pink-700 hover:bg-pink-200"
				}`}
						>
							<DrawIcon />
							<span>Draw</span>
						</button>
					</div>

					<div className="transition-all duration-300">
						{activeTab === "message" && <MessageSender wsClient={wsClient} />}
						{activeTab === "drawing" && <DrawingCanvas wsClient={wsClient} />}
					</div>
				</div>
			</div>

			{!connected && (
				<div className="fixed bottom-0 left-0 right-0 bg-red-100/90 backdrop-blur-sm text-red-700 px-6 py-3 text-center">
					Disconnected from server. Attempting to reconnect...
				</div>
			)}
		</div>
	);
};

export default App;
