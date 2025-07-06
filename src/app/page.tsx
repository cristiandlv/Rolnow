import Link from 'next/link'; // Alternativa para Server Components

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-gray-900 to-black text-white">
      <h1 className="text-4xl md:text-6xl font-bold mb-4 text-emerald-400">
        🎲 RolDice
      </h1>
      <p className="text-lg md:text-xl text-gray-300 max-w-xl mb-8">
        Simulador de tiradas de dados para juegos de rol, con chat integrado.
      </p>
      <Link
        href="/table"
        className="bg-emerald-500 hover:bg-emerald-600 transition-colors text-white px-6 py-3 rounded-xl text-lg font-semibold shadow-lg cursor-pointer"
      >
        Empezar a jugar
      </Link>
    </main>
  );
}