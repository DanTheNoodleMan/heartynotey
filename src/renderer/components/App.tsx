// src/renderer/components/App.tsx
import React, { useState, useEffect } from "react";
import { WebSocketClient } from "../utils/websocket";
import { Message } from "../utils/types";
import Auth from "./Auth";
import MessageSender from "./MessageSender";
import DrawingCanvas from "./DrawingCanvas";

const App: React.FC = () => {
	const [wsClient, setWsClient] = useState<WebSocketClient | null>(null);
	const [activeTab, setActiveTab] = useState<"message" | "drawing">("message");
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [userId, setUserId] = useState<string | null>(null);
	const [partnerId, setPartnerId] = useState<string | null>(null);

	const handleIncomingMessage = (message: Message) => {
		window.electron.showNote(message);
	};

	const handleAuthSuccess = (newUserId: string, newPartnerId: string) => {
		setUserId(newUserId);
		setPartnerId(newPartnerId);
		setIsAuthenticated(true);

		// Initialize WebSocket connection after authentication
		const client = new WebSocketClient(newUserId, newPartnerId, handleIncomingMessage);
		setWsClient(client);
	};

	if (!isAuthenticated) {
		return <Auth onAuthSuccess={handleAuthSuccess} />;
	}

	return (
		<div className="flex flex-col h-screen bg-pink-50">
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
		</div>
	);
};

export default App;