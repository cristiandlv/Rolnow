'use client';

import { useState } from "react";
import { addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/utils/firebaseConfig";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface CreateRoomModalProps {
  onClose: () => void;
}

export default function CreateRoomModal({ onClose }: CreateRoomModalProps) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [durationDays, setDurationDays] = useState(1); // valor por defecto 1 día

  const handleCreateRoom = async () => {
    if (durationDays < 1 || durationDays > 30) {
      toast.error("La duración debe ser entre 1 y 30 días");
      return;
    }

    try {
      setCreating(true);
      const now = Timestamp.now();
      const expiresAt = Timestamp.fromMillis(
        now.toMillis() + durationDays * 24 * 60 * 60 * 1000
      );

      const roomRef = await addDoc(collection(db, "rooms"), {
        name: roomName || null,
        createdAt: serverTimestamp(),
        expiresAt,
        players: [],
        state: {},
      });

      toast.success("Sala creada con éxito!");
      router.push(`/table/${roomRef.id}`);
    } catch (error) {
      console.error("Error creando la sala:", error);
      toast.error("No se pudo crear la sala");
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-xl p-6 w-80 sm:w-96 shadow-lg flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-emerald-400">Crear Sala</h2>
        <input
          type="text"
          placeholder="Nombre de la sala (opcional)"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700"
        />
        <label className="flex flex-col gap-1">
          Duración (días, máximo 30):
          <input
            type="number"
            min={1}
            max={30}
            value={durationDays}
            onChange={(e) => setDurationDays(Number(e.target.value))}
            className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700"
          />
        </label>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
            disabled={creating}
          >
            Cancelar
          </button>
          <button
            onClick={handleCreateRoom}
            className="px-4 py-2 bg-emerald-500 rounded hover:bg-emerald-600"
            disabled={creating}
          >
            {creating ? "Creando..." : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
}
