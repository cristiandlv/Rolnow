"use client";

import { useEffect, useRef, useState } from "react";
import { db } from "@/utils/firebaseConfig";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { FaTimes } from "react-icons/fa";

interface ChatBoxProps {
  roomId: string;
  onClose: () => void;
}

interface Message {
  id: string;
  user: string;
  text: string;
  createdAt: any;
}

export default function ChatBox({ roomId, onClose }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const username =
    typeof window !== "undefined"
      ? localStorage.getItem("rpg-username") || "Anon"
      : "Anon";

  // 🔄 Cargar mensajes en tiempo real
  useEffect(() => {
    const q = query(
      collection(db, "rooms", roomId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...(doc.data() as any) });
      });
      setMessages(msgs);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    return () => unsub();
  }, [roomId]);

  // ✉️ Enviar mensaje
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await addDoc(collection(db, "rooms", roomId, "messages"), {
      user: username,
      text: newMessage.trim(),
      createdAt: serverTimestamp(),
    });

    setNewMessage("");
  };

  return (
    <div className="w-80 sm:w-96 h-[70vh] max-h-[600px] bg-gray-900 border border-emerald-600 rounded-xl shadow-xl flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 border-b border-emerald-600">
        <h3 className="text-emerald-400 font-semibold">💬 Chat</h3>
        <button onClick={onClose} className="text-white hover:text-red-400">
          <FaTimes />
        </button>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[60vh]">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400">No hay mensajes aún</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-2 rounded-lg max-w-[80%] break-words ${
                msg.user === username
                  ? "bg-emerald-600 text-white ml-auto"
                  : "bg-gray-700 text-gray-200"
              }`}
            >
              <span className="block text-xs font-bold">{msg.user}</span>
              <span>{msg.text}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-emerald-600 flex gap-2"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 px-3 py-2 rounded bg-gray-800 text-white focus:outline-none text-sm sm:text-base"
        />
        <button
          type="submit"
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-600 rounded hover:bg-emerald-500 text-sm sm:text-base"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
