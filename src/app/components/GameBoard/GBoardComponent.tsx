"use client";

import { DiceType } from "@/utils/types";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GiDiceTwentyFacesTwenty } from "react-icons/gi";

interface Props {
  rolledDice: { type: DiceType; value: number } | null;
  isShaking: boolean;
  tokens: string[];
}

export default function GameBoard({ rolledDice, isShaking }: Props) {
  const [isRolling, setIsRolling] = useState(false);
  const [currentRoll, setCurrentRoll] = useState<{ type: DiceType; value: number } | null>(null);
  const [showNumber, setShowNumber] = useState(false);

  useEffect(() => {
    if (isShaking) {
      setIsRolling(false);
      setShowNumber(false);
    } else if (rolledDice) {
      // Empieza animación de giro
      setCurrentRoll(rolledDice);
      setIsRolling(true);
      setShowNumber(false);

      const timeout = setTimeout(() => {
        setIsRolling(false);
        setShowNumber(true);
      }, 700); // velocidad al mostrar número final

      return () => clearTimeout(timeout);
    }
  }, [rolledDice, isShaking]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl min-h-[320px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-4 border-emerald-600 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-10 relative overflow-hidden">

        <AnimatePresence mode="wait">
          {isShaking ? (
            <motion.div
              key="shake"
              className="w-32 h-32 rounded-full bg-gray-700 shadow-xl flex items-center justify-center ring-4 ring-emerald-400"
              animate={{
                rotate: [0, -15, 15, -10, 10, -5, 5, 0],
                x: [0, -6, 6, -4, 4, -2, 2, 0],
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <GiDiceTwentyFacesTwenty className="text-emerald-400 text-[72px]" />
            </motion.div>
          ) : isRolling ? (
            <motion.div
              key="rolling"
              className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center shadow-inner ring-4 ring-emerald-400"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
            >
              <GiDiceTwentyFacesTwenty className="text-gray-900 text-[70px]" />
            </motion.div>
          ) : showNumber && currentRoll ? (
            <motion.div
              key="result"
              className="w-36 h-36 bg-gray-800 text-white text-6xl font-extrabold flex items-center justify-center rounded-2xl shadow-xl ring-4 ring-emerald-400"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {currentRoll.value}
            </motion.div>
          ) : (
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

        {showNumber && currentRoll && (
          <p className="text-lg sm:text-xl mt-4 text-emerald-400 font-semibold tracking-wide uppercase">
            Resultado {currentRoll.type}
          </p>
        )}
      </div>
    </div>
  );
}
