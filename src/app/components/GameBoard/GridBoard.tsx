"use client";

import { useState } from "react";

interface CellToken {
  id: number; // ID de la celda donde está el token
  token: string; // Emoji o ícono del token
}

const validTokens = ["🧙", "🐉", "🧟", "🧝", "⚔️", "🛡️", "🔥", "💀"];

export default function GridBoard() {
  const gridSize = 20;
  const [cellSize, setCellSize] = useState(60);
  const [tokens, setTokens] = useState<CellToken[]>([]);
  const [draggedToken, setDraggedToken] = useState<CellToken | null>(null);

  const zoomIn = () => setCellSize((prev) => Math.min(prev + 10, 100));
  const zoomOut = () => setCellSize((prev) => Math.max(prev - 10, 30));
  const resetZoom = () => setCellSize(60);

  const handleDrop = (index: number, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const fromPalette = e.dataTransfer.getData("custom/token");

    if (fromPalette && validTokens.includes(fromPalette)) {
      setTokens((prev) => [
        ...prev.filter((t) => t.id !== index),
        { id: index, token: fromPalette },
      ]);
    } else if (draggedToken) {
      setTokens((prev) =>
        prev
          .filter((t) => t.id !== draggedToken.id && t.id !== index)
          .concat({ ...draggedToken, id: index })
      );
      setDraggedToken(null);
    }
  };

  const handleDragStart = (token: CellToken, e: React.DragEvent<HTMLDivElement>) => {
    setDraggedToken(token);
    e.dataTransfer.setData("text/plain", "");
    const dragImg = document.createElement("div");
    dragImg.style.width = `${cellSize}px`;
    dragImg.style.height = `${cellSize}px`;
    dragImg.style.background = "transparent";
    dragImg.style.display = "flex";
    dragImg.style.alignItems = "center";
    dragImg.style.justifyContent = "center";
    dragImg.style.fontSize = "28px";
    dragImg.innerText = token.token;
    document.body.appendChild(dragImg);
    e.dataTransfer.setDragImage(dragImg, cellSize / 2, cellSize / 2);
    setTimeout(() => document.body.removeChild(dragImg), 0);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRightClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setTokens((prev) => prev.filter((t) => t.id !== index));
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full h-full">
      <div className="flex gap-2 mb-2">
        <button onClick={zoomOut} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white">➖ Zoom -</button>
        <button onClick={resetZoom} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white">🔄 Reset</button>
        <button onClick={zoomIn} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white">➕ Zoom +</button>
      </div>

      <div className="overflow-auto max-w-full max-h-[75vh] border-2 border-emerald-500 rounded-lg bg-gray-900 shadow-lg">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
            gap: "2px",
          }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, index) => {
            const token = tokens.find((t) => t.id === index);

            return (
              <div
                key={index}
                onContextMenu={(e) => handleRightClick(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(index, e)}
                className="bg-gray-800 border border-gray-700 rounded-sm relative hover:border-emerald-400 transition-colors cursor-pointer"
                style={{ width: cellSize, height: cellSize }}
              >
                {token && (
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(token, e)}
                    className="absolute inset-0 flex items-center justify-center text-2xl cursor-move"
                    title="Arrastrar o clic derecho para eliminar"
                  >
                    {token.token}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}