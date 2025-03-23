import React, { useRef, useState, useEffect } from "react";
import { WebSocketClient } from "../utils/websocket";

interface Props {
  wsClient: WebSocketClient | null;
}

interface Point {
  x: number;
  y: number;
}

interface BrushStyle {
  id: string;
  name: string;
  render: (ctx: CanvasRenderingContext2D, points: Point[], color: string, size: number) => void;
  icon: string;
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

// Helper function to convert hex to rgba
const hexToRgba = (hex: string, alpha = 1) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Brush Styles
const BRUSH_STYLES: BrushStyle[] = [
  {
    id: 'pen',
    name: 'Pen',
    icon: '✒️',
    render: (ctx, points, color, size) => {
      if (points.length < 2) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      
      for (let i = 1; i < points.length; i++) {
        const xc = (points[i].x + points[i - 1].x) / 2;
        const yc = (points[i].y + points[i - 1].y) / 2;
        ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
      }
      ctx.stroke();
    }
  },
  {
    id: 'brush',
    name: 'Brush',
    icon: '🖌️',
    render: (ctx, points, color, size) => {
      if (points.length < 2) return;
      
      const rgba = hexToRgba(color, 0.6);
      ctx.strokeStyle = rgba;
      ctx.lineWidth = size * 1.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      
      for (let i = 1; i < points.length; i++) {
        const xc = (points[i].x + points[i - 1].x) / 2;
        const yc = (points[i].y + points[i - 1].y) / 2;
        ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
      }
      ctx.stroke();
    }
  },
  {
    id: 'gradient',
    name: 'Gradient',
    icon: '🎨',
    render: (ctx, points, color, size) => {
      if (points.length < 2) return;
      
      for (let i = 1; i < points.length; i++) {
        const gradient = ctx.createLinearGradient(
          points[i - 1].x, points[i - 1].y,
          points[i].x, points[i].y
        );
        
        // Create gradient effect
        gradient.addColorStop(0, hexToRgba(color, 0.2));
        gradient.addColorStop(0.5, color);
        gradient.addColorStop(1, hexToRgba(color, 0.2));
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(points[i - 1].x, points[i - 1].y);
        
        // Smooth line
        if (i < points.length - 1) {
          const xc = (points[i].x + points[i + 1].x) / 2;
          const yc = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        } else {
          ctx.lineTo(points[i].x, points[i].y);
        }
        
        ctx.stroke();
      }
    }
  }
];

const DrawingCanvas: React.FC<Props> = ({ wsClient }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#ff69b4");
  const [brushSize, setBrushSize] = useState(3);
  const [customColor, setCustomColor] = useState("#ff69b4");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentBrush, setCurrentBrush] = useState<BrushStyle>(BRUSH_STYLES[0]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set initial canvas state
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Handle window resize
    const handleResize = () => {
      if (canvas && ctx) {
        // Save the current drawing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Resize canvas maintaining aspect ratio
        const container = canvas.parentElement;
        if (container) {
          const displayWidth = Math.min(300, container.clientWidth - 20);
          canvas.style.width = `${displayWidth}px`;
          canvas.style.height = `${displayWidth}px`;
        }
        
        // Restore the drawing
        ctx.putImageData(imageData, 0, 0);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const getMousePos = (canvas: HTMLCanvasElement, e: React.MouseEvent | React.TouchEvent) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

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
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getMousePos(canvas, e);
    setCurrentStroke([{ x, y }]);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getMousePos(canvas, e);
    const newPoint = { x, y };
    
    setCurrentStroke(prev => {
      const updatedStroke = [...prev, newPoint];
      currentBrush.render(ctx, updatedStroke, color, brushSize);
      return updatedStroke;
    });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setCurrentStroke([]);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const sendDrawing = () => {
    if (!wsClient || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL("image/png");
    wsClient.sendMessage(dataUrl, "drawing");
    clearCanvas();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-lg p-4 shadow-sm">
        {/* Brush style selector */}
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-2">Brush Style</label>
          <div className="flex gap-2">
            {BRUSH_STYLES.map(brush => (
              <button
                key={brush.id}
                onClick={() => setCurrentBrush(brush)}
                className={`p-3 rounded-lg transition-all cursor-pointer ${
                  currentBrush.id === brush.id
                    ? "bg-pink-100 text-pink-600 scale-110 shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title={brush.name}
              >
                <span className="text-xl">{brush.icon}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Size slider */}
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-2">Brush Size</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm w-8 text-center">{brushSize}</span>
          </div>
        </div>

        {/* Color selection */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">Color</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset.color}
                className={`w-8 h-8 rounded-full cursor-pointer transition-transform ${
                  color === preset.color ? "ring-2 ring-offset-2 ring-pink-500 scale-110" : ""
                }`}
                style={{ backgroundColor: preset.color }}
                onClick={() => setColor(preset.color)}
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
                onClick={() => {
                  setColor(customColor);
                  setShowColorPicker(false);
                }}
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
            className="border rounded-lg bg-white touch-none cursor-crosshair"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>

        <div className="flex gap-2">
          <button 
            onClick={clearCanvas} 
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
          >
            Clear
          </button>
          <button 
            onClick={sendDrawing} 
            className="flex-1 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors cursor-pointer"
          >
            Send Drawing
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrawingCanvas;