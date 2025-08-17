"use client";

import { DiceType } from "@/utils/types";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GiDiceTwentyFacesTwenty } from "react-icons/gi";

interface Props {
  rolledDice: { type: DiceType; value: number } | null;
  isShaking: boolean;
}

export default function GameBoard({ rolledDice, isShaking }: Props) {
  const [phase, setPhase] = useState<"idle" | "shake" | "showNumber">("idle");
  const [currentRoll, setCurrentRoll] = useState<{ type: DiceType; value: number } | null>(null);

  useEffect(() => {
    if (!rolledDice) {
      setPhase("idle");
      setCurrentRoll(null);
      return;
    }

    if (isShaking) {
      setPhase("shake");
      setCurrentRoll(rolledDice);
    } else {
      setPhase("showNumber");
      setCurrentRoll(rolledDice);

      const timer = setTimeout(() => setPhase("idle"), 3000); // más rápido
      return () => clearTimeout(timer);
    }
  }, [rolledDice, isShaking]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl min-h-[280px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-4 border-emerald-600 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {phase === "shake" && currentRoll && (
            <motion.div
              key="shake"
              className="w-28 h-28 rounded-full bg-gray-700 shadow-xl flex items-center justify-center ring-4 ring-emerald-400"
              animate={{
                rotate: [0, -20, 20, -15, 15, -8, 8, 0],
                x: [0, -6, 6, -4, 4, -2, 2, 0],
                y: [0, -3, 3, -2, 2, -1, 1, 0],
              }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <GiDiceTwentyFacesTwenty className="text-emerald-400 text-[64px]" />
            </motion.div>
          )}

          {phase === "showNumber" && currentRoll && (
            <motion.div
              key="result"
              className="w-32 h-32 bg-gray-800 text-white text-6xl font-extrabold flex items-center justify-center rounded-2xl shadow-xl ring-4 ring-emerald-400"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {currentRoll.value}
            </motion.div>
          )}

          {phase === "idle" && (
            <motion.p
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-400 text-lg text-center italic"
            >
              Tirá un dado para ver el resultado aquí
            </motion.p>
          )}
        </AnimatePresence>

        {phase === "showNumber" && currentRoll && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="text-lg sm:text-xl mt-3 text-emerald-400 font-semibold tracking-wide uppercase"
          >
            Resultado {currentRoll.type.toUpperCase()}
          </motion.p>
        )}
      </div>
    </div>
  );
}
