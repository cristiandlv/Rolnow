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

  const zoomIn = () => setCellSize((prev) => Math.min(prev + 10, 100));
  const zoomOut = () => setCellSize((prev) => Math.max(prev - 10, 30));
  const resetZoom = () => setCellSize(60);

  const handleDrop = (index: number, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setHoveredIndex(null);

    const ctrlPressed = e.ctrlKey || e.metaKey;
    const fromPaletteId = e.dataTransfer.getData("token-id");
    const fromBoardRaw = e.dataTransfer.getData("from-board");

    if (fromPaletteId && tokenData[fromPaletteId]) {
      // Token nuevo desde la paleta
      if (!tokens.find((t) => t.id === index)) {
        setTokens((prev) => [...prev, { id: index, tokenId: fromPaletteId }]);
      }
    } else if (fromBoardRaw) {
      try {
        const movedToken: CellToken = JSON.parse(fromBoardRaw);
        if (!tokens.find((t) => t.id === index)) {
          if (ctrlPressed) {
            // Duplica
            setTokens((prev) => [...prev, { id: index, tokenId: movedToken.tokenId }]);
          } else {
            // Mueve
            setTokens((prev) =>
              prev.filter((t) => t.id !== movedToken.id).concat({ ...movedToken, id: index })
            );
          }
        }
      } catch {
        // JSON malformado o sin datos, no hace nada
      }
    }
  };

  const handleDragStart = (token: CellToken, e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("from-board", JSON.stringify(token));

    const iconInfo = tokenData[token.tokenId];
    if (!iconInfo) return;

    const dragImg = document.createElement("div");
    dragImg.style.width = `${cellSize}px`;
    dragImg.style.height = `${cellSize}px`;
    dragImg.style.display = "flex";
    dragImg.style.alignItems = "center";
    dragImg.style.justifyContent = "center";
    dragImg.style.background = "transparent";
    dragImg.style.fontSize = `${cellSize * 0.6}px`;
    dragImg.style.color = iconInfo.color;
    dragImg.innerHTML = `<iconify-icon icon="${iconInfo.icon}" style="font-size:${cellSize * 0.6}px;color:${iconInfo.color};"></iconify-icon>`;
    document.body.appendChild(dragImg);
    e.dataTransfer.setDragImage(dragImg, cellSize / 2, cellSize / 2);
    setTimeout(() => document.body.removeChild(dragImg), 0);
  };

  const handleDragOver = (index: number, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setHoveredIndex(index);
    setIsCopying(e.ctrlKey || e.metaKey);
  };

  const handleDragLeave = () => {
    setHoveredIndex(null);
    setIsCopying(false);
  };

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
                    <Icon icon={tokenInfo.icon} width={cellSize * 0.6} height={cellSize * 0.6} />
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
