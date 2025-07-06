"use client";

import { DiceType } from "@/utils/types";

interface Props {
  onRoll: (roll: { type: DiceType; value: number }) => void;
}

export default function DicePanel({ onRoll }: Props) {
  const rollDice = (type: DiceType) => {
    const sides = parseInt(type.replace("d", ""), 10);
    if (isNaN(sides)) {
      console.error("Valor inválido de dado:", type);
      return;
    }

    const result = Math.floor(Math.random() * sides) + 1;

    // ✅ Ahora pasamos un solo objeto con type y value
    onRoll({ type, value: result });
  };

  const diceList: DiceType[] = ["d4", "d6", "d8", "d10", "d12", "d20", "d100"];

  return (
    <div className="grid grid-cols-3 gap-3">
      {diceList.map((dice) => (
        <button
          key={dice}
          onClick={() => rollDice(dice)}
          className="relative w-16 h-16 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg rounded-[20%] shadow-lg transform hover:scale-110 transition-all"
        >
          {dice.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
