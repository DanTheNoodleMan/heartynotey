// src/main/preload.ts
import { contextBridge, ipcRenderer } from "electron";
import { Message } from "../shared/types";

export interface NoteTheme {
	id: string;
	name: string;
	background: string;
	textColor: string;
	borderStyle: string;
	icon: string;
}

declare global {
	interface Window {
		electron: {
			showNote: (message: Message & { theme?: NoteTheme }) => void;
			closeNote: () => void;
			onNoteContent: (callback: (message: Message & { theme?: NoteTheme }) => void) => void;
			removeNoteListeners: () => void;
		};
	}
}

contextBridge.exposeInMainWorld("electron", {
	showNote: (message: Message & { theme?: NoteTheme }) => ipcRenderer.send("show-note", message),
	closeNote: () => ipcRenderer.send("close-note"),
	onNoteContent: (callback: (message: Message & { theme?: NoteTheme }) => void) => {
		ipcRenderer.on("set-note-content", (_, message) => callback(message));
	},
	removeNoteListeners: () => {
		ipcRenderer.removeAllListeners("set-note-content");
	},
});
