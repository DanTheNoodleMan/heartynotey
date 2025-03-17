import React, { useEffect, useState } from "react";
import { Message } from "../../shared/types";

const NoteWindow: React.FC = () => {
	const [message, setMessage] = useState<Message | null>(null);
	const [isClosing, setIsClosing] = useState(false);

	useEffect(() => {
		// Set up event listener for receiving note content
		window.electron.onNoteContent((msg: Message) => {
			console.log("Note content received:", msg);
			setMessage(msg);
		});

		// Clean up event listeners on unmount
		return () => {
			window.electron.removeNoteListeners();
		};
	}, []);

	const handleClose = () => {
		setIsClosing(true);
		setTimeout(() => window.electron.closeNote(), 300);
	};

	// Don't render anything if there's no message
	if (!message) return null;

	return (
		<div
			className={`p-4 rounded-lg shadow-lg bg-pink-100 animate-fade-in
        ${isClosing ? "animate-fade-out" : ""}`}
			onClick={handleClose}
			style={{
				maxWidth: "100%",
				maxHeight: "100%",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				cursor: "pointer",
			}}
		>
			{message.type === "text" && <p className="text-pink-800 font-medium text-center">{message.content}</p>}

			{message.type === "sticker" && (
				<img src={message.content} alt="Sticker" className="w-full h-auto max-h-[200px] object-contain" />
			)}

			{message.type === "drawing" && (
				<img src={message.content} alt="Drawing" className="w-full h-auto max-h-[200px] object-contain" />
			)}
		</div>
	);
};

export default NoteWindow;
