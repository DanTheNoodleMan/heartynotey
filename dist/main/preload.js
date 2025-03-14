"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/main/preload.ts
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("electron", {
    showNote: (message) => electron_1.ipcRenderer.send("show-note", message),
    closeNote: () => electron_1.ipcRenderer.send("close-note"),
    onNoteContent: (callback) => {
        electron_1.ipcRenderer.on("set-note-content", (_, message) => callback(message));
    },
    removeNoteListeners: () => {
        electron_1.ipcRenderer.removeAllListeners("set-note-content");
    },
});
