"use client";

import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { tokenData } from "../toolsrpg/TokenData";
import { DiceType } from "@/utils/types";
import { motion, AnimatePresence } from "framer-motion";

export interface CellToken {
  id: number;
  tokenId: string;
}

interface GridBoardProps {
  tokens: CellToken[];
  setTokens: React.Dispatch<React.SetStateAction<CellToken[]>>;
  rolledDice: { type: DiceType; value: number } | null;
  onTokenPointerDown?: () => void;
  onTokenDragStart?: () => void;
  style?: React.CSSProperties; // ✅ Permitir pasar estilos desde afuera
}

const NOTIF_DISPLAY_TIME = 3000;
const SHAKE_DURATION = 1000;

export default function GridBoard({
  tokens,
  setTokens,
  rolledDice,
  onTokenPointerDown,
  onTokenDragStart,
  style,
}: GridBoardProps) {
  const gridSize = 60;
  const [cellSize, setCellSize] = useState(60);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [showDiceNotif, setShowDiceNotif] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (rolledDice) {
      setShowDiceNotif(false);

      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        setShowDiceNotif(true);

        timerRef.current = setTimeout(() => {
          setShowDiceNotif(false);
        }, NOTIF_DISPLAY_TIME);
      }, SHAKE_DURATION);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [rolledDice]);

  const zoomIn = () => setCellSize((prev) => Math.min(prev + 10, 100));
  const zoomOut = () => setCellSize((prev) => Math.max(prev - 10, 30));
  const resetZoom = () => setCellSize(60);

  return (
    <div
      className="flex flex-col items-center w-full h-full gap-3 relative select-none"
      style={style} // ✅ Usamos el style externo
    >
      {/* Controles de zoom */}
      <div className="flex gap-2 mb-2">
        <button onClick={zoomOut} className="btn">➖</button>
        <button onClick={resetZoom} className="btn">🔄</button>
        <button onClick={zoomIn} className="btn">➕</button>
      </div>

      <div
        id="grid-board-inner"
        className="flex-1 overflow-auto p-4 rounded-xl border-2 border-emerald-600 bg-gray-950 shadow-inner"
      >
        {/* Toast del dado */}
        <AnimatePresence>
          {showDiceNotif && rolledDice && (
            <motion.div
              key="dice-notif"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ duration: 0.4 }}
              className="fixed bottom-36 left-1/2 -translate-x-1/2 z-50 bg-black bg-opacity-80 px-6 py-3 rounded-xl border border-emerald-500 shadow-lg text-white text-lg font-bold tracking-wide pointer-events-none"
            >
              🎲 {rolledDice.type.toUpperCase()} →{" "}
              <span className="text-emerald-400">{rolledDice.value}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid */}
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
                      onTokenDragStart?.();
                    }}
                    onPointerDown={() => onTokenPointerDown?.()}
                    className="token-on-board absolute inset-0 flex items-center justify-center cursor-move select-none"
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
                      aria-label={`Token ${token.tokenId}`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Botones de zoom */}
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
