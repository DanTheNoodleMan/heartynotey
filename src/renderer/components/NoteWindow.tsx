import React, { useEffect, useState } from "react";
import { Message } from "../../shared/types";
import { NoteTheme } from "./NoteCustomization";

// Default theme as fallback
const DEFAULT_THEME: NoteTheme = {
	id: "default",
	name: "Classic Pink",
	background: "rgba(255, 182, 193, 0.85)",
	textColor: "#4a154b",
	borderStyle: "2px solid rgba(255, 255, 255, 0.5)",
	icon: "❤️",
};

interface ExtendedMessage extends Message {
	theme?: NoteTheme;
}

const NoteWindow: React.FC = () => {
	const [message, setMessage] = useState<Message | null>(null);
	const [isClosing, setIsClosing] = useState(false);
	const [theme, setTheme] = useState<NoteTheme>(DEFAULT_THEME);

	useEffect(() => {
		// Set up event listener for receiving note content
		window.electron.onNoteContent((msg: ExtendedMessage) => {
			console.log("Note content received:", msg);
			setMessage(msg);

			// If message includes theme info, apply it
			if (msg.theme) {
				setTheme(msg.theme);
			}
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

	// Apply the theme to the note container
	const containerStyle = {
		background: theme.background,
		color: theme.textColor,
		border: theme.borderStyle,
	};

	return (
		<div
			className={`p-4 rounded-lg shadow-lg animate-fade-in
			${isClosing ? "animate-fade-out" : ""}`}
			onClick={handleClose}
			style={{
				maxWidth: "100%",
				maxHeight: "100%",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				cursor: "pointer",
				...containerStyle,
			}}
		>
			{message.type === "text" && (
				<p className="font-medium text-center" style={{ color: theme.textColor }}>
					{message.content}
				</p>
			)}

			{message.type === "sticker" && (
				<img src={message.content} alt="Sticker" className="w-full h-auto max-h-[200px] object-contain" />
			)}

			{message.type === "drawing" && (
				<img src={message.content} alt="Drawing" className="w-full h-auto max-h-[200px] object-contain" />
			)}

			{/* Theme icon decoration */}
			<div className="absolute bottom-2 right-2 opacity-50 text-sm">{theme.icon}</div>
		</div>
	);
};

export default NoteWindow;
