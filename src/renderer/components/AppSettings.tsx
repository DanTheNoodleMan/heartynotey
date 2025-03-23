import React, { useState } from "react";
import NoteCustomization, { NoteTheme } from "./NoteCustomization";
import ThemeService from "../utils/themeService";

const AppSettings: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false);
	const themeService = ThemeService.getInstance();

	const handleThemeChange = (theme: NoteTheme) => {
		themeService.setTheme(theme);
	};

	return (
		<div className="mb-4">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className={`w-full flex items-center justify-between px-4 py-2 rounded-lg cursor-pointer
          ${isOpen ? "bg-pink-100 text-pink-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
          transition-colors mb-2`}
			>
				<span className="font-medium">Note Settings</span>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="currentColor"
					className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`}
				>
					<path d="M7 10l5 5 5-5z" />
				</svg>
			</button>

			{isOpen && (
				<div className="space-y-4 p-2">
					<NoteCustomization onThemeChange={handleThemeChange} />
				</div>
			)}
		</div>
	);
};

export default AppSettings;
