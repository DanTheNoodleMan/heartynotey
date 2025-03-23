import React, { useState, useEffect } from "react";

// Note theme types
export interface NoteTheme {
	id: string;
	name: string;
	background: string;
	textColor: string;
	borderStyle: string;
	icon: string;
	noteStyle?: "default" | "rounded-corners" | "square-corners" | "polaroid" | "post-it" | "cloud";
	animation?: "fade-in" | "slide-in" | "pop-in" | "heartbeat" | "bounce-1";
	fontFamily?: string;
	sticker?: string;
	primaryColor?: string;
}

// Predefined themes
const DEFAULT_THEMES: NoteTheme[] = [
	{
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
	},
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
		background: "rgba(255, 107, 107)",
		textColor: "#4a4a4a",
		borderStyle: "2px solid rgba(255, 255, 255, 0.5)",
		icon: "❤️",
		noteStyle: "default",
		animation: "fade-in",
		fontFamily: "'Comic Sans MS', cursive, sans-serif",
		primaryColor: "#ff6b6b",
	});

	// Toggle for sticker section
	const [showStickers, setShowStickers] = useState(false);

	// Selected sticker
	const [selectedSticker, setSelectedSticker] = useState<string>("");

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
			// Update with sticker if there is one selected
			const updatedTheme = selectedSticker ? { ...theme, sticker: selectedSticker } : { ...theme, sticker: undefined };

			onThemeChange(updatedTheme);
			localStorage.setItem("selectedNoteTheme", selectedTheme);
		}
	}, [selectedTheme, themes, selectedSticker, onThemeChange]);

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

	// Available stickers
	const availableStickers = ["❤️", "😘", "🌟", "🌺", "🥰", "💖", "🍀", "🦋", "☕"];

	// Note style options
	const noteStyles = [
		{ id: "default", name: "Default" },
		{ id: "rounded-corners", name: "Rounded" },
		{ id: "square-corners", name: "Square" },
		{ id: "polaroid", name: "Polaroid" },
		{ id: "post-it", name: "Post-it" },
		{ id: "cloud", name: "Cloud" },
	];

	// Animation options
	const animationOptions = [
		{ id: "fade-in", name: "Fade In" },
		{ id: "slide-in", name: "Slide In" },
		{ id: "pop-in", name: "Pop In" },
		{ id: "heartbeat", name: "Heartbeat" },
		{ id: "bounce-1", name: "Bounce" },
	];

	// Font options
	const fontOptions = [
		{ id: "'Comic Sans MS', cursive, sans-serif", name: "Comic Sans" },
		{ id: "'Courier New', monospace", name: "Typewriter" },
		{ id: "'Brush Script MT', cursive", name: "Handwritten" },
		{ id: "'Arial', sans-serif", name: "Simple" },
		{ id: "'Georgia', serif", name: "Elegant" },
	];

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

			{/* Note Style Selection */}
			<div className="mb-4">
				<h4 className="text-sm font-medium mb-2">Note Style</h4>
				<div className="flex flex-wrap gap-2">
					{noteStyles.map((style) => {
						const currentTheme = themes.find((t) => t.id === selectedTheme);
						const isActive = currentTheme?.noteStyle === style.id;

						return (
							<button
								key={style.id}
								onClick={() => {
									const theme = themes.find((t) => t.id === selectedTheme);
									if (theme) {
										// Create a copy with the updated style
										const updatedTheme = { ...theme, noteStyle: style.id as any };

										// Update themes list
										const updatedThemes = themes.map((t) => (t.id === theme.id ? updatedTheme : t));

										setThemes(updatedThemes);

										// Update selected theme
										onThemeChange(updatedTheme);

										// Save if it's a custom theme
										if (!DEFAULT_THEMES.some((dt) => dt.id === theme.id)) {
											const customThemesToSave = updatedThemes.filter(
												(t) => !DEFAULT_THEMES.some((dt) => dt.id === t.id)
											);
											localStorage.setItem("noteThemes", JSON.stringify(customThemesToSave));
										}
									}
								}}
								className={`px-3 py-1 text-sm rounded-full transition-colors ${
									isActive ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
								}`}
							>
								{style.name}
							</button>
						);
					})}
				</div>
			</div>

			{/* Animation Selection */}
			<div className="mb-4">
				<h4 className="text-sm font-medium mb-2">Animation</h4>
				<div className="flex flex-wrap gap-2">
					{animationOptions.map((animation) => {
						const currentTheme = themes.find((t) => t.id === selectedTheme);
						const isActive = currentTheme?.animation === animation.id;

						return (
							<button
								key={animation.id}
								onClick={() => {
									const theme = themes.find((t) => t.id === selectedTheme);
									if (theme) {
										// Create a copy with the updated animation
										const updatedTheme = { ...theme, animation: animation.id as any };

										// Update themes list
										const updatedThemes = themes.map((t) => (t.id === theme.id ? updatedTheme : t));

										setThemes(updatedThemes);

										// Update selected theme
										onThemeChange(updatedTheme);

										// Save if it's a custom theme
										if (!DEFAULT_THEMES.some((dt) => dt.id === theme.id)) {
											const customThemesToSave = updatedThemes.filter(
												(t) => !DEFAULT_THEMES.some((dt) => dt.id === t.id)
											);
											localStorage.setItem("noteThemes", JSON.stringify(customThemesToSave));
										}
									}
								}}
								className={`px-3 py-1 text-sm rounded-full transition-colors ${
									isActive ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
								}`}
							>
								{animation.name}
							</button>
						);
					})}
				</div>
			</div>

			{/* Font Style Selection */}
			<div className="mb-4">
				<h4 className="text-sm font-medium mb-2">Font Style</h4>
				<div className="flex flex-wrap gap-2">
					{fontOptions.map((font) => {
						const currentTheme = themes.find((t) => t.id === selectedTheme);
						const isActive = currentTheme?.fontFamily === font.id;

						return (
							<button
								key={font.id}
								style={{ fontFamily: font.id }}
								onClick={() => {
									const theme = themes.find((t) => t.id === selectedTheme);
									if (theme) {
										// Create a copy with the updated font
										const updatedTheme = { ...theme, fontFamily: font.id };

										// Update themes list
										const updatedThemes = themes.map((t) => (t.id === theme.id ? updatedTheme : t));

										setThemes(updatedThemes);

										// Update selected theme
										onThemeChange(updatedTheme);

										// Save if it's a custom theme
										if (!DEFAULT_THEMES.some((dt) => dt.id === theme.id)) {
											const customThemesToSave = updatedThemes.filter(
												(t) => !DEFAULT_THEMES.some((dt) => dt.id === t.id)
											);
											localStorage.setItem("noteThemes", JSON.stringify(customThemesToSave));
										}
									}
								}}
								className={`px-3 py-1 text-sm rounded-full transition-colors ${
									isActive ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
								}`}
							>
								{font.name}
							</button>
						);
					})}
				</div>
			</div>

			{/* Sticker Toggle */}
			<div className="flex items-center gap-2 mb-3">
				<span className="text-sm">Add Stickers:</span>
				<div
					className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${showStickers ? "bg-pink-500" : "bg-gray-300"}`}
					onClick={() => setShowStickers(!showStickers)}
				>
					<div
						className={`w-3 h-3 bg-white rounded-full transition-transform ${showStickers ? "transform translate-x-5" : ""}`}
					></div>
				</div>
			</div>

			{/* Sticker Selection */}
			{showStickers && (
				<div className="flex flex-wrap gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
					{availableStickers.map((sticker) => (
						<div
							key={sticker}
							onClick={() => setSelectedSticker(sticker)}
							className={`w-8 h-8 rounded-full cursor-pointer flex items-center justify-center
                ${selectedSticker === sticker ? "bg-pink-100 ring-2 ring-pink-500" : "bg-white border hover:bg-gray-100"}`}
						>
							{sticker}
						</div>
					))}

					{/* Clear sticker button */}
					{selectedSticker && (
						<button
							onClick={() => setSelectedSticker("")}
							className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 text-gray-700"
						>
							Clear Sticker
						</button>
					)}
				</div>
			)}

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
