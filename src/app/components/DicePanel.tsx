"use client";

import { useState } from "react";
import { DiceType } from "@/utils/types";
import { motion } from "framer-motion";

const DICE_SIDES: Record<DiceType, number> = {
  d4: 4, d6: 6, d8: 8, d10: 10, d12: 12, d20: 20, d100: 100,
};

interface DicePanelProps {
  onRollStart?: (type: DiceType) => void;
  onRollFinish: (type: DiceType, value: number) => void;
}

export default function DicePanel({ onRollStart, onRollFinish }: DicePanelProps) {
  const [busy, setBusy] = useState(false);
  const [shakeType, setShakeType] = useState<DiceType | null>(null);

  const roll = (type: DiceType) => {
    if (busy) return;
    setBusy(true);
    setShakeType(type);

    onRollStart?.(type);

    const SHAKE_MS = 1400; // más rápido

    setTimeout(() => {
      const sides = DICE_SIDES[type];
      const value = 1 + Math.floor(Math.random() * sides);

      setShakeType(null);
      onRollFinish(type, value);

      setTimeout(() => setBusy(false), 600);
    }, SHAKE_MS);
  };

  return (
    <div className="mt-4">
      <h4 className="text-lg font-semibold text-emerald-300 mb-2">Dados</h4>
      <div className="flex flex-wrap gap-2">
        {Object.keys(DICE_SIDES).map((k) => {
          const type = k as DiceType;
          const isShaking = shakeType === type;

          return (
            <motion.button
              key={type}
              disabled={busy}
              onClick={() => roll(type)}
              animate={
                isShaking
                  ? { rotate: [0, -15, 15, -10, 10, -5, 5, 0], y: [0, -2, 2, -1, 1, 0] }
                  : { rotate: 0, y: 0 }
              }
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className={`px-3 py-2 rounded-md border font-semibold text-gray-100 text-sm
                ${busy
                  ? "opacity-60 cursor-not-allowed border-gray-600"
                  : "border-emerald-500 bg-gray-800 hover:bg-emerald-700"
                }`}
            >
              {type.toUpperCase()}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
