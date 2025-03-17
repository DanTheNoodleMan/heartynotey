import React, { useState } from "react";
import { Room } from "../../shared/types";

interface Props {
	roomId: string;
	room: Room | null;
}

const RoomInfo: React.FC<Props> = ({ roomId, room }) => {
	const [copied, setCopied] = useState(false);

	const copyRoomId = () => {
		navigator.clipboard.writeText(roomId);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	// Format timestamp to a readable date/time
	const formatTime = (timestamp: number) => {
		return new Date(timestamp).toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className="w-full bg-white p-4 rounded-lg shadow-sm">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
				<div>
					<h2 className="text-lg font-medium text-pink-600">Your Love Room</h2>
					<div className="flex items-center mt-1">
						<p className="text-sm text-gray-600 mr-2">
							Share this ID: <span className="font-medium select-all">{roomId}</span>
						</p>
						<button
							onClick={copyRoomId}
							className={`text-xs px-2 py-1 rounded cursor-pointer ${
								copied ? "bg-green-100 text-green-700" : "bg-pink-100 text-pink-600 hover:bg-pink-200"
							} transition-colors`}
						>
							{copied ? "Copied!" : "Copy"}
						</button>
					</div>
				</div>

				{room && room.createdAt && <div className="text-xs text-gray-500">Created at {formatTime(room.createdAt)}</div>}
			</div>

			<div className="border-t pt-3">
				<p className="text-sm text-gray-600 mb-2 font-medium">Connected Users:</p>

				{room && room.participants.length > 0 ? (
					<div className="flex flex-wrap gap-2">
						{room.participants.map((participant) => (
							<div key={participant.id} className="flex items-center bg-pink-50 rounded-lg px-3 py-1">
								<span className="text-sm font-medium text-pink-700 mr-1">{participant.name}</span>
								<span className="w-2 h-2 rounded-full bg-green-400"></span>
							</div>
						))}
					</div>
				) : (
					<p className="text-sm text-gray-500 italic">Waiting for users to connect...</p>
				)}
			</div>
		</div>
	);
};

export default RoomInfo;
