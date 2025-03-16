// src/main/main.ts
import { app, BrowserWindow } from "electron";
import path from "path";
import { setupIpcHandlers, initializePaths, closeAllNoteWindows } from "./ipc";

class MainApplication {
  private mainWindow: BrowserWindow | null = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Handle app lifecycle events
    app.on("ready", this.onReady.bind(this));
    app.on("window-all-closed", this.onWindowAllClosed.bind(this));
    app.on("activate", this.onActivate.bind(this));
    app.on("quit", this.onQuit.bind(this));
  }

  private onReady() {
    // Create main window
    this.createMainWindow();
    
    // Initialize paths for IPC
    initializePaths(
      path.join(__dirname, "preload.js"),
      path.join(__dirname, "../renderer/note.html")
    );
    
    // Setup IPC handlers
    setupIpcHandlers();
  }

  private createMainWindow() {
    // Create the browser window
    this.mainWindow = new BrowserWindow({
      width: 600, 
      height: 650,
      minWidth: 300,
      minHeight: 500,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, "preload.js"),
      },
      backgroundColor: "#FFF5F8", // Light pink background
      title: "Love Notes",
    });

    // Load the app
    if (process.env.NODE_ENV === "development") {
      // In development mode, load from webpack dev server
      this.mainWindow.loadURL("http://localhost:8080");
      this.mainWindow.webContents.openDevTools();
    } else {
      // In production mode, load from file
      this.mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
    }

    // Handle window close
    this.mainWindow.on("closed", () => {
      this.mainWindow = null;
    });
  }

  private onWindowAllClosed() {
    // On macOS it is common for applications to stay active until the user quits
    // explicitly with Cmd + Q
    if (process.platform !== "darwin") {
      app.quit();
    }
  }

  private onActivate() {
    // On macOS it's common to re-create a window when the dock icon is clicked
    // and there are no other windows open
    if (this.mainWindow === null) {
      this.createMainWindow();
    }
  }

  private onQuit() {
    // Clean up any resources
    closeAllNoteWindows();
  }
}

// Initialize the application
new MainApplication();