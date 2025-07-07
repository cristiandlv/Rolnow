"use client";

import { useState } from "react";
import DicePanel from "../components/DicePanel";
import GameBoard from "../components/GameBoard/GBoardComponent";
import ChatBox from "../components/ChatBox";
import GridBoard from "../components/GameBoard/GridBoard";
import TokenPalette from "../components/toolsrpg/TokenPalette";
import { DiceType } from "@/utils/types";

export interface CellToken {
  id: number;
  tokenId: string;
}

export default function TablePage() {
  const [rolledDice, setRolledDice] = useState<{ type: DiceType; value: number } | null>(null);
  const [isShaking, setIsShaking] = useState(false); 
  const [tokens, setTokens] = useState<CellToken[]>([]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <div className="flex flex-col lg:flex-row gap-4 h-full">
        {/* 🧰 Herramientas */}
        <aside className="lg:w-1/5 bg-gray-800 rounded-xl p-4 flex flex-col items-center shadow-lg overflow-auto">
          <h2 className="text-xl font-bold text-emerald-400 mb-4">🧰 Herramientas</h2>
          <DicePanel
  onRoll={setRolledDice}
  onStartShake={() => setIsShaking(true)}
  onStopShake={() => setIsShaking(false)}
/>

<GameBoard rolledDice={rolledDice} isShaking={isShaking} tokens={[]} />
          <TokenPalette />
        </aside>

        {/* 🧩 Tablero */}
        <section className="lg:w-3/5 bg-gray-900 rounded-xl p-6 flex flex-col items-center justify-start shadow-2xl min-h-[400px] overflow-auto">
          <h2 className="text-2xl font-bold text-emerald-400 mb-6">🧩 Tablero de juego</h2>
          <GameBoard rolledDice={rolledDice} isShaking={isShaking} tokens={tokens.map(t => t.tokenId)} />
          <GridBoard tokens={tokens} setTokens={setTokens} />
        </section>

        {/* 💬 Chat */}
        <aside className="lg:w-1/5 bg-gray-800 rounded-xl p-4 flex flex-col shadow-lg overflow-auto">
          <h2 className="text-xl font-bold text-emerald-400 mb-4">💬 Chat</h2>
          <ChatBox />
        </aside>
      </div>
    </main>
  );
}
