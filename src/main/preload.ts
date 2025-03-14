// src/main/preload.ts
import { contextBridge, ipcRenderer } from "electron";
import { Message } from '../shared/types';

declare global {
	interface Window {
		electron: any;
	}
}

contextBridge.exposeInMainWorld("electron", {
	showNote: (message: Message) => ipcRenderer.send("show-note", message),
	closeNote: () => ipcRenderer.send("close-note"),
	onNoteContent: (callback: (message: Message) => void) => {
		ipcRenderer.on("set-note-content", (_, message) => callback(message));
	},
	removeNoteListeners: () => {
		ipcRenderer.removeAllListeners("set-note-content");
	},
});
