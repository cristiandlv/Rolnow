"use client";

import { DiceType } from "@/utils/types";
import { Icon } from "@iconify/react";
import { motion, Variants } from "framer-motion";
import { useState } from "react";

interface Props {
  onRoll: (roll: { type: DiceType; value: number }) => void;
  onStartShake: () => void;
  onStopShake: () => void;
}

const diceIcons: Record<DiceType, string> = {
  d4: "game-icons:d4",
  d6: "game-icons:dice-six-faces-six",
  d8: "game-icons:dice-eight-faces-eight",
  d10: "game-icons:d10",
  d12: "game-icons:d12",
  d20: "game-icons:dice-twenty-faces-twenty",
  d100: "game-icons:dice-twenty-faces-twenty",
};

const diceColors: Record<DiceType, { text: string; border: string; ring: string }> = {
  d4: { text: "text-purple-400", border: "border-purple-500", ring: "ring-purple-500" },
  d6: { text: "text-blue-400", border: "border-blue-500", ring: "ring-blue-500" },
  d8: { text: "text-green-400", border: "border-green-500", ring: "ring-green-500" },
  d10: { text: "text-yellow-400", border: "border-yellow-500", ring: "ring-yellow-500" },
  d12: { text: "text-pink-400", border: "border-pink-500", ring: "ring-pink-500" },
  d20: { text: "text-emerald-400", border: "border-emerald-500", ring: "ring-emerald-500" },
  d100: { text: "text-red-400", border: "border-red-500", ring: "ring-red-500" },
};

const shakeVariants: Variants = {
  idle: { rotate: 0, x: 0, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  shaking: {
    rotate: [0, 10, -10, 10, -10, 0],
    x: [0, -3, 3, -3, 3, 0],
    y: [0, -3, 3, -3, 3, 0],
    transition: { repeat: Infinity, duration: 0.3, ease: "easeInOut" },
  },
};

export default function DicePanel({ onRoll, onStartShake, onStopShake }: Props) {
  const diceList: DiceType[] = ["d4", "d6", "d8", "d10", "d12", "d20", "d100"];
  const [shakingDice, setShakingDice] = useState<DiceType | null>(null);

  const rollDice = (type: DiceType) => {
    const sides = parseInt(type.replace("d", ""), 10);
    if (isNaN(sides)) return;
    const result = Math.floor(Math.random() * sides) + 1;
    onRoll({ type, value: result });
  };

  const handleStartShake = (dice: DiceType) => {
    setShakingDice(dice);
    onStartShake();
  };

  const handleStopShake = () => {
    setShakingDice(null);
    onStopShake();
  };

  return (
    <section
      aria-label="Dice Roller Panel"
      className="max-w-md mx-auto mt-10 p-6 bg-gray-900 rounded-xl shadow-lg border border-gray-700"
    >
      <h2 className="text-2xl font-semibold text-emerald-400 mb-6 text-center select-none">
        🎲 Tirar Dados
      </h2>

      <div className="grid grid-cols-4 gap-6 justify-center">
        {diceList.map((dice) => {
          const color = diceColors[dice];
          const isShaking = shakingDice === dice;

          return (
            <motion.button
              key={dice}
              onClick={() => rollDice(dice)}
              title={`Tirar dado ${dice.toUpperCase()}`}
              aria-label={`Tirar dado ${dice.toUpperCase()}`}
              onMouseDown={() => handleStartShake(dice)}
              onMouseUp={handleStopShake}
              onMouseLeave={handleStopShake}
              onTouchStart={() => handleStartShake(dice)}
              onTouchEnd={handleStopShake}
              onTouchCancel={handleStopShake}
              animate={isShaking ? "shaking" : "idle"}
              variants={shakeVariants}
              className={`
                flex flex-col items-center justify-center
                rounded-lg border-2
                bg-gray-800
                ${color.text} ${color.border}
                font-semibold text-lg uppercase
                shadow-md
                cursor-pointer
                select-none
                transition
                duration-300
                ease-out
                hover:bg-gray-700 hover:scale-110 hover:shadow-lg
                active:scale-95 active:bg-gray-900
                focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-gray-900
                ${color.ring}
              `}
              style={{ width: "72px", height: "72px" }}
            >
              <Icon
                icon={diceIcons[dice]}
                width={32}
                height={32}
                className={`mb-1 ${color.text}`}
                aria-hidden="true"
                focusable="false"
              />
              {dice.toUpperCase()}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
