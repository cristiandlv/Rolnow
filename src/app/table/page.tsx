"use client";

import { useState, useEffect } from "react";
import { FaTools, FaComments, FaTimes } from "react-icons/fa";
import DicePanel from "../components/DicePanel";
import GameBoard from "../components/GameBoard/GBoardComponent";
import GridBoard from "../components/GameBoard/GridBoard";
import TokenPalette from "../components/toolsrpg/TokenPalette";
import ChatBox from "../components/ChatBox";
import { DiceType } from "@/utils/types";

export interface CellToken {
  id: number;
  tokenId: string;
}

export default function TablePage() {
  const [toolsOpen, setToolsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const [rolledDice, setRolledDice] = useState<{ type: DiceType; value: number } | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [tokens, setTokens] = useState<CellToken[]>([]);

  // Controla cuánto tiempo se ve GameBoard
  const [showGameBoard, setShowGameBoard] = useState(false);

  useEffect(() => {
    if (rolledDice) {
      setShowGameBoard(true);
      const timeout = setTimeout(() => {
        setShowGameBoard(false);
      }, 3000); // se oculta luego de 3s

      return () => clearTimeout(timeout);
    }
  }, [rolledDice]);

  return (
    <main className="relative w-screen h-screen bg-gray-900 text-white overflow-hidden">

      {/* Grid de fondo, ocupa toda la pantalla */}
      <GridBoard tokens={tokens} setTokens={setTokens} rolledDice={rolledDice} />

      {/* GameBoard visible temporalmente arriba */}
      {showGameBoard && (
  <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30">
    <GameBoard rolledDice={rolledDice} isShaking={isShaking} tokens={tokens.map((t) => t.tokenId)} />
  </div>
)}


      {/* BOTONES FLOTANTES para sliders */}
      <div className="fixed top-6 left-6 z-40 flex flex-col gap-3">
        {!toolsOpen && (
          <button
            onClick={() => setToolsOpen(true)}
            aria-label="Abrir Herramientas"
            className="w-14 h-14 rounded-full border-2 border-emerald-400 bg-gray-800 text-emerald-400 flex items-center justify-center hover:bg-emerald-700 transition"
          >
            <FaTools size={24} />
          </button>
        )}
      </div>

      <div className="fixed top-6 right-6 z-40 flex flex-col gap-3">
        {!chatOpen && (
          <button
            onClick={() => setChatOpen(true)}
            aria-label="Abrir Chat"
            className="w-14 h-14 rounded-full border-2 border-emerald-400 bg-gray-800 text-emerald-400 flex items-center justify-center hover:bg-emerald-700 transition"
          >
            <FaComments size={24} />
          </button>
        )}
      </div>

      {/* SLIDER herramientas */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-80 bg-gray-900 border-r border-emerald-600 shadow-xl z-50
          transform transition-transform duration-300 ease-in-out
          ${toolsOpen ? "translate-x-0" : "-translate-x-full"}
          flex flex-col p-4 overflow-hidden
        `}
        aria-label="Panel de herramientas"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-emerald-400 select-none">🧰 Herramientas</h3>
          <button
            onClick={() => setToolsOpen(false)}
            aria-label="Cerrar herramientas"
            className="w-9 h-9 flex items-center justify-center rounded-full text-emerald-400 hover:bg-emerald-700 transition"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <DicePanel
          onRoll={setRolledDice}
          onStartShake={() => setIsShaking(true)}
          onStopShake={() => setIsShaking(false)}
        />

        <TokenPalette />
      </aside>

      {/* SLIDER chat */}
      <aside
        className={`
          fixed top-0 right-0 h-full w-80 bg-gray-900 border-l border-emerald-600 shadow-xl z-50
          transform transition-transform duration-300 ease-in-out
          ${chatOpen ? "translate-x-0" : "translate-x-full"}
          flex flex-col p-4 overflow-hidden
        `}
        aria-label="Panel de chat"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-emerald-400 select-none">💬 Chat</h3>
          <button
            onClick={() => setChatOpen(false)}
            aria-label="Cerrar chat"
            className="w-9 h-9 flex items-center justify-center rounded-full text-emerald-400 hover:bg-emerald-700 transition"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <ChatBox />
      </aside>
    </main>
  );
}
