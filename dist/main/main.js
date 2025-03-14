"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const electron_2 = require("electron");
const path_1 = __importDefault(require("path"));
class MainWindow {
    constructor() {
        this.window = null;
        this.noteWindows = [];
        electron_1.app.on("ready", () => {
            this.createMainWindow();
            this.setupIpcHandlers();
        });
        electron_1.app.on("window-all-closed", () => {
            if (process.platform !== "darwin") {
                electron_1.app.quit();
            }
        });
    }
    createMainWindow() {
        this.window = new electron_1.BrowserWindow({
            width: 400,
            height: 600,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: true,
                preload: path_1.default.join(__dirname, "preload.js"),
            },
        });
        if (process.env.NODE_ENV === "development") {
            this.window.loadURL("http://localhost:8080");
            this.window.webContents.openDevTools();
        }
        else {
            this.window.loadFile(path_1.default.join(__dirname, "../renderer/index.html"));
        }
    }
    createNoteWindow(message) {
        const { width, height } = electron_2.screen.getPrimaryDisplay().workAreaSize;
        const noteWindow = new electron_1.BrowserWindow({
            width: 250,
            height: 150,
            frame: false,
            transparent: true,
            alwaysOnTop: true,
            skipTaskbar: true,
            x: Math.random() * (width - 250),
            y: Math.random() * (height - 150),
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: true,
                preload: path_1.default.join(__dirname, "preload.js"),
            },
        });
        noteWindow.loadFile(path_1.default.join(__dirname, "../renderer/note.html"));
        // Send message data once window is ready
        noteWindow.webContents.on("did-finish-load", () => {
            noteWindow.webContents.send("set-note-content", message);
        });
        // Auto-close note after delay based on content type
        const timeout = message.type === "text" ? 5000 : 8000;
        setTimeout(() => {
            if (!noteWindow.isDestroyed()) {
                noteWindow.close();
            }
        }, timeout);
        this.noteWindows.push(noteWindow);
    }
    setupIpcHandlers() {
        electron_1.ipcMain.on("show-note", (_, message) => {
            this.createNoteWindow(message);
        });
        electron_1.ipcMain.on("close-note", (event) => {
            const win = electron_1.BrowserWindow.fromWebContents(event.sender);
            if (win) {
                win.close();
            }
        });
    }
}
new MainWindow();
