"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { tokenData } from "./TokenData";

const categoryIcons = {
  characters: "game-icons:barbarian",
  monsters: "game-icons:dragon-head",
  objects: "game-icons:chest",
  dungeon: "game-icons:brick-wall",
  environment: "game-icons:circle-forest",
  symbols: "game-icons:crossed-swords",
};

type Category = keyof typeof categoryIcons;

export default function TokenPalette() {
  const [activeCategory, setActiveCategory] = useState<Category>("characters");

  const filteredTokens = Object.entries(tokenData).filter(
    ([, value]) => value.category === activeCategory
  );

  return (
    <div className="w-full mt-6">
      <h3 className="text-lg font-semibold text-emerald-300 mb-4 text-center">
        🎭 Token Palette
      </h3>

      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {(Object.keys(categoryIcons) as Category[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 ${
              activeCategory === cat
                ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                : "bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700"
            }`}
          >
            <Icon icon={categoryIcons[cat]} className="text-xl" />
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {filteredTokens.length === 0 ? (
        <p className="text-center text-gray-400">No tokens in this category</p>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-1 px-0">
          {filteredTokens.map(([tokenId, { icon, color }]) => (
            <div
              key={tokenId}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("token-id", tokenId)}
              className="cursor-move transition-transform hover:scale-110 flex justify-center items-center p-3 rounded-lg bg-gray-900 shadow-lg border border-gray-700"
              title={tokenId}
            >
              <Icon
                icon={icon}
                width={40}
                height={40}
                color={color}
                className="drop-shadow-[0_0_2px_black]"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
