// src/renderer/components/PartnerForm.tsx
import React, { useState } from "react";

interface Props {
	userId: string;
	username: string;
	onPairSuccess: (data: { partnerId: string; partnerUsername: string }) => void;
}

const PartnerForm: React.FC<Props> = ({ userId, username, onPairSuccess }) => {
	const [partnerUsername, setPartnerUsername] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			const response = await fetch("http://localhost:3000/auth/pair", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userId,
					partnerUsername,
				}),
			});

			const data = await response.json();

			if (data.success) {
				onPairSuccess({
					partnerId: data.partnerId,
					partnerUsername: data.partnerUsername,
				});
			} else {
				setError(data.error || "Failed to pair with partner");
			}
		} catch (err) {
			setError("Connection error. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center h-screen bg-pink-50 p-4">
			<div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
				<h2 className="text-2xl font-bold mb-6 text-center text-pink-600">Add Your Partner</h2>

				<div className="mb-6 p-4 bg-pink-50 rounded-lg">
					<p className="text-gray-600 text-sm">Share your username with your partner:</p>
					<p className="text-lg font-medium text-pink-600 mt-1">{username}</p>
				</div>

				{error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

				<form onSubmit={handleSubmit}>
					<div className="mb-4">
						<label className="block mb-2 text-gray-700">Enter your partner's username:</label>
						<input
							type="text"
							value={partnerUsername}
							onChange={(e) => setPartnerUsername(e.target.value)}
							className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none"
							required
							placeholder="Partner's username"
						/>
					</div>

					<button
						type="submit"
						disabled={isLoading}
						className={`w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600 transition-colors
              ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
					>
						{isLoading ? "Connecting..." : "Connect with Partner"}
					</button>
				</form>
			</div>
		</div>
	);
};

export default PartnerForm;
