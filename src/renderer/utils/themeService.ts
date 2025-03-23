// src/renderer/utils/themeService.ts
import { NoteTheme } from "../components/NoteCustomization";

// Default theme
const DEFAULT_THEME: NoteTheme = {
	id: "default",
	name: "Classic Pink",
	background: "rgba(255, 182, 193, 0.85)",
	textColor: "#4a154b",
	borderStyle: "2px solid rgba(255, 255, 255, 0.5)",
	icon: "❤️",
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
				const predefinedThemes = [
					DEFAULT_THEME,
					{
						id: "clouds",
						name: "Fluffy Clouds",
						background: "rgba(208, 235, 255, 0.85)",
						textColor: "#1e3a8a",
						borderStyle: "2px solid rgba(255, 255, 255, 0.7)",
						icon: "☁️",
					},
					{
						id: "flowers",
						name: "Spring Flowers",
						background: "rgba(253, 242, 250, 0.85)",
						textColor: "#831843",
						borderStyle: "2px solid rgba(244, 114, 182, 0.4)",
						icon: "🌸",
					},
					{
						id: "stars",
						name: "Starry Night",
						background: "rgba(30, 41, 59, 0.85)",
						textColor: "#e2e8f0",
						borderStyle: "2px solid rgba(148, 163, 184, 0.5)",
						icon: "✨",
					},
					{
						id: "hearts",
						name: "Floating Hearts",
						background: "rgba(254, 226, 226, 0.85)",
						textColor: "#b91c1c",
						borderStyle: "2px solid rgba(248, 113, 113, 0.4)",
						icon: "💕",
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
      }
      #note-content {
        color: ${this.currentTheme.textColor};
      }
    `;
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
