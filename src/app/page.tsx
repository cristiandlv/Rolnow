'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/utils/firebaseConfig';

export default function CreateRoomPage() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const handleCreateRoom = async () => {
    try {
      setCreating(true);
      const roomRef = await addDoc(collection(db, 'rooms'), {
        createdAt: serverTimestamp(),
        players: [],
        state: {}, // podés guardar acá tokens, tablero, etc.
      });
      router.push(`/table/${roomRef.id}`);
    } catch (error) {
      console.error('Error al crear sala:', error);
      alert('Error al crear la sala');
      setCreating(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-gray-900 to-black text-white">
      <h1 className="text-4xl md:text-6xl font-bold mb-4 text-emerald-400">
        🎲 RolNow
      </h1>
      <p className="text-lg md:text-xl text-gray-300 max-w-xl mb-8">
        Crea tu sala de rol y juega sin más complicaciones. Comenzá ahora.
      </p>
      <button
        onClick={handleCreateRoom}
        className="bg-emerald-500 hover:bg-emerald-600 transition-colors text-white px-6 py-3 rounded-xl text-lg font-semibold shadow-lg cursor-pointer"
        disabled={creating}
      >
        {creating ? 'Creando...' : 'Empezar a jugar'}
      </button>
    </main>
  );
}
