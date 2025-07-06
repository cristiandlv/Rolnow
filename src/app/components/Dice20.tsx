"use client";
import { useState } from "react";

export default function DiceRoller20() {
  const [result, setResult] = useState<number | null>(null);

  const rollDice = () => {
    const value = Math.floor(Math.random() * 20) + 1;
    setResult(value);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-md flex flex-col items-center">
      <h2 className="text-xl font-semibold mb-2 text-emerald-300">D20 🎲</h2>
      <button
        onClick={rollDice}
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        Tirar dado
      </button>
      {result !== null && (
        <p className="mt-4 text-3xl font-bold text-emerald-400">
          {result}
        </p>
      )}
    </div>
  );
}
