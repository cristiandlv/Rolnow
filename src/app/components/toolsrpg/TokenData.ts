// src/components/toolsrpg/tokenData.ts

export type TokenCategory = "characters" | "monsters" | "objects" | "dungeon";

export interface TokenInfo {
  icon: string;
  color: string;
  category: TokenCategory;
}

export const tokenData: Record<string, TokenInfo> = {
  
  // 👤 Personajes
  warrior: { icon: "game-icons:battle-gear", color: "#D97706", category: "characters" },
  mage: { icon: "game-icons:wizard-face", color: "#2563EB", category: "characters" },
  rogue: { icon: "game-icons:hood", color: "#4B5563", category: "characters" },
  bard: { icon: "game-icons:lyre", color: "#DB2777", category: "characters" },
  paladin: { icon: "game-icons:holy-grail", color: "#10B981", category: "characters" },

  // 👹 Monstruos
  goblin: { icon: "game-icons:goblin-head", color: "#65A30D", category: "monsters" },
  orc: { icon: "game-icons:orc-head", color: "#4B5563", category: "monsters" },
  dragon: { icon: "game-icons:dragon-head", color: "#EF4444", category: "monsters" },
  skeleton: { icon: "game-icons:skeleton", color: "#6B7280", category: "monsters" },

  // 🧳 Objetos
  chest: { icon: "game-icons:chest", color: "#FBBF24", category: "objects" },
  potion: { icon: "game-icons:health-potion", color: "#EF4444", category: "objects" },
  torch: { icon: "game-icons:torch", color: "#F97316", category: "objects" },
  key: { icon: "game-icons:key", color: "#EAB308", category: "objects" },

  // 🏰 Dungeon
  trap: { icon: "game-icons:spiked-trap", color: "#DC2626", category: "dungeon" },
  wall: { icon: "game-icons:brick-wall", color: "#4B5563", category: "dungeon" },
  door: { icon: "game-icons:door", color: "#92400E", category: "dungeon" },
  floor: { icon: "game-icons:stone-path", color: "#A1A1AA", category: "dungeon" },
};

