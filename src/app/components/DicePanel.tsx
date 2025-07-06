"use client";

import { DiceType } from "@/utils/types";
import TokenPalette from "./toolsrpg/TokenPalette";

interface Props {
  onRoll: (roll: { type: DiceType; value: number }) => void;
  onAddToken: (token: string) => void;
}

export default function DicePanel({ onRoll, onAddToken }: Props) {
  const diceList: DiceType[] = ["d4", "d6", "d8", "d10", "d12", "d20", "d100"];

  const rollDice = (type: DiceType) => {
    const sides = parseInt(type.replace("d", ""), 10);
    if (isNaN(sides)) return;
    const result = Math.floor(Math.random() * sides) + 1;
    onRoll({ type, value: result });
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        {diceList.map((dice) => (
          <button
            key={dice}
            onClick={() => rollDice(dice)}
            className="w-16 h-16 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg rounded-[20%] shadow-lg transform hover:scale-110 transition-all"
          >
            {dice.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tokens */}
      <TokenPalette onAddToken={onAddToken} />
    </>
  );
}
