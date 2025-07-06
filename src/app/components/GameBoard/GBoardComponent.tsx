"use client";

import { DiceType } from "@/utils/types";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GiDiceTwentyFacesTwenty } from "react-icons/gi";

interface Props {
  rolledDice: { type: DiceType; value: number } | null;
}

export default function GameBoard({ rolledDice }: Props) {
  const [animating, setAnimating] = useState(false);
  const [display, setDisplay] = useState<{ type: DiceType; value: number } | null>(null);

  useEffect(() => {
    if (rolledDice) {
      console.log("🎲 Nuevo dado tirado:", rolledDice); // DEBUG
      setAnimating(true);
      setTimeout(() => {
        setDisplay(rolledDice);
        setAnimating(false);
      }, 1000);
    }
  }, [rolledDice]);

  return (
   <div className="w-full h-full flex flex-col items-center justify-center gap-6 px-4">
  <div className="w-full max-w-3xl min-h-[300px] bg-gray-900 border-2 border-emerald-500 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8">
    {animating ? (
      <motion.div
        className="w-32 h-32 bg-emerald-500 text-white text-5xl font-bold flex items-center justify-center rounded-full shadow-2xl"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      >
         <GiDiceTwentyFacesTwenty className="text-gray-700 text-9xl " />
      </motion.div>
    ) : display ? (
      <>
        <div className="w-32 h-32 bg-gray-800 text-white text-6xl font-extrabold flex items-center justify-center rounded-2xl shadow-lg">
          {display.value}
        </div>
        <p className="text-xl text-emerald-400 font-semibold"> <br />
          {display.type.toUpperCase()} - Resultado
        </p>
      </>
    ) : (
      <p className="text-gray-400 text-lg text-center">
        Tirá un dado desde la caja de herramientas para ver el resultado aquí
      </p>
    )}
  </div>
</div>

  );
}
