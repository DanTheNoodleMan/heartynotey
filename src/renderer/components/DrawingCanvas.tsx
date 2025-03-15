import React, { useRef, useState, useEffect } from "react";
import { WebSocketClient } from "../utils/websocket";

interface Props {
  wsClient: WebSocketClient | null;
}

const DrawingCanvas: React.FC<Props> = ({ wsClient }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#ff69b4");
  const [brushSize, setBrushSize] = useState(3);

  const colors = ["#ff69b4", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#000000"];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set initial canvas state
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
  }, []);

  const getMousePos = (canvas: HTMLCanvasElement, e: React.MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getMousePos(canvas, e);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getMousePos(canvas, e);
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
  };

  const sendDrawing = () => {
    if (!wsClient || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL("image/png");
    wsClient.sendMessage(dataUrl, "drawing");

    window.electron.showNote({
      type: "drawing",
      content: dataUrl,
      senderId: "user1",
      receiverId: "user2",
      timestamp: Date.now(),
    });

    clearCanvas();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          {colors.map((c) => (
            <button
              key={c}
              className={`w-8 h-8 rounded-full ${color === c ? "ring-2 ring-offset-2 ring-pink-500" : ""}`}
              style={{ backgroundColor: c }}
              onClick={() => {
                setColor(c);
                const ctx = canvasRef.current?.getContext("2d");
                if (ctx) ctx.strokeStyle = c;
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label>Size:</label>
          <input
            type="range"
            min="1"
            max="10"
            value={brushSize}
            onChange={(e) => {
              const size = Number(e.target.value);
              setBrushSize(size);
              const ctx = canvasRef.current?.getContext("2d");
              if (ctx) ctx.lineWidth = size;
            }}
            className="w-24"
          />
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="border rounded-lg bg-white touch-none"
        style={{ width: '300px', height: '300px' }}  // Force physical size to match logical size
      />

      <div className="flex gap-2">
        <button onClick={clearCanvas} className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">
          Clear
        </button>
        <button onClick={sendDrawing} className="flex-1 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600">
          Send Drawing
        </button>
      </div>
    </div>
  );
};

export default DrawingCanvas;