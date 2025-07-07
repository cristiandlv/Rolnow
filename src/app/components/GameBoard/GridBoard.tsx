"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { tokenData } from "../toolsrpg/TokenData";

interface CellToken {
  id: number;
  tokenId: string;
}

interface GridBoardProps {
  tokens: CellToken[];
  setTokens: React.Dispatch<React.SetStateAction<CellToken[]>>;
}

export default function GridBoard({ tokens, setTokens }: GridBoardProps) {
  const gridSize = 20;
  const [cellSize, setCellSize] = useState(60);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isCopying, setIsCopying] = useState(false);

  // Zoom handlers
  const zoomIn = () => setCellSize((prev) => Math.min(prev + 10, 100));
  const zoomOut = () => setCellSize((prev) => Math.max(prev - 10, 30));
  const resetZoom = () => setCellSize(60);

  // Cuando arrastrás un token del tablero:
  const handleDragStart = (token: CellToken, e: React.DragEvent<HTMLDivElement>) => {
    // Serializamos token para poder mover/copiar
    e.dataTransfer.setData("from-board", JSON.stringify(token));

    // Crear una imagen temporal para drag con el icono real:
    const iconInfo = tokenData[token.tokenId];
    if (!iconInfo) return;

    // Crear un canvas para dibujar el icono y usarlo como drag image
    const canvas = document.createElement("canvas");
    canvas.width = cellSize;
    canvas.height = cellSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Dibujo simple: fondo transparente + texto emoji de fallback
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = iconInfo.color;
    ctx.font = `${cellSize * 0.8}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🎲", canvas.width / 2, canvas.height / 2);

    // Seteamos la imagen para el drag
    e.dataTransfer.setDragImage(canvas, cellSize / 2, cellSize / 2);
  };

  // Cuando arrastrás sobre una celda
  const handleDragOver = (index: number, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setHoveredIndex(index);
    setIsCopying(e.ctrlKey || e.metaKey);
  };

  const handleDragLeave = () => {
    setHoveredIndex(null);
    setIsCopying(false);
  };

  // Drop en la celda
  const handleDrop = (index: number, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setHoveredIndex(null);

    const ctrlPressed = e.ctrlKey || e.metaKey;
    const fromPaletteId = e.dataTransfer.getData("token-id");
    const fromBoardRaw = e.dataTransfer.getData("from-board");

    if (fromPaletteId && tokenData[fromPaletteId]) {
      // Token nuevo desde paleta
      if (!tokens.find((t) => t.id === index)) {
        setTokens((prev) => [...prev, { id: index, tokenId: fromPaletteId }]);
      }
    } else if (fromBoardRaw) {
      try {
        const movedToken: CellToken = JSON.parse(fromBoardRaw);
        if (!tokens.find((t) => t.id === index)) {
          if (ctrlPressed) {
            // Duplica token
            setTokens((prev) => [...prev, { id: index, tokenId: movedToken.tokenId }]);
          } else {
            // Mueve token
            setTokens((prev) =>
              prev.filter((t) => t.id !== movedToken.id).concat({ ...movedToken, id: index })
            );
          }
        }
      } catch {
        // Error JSON
      }
    }
  };

  // Click derecho elimina token
  const handleRightClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setTokens((prev) => prev.filter((t) => t.id !== index));
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full h-full">
      <div className="flex gap-2 mb-2">
        <button
          onClick={zoomOut}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white"
          aria-label="Zoom Out"
        >
          ➖ Zoom -
        </button>
        <button
          onClick={resetZoom}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white"
          aria-label="Reset Zoom"
        >
          🔄 Reset
        </button>
        <button
          onClick={zoomIn}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white"
          aria-label="Zoom In"
        >
          ➕ Zoom +
        </button>
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
            const tokenInfo = token ? tokenData[token.tokenId] : null;
            const isHovered = index === hoveredIndex;

            return (
              <div
                key={index}
                onContextMenu={(e) => handleRightClick(e, index)}
                onDragOver={(e) => handleDragOver(index, e)}
                onDrop={(e) => handleDrop(index, e)}
                onDragLeave={handleDragLeave}
                className={`bg-gray-800 border rounded-sm relative flex items-center justify-center transition-colors cursor-pointer
                  ${isHovered && isCopying ? "border-sky-400 border-2" : "border-gray-700"}
                  hover:border-emerald-400`}
                style={{ width: cellSize, height: cellSize }}
                title={token?.tokenId}
              >
                {token && tokenInfo && (
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(token, e)}
                    className="absolute inset-0 flex items-center justify-center cursor-move select-none"
                    style={{ color: tokenInfo.color }}
                  >
                                  <Icon
                icon={tokenInfo.icon}
                color={tokenInfo.color}
                width={
                  ["dungeon", "environment"].includes(tokenInfo.category)
                    ? cellSize * 0.85
                    : cellSize * 0.6
                }
                height={
                  ["dungeon", "environment"].includes(tokenInfo.category)
                    ? cellSize * 0.85
                    : cellSize * 0.6
                }
              />

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
