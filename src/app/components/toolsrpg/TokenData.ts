export type TokenCategory =
  | "characters"
  | "monsters"
  | "objects"
  | "dungeon"
  | "environment"
  | "symbols";

export interface TokenInfo {
  icon: string;
  color: string;
  category: TokenCategory;
}

export const tokenData: Record<string, TokenInfo> = {
  // 👤 Characters
  warrior: { icon: "game-icons:battle-gear", color: "#F59E0B", category: "characters" },
  barbarian: { icon: "game-icons:barbarian", color: "#B91C1C", category: "characters" },
  mage: { icon: "game-icons:wizard-face", color: "#3B82F6", category: "characters" },
  rogue: { icon: "game-icons:hood", color: "#6B7280", category: "characters" },
  bard: { icon: "game-icons:lyre", color: "#A21CAF", category: "characters" },
  paladin: { icon: "game-icons:holy-grail", color: "#10B981", category: "characters" },
  dwarf: { icon: "game-icons:dwarf-face", color: "#92400E", category: "characters" },
  elf: { icon: "game-icons:woman-elf-face", color: "#22C55E", category: "characters" },
  vampire: { icon: "game-icons:vampire-dracula", color: "#DC2626", category: "characters" },
  cultist: { icon: "game-icons:cultist", color: "#4B5563", category: "characters" },
  assassin: { icon: "game-icons:hooded-assassin", color: "#111827", category: "characters" },
  bandit: { icon: "game-icons:bandit", color: "#78350F", category: "characters" },
  brute: { icon: "game-icons:brute", color: "#EA580C", category: "characters" },
  badGnome: { icon: "game-icons:bad-gnome", color: "#16A34A", category: "characters" },
  cowled: { icon: "game-icons:cowled", color: "#1E3A8A", category: "characters" },
  cyborg: { icon: "game-icons:cyborg-face", color: "#6D28D9", category: "characters" },

  // 👹 Monsters
  goblin: { icon: "game-icons:goblin", color: "#84CC16", category: "monsters" },
  orc: { icon: "game-icons:orc-head", color: "#15803D", category: "monsters" },
  dragon: { icon: "game-icons:dragon-head", color: "#EF4444", category: "monsters" },
  skeleton: { icon: "game-icons:skeleton", color: "#9CA3AF", category: "monsters" },
  minotaur: { icon: "game-icons:minotaur", color: "#B45309", category: "monsters" },
  demon: { icon: "game-icons:devil-mask", color: "#7C3AED", category: "monsters" },
  ghost: { icon: "game-icons:ghost", color: "#E5E7EB", category: "monsters" },
  oni: { icon: "game-icons:oni", color: "#991B1B", category: "monsters" },
  evilMinion: { icon: "game-icons:evil-minion", color: "#4C1D95", category: "monsters" },
  daemon: { icon: "game-icons:daemon-skull", color: "#8B5CF6", category: "monsters" },
  brute2: { icon: "game-icons:bully-minion", color: "#D97706", category: "monsters" },
  mutant: { icon: "game-icons:alien-bug", color: "#F43F5E", category: "monsters" },

  // 🧳 Objects
  chest: { icon: "game-icons:chest", color: "#FBBF24", category: "objects" },
  potion: { icon: "game-icons:health-potion", color: "#EF4444", category: "objects" },
  torch: { icon: "game-icons:torch", color: "#F97316", category: "objects" },
  key: { icon: "game-icons:key", color: "#EAB308", category: "objects" },
  coins: { icon: "game-icons:coins", color: "#FACC15", category: "objects" },
  trap: { icon: "game-icons:spiked-trap", color: "#DC2626", category: "objects" },
  fishingBoat: { icon: "game-icons:fishing-boat", color: "#0284C7", category: "objects" },
  lyre: { icon: "game-icons:lyre", color: "#A855F7", category: "objects" },
  mask: { icon: "game-icons:curly-mask", color: "#9CA3AF", category: "objects" },
  cog: { icon: "game-icons:cog", color: "#94A3B8", category: "objects" },
  crackedGlass: { icon: "game-icons:cracked-glass", color: "#F472B6", category: "objects" },

  // 🏰 Dungeon
  wall: { icon: "game-icons:brick-wall", color: "#6B7280", category: "dungeon" },
  stoneWall: { icon: "game-icons:stone-wall", color: "#4B5563", category: "dungeon" },
  door: { icon: "game-icons:door", color: "#92400E", category: "dungeon" },
  floor: { icon: "game-icons:stone-path", color: "#A1A1AA", category: "dungeon" },
  gate: { icon: "game-icons:dungeon-gate", color: "#1F2937", category: "dungeon" },
  light: { icon: "game-icons:dungeon-light", color: "#FCD34D", category: "dungeon" },
  hatch: { icon: "game-icons:floor-hatch", color: "#737373", category: "dungeon" },
  firewall: { icon: "game-icons:firewall", color: "#DC2626", category: "dungeon" },
  expand: { icon: "game-icons:expand", color: "#7DD3FC", category: "dungeon" },
  mapBoard: { icon: "game-icons:empty-chessboard", color: "#E2E8F0", category: "dungeon" },

  // 🌿 Environment
  forest: { icon: "game-icons:circle-forest", color: "#16A34A", category: "environment" },
  campfire: { icon: "game-icons:campfire", color: "#F97316", category: "environment" },
  mountain: { icon: "game-icons:mountains", color: "#78716C", category: "environment" },
  nest: { icon: "game-icons:crow-nest", color: "#A16207", category: "environment" },
  dragonBoat: { icon: "game-icons:drakkar", color: "#0369A1", category: "environment" },
  cloud: { icon: "game-icons:dust-cloud", color: "#E5E7EB", category: "environment" },
  deadTree: { icon: "game-icons:dead-wood", color: "#A8A29E", category: "environment" },
  bridge: { icon: "game-icons:bridge", color: "#6B7280", category: "environment" },
  goldMine: { icon: "game-icons:gold-mine", color: "#FACC15", category: "environment" },

  // 🔣 Symbols
  sword: { icon: "game-icons:crossed-swords", color: "#F3F4F6", category: "symbols" },
  aura: { icon: "game-icons:beams-aura", color: "#E0F2FE", category: "symbols" },
  dice20: { icon: "game-icons:dice-twenty-faces-twenty", color: "#14B8A6", category: "symbols" },
  d4: { icon: "game-icons:d4", color: "#6366F1", category: "symbols" },
  d10: { icon: "game-icons:d10", color: "#F472B6", category: "symbols" },
  d12: { icon: "game-icons:d12", color: "#8B5CF6", category: "symbols" },
  d8: { icon: "game-icons:dice-eight-faces-eight", color: "#3B82F6", category: "symbols" },
  duration: { icon: "game-icons:duration", color: "#22D3EE", category: "symbols" },
  arrowed: { icon: "game-icons:arrowed", color: "#F87171", category: "symbols" }
};
