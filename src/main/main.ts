import { app, BrowserWindow, ipcMain } from "electron";
import { screen } from "electron";
import path from "path";
import { Message } from '../shared/types';

class MainWindow {
	private window: BrowserWindow | null = null;
	private noteWindows: BrowserWindow[] = [];

	constructor() {
		app.on("ready", () => {
			this.createMainWindow();
			this.setupIpcHandlers();
		});

		app.on("window-all-closed", () => {
			if (process.platform !== "darwin") {
				app.quit();
			}
		});
	}

	private createMainWindow() {
		this.window = new BrowserWindow({
			width: 400,
			height: 600,
			webPreferences: {
				nodeIntegration: true,
				contextIsolation: true,
				preload: path.join(__dirname, "preload.js"),
			},
		});

		if (process.env.NODE_ENV === "development") {
			this.window.loadURL("http://localhost:8080");
			this.window.webContents.openDevTools();
		} else {
			this.window.loadFile(path.join(__dirname, "../renderer/index.html"));
		}
	}

	private createNoteWindow(message: Message) {
		const { width, height } = screen.getPrimaryDisplay().workAreaSize;
		const noteWindow = new BrowserWindow({
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
				preload: path.join(__dirname, "preload.js"),
			},
		});

		noteWindow.loadFile(path.join(__dirname, "../renderer/note.html"));

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

	private setupIpcHandlers() {
		ipcMain.on("show-note", (_, message: Message) => {
			this.createNoteWindow(message);
		});

		ipcMain.on("close-note", (event) => {
			const win = BrowserWindow.fromWebContents(event.sender);
			if (win) {
				win.close();
			}
		});
	}
}

new MainWindow();
