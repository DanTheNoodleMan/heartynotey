import React, { useState } from "react";
import { WebSocketClient } from "../utils/websocket";
import StickerPicker from "./StickerPicker";

interface Props {
	wsClient: WebSocketClient | null;
}

const HeartIcon = () => (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="inline-block">
		<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
	</svg>
);

const StickerIcon = () => (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="inline-block">
		<path d="M18.5 2h-13C4.12 2 3 3.12 3 4.5v15C3 20.88 4.12 22 5.5 22h13c1.38 0 2.5-1.12 2.5-2.5v-15C21 3.12 19.88 2 18.5 2zM19 19.5c0 .28-.22.5-.5.5h-13c-.28 0-.5-.22-.5-.5v-15c0-.28.22-.5.5-.5h13c.28 0 .5.22.5.5v15zM7.75 15c.69 0 1.25-.56 1.25-1.25S8.44 12.5 7.75 12.5 6.5 13.06 6.5 13.75 7.06 15 7.75 15zm4.25 0c.69 0 1.25-.56 1.25-1.25s-.56-1.25-1.25-1.25-1.25.56-1.25 1.25.56 1.25 1.25 1.25zm4.25 0c.69 0 1.25-.56 1.25-1.25s-.56-1.25-1.25-1.25-1.25.56-1.25 1.25.56 1.25 1.25 1.25zM15 9H9c-.55 0-1-.45-1-1s.45-1 1-1h6c.55 0 1 .45 1 1s-.45 1-1 1z" />
	</svg>
);

const MessageSender: React.FC<Props> = ({ wsClient }) => {
	const [message, setMessage] = useState("");
	const [showStickerPicker, setShowStickerPicker] = useState(false);

	const handleSend = () => {
		if (!message.trim() || !wsClient) return;

		const success = wsClient.sendMessage(message, "text");

		if (success) {
			// Optional: Show a confirmation that message was sent
			console.log("Message sent successfully");
			setMessage(""); // Clear the input
		}
	};

	const toggleStickerPicker = () => {
		setShowStickerPicker(!showStickerPicker);
	};

	return (
		<div className="bg-white rounded-2xl shadow-love p-6 ">
			{!showStickerPicker ? (
				<>
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

					<div className="flex gap-2">
						<button
							onClick={toggleStickerPicker}
							className="bg-pink-100 text-pink-600 py-3 px-4 rounded-xl
                       flex items-center justify-center gap-2 transform hover:scale-105
                       transition-all duration-300 font-medium shadow-sm hover:shadow-md
                       cursor-pointer"
						>
							<StickerIcon />
							<span>Stickers</span>
						</button>

						<button
							onClick={handleSend}
							className="flex-1 bg-button-gradient text-white py-3 px-6 rounded-xl
                       flex items-center justify-center gap-2 transform hover:scale-105
                       transition-all duration-300 font-medium shadow-md hover:shadow-lg
                       disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
							disabled={!message.trim()}
						>
							<HeartIcon />
							<span>Send Love Note</span>
						</button>
					</div>
				</>
			) : (
				<StickerPicker wsClient={wsClient} onClose={toggleStickerPicker} />
			)}
		</div>
	);
};

export default MessageSender;
