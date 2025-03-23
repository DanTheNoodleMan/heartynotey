import React, { useEffect, useState } from "react";
import { Message } from "../../shared/types";
import { NoteTheme } from "./NoteCustomization";

// Default theme as fallback
const DEFAULT_THEME: NoteTheme = {
	id: "default",
	name: "Classic Pink",
	background: "rgba(255, 107, 107)",
	textColor: "#4a4a4a",
	borderStyle: "2px solid rgba(255, 255, 255, 0.5)",
	icon: "❤️",
	noteStyle: "default",
	animation: "fade-in",
	fontFamily: "'Comic Sans MS', cursive, sans-serif",
	primaryColor: "#ff6b6b",
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
		setTimeout(() => window.electron.closeNote(), 400);
	};

	// Don't render anything if there's no message
	if (!message) return null;

	// Get animation class
	const animationClass = theme.animation || "fade-in";

	// Get style for the note based on noteStyle
	const getNoteStyleClass = () => {
		const style = theme.noteStyle || "default";
		return style !== "default" ? style : "";
	};

	return (
		<div className="note-container">
			<div
				className={`note ${animationClass} ${getNoteStyleClass()} ${isClosing ? "fade-out" : ""}`}
				onClick={handleClose}
				style={{
					backgroundColor: theme.background,
					color: theme.textColor,
					borderColor: theme.primaryColor,
					fontFamily: theme.fontFamily || DEFAULT_THEME.fontFamily,
				}}
			>
				<div className="note-header">
					<div className="close-btn">×</div>
				</div>

				<div className="note-content">
					{message.type === "text" && <p>{message.content}</p>}

					{message.type === "sticker" && (
						<img src={message.content} alt="Sticker" className="w-full h-auto max-h-[200px] object-contain" />
					)}

					{message.type === "drawing" && (
						<img src={message.content} alt="Drawing" className="w-full h-auto max-h-[200px] object-contain" />
					)}
				</div>

				<div className="note-footer">
					{new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
				</div>

				{/* Display sticker if selected */}
				{theme.sticker && <div className="note-sticker">{theme.sticker}</div>}
			</div>
		</div>
	);
};

export default NoteWindow;
