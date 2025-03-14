// src/renderer/components/Auth.tsx
import React, { useState } from "react";

interface Props {
	onAuthSuccess: (userId: string, partnerId: string) => void;
}

const Auth: React.FC<Props> = ({ onAuthSuccess }) => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [partnerUsername, setPartnerUsername] = useState("");
	const [isRegistering, setIsRegistering] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		try {
			// First, handle registration or login
			const endpoint = isRegistering ? "/auth/register" : "/auth/login";
			const authResponse = await fetch(`http://localhost:3000${endpoint}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});

			const data = await authResponse.json();

			if (!data.success) {
				setError(data.error || "Authentication failed");
				return;
			}

			// If there's a partner username, attempt to pair
			if (partnerUsername) {
				const pairResponse = await fetch("http://localhost:3000/auth/pair", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						userId: data.userId,
						partnerUsername,
					}),
				});

				const pairData = await pairResponse.json();
				if (pairData.success) {
					onAuthSuccess(data.userId, pairData.partnerId);
				} else {
					setError("Failed to pair with partner. Please check the username.");
				}
			} else {
				// If no partner username, just complete auth with empty partnerId
				onAuthSuccess(data.userId, "");
			}
		} catch (err) {
			setError("Connection error. Please try again.");
		}
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-pink-50 p-4">
			<form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
				<h2 className="text-2xl font-bold mb-6 text-center text-pink-600">{isRegistering ? "Create Account" : "Login"}</h2>

				{error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

				<div className="mb-4">
					<label className="block mb-2 text-gray-700">Username:</label>
					<input
						type="text"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none"
						required
						placeholder="Enter your username"
					/>
				</div>

				<div className="mb-4">
					<label className="block mb-2 text-gray-700">Password:</label>
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none"
						required
						placeholder="Enter your password"
					/>
				</div>

				<div className="mb-6">
					<label className="block mb-2 text-gray-700">Partner's Username:</label>
					<input
						type="text"
						value={partnerUsername}
						onChange={(e) => setPartnerUsername(e.target.value)}
						className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none"
						placeholder="Optional - can add later to pair with partner"
					/>
				</div>

				<button type="submit" className="w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600 transition-colors">
					{isRegistering ? "Register" : "Login"}
				</button>

				<button
					type="button"
					onClick={() => setIsRegistering(!isRegistering)}
					className="w-full mt-4 text-pink-500 hover:text-pink-600 transition-colors text-sm"
				>
					{isRegistering ? "Already have an account? Login" : "Need an account? Register"}
				</button>
			</form>
		</div>
	);
};

export default Auth;
