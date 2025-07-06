"use client";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { tokenData } from "./TokenData";

const categories = ["characters", "monsters", "objects", "dungeon"] as const;

export default function TokenPalette() {
  const [activeCategory, setActiveCategory] = useState("characters");

  const filteredTokens = Object.entries(tokenData).filter(
    ([, value]) => value.category === activeCategory
  );

  return (
    <div className="w-full mt-6">
      <h3 className="text-lg font-semibold text-emerald-300 mb-3">🎭 Tokens</h3>

      <div className="flex gap-2 mb-4 flex-wrap justify-center">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-full text-sm font-medium border ${
              activeCategory === cat
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4">
        {filteredTokens.map(([tokenId, { icon, color }]) => (
          <div
            key={tokenId}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("token-id", tokenId)}
            className="cursor-move hover:scale-125 transition-transform flex justify-center items-center"
            title={tokenId}
          >
            <Icon icon={icon} width="36" height="36" color={color} />
          </div>
        ))}
      </div>
    </div>
  );
}
