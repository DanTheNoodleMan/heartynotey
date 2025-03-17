// src/main/ipc.ts
import { ipcMain, BrowserWindow, screen } from "electron";
import { Message } from "../shared/types";
import path from "path";

// This will be initialized in main.ts
let PRELOAD_PATH = "";
let NOTE_HTML_PATH = "";

export function initializePaths(preloadPath: string, noteHtmlPath: string) {
	PRELOAD_PATH = preloadPath;
	NOTE_HTML_PATH = noteHtmlPath;
}

export function setupIpcHandlers() {
	ipcMain.on("show-note", (_, message: Message) => {
		createNoteWindow(message);
	});

	ipcMain.on("close-note", (event) => {
		const win = BrowserWindow.fromWebContents(event.sender);
		if (win) {
			win.close();
		}
	});
}

let noteWindows: BrowserWindow[] = [];

export function createNoteWindow(message: Message) {
	// Get dimensions of the primary display
	const primaryDisplay = screen.getPrimaryDisplay();
	const { width, height } = primaryDisplay.workAreaSize;
	
	// Calculate safe margins
	const safeMarginX = width * 0.1; // 10% of screen width
	const safeMarginY = height * 0.1; // 10% of screen height
	
	// Size based on content type
	const size = message.type === "text" 
		? { width: 250, height: 100 } 
		: { width: 250, height: 250 };
	
	// Create coordinates - keep away from edges with improved margin handling
	const maxX = width - size.width - safeMarginX;
	const maxY = height - size.height - safeMarginY;
	
	const x = Math.floor(safeMarginX + Math.random() * maxX);
	const y = Math.floor(safeMarginY + Math.random() * maxY);
	
	console.log(`Creating note at position: (${x}, ${y}) with size: ${size.width}x${size.height}`);

	const noteWindow = new BrowserWindow({
		...size,
		x,
		y,
		frame: false,
		transparent: true,
		alwaysOnTop: true,
		skipTaskbar: true,
		show: false, // Start hidden for smooth fade-in
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: PRELOAD_PATH,
		},
	});

	// Load the note HTML
	noteWindow.loadFile(NOTE_HTML_PATH);

	// Send note content when window is ready
	noteWindow.webContents.on("did-finish-load", () => {
		noteWindow.webContents.send("set-note-content", message);

		// Show with fade-in effect (the CSS animation will handle this)
		noteWindow.show();
		
		// Ensure window is visible and on top
		noteWindow.setAlwaysOnTop(true, "floating");
		noteWindow.setVisibleOnAllWorkspaces(true);
		noteWindow.setFullScreenable(false);
	});

	// Auto-close note after delay based on content type
	const timeout = message.type === "text" ? 6000 : 10000;
	setTimeout(() => {
		if (!noteWindow.isDestroyed()) {
			noteWindow.close();
		}
	}, timeout);

	// Remove closed windows from our array
	noteWindow.on("closed", () => {
		noteWindows = noteWindows.filter((win) => !win.isDestroyed());
	});

	// Add to our array
	noteWindows.push(noteWindow);

	return noteWindow;
}

// Close all note windows
export function closeAllNoteWindows() {
	noteWindows.forEach((window) => {
		if (!window.isDestroyed()) {
			window.close();
		}
	});
	noteWindows = [];
}