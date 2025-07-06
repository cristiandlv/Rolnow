// toolsrpg/TokenPalette.tsx
"use client";

interface Props {
  onAddToken: (token: string) => void;
}

const tokenList = ["🧙", "🐉", "🧟", "🧝", "⚔️", "🛡️", "🔥", "💀"];

export default function TokenPalette({ onAddToken }: Props) {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-emerald-300 mb-2">🎭 Tokens</h3>
      <div className="grid grid-cols-4 gap-2">
        {tokenList.map((token, i) => (
          <div
            key={i}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("custom/token", token); // clave personalizada
              // También podés disparar el callback para registrar el uso
              onAddToken(token);
            }}
            className="text-2xl cursor-move hover:scale-125 transition-transform"
            title={`Arrastrar ${token}`}
          >
            {token}
          </div>
        ))}
      </div>
    </div>
  );
}
