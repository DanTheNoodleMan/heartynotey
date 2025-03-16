import React, { useState, useEffect } from "react";
import { WebSocketClient } from "../utils/websocket";
import { Room } from "../../shared/types";
import RoomJoin from "./RoomJoin";
import MessageSender from "./MessageSender";
import DrawingCanvas from "./DrawingCanvas";
import RoomInfo from "./RoomInfo";

const App: React.FC = () => {
	const [wsClient, setWsClient] = useState<WebSocketClient>(() => new WebSocketClient());
	const [activeTab, setActiveTab] = useState<"message" | "drawing">("message");
	const [roomId, setRoomId] = useState<string | null>(null);
	const [room, setRoom] = useState<Room | null>(null);
	const [connected, setConnected] = useState(false);

	useEffect(() => {
		const handleConnect = () => {
			console.log("WebSocket connected");
			setConnected(true);
		};

		const handleDisconnect = () => {
			console.log("WebSocket disconnected");
			setConnected(false);
		};

		const handleRoomUpdate = (updatedRoom: Room) => {
			console.log("Room updated:", updatedRoom);
			setRoom(updatedRoom);
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

	const handleJoinSuccess = (client: WebSocketClient) => {
		console.log("Join/Create success callback triggered");
		const newRoomId = client.getRoomId();
		console.log("Setting room ID:", newRoomId);
		setRoomId(newRoomId);

		client.onMessage((message) => {
			console.log("Received message in App:", message);
			window.electron.showNote(message);
		});
	};

	if (!wsClient || !roomId) {
		return <RoomJoin onJoinSuccess={handleJoinSuccess} />;
	}

	return (
		<div className="flex flex-col h-screen bg-pink-50">
			<RoomInfo roomId={roomId} room={room} />

			<div className="flex-1 p-4">
				{activeTab === "message" && <MessageSender wsClient={wsClient} />}
				{activeTab === "drawing" && <DrawingCanvas wsClient={wsClient} />}
			</div>

			<div className="flex justify-around p-4 bg-white border-t">
				<button
					onClick={() => setActiveTab("message")}
					className={`p-2 rounded ${activeTab === "message" ? "bg-pink-500 text-white" : "bg-gray-200"}`}
				>
					Message
				</button>
				<button
					onClick={() => setActiveTab("drawing")}
					className={`p-2 rounded ${activeTab === "drawing" ? "bg-pink-500 text-white" : "bg-gray-200"}`}
				>
					Draw
				</button>
			</div>
			{!connected && (
				<div className="absolute bottom-0 left-0 right-0 bg-red-100 text-red-700 px-4 py-2 text-sm">
					Disconnected from server. Attempting to reconnect...
				</div>
			)}
		</div>
	);
};

export default App;
