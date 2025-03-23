// src/renderer/config/themes.ts
import { NoteTheme } from "../../shared/types";

export const DEFAULT_THEMES: NoteTheme[] = [
	{
		id: "hearts",
		name: "Love Letter",
		background: "rgba(255, 182, 193, 0.85)",
		textColor: "#4a154b",
		borderStyle: "2px solid rgba(255, 255, 255, 0.5)",
		icon: "❤️",
		frameStyle: "heart",
		decorStyle: "hearts",
		fontFamily: "PlaywriteHU",
	},
	{
		id: "clouds",
		name: "Dreamy Clouds",
		background: "rgba(208, 235, 255, 0.85)",
		textColor: "#1e3a8a",
		borderStyle: "2px solid rgba(255, 255, 255, 0.7)",
		icon: "☁️",
		frameStyle: "sticky",
		decorStyle: "clouds",
		fontFamily: "Quicksand",
	},
	{
		id: "flowers",
		name: "Spring Garden",
		background: "rgba(253, 242, 250, 0.85)",
		textColor: "#831843",
		borderStyle: "2px solid rgba(244, 114, 182, 0.4)",
		icon: "🌸",
		frameStyle: "envelope",
		decorStyle: "flowers",
		fontFamily: "PlaywriteHU",
	},
	{
		id: "stars",
		name: "Starry Night",
		background: "rgba(30, 41, 59, 0.85)",
		textColor: "#e2e8f0",
		borderStyle: "2px solid rgba(148, 163, 184, 0.5)",
		icon: "✨",
		frameStyle: "polaroid",
		decorStyle: "stars",
		fontFamily: "Quicksand",
	},
	{
		id: "cats",
		name: "Kitty Notes",
		background: "rgba(254, 226, 226, 0.85)",
		textColor: "#b91c1c",
		borderStyle: "2px solid rgba(248, 113, 113, 0.4)",
		icon: "🐱",
		frameStyle: "cat",
		decorStyle: "paws",
		fontFamily: "Quicksand",
	},
];

export const THEME_PREVIEWS = {
	hearts: "Love you! ❤️",
	clouds: "Dream big! ☁️",
	flowers: "You're blooming! 🌸",
	stars: "You're stellar! ✨",
	cats: "You're purr-fect! 🐱",
};

export const AVAILABLE_ICONS = [
	"❤️",
	"💕",
	"🌸",
	"✨",
	"☁️",
	"🌈",
	"🍀",
	"🌟",
	"🦄",
	"🎀",
	"🐱",
	"🐰",
	"🦋",
	"🌺",
	"🎭",
	"📷",
	"🎨",
	"🔮",
	"🌙",
	"⭐️",
];

export const FRAME_STYLES = [
	{ id: "heart", name: "Heart Shape", description: "A cute heart-shaped frame" },
	{ id: "sticky", name: "Sticky Note", description: "Classic sticky note with a turned corner" },
	{ id: "envelope", name: "Love Letter", description: "Envelope-style with a decorative seal" },
	{ id: "polaroid", name: "Polaroid", description: "Vintage polaroid photo style" },
	{ id: "cat", name: "Kitty", description: "Adorable cat ears frame" },
];
