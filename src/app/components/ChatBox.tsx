"use client";

import { FaTimes } from "react-icons/fa";

interface ChatBoxProps {
  onClose: () => void;
}

export default function ChatBox({ onClose }: ChatBoxProps) {
  return (
    <div
      className="fixed top-0 right-0 h-full w-96 bg-gray-900/85 backdrop-blur-sm 
      shadow-xl border-l border-emerald-600 z-50 flex flex-col p-4"
    >
      {/* Botón de cerrar */}
      <div className="flex justify-end mb-2">
        <button
          onClick={onClose}
          className="text-emerald-400 hover:text-red-500 transition"
          title="Cerrar chat"
          aria-label="Cerrar chat"
        >
          <FaTimes size={20} />
        </button>
      </div>

      {/* Mensajes */}
      <div className="flex-grow bg-gray-900/60 rounded-md p-4 overflow-y-auto">
        <p className="text-gray-400 italic">El chat aparecerá aquí...</p>
      </div>

      {/* Input */}
      <form className="mt-4 flex">
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          className="flex-grow p-2 rounded-l-md bg-gray-800 text-white border border-gray-600"
        />
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-r-md"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
