// src/renderer/components/App.tsx
import React, { useState, useEffect } from "react";
import { WebSocketClient } from "../utils/websocket";
import { Message } from "../utils/types";
import Auth from "./Auth";
import PartnerForm from "./PartnerForm";
import MessageSender from "./MessageSender";
import DrawingCanvas from "./DrawingCanvas";

const App: React.FC = () => {
	const [wsClient, setWsClient] = useState<WebSocketClient | null>(null);
	const [activeTab, setActiveTab] = useState<"message" | "drawing">("message");
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [userId, setUserId] = useState<string | null>(null);
	const [username, setUsername] = useState<string | null>(null);
	const [partnerId, setPartnerId] = useState<string | null>(null);
	const [partnerUsername, setPartnerUsername] = useState<string | null>(null);
	const [needsPartner, setNeedsPartner] = useState(false);

	const handleIncomingMessage = (message: Message) => {
		if (message.senderId === partnerId) {
			window.electron.showNote(message);
		}
	};

	const handleAuthSuccess = (data: { userId: string; username: string; partnerId?: string; partnerUsername?: string }) => {
		setUserId(data.userId);
		setUsername(data.username);
		setPartnerId(data.partnerId || null);
		setPartnerUsername(data.partnerUsername || null);
		setIsAuthenticated(true);
		setNeedsPartner(!data.partnerId);

		// Initialize WebSocket connection after authentication
		const client = new WebSocketClient(data.userId, data.partnerId || null, handleIncomingMessage);
		setWsClient(client);
	};

	const handlePairSuccess = (data: { partnerId: string; partnerUsername: string }) => {
		setPartnerId(data.partnerId);
		setPartnerUsername(data.partnerUsername);
		setNeedsPartner(false);

		// Reinitialize WebSocket connection with partner
		if (wsClient) {
			wsClient.disconnect();
		}
		const client = new WebSocketClient(userId!, data.partnerId, handleIncomingMessage);
		setWsClient(client);
	};

	if (!isAuthenticated) {
		return <Auth onAuthSuccess={handleAuthSuccess} />;
	}

	if (needsPartner && userId && username) {
		return <PartnerForm userId={userId} username={username} onPairSuccess={handlePairSuccess} />;
	}

	return (
		<div className="flex flex-col h-screen bg-pink-50">
			<div className="bg-white p-4 shadow-sm">
				<p className="text-sm text-gray-600">
					Connected with: <span className="font-medium">{partnerUsername}</span>
				</p>
			</div>

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
