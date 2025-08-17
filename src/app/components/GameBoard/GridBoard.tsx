"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { tokenData } from "../toolsrpg/TokenData";
import { CellToken } from "@/app/table/page";

interface GridBoardProps {
  tokens: CellToken[];
  setTokens: (tokens: CellToken[] | ((prev: CellToken[]) => CellToken[])) => void;
  onTokenPointerDown?: () => void;
  onTokenDragEnd?: () => void;
  style?: React.CSSProperties;
}

export default function GridBoard({
  tokens,
  setTokens,
  onTokenPointerDown,
  onTokenDragEnd,
  style,
}: GridBoardProps) {
  const gridSize = 60;
  const [cellSize, setCellSize] = useState(60);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isCopying, setIsCopying] = useState(false);

  const zoomIn = () => setCellSize((prev) => Math.min(prev + 10, 100));
  const zoomOut = () => setCellSize((prev) => Math.max(prev - 10, 30));
  const resetZoom = () => setCellSize(60);

  return (
    <div
      className="flex flex-col items-center w-full h-full gap-3 relative select-none"
      style={style}
    >
      <div className="flex gap-2 mb-2">
        <button onClick={zoomOut} className="btn">➖</button>
        <button onClick={resetZoom} className="btn">🔄</button>
        <button onClick={zoomIn} className="btn">➕</button>
      </div>

      <div
        id="grid-board-inner"
        className="flex-1 overflow-auto p-4 rounded-xl border-2 border-emerald-600 bg-gray-950 shadow-inner"
      >
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
                onContextMenu={(e) => {
                  e.preventDefault();
                  setTokens((prev) => prev.filter((t) => t.id !== index));
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setHoveredIndex(index);
                  setIsCopying(e.ctrlKey || e.metaKey);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setHoveredIndex(null);
                  const ctrlPressed = e.ctrlKey || e.metaKey;
                  const fromPaletteId = e.dataTransfer.getData("token-id");
                  const fromBoardRaw = e.dataTransfer.getData("from-board");

                  if (fromPaletteId && tokenData[fromPaletteId]) {
                    if (!tokens.find((t) => t.id === index)) {
                      setTokens((prev) => [...prev, { id: index, tokenId: fromPaletteId }]);
                    }
                  } else if (fromBoardRaw) {
                    try {
                      const movedToken: CellToken = JSON.parse(fromBoardRaw);
                      if (!tokens.find((t) => t.id === index)) {
                        if (ctrlPressed) {
                          setTokens((prev) => [...prev, { id: index, tokenId: movedToken.tokenId }]);
                        } else {
                          setTokens((prev) =>
                            prev.filter((t) => t.id !== movedToken.id).concat({ ...movedToken, id: index })
                          );
                        }
                      }
                    } catch {}
                  }
                  onTokenDragEnd?.();
                }}
                onDragLeave={() => {
                  setHoveredIndex(null);
                  setIsCopying(false);
                }}
                className={`bg-gray-800 border rounded-sm flex items-center justify-center transition-colors relative
                  ${isHovered && isCopying ? "border-sky-400 border-2" : "border-gray-700"}
                  hover:border-emerald-500`}
                style={{ width: cellSize, height: cellSize }}
              >
                {token && tokenInfo && (
                  <div
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("from-board", JSON.stringify(token));
                      onTokenPointerDown?.(); // DESACTIVA DIBUJO
                    }}
                    onPointerDown={() => onTokenPointerDown?.()} // DESACTIVA DIBUJO
                    className="token-on-board absolute inset-0 flex items-center justify-center cursor-move select-none"
                  >
                    <Icon
                      icon={tokenInfo.icon}
                      color={tokenInfo.color}
                      width={cellSize * 0.6}
                      height={cellSize * 0.6}
                      aria-label={`Token ${token.tokenId}`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .btn {
          background-color: #1f2937;
          padding: 6px 12px;
          border-radius: 6px;
          color: white;
          font-weight: 500;
          transition: background 0.3s;
        }
        .btn:hover {
          background-color: #374151;
        }
      `}</style>
    </div>
  );
}
