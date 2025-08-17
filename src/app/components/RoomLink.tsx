"use client";

import { useState, useEffect } from "react";
import { db } from "@/utils/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { FaRegCopy } from "react-icons/fa";

interface RoomLinkPanelProps {
  roomId: string;
}


export default function RoomLinkFloating({ roomId }: { roomId: string }) {
  const [roomName, setRoomName] = useState("");
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);

  const roomRef = doc(db, "rooms", roomId);

  useEffect(() => {
    const fetchRoom = async () => {
      const snap = await getDoc(roomRef);
      if (snap.exists()) {
        const data = snap.data() as any;
        setRoomName(data.name || "");
      }
    };
    fetchRoom();
  }, [roomId]);

  const saveRoomName = async () => {
    await updateDoc(roomRef, { name: roomName });
    setEditing(false);
  };

  const copyLink = () => {
    const link = `${window.location.origin}/table/${roomId}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copiado al portapapeles!", { position: "top-center", autoClose: 2000 });
  };

  return (
    <div className="fixed top-24 right-6 z-50 flex flex-col items-end">
      {/* Botón principal */}
      <button
        onClick={() => setOpen(!open)}
        className="p-3 bg-gray-800 rounded-full shadow-lg hover:bg-emerald-600 transition-colors"
        title="Abrir panel de la sala"
      >
        <FaLink className="text-white" />
      </button>

      {/* Panel desplegable */}
      <div
        className={`mt-2 w-52 bg-gray-800/95 backdrop-blur-sm p-3 rounded-xl border border-emerald-500 shadow-lg flex flex-col gap-1 transition-all duration-300 overflow-hidden ${open ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="flex items-center justify-between">
          {editing ? (
            <input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              onBlur={saveRoomName}
              onKeyDown={(e) => e.key === "Enter" && saveRoomName()}
              className="bg-gray-700 text-white px-2 py-1 rounded w-full"
              autoFocus
            />
          ) : (
            <h4
              className="text-white font-semibold cursor-pointer truncate"
              onClick={() => setEditing(true)}
              title="Click para editar"
            >
              {roomName || "Nombre de la sala"}
            </h4>
          )}
          <button
            onClick={copyLink}
            className="ml-2 p-1 bg-gray-700 rounded hover:bg-emerald-600 transition-colors"
            title="Copiar link"
          >
            <FaRegCopy className="text-white" />
          </button>
        </div>
        <p className="text-gray-400 text-xs truncate">Link listo para compartir</p>
      </div>
    </div>
  );
}