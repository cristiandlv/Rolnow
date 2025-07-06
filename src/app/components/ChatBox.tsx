"use client";

export default function ChatBox() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow bg-gray-900 rounded-md p-4 overflow-y-auto">
        <p className="text-gray-400 italic">El chat aparecerá aquí...</p>
      </div>
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
