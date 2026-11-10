// ════════════════════════════════════════════════════════════════════════
//  DESK — the wooden table the book sits on, plus the room backdrop.
// ════════════════════════════════════════════════════════════════════════
//
//  This is the editable "art layer" for the surface under the book. The engine
//  paints a procedural wood grain from the three tones below (no image file),
//  so re-skinning the desk is just a matter of changing numbers here.
//
//    • base       – main plank colour            [r, g, b]  (0–255)
//    • grainLight – bright streaks in the grain   [r, g, b]
//    • grainDark  – dark grooves between planks   [r, g, b]
//    • ambient    – room background + fog tint behind the book (hex string)
//    • size       – texture resolution; bigger px = crisper grain, slower load
//
//  Change the numbers below to recolour the table.

export const DESK = {
    // Deep walnut / rosewood with HIGH grain contrast, so the planks read as
    // rich figured wood instead of flat beige. The dark ambient turns the room
    // into a moody spotlight stage that makes the book pop as the hero object.
    base: [82, 56, 42],
    grainLight: [138, 100, 72],
    grainDark: [42, 27, 20],
    ambient: "#181009",
    size: { W: 1400, H: 800, px: 1.3 },
};

export default DESK;
