import React, { useState } from "react";
import { WebSocketClient } from "../utils/websocket";

interface Props {
	wsClient: WebSocketClient | null;
}

const HeartIcon = () => (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="inline-block">
		<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
	</svg>
);

const MessageSender: React.FC<Props> = ({ wsClient }) => {
	const [message, setMessage] = useState("");

	const handleSend = () => {
		if (!message.trim() || !wsClient) return;

		const success = wsClient.sendMessage(message, "text");

		if (success) {
			// Optional: Show a confirmation that message was sent
			console.log("Message sent successfully");
			setMessage(""); // Clear the input
		}
	};

	return (
		<div className="bg-white rounded-2xl shadow-love p-6 ">
			<div className="mb-4">
				<textarea
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					className="w-full p-4 h-32 bg-pink-50 border-2 border-pink-200 rounded-xl 
                   focus:border-pink-400 focus:ring focus:ring-pink-200 focus:ring-opacity-50
                   placeholder-pink-300 text-pink-800 resize-none transition-all duration-300"
					placeholder="Write your lovely message here..."
				/>
			</div>

			<button
				onClick={handleSend}
				className="w-full bg-button-gradient text-white py-3 px-6 rounded-xl
                 flex items-center justify-center gap-2 transform hover:scale-105
                 transition-all duration-300 font-medium shadow-md hover:shadow-lg
                 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
				disabled={!message.trim()}
			>
				<HeartIcon />
				<span>Send Love Note</span>
			</button>
		</div>
	);
};

export default MessageSender;
