// ════════════════════════════════════════════════════════════════════════
//  PALETTE — the named colour table for the whole book
// ════════════════════════════════════════════════════════════════════════
//
//  Every piece of paper pulls its colour from this object by name
//  (e.g. PALETTE.navy).
//
//  Change the hex values below. Keep the SAME KEYS — the scenes reference
//  them by name. You can add new keys and use them from a scene file.
//
//  Lighting is a studio HDRI, so mid-saturation, slightly warm colours
//  read best as paper.
//
export const PALETTE = {
  // warm / reds
  red:        "#f2382f",
  vermilion:  "#ff5424", // UI accent colour (also set as --accent in index.html)
  tangerine:  "#ff8a1c",
  marigold:   "#ffb31c",
  lemon:      "#ffd93b",
  coral:      "#ff6f5e",
  brick:      "#c94a2c",
  terracotta: "#e5643b",

  // pinks / purples
  pink:   "#ff5c9d",
  rose:   "#ff9cbc",
  plum:   "#8f3fb8",
  violet: "#6d52ec",

  // blues
  cobalt: "#2556ef",
  sky:    "#52b7ff",
  aqua:   "#7fe3f0",
  navy:   "#1d2b6e",
  ink:    "#232a44",

  // greens
  teal:    "#11b3ad",
  mint:    "#62e0b4",
  emerald: "#1ea35b",
  leaf:    "#41bf4c",
  lime:    "#a6dc3a",
  forest:  "#16784a",

  // neutrals / paper
  cream: "#fff3dc",
  white: "#fffaf1",
  sand:  "#ffd9a2",
  brown: "#9b5b31",
  peach: "#ffb48a",
};

export default PALETTE;
