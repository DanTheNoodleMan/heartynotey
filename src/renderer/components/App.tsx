import React, { useState, useEffect, useCallback } from "react";
import { WebSocketClient } from "../utils/websocket";
import { Room } from "../../shared/types";
import RoomJoin from "./RoomJoin";
import MessageSender from "./MessageSender";
import DrawingCanvas from "./DrawingCanvas";
import RoomInfo from "./RoomInfo";

const App: React.FC = () => {
  const [wsClient, setWsClient] = useState<WebSocketClient | null>(null);
  const [activeTab, setActiveTab] = useState<"message" | "drawing">("message");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create WebSocket client
    const newClient = new WebSocketClient();
    setWsClient(newClient);

    return () => {
      // Clean up
      if (newClient) {
        newClient.disconnect();
      }
    };
  }, []);

  // Setup event listeners when client is available
  useEffect(() => {
    if (!wsClient) return;

    const handleConnect = () => {
      console.log("WebSocket connected");
      setConnected(true);
      setError(null);
    };

    const handleDisconnect = () => {
      console.log("WebSocket disconnected");
      setConnected(false);
      setError("Disconnected from server. Trying to reconnect...");
    };

    const handleRoomUpdate = (updatedRoom: Room) => {
      console.log("Room updated:", updatedRoom);
      setRoom(updatedRoom);
      
      // Check if we're still in the room - if not, reset UI state
      const isStillInRoom = updatedRoom.participants.some(
        p => p.id === wsClient.socket.id
      );
      
      if (!isStillInRoom) {
        console.log("No longer in room, resetting state");
        setRoomId(null);
        setRoom(null);
        setError("You have been disconnected from the room");
      }
    };

    wsClient.socket.on("connect", handleConnect);
    wsClient.socket.on("disconnect", handleDisconnect);
    wsClient.socket.on("room:updated", handleRoomUpdate);

    return () => {
      wsClient.socket.off("connect", handleConnect);
      wsClient.socket.off("disconnect", handleDisconnect);
      wsClient.socket.off("room:updated", handleRoomUpdate);
    };
  }, [wsClient]);

  const handleJoinSuccess = useCallback((client: WebSocketClient) => {
    console.log("Join/Create success callback triggered");
    const newRoomId = client.getRoomId();
    console.log("Setting room ID:", newRoomId);
    
    if (newRoomId) {
      setRoomId(newRoomId);
      setError(null);

      client.onMessage((message) => {
        console.log("Received message:", message);
        window.electron.showNote(message);
      });
    } else {
      setError("Failed to get room ID");
    }
  }, []);

  const handleLeaveRoom = useCallback(() => {
    if (wsClient) {
      wsClient.disconnect();
      
      // Create a new WebSocket client
      const newClient = new WebSocketClient();
      setWsClient(newClient);
      
      // Reset state
      setRoomId(null);
      setRoom(null);
    }
  }, [wsClient]);

  if (!wsClient) {
    return <div className="p-4">Initializing application...</div>;
  }

  if (!roomId) {
    return <RoomJoin onJoinSuccess={handleJoinSuccess} wsClient={wsClient} error={error} />;
  }

  return (
    <div className="flex flex-col h-screen bg-pink-50">
      <div className="bg-white p-4 flex justify-between items-center shadow-sm">
        <RoomInfo roomId={roomId} room={room} />
        <button 
          onClick={handleLeaveRoom}
          className="px-4 py-2 bg-pink-100 text-pink-700 rounded hover:bg-pink-200 transition-colors"
        >
          Leave Room
        </button>
      </div>

      <div className="flex-1 p-4">
        {activeTab === "message" && <MessageSender wsClient={wsClient} />}
        {activeTab === "drawing" && <DrawingCanvas wsClient={wsClient} />}
      </div>

      <div className="flex justify-around p-4 bg-white border-t">
        <button
          onClick={() => setActiveTab("message")}
          className={`p-2 rounded ${activeTab === "message" ? "bg-pink-500 text-white" : "bg-gray-200"}`}
        >
          Message
        </button>
        <button
          onClick={() => setActiveTab("drawing")}
          className={`p-2 rounded ${activeTab === "drawing" ? "bg-pink-500 text-white" : "bg-gray-200"}`}
        >
          Draw
        </button>
      </div>
      
      {error && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-100 text-red-700 px-4 py-2 text-sm">
          {error}
        </div>
      )}
      
      {!connected && !error && (
        <div className="absolute bottom-0 left-0 right-0 bg-yellow-100 text-yellow-700 px-4 py-2 text-sm">
          Connecting to server...
        </div>
      )}
    </div>
  );
};

export default App;