import React, { useRef, useState, useEffect } from "react";
import { WebSocketClient } from "../utils/websocket";

interface Props {
  wsClient: WebSocketClient | null;
}

// Predefined colors with names
const PRESET_COLORS = [
  { color: "#ff69b4", name: "Pink" },
  { color: "#ff0000", name: "Red" },
  { color: "#ff9900", name: "Orange" },
  { color: "#ffff00", name: "Yellow" },
  { color: "#00ff00", name: "Green" },
  { color: "#0000ff", name: "Blue" },
  { color: "#9900ff", name: "Purple" },
  { color: "#000000", name: "Black" },
];

const DrawingCanvas: React.FC<Props> = ({ wsClient }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#ff69b4");
  const [brushSize, setBrushSize] = useState(3);
  const [customColor, setCustomColor] = useState("#ff69b4");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [tool, setTool] = useState<"brush" | "eraser">("brush");
  const [lastBrushColor, setLastBrushColor] = useState("#ff69b4");

  // Track previous position for smoother lines
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set initial canvas state
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    updateBrush(ctx);

    // Handle window resize
    const handleResize = () => {
      if (canvas && ctx) {
        // Save the current drawing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Resize canvas maintaining aspect ratio
        const container = canvas.parentElement;
        if (container) {
          const displayWidth = Math.min(300, container.clientWidth - 20); // 10px padding on each side
          canvas.style.width = `${displayWidth}px`;
          canvas.style.height = `${displayWidth}px`;
        }
        
        // Restore the drawing
        ctx.putImageData(imageData, 0, 0);
        updateBrush(ctx);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Update brush settings when color or size changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    updateBrush(ctx);
  }, [color, brushSize, tool]);

  const updateBrush = (ctx: CanvasRenderingContext2D) => {
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
    }
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  };

  const getMousePos = (canvas: HTMLCanvasElement, e: React.MouseEvent | React.TouchEvent) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Handle both mouse and touch events
    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling when drawing on touch devices
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getMousePos(canvas, e);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    lastPosRef.current = { x, y };
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling when drawing on touch devices
    
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getMousePos(canvas, e);
    
    // For smooth lines, we'll use quadratic curves
    if (lastPosRef.current) {
      const lastPos = lastPosRef.current;
      
      // Calculate control point (midpoint)
      const controlX = (lastPos.x + x) / 2;
      const controlY = (lastPos.y + y) / 2;
      
      // Draw a quadratic curve to the midpoint
      ctx.quadraticCurveTo(lastPos.x, lastPos.y, controlX, controlY);
      ctx.stroke();
      
      // Start a new path from the midpoint
      ctx.beginPath();
      ctx.moveTo(controlX, controlY);
    }
    
    lastPosRef.current = { x, y };
  };

  const stopDrawing = () => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.closePath();
    setIsDrawing(false);
    lastPosRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    updateBrush(ctx);
  };

  const sendDrawing = () => {
    if (!wsClient || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL("image/png");
    wsClient.sendMessage(dataUrl, "drawing");

    // Optional: Clear canvas after sending
    clearCanvas();
  };

  const handleToolChange = (newTool: "brush" | "eraser") => {
    if (newTool === "brush") {
      setColor(lastBrushColor);
    } else if (newTool === "eraser" && tool === "brush") {
      setLastBrushColor(color);
    }
    setTool(newTool);
  };

  const applyCustomColor = () => {
    setColor(customColor);
    setShowColorPicker(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-lg p-4 shadow-sm">
        {/* Tools and color selection */}
        <div className="flex justify-between items-center mb-4">
          {/* Tool buttons */}
          <div className="flex gap-2">
            <button
              className={`p-2 rounded-md ${tool === "brush" ? "bg-pink-100 text-pink-700" : "bg-gray-100 text-gray-700"}`}
              onClick={() => handleToolChange("brush")}
              title="Brush"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34c-.39-.39-1.02-.39-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z" />
              </svg>
            </button>
            <button
              className={`p-2 rounded-md ${tool === "eraser" ? "bg-pink-100 text-pink-700" : "bg-gray-100 text-gray-700"}`}
              onClick={() => handleToolChange("eraser")}
              title="Eraser"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.14 3c-.51 0-1.02.2-1.41.59L2.59 14.73c-.78.77-.78 2.04 0 2.83L5.03 20h7.94l8.08-8.08c.78-.78.78-2.03 0-2.83l-4.5-4.5C16.16 3.2 15.65 3 15.14 3zm-1.41 14.39L5.41 9.07l2.12-2.12 8.32 8.32-2.12 2.12z" />
              </svg>
            </button>
          </div>

          {/* Size slider */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Size:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-sm w-6 text-center">{brushSize}</span>
          </div>
        </div>

        {/* Color selection */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset.color}
                className={`w-8 h-8 rounded-full cursor-pointer transition-transform ${
                  color === preset.color && tool !== "eraser" ? "ring-2 ring-offset-2 ring-pink-500 scale-110" : ""
                }`}
                style={{ backgroundColor: preset.color }}
                onClick={() => {
                  setColor(preset.color);
                  setTool("brush");
                }}
                title={preset.name}
              />
            ))}
            
            {/* Custom color button */}
            <button
              className={`w-8 h-8 rounded-full cursor-pointer flex items-center justify-center bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 ${
                showColorPicker ? "ring-2 ring-offset-2 ring-pink-500" : ""
              }`}
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Custom Color"
            >
              <span className="text-xs font-bold text-white">+</span>
            </button>
          </div>

          {/* Custom color picker */}
          {showColorPicker && (
            <div className="p-3 bg-gray-50 rounded-lg mb-3 flex items-center gap-3">
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <div className="flex-1">
                <label className="text-sm text-gray-600 block mb-1">Custom Color</label>
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-full p-1 text-sm border rounded"
                />
              </div>
              <button
                onClick={applyCustomColor}
                className="px-3 py-1 bg-pink-500 text-white rounded hover:bg-pink-600"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Canvas and buttons */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex justify-center mb-4">
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="border rounded-lg bg-white touch-none shadow-inner"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>

        <div className="flex gap-2">
          <button 
            onClick={clearCanvas} 
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 cursor-pointer transition-colors"
          >
            Clear
          </button>
          <button 
            onClick={sendDrawing} 
            className="flex-1 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 cursor-pointer transition-colors"
          >
            Send Drawing
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrawingCanvas;