import React, { useState } from "react";
import { WebSocketClient } from "../utils/websocket";

interface Props {
	wsClient: WebSocketClient | null;
	onClose: () => void;
}

const StickerPicker: React.FC<Props> = ({ wsClient, onClose }) => {
	// Available stickers
	const stickers = ["❤️", "😘", "🌟", "🌺", "🥰", "💖", "🍀", "🦋", "☕", "😊", "💕", "✨", "🎂", "🎁", "🌈", "🍓", "🌷", "🐱"];

	const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
	const [isSending, setIsSending] = useState(false);

	const handleStickerClick = (sticker: string) => {
		setSelectedSticker(sticker);
	};

	const sendSticker = () => {
		if (!selectedSticker || !wsClient) return;

		setIsSending(true);

		// Send the sticker emoji as content
		const success = wsClient.sendMessage(selectedSticker, "sticker");

		if (success) {
			setTimeout(() => {
				setIsSending(false);
				onClose(); // Close the sticker picker
			}, 500);
		} else {
			setIsSending(false);
		}
	};

	return (
		<div className="bg-white rounded-2xl shadow-love p-6">
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-lg font-medium text-pink-600">Choose a Sticker</h3>
				<button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100">
					✕
				</button>
			</div>

			<div className="grid grid-cols-6 gap-2 mb-4">
				{stickers.map((sticker) => (
					<div
						key={sticker}
						onClick={() => handleStickerClick(sticker)}
						className={`sticker ${selectedSticker === sticker ? "selected" : ""}`}
					>
						{sticker}
					</div>
				))}
			</div>

			<div className="flex justify-between">
				<button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
					Cancel
				</button>

				<button
					onClick={sendSticker}
					disabled={!selectedSticker || isSending}
					className={`px-4 py-2 rounded-lg bg-pink-500 text-white hover:bg-pink-600 transition-colors flex items-center gap-2 ${
						!selectedSticker || isSending ? "opacity-50 cursor-not-allowed" : ""
					}`}
				>
					{isSending ? "Sending..." : "Send Sticker"}
				</button>
			</div>
		</div>
	);
};

export default StickerPicker;
