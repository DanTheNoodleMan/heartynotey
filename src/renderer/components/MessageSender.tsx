import React, { useState } from "react";
import { WebSocketClient } from "../utils/websocket";

interface Props {
	wsClient: WebSocketClient | null;
}

const MessageSender: React.FC<Props> = ({ wsClient }) => {
	const [message, setMessage] = useState("");

	const handleSend = () => {
		if (!message.trim() || !wsClient) return;

		wsClient.sendMessage(message, "text");
		window.electron.showNote({
			type: "text",
			content: message,
			senderId: "user1",
			receiverId: "user2",
			timestamp: Date.now(),
		});
		setMessage("");
	};

	return (
		<div className="flex flex-col gap-4">
			<textarea
				value={message}
				onChange={(e) => setMessage(e.target.value)}
				className="w-full p-4 border rounded-lg resize-none h-32"
				placeholder="Type your message..."
			/>
			<button onClick={handleSend} className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600">
				Send Message
			</button>
		</div>
	);
};

export default MessageSender;