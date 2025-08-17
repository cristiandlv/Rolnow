"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onSave: (name: string) => void;
}

export default function UsernameModal({ onSave }: Props) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim());
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-gray-900 border border-emerald-600 rounded-2xl shadow-2xl p-6 w-80"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl font-bold text-emerald-400 mb-4 text-center">
            Elige tu nombre
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Escribe tu nombre..."
              className="p-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-md font-semibold"
            >
              Confirmar
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
