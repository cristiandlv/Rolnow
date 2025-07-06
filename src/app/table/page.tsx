// src/app/table/page.tsx
"use client";

import { useState } from "react";
import DicePanel from "../components/DicePanel";
import GameBoard from "../components/GameBoard/GBoardComponent";
import ChatBox from "../components/ChatBox";
import { DiceType } from "@/utils/types";
import GridBoard from "../components/GameBoard/GridBoard";


export default function TablePage() {
  const [rolledDice, setRolledDice] = useState<{ type: DiceType; value: number } | null>(null);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <div className="flex flex-col lg:flex-row gap-4 h-full">
        {/* 🧰 Caja de Herramientas */}
        <aside className="lg:w-1/5 bg-gray-800 rounded-xl p-4 flex flex-col items-center shadow-lg">
          <h2 className="text-xl font-bold text-emerald-400 mb-4">🧰 Herramientas</h2>
          <DicePanel onRoll={setRolledDice} />
          {/* Futuras herramientas aquí */}
        </aside>

        {/* 🧩 Tablero principal */}
        <section className="lg:w-3/5 bg-gray-900 rounded-xl p-6 flex flex-col items-center justify-center shadow-2xl min-h-[400px]">
          <h2 className="text-2xl font-bold text-emerald-400 mb-6">🧩 Tablero</h2>
          <GameBoard rolledDice={rolledDice} /> <h1 className="text-2xl font-bold text-emerald-400 mb-6">🧩 Tablero de juego</h1>
      <GridBoard />
        </section>
       

        {/* 💬 Chat */}
        <aside className="lg:w-1/5 bg-gray-800 rounded-xl p-4 flex flex-col shadow-lg">
          <h2 className="text-xl font-bold text-emerald-400 mb-4">💬 Chat</h2>
          <ChatBox />
        </aside>
      </div>
    </main>
  );
}
