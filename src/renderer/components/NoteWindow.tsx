import React, { useEffect, useState } from "react";
import { Message } from "../utils/types";

const NoteWindow: React.FC = () => {
	const [message, setMessage] = useState<Message | null>(null);
	const [isClosing, setIsClosing] = useState(false);

	useEffect(() => {
		window.electron.onNoteContent((msg: Message) => {
			setMessage(msg);
		});

		return () => {
			window.electron.removeNoteListeners();
		};
	}, []);

	if (!message) return null;

	return (
		<div
			className={`p-4 rounded-lg shadow-lg bg-pink-100 animate-fade-in
        ${isClosing ? "animate-fade-out" : ""}`}
			onClick={() => {
				setIsClosing(true);
				setTimeout(() => window.electron.closeNote(), 300);
			}}
		>
			{message.type === "text" && <p className="text-pink-800 font-medium">{message.content}</p>}
			{message.type === "sticker" && <img src={message.content} alt="Sticker" className="w-full h-auto" />}
			{message.type === "drawing" && <img src={message.content} alt="Drawing" className="w-full h-auto" />}
		</div>
	);
};

export default NoteWindow;
