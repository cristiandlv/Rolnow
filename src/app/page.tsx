'use client';

import { useState } from "react";
import CreateRoomModal from "./components/CreateRoomModal";
import CleanupExpiredRooms from "./components/CleanupExpireRooms";

export default function CreateRoomPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-gray-900 to-black text-white">
       <CleanupExpiredRooms />
      <h1 className="text-4xl md:text-6xl font-bold mb-4 text-emerald-400">
        🎲 RolNow
      </h1>
      <p className="text-lg md:text-xl text-gray-300 max-w-xl mb-8">
        Crea tu sala de rol y juega sin más complicaciones. Comenzá ahora.
      </p>
      <button
        onClick={() => setModalOpen(true)}
        className="bg-emerald-500 hover:bg-emerald-600 transition-colors text-white px-6 py-3 rounded-xl text-lg font-semibold shadow-lg cursor-pointer"
      >
        Crear Sala
      </button>

      {modalOpen && <CreateRoomModal onClose={() => setModalOpen(false)} />}
    </main>
  );
}
