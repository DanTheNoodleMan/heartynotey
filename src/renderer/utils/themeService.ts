// src/renderer/utils/themeService.ts
import { NoteTheme } from "../../shared/types";

// Default theme
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

class ThemeService {
	private static instance: ThemeService;
	private currentTheme: NoteTheme = DEFAULT_THEME;
	private themeChangeListeners: ((theme: NoteTheme) => void)[] = [];

	private constructor() {
		// Initialize with saved theme if available
		this.loadSavedTheme();
	}

	// Singleton pattern
	public static getInstance(): ThemeService {
		if (!ThemeService.instance) {
			ThemeService.instance = new ThemeService();
		}
		return ThemeService.instance;
	}

	private loadSavedTheme(): void {
		try {
			const savedThemeId = localStorage.getItem("selectedNoteTheme");
			if (savedThemeId) {
				const savedThemes = localStorage.getItem("noteThemes");
				if (savedThemes) {
					const parsedThemes = JSON.parse(savedThemes);
					const foundTheme = parsedThemes.find((t: NoteTheme) => t.id === savedThemeId);

					if (foundTheme) {
						this.currentTheme = foundTheme;
						return;
					}
				}

				// Check if it's a predefined theme
				const predefinedThemes: NoteTheme[] = [
					DEFAULT_THEME,
					{
						id: "blue",
						name: "Fluffy Clouds",
						background: "rgba(216, 248, 255)",
						textColor: "#4a4a4a",
						borderStyle: "2px solid rgba(255, 255, 255, 0.7)",
						icon: "☁️",
						noteStyle: "cloud",
						animation: "slide-in",
						fontFamily: "'Arial', sans-serif",
						primaryColor: "#6bb5ff",
					},
					{
						id: "yellow",
						name: "Sunny Notes",
						background: "rgba(249, 249, 216)",
						textColor: "#4a4a4a",
						borderStyle: "2px solid rgba(255, 255, 255, 0.4)",
						icon: "🌟",
						noteStyle: "post-it",
						animation: "pop-in",
						fontFamily: "'Brush Script MT', cursive",
						primaryColor: "#ffe066",
					},
					{
						id: "green",
						name: "Spring Leaves",
						background: "rgba(224, 248, 216)",
						textColor: "#4a4a4a",
						borderStyle: "2px solid rgba(224, 248, 216, 0.5)",
						icon: "🍀",
						noteStyle: "rounded-corners",
						animation: "bounce-1",
						fontFamily: "'Georgia', serif",
						primaryColor: "#7cdc69",
					},
					{
						id: "purple",
						name: "Lavender Dreams",
						background: "rgba(248, 216, 248)",
						textColor: "#4a4a4a",
						borderStyle: "2px solid rgba(216, 120, 216, 0.4)",
						icon: "🦋",
						noteStyle: "polaroid",
						animation: "heartbeat",
						fontFamily: "'Courier New', monospace",
						primaryColor: "#d878d8",
					},
				];

				const predefinedTheme = predefinedThemes.find((t) => t.id === savedThemeId);
				if (predefinedTheme) {
					this.currentTheme = predefinedTheme;
				}
			}
		} catch (error) {
			console.error("Failed to load saved theme:", error);
		}
	}

	// Set the current theme and notify listeners
	public setTheme(theme: NoteTheme): void {
		this.currentTheme = theme;
		this.notifyListeners();
	}

	// Get the current theme
	public getTheme(): NoteTheme {
		return this.currentTheme;
	}

	// Add a listener for theme changes
	public addListener(listener: (theme: NoteTheme) => void): void {
		this.themeChangeListeners.push(listener);
		// Immediately notify the new listener with the current theme
		listener(this.currentTheme);
	}

	// Remove a listener
	public removeListener(listener: (theme: NoteTheme) => void): void {
		this.themeChangeListeners = this.themeChangeListeners.filter((l) => l !== listener);
	}

	// Notify all listeners of theme change
	private notifyListeners(): void {
		this.themeChangeListeners.forEach((listener) => {
			listener(this.currentTheme);
		});
	}

	// Get CSS for applying the theme
	public getThemeCSS(): string {
		return `
      #note-container {
        background: ${this.currentTheme.background};
        color: ${this.currentTheme.textColor};
        border: ${this.currentTheme.borderStyle};
        font-family: ${this.currentTheme.fontFamily || "'Comic Sans MS', cursive, sans-serif"};
      }
      #note-content {
        color: ${this.currentTheme.textColor};
      }
      .note-sticker {
        position: absolute;
        bottom: 10px;
        left: 10px;
        font-size: 24px;
      }
      /* Note style classes */
      ${this.getNoteStyleCSS()}
    `;
	}

	// Generate CSS for the specific note style
	private getNoteStyleCSS(): string {
		const style = this.currentTheme.noteStyle || "default";

		switch (style) {
			case "rounded-corners":
				return `
          #note-container {
            border-radius: 25px;
          }
        `;
			case "square-corners":
				return `
          #note-container {
            border-radius: 5px;
          }
        `;
			case "polaroid":
				return `
          #note-container {
            padding-bottom: 40px;
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
            border: 8px solid white;
            border-bottom: 40px solid white;
          }
        `;
			case "post-it":
				return `
          #note-container {
            transform: rotate(2deg);
            box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
          }
        `;
			case "cloud":
				return `
          #note-container {
            border-radius: 50px;
            background: white;
          }
        `;
			default:
				return "";
		}
	}

	// Apply theme to an Electron window (updates preload to pass theme info)
	public applyThemeToMessage(message: any): any {
		return {
			...message,
			theme: this.currentTheme,
		};
	}
}

export default ThemeService;
