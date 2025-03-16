import React from 'react';
import { Room } from '../../shared/types';

interface Props {
  roomId: string;
  room: Room | null;
}

const RoomInfo: React.FC<Props> = ({ roomId, room }) => {
  return (
    <div className="bg-white p-4 shadow-sm space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Room ID: <span className="font-medium select-all">{roomId}</span>
        </p>
        <button 
          onClick={() => navigator.clipboard.writeText(roomId)}
          className="text-xs text-pink-500 hover:text-pink-600 transition-colors"
        >
          Copy ID
        </button>
      </div>
      
      <div className="border-t pt-2">
        <p className="text-sm text-gray-600 mb-1">Connected Users:</p>
        <div className="space-y-1">
          {room?.participants.map(participant => (
            <div 
              key={participant.id} 
              className="flex items-center bg-pink-50 rounded-lg px-3 py-1"
            >
              <span className="text-sm font-medium text-pink-700">
                {participant.name}
              </span>
              {/* Add a small dot to indicate connection status */}
              <span className="ml-2 w-2 h-2 rounded-full bg-green-400"></span>
            </div>
          ))}
          {(!room?.participants || room.participants.length === 0) && (
            <p className="text-sm text-gray-500 italic">No users connected</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomInfo;