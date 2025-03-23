import React, { useState, useEffect } from "react";

// Note theme types
export interface NoteTheme {
	id: string;
	name: string;
	background: string;
	textColor: string;
	borderStyle: string;
	icon: string;
}

// Predefined themes
const DEFAULT_THEMES: NoteTheme[] = [
	{
		id: "default",
		name: "Classic Pink",
		background: "rgba(255, 182, 193, 0.85)",
		textColor: "#4a154b",
		borderStyle: "2px solid rgba(255, 255, 255, 0.5)",
		icon: "❤️",
	},
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

interface Props {
	onThemeChange: (theme: NoteTheme) => void;
}

const NoteCustomization: React.FC<Props> = ({ onThemeChange }) => {
	const [selectedTheme, setSelectedTheme] = useState<string>("default");
	const [themes, setThemes] = useState<NoteTheme[]>(DEFAULT_THEMES);
	const [showCustomizer, setShowCustomizer] = useState(false);
	const [customTheme, setCustomTheme] = useState<NoteTheme>({
		id: "custom",
		name: "My Theme",
		background: "rgba(255, 182, 193, 0.85)",
		textColor: "#4a154b",
		borderStyle: "2px solid rgba(255, 255, 255, 0.5)",
		icon: "❤️",
	});

	// Load saved themes from localStorage
	useEffect(() => {
		const savedThemes = localStorage.getItem("noteThemes");
		const savedSelectedTheme = localStorage.getItem("selectedNoteTheme");

		if (savedThemes) {
			try {
				const parsedThemes = JSON.parse(savedThemes);
				setThemes([...DEFAULT_THEMES, ...parsedThemes.filter((t: NoteTheme) => !DEFAULT_THEMES.some((dt) => dt.id === t.id))]);
			} catch (e) {
				console.error("Failed to parse saved themes", e);
			}
		}

		if (savedSelectedTheme) {
			setSelectedTheme(savedSelectedTheme);
		}
	}, []);

	// Update theme when selection changes
	useEffect(() => {
		const theme = themes.find((t) => t.id === selectedTheme);
		if (theme) {
			onThemeChange(theme);
			localStorage.setItem("selectedNoteTheme", selectedTheme);
		}
	}, [selectedTheme, themes, onThemeChange]);

	const handleSaveCustomTheme = () => {
		// Create a unique ID for the custom theme
		const newCustomTheme = {
			...customTheme,
			id: `custom-${Date.now()}`,
		};

		// Add to themes list
		const updatedThemes = [...themes, newCustomTheme];
		setThemes(updatedThemes);
		setSelectedTheme(newCustomTheme.id);

		// Save to localStorage (excluding default themes to save space)
		const customThemesToSave = updatedThemes.filter((theme) => !DEFAULT_THEMES.some((dt) => dt.id === theme.id));
		localStorage.setItem("noteThemes", JSON.stringify(customThemesToSave));

		// Hide the customizer
		setShowCustomizer(false);
	};

	const handleDeleteTheme = (themeId: string) => {
		// Only allow deleting custom themes
		if (DEFAULT_THEMES.some((t) => t.id === themeId)) return;

		const updatedThemes = themes.filter((t) => t.id !== themeId);
		setThemes(updatedThemes);

		// If the deleted theme was selected, revert to default
		if (selectedTheme === themeId) {
			setSelectedTheme("default");
		}

		// Update localStorage
		const customThemesToSave = updatedThemes.filter((theme) => !DEFAULT_THEMES.some((dt) => dt.id === theme.id));
		localStorage.setItem("noteThemes", JSON.stringify(customThemesToSave));
	};

	// Helper function to convert color to rgba
	const hexToRgba = (hex: string, alpha: number = 0.85) => {
		const r = parseInt(hex.slice(1, 3), 16);
		const g = parseInt(hex.slice(3, 5), 16);
		const b = parseInt(hex.slice(5, 7), 16);
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	};

	// Available emoji icons for custom themes
	const availableIcons = ["❤️", "💕", "🌸", "✨", "☁️", "🌈", "🍀", "🌟", "🦄", "🎀"];

	return (
		<div className="bg-white rounded-lg p-4 shadow-sm">
			<h3 className="text-lg font-medium text-pink-700 mb-3">Note Appearance</h3>

			{/* Theme Selection */}
			<div className="grid grid-cols-3 gap-2 mb-4">
				{themes.map((theme) => (
					<div
						key={theme.id}
						onClick={() => setSelectedTheme(theme.id)}
						className={`relative rounded-lg p-3 cursor-pointer transition-all ${
							selectedTheme === theme.id ? "ring-2 ring-pink-500 transform scale-105" : "hover:bg-pink-50"
						}`}
						style={{
							background: theme.id !== selectedTheme ? "#fff" : theme.background,
							color: theme.id === selectedTheme ? theme.textColor : "inherit",
						}}
					>
						<div className="flex flex-col items-center">
							<span className="text-2xl mb-1">{theme.icon}</span>
							<span className="text-xs font-medium truncate w-full text-center">{theme.name}</span>
						</div>

						{/* Delete button for custom themes */}
						{!DEFAULT_THEMES.some((t) => t.id === theme.id) && (
							<button
								onClick={(e) => {
									e.stopPropagation();
									handleDeleteTheme(theme.id);
								}}
								className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-70 hover:opacity-100"
							>
								<span className="text-xs">×</span>
							</button>
						)}
					</div>
				))}

				{/* Add custom theme button */}
				<div
					onClick={() => setShowCustomizer(true)}
					className="rounded-lg p-3 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all flex flex-col items-center justify-center"
				>
					<span className="text-xl mb-1">+</span>
					<span className="text-xs font-medium">Create Theme</span>
				</div>
			</div>

			{/* Custom Theme Creator */}
			{showCustomizer && (
				<div className="bg-gray-50 rounded-lg p-4 mb-4">
					<h4 className="text-sm font-medium mb-3">Create Custom Theme</h4>

					<div className="space-y-3">
						<div>
							<label className="block text-xs text-gray-600 mb-1">Theme Name</label>
							<input
								type="text"
								value={customTheme.name}
								onChange={(e) => setCustomTheme({ ...customTheme, name: e.target.value })}
								className="w-full p-2 text-sm border rounded focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
								maxLength={15}
							/>
						</div>

						<div className="grid grid-cols-2 gap-2">
							<div>
								<label className="block text-xs text-gray-600 mb-1">Background Color</label>
								<div className="flex items-center">
									<input
										type="color"
										value={
											customTheme.background.startsWith("rgba")
												? "#" +
												  customTheme.background
														.match(/\d+, \d+, \d+/)![0]
														.split(", ")
														.map((n) => parseInt(n).toString(16).padStart(2, "0"))
														.join("")
												: customTheme.background
										}
										onChange={(e) =>
											setCustomTheme({
												...customTheme,
												background: hexToRgba(e.target.value),
											})
										}
										className="w-8 h-8 rounded cursor-pointer mr-2"
									/>
									<div className="flex-1">
										<div className="w-full h-8 rounded" style={{ background: customTheme.background }}></div>
									</div>
								</div>
							</div>

							<div>
								<label className="block text-xs text-gray-600 mb-1">Text Color</label>
								<div className="flex items-center">
									<input
										type="color"
										value={customTheme.textColor}
										onChange={(e) => setCustomTheme({ ...customTheme, textColor: e.target.value })}
										className="w-8 h-8 rounded cursor-pointer mr-2"
									/>
									<div
										className="flex-1 h-8 rounded flex items-center justify-center font-medium"
										style={{ background: customTheme.background, color: customTheme.textColor }}
									>
										Sample Text
									</div>
								</div>
							</div>
						</div>

						<div>
							<label className="block text-xs text-gray-600 mb-1">Icon</label>
							<div className="flex flex-wrap gap-2">
								{availableIcons.map((icon) => (
									<button
										key={icon}
										onClick={() => setCustomTheme({ ...customTheme, icon })}
										className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
											customTheme.icon === icon ? "bg-pink-100 ring-2 ring-pink-500" : "bg-white border"
										}`}
									>
										{icon}
									</button>
								))}
							</div>
						</div>

						<div className="flex justify-end gap-2 mt-4">
							<button
								onClick={() => setShowCustomizer(false)}
								className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm cursor-pointer"
							>
								Cancel
							</button>
							<button
								onClick={handleSaveCustomTheme}
								className="px-3 py-1 bg-pink-500 text-white rounded hover:bg-pink-600 text-sm cursor-pointer"
							>
								Save Theme
							</button>
						</div>
					</div>
				</div>
			)}

			<p className="text-xs text-gray-500 mt-2">Your note appearance preference is saved for future sessions.</p>
		</div>
	);
};

export default NoteCustomization;
