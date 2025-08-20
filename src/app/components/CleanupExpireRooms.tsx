"use client";

import { useEffect } from "react";
import { collection, getDocs, query, where, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "@/utils/firebaseConfig";

export default function CleanupExpiredRooms() {
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const cleanup = async () => {
      try {
        const now = Timestamp.now();
        const roomsRef = collection(db, "rooms");
        const q = query(roomsRef, where("expiresAt", "<=", now));
        const snapshot = await getDocs(q);

        snapshot.forEach(async (room) => {
          await deleteDoc(doc(db, "rooms", room.id));
          console.log("Room eliminada automáticamente:", room.id);
        });
      } catch (error) {
        console.error("Error borrando rooms expiradas:", error);
      }
    };

    // Ejecuta al cargar
    cleanup();

    // Ejecuta cada 5 minutos
    intervalId = setInterval(cleanup, 5 * 60 * 1000);

    // Limpieza al desmontar
    return () => clearInterval(intervalId);
  }, []);

  return null;
}
