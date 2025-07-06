"use client";

import { useState } from "react";

export default function GridBoard() {
  const gridSize = 20;
  const [cellSize, setCellSize] = useState(60); // Permite zoom dinámico

  const cells = Array.from({ length: gridSize * gridSize });

  const zoomIn = () => setCellSize((prev) => Math.min(prev + 10, 100));
  const zoomOut = () => setCellSize((prev) => Math.max(prev - 10, 30));
  const resetZoom = () => setCellSize(60);

  return (
    <div className="flex flex-col items-center gap-4 w-full h-full">
      {/* 🔍 Controles de zoom */}
      <div className="flex gap-2">
        <button
          onClick={zoomOut}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white"
        >
          ➖ Zoom -
        </button>
        <button
          onClick={resetZoom}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white"
        >
          🔄 Reset
        </button>
        <button
          onClick={zoomIn}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white"
        >
          ➕ Zoom +
        </button>
      </div>

      {/* 🧩 Tablero con scroll */}
      <div
        className="overflow-auto max-w-full max-h-[75vh] border-2 border-emerald-500 rounded-lg bg-gray-900 shadow-lg"
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
            gap: "2px",
          }}
        >
          {cells.map((_, index) => (
            <div
              key={index}
              className="bg-gray-800 border border-gray-700 rounded-sm"
              style={{ width: cellSize, height: cellSize }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
