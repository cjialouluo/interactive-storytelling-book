// Scene 1 — Clocktower Square.
//
// Two ways a card is made here:
//   1) Image card — card(x0, x1, y1, img, scale, hint)
//      A transparent PNG, cut out by its alpha, on a hidden paper card.
//      Swap an import below for your own PNG.
//   2) Drawn card — panel() / layer() with shapes, no texture.
//      Garland, lamps, bushes, flowers.
//
// On a fold-up strip, x = 0 is the spine and grows outward (~176).
// y = 0 is the floor and grows up.
// Panel A is the left page (mirrored). Panel B is the right page.
// `at` is depth: a bigger number stands closer to the reader.

// Swap any of these for your own transparent PNG.
import clocktowerLUrl from "../pics/placeholders/clocktowerL.png";
import clocktowerRUrl from "../pics/placeholders/clocktowerR.png";
import housesUrl from "../pics/placeholders/houses1.png";
import bakeryUrl from "../pics/placeholders/bakery.png";
import signpostUrl from "../pics/placeholders/signpost.png";
import wantedUrl from "../pics/placeholders/wanted.png";
import crateUrl from "../pics/placeholders/crate.png";
import barrelUrl from "../pics/placeholders/barrel.png";
import raccoonUrl from "../pics/placeholders/raccoon.png";
import rabbitUrl from "../pics/placeholders/rabbit.png";
import blankUrl from "../pics/placeholders/blank.svg";

export function buildSquare(api, base) {
    const { P, shape, rect, circle, panel, layer, vstrip, flat } = api;
    const K = shape; // ensure correct winding on hand-made outlines

    // ── primitive paper shapes (raw [x,y] point arrays) ───────────────────
    const tri = (a, b, c) => [a, b, c];

    // a row of rounded lobes (bush / hill top)
    const scallop = (cx, baseY, w, h, bumps) => {
        const p = [[cx - w / 2, baseY]];
        const r = w / (2 * bumps);
        for (let b = 0; b < bumps; b++) {
            const bx = cx - w / 2 + (2 * b + 1) * r;
            const bh = h * (0.82 + 0.18 * Math.sin(b * 1.7));
            for (let a = 0; a <= 9; a++) {
                const ang = Math.PI - (Math.PI * a) / 9;
                p.push([bx + r * 1.08 * Math.cos(ang), baseY + bh * 0.45 + r * 1.25 * Math.sin(ang)]);
            }
        }
        p.push([cx + w / 2, baseY]);
        return p;
    };

    // 5-petal bloom → array of petal outlines (caller adds a centre dot)
    const bloom = (cx, cy, r) => {
        const petals = [];
        for (let a = 0; a < 5; a++) {
            const ang = -Math.PI / 2 + (a * 2 * Math.PI) / 5;
            petals.push(circle(cx + r * 0.95 * Math.cos(ang), cy + r * 0.95 * Math.sin(ang), r * 0.6, 12));
        }
        return petals;
    };

    // ══════════════════════════════════════════════════════════════════════
    //  IMAGE CARDS — a transparent PNG stood up on a hidden paper card.
    //  Same helper as the lamb and the cat in castle.js.
    // ══════════════════════════════════════════════════════════════════════
    const card = (x0, x1, y1, img, scale, hint) =>
        panel(P.cream, rect(x0, 0, x1, y1), [], [],
            img ? { image: img, imageScale: scale ?? 1, hideCard: true, hint } : {});

    // a totally transparent card, used to fill the opposite page of a one-sided row
    const blank = () => card(40, 60, 20, blankUrl, 1, null);

    // ══════════════════════════════════════════════════════════════════════
    //  PAPER CARDS — procedurally drawn (no image textures)
    // ══════════════════════════════════════════════════════════════════════

    // ── aerial bunting garland (folds with the pages) ──
    //  A "par" (parallel-fold) banner strung high across the gutter: it hangs
    //  from an invisible rig's apex and drapes FORWARD over the square, so it
    //  folds outward as the book opens instead of lying flat on a backdrop.
    //  Local strip frame: Y = 0..len runs along the cord; pennants hang toward
    //  X = 0.
    const buntingCols = [P.red, P.lemon, P.cobalt, P.pink, P.leaf, P.tangerine, P.violet, P.sky];
    const buntingStrip = (len, off) => {
        const flags = [];
        const n = Math.floor((len - 2) / 5.2);
        for (let r = 0; r < n; r++) {
            const a = 2 + r * 5.2;
            flags.push(K(tri([6.5, a], [6.5, a + 4.4], [0.6, a + 2.2])));
        }
        const cord = K([[6.5, 0], [7.1, 0], [7.1, len], [6.5, len]]);
        return panel(P.navy, cord, [],
            buntingCols
                .map((c, a) => layer(c, flags.filter((o, l) => (l + off) % buntingCols.length === a),
                    { z: 0.02, color2: P.cream, pat: [2, 2.2, 0, 0.3] }))
                .filter((x) => x.outlines.length));
    };
    // an invisible v-strip whose apex (garlandRig.AB) the banners hang from.
    // It renders nothing; the garlands below are hinged on it.
    const garlandRig = {
        id: "garlandRig", type: "v", hinge: "gutter", at: -90, phi: api.deg(40), dir: 1,
        panels: { A: blank(), B: blank() },
    };
    const garland = (id, along0, drop, len, off) => ({
        id, type: "par", hinge: "garlandRig.AB",
        along: [along0, along0 + 8], d1: drop, d2: drop, a: len, b: len, close: "fold",
        panels: { A: buntingStrip(len, off), B: buntingStrip(len, off + 3) },
    });

    // ── bushes + scattered flowers along the front lawn ───────────────────
    const flowersLayers = (spots) => {
        const out = [];
        for (const [x, y, r, pc, cc] of spots) {
            out.push(layer(pc, bloom(x, y, r), { z: 1.5 }));
            out.push(layer(cc, [circle(x, y, r * 0.5, 12)], { z: 1.55 }));
        }
        return out;
    };
    // Lower clumps along the sides (not a tall wall), so the standees' feet show
    // and read like the scattered bushes in the concept art.
    const greens = (side) =>
        panel(P.leaf, scallop(84, 0, 184, 20, 8), [], [
            layer(P.emerald, [scallop(54, 0, 96, 17, 5)], { z: 0.2, color2: P.leaf, pat: [2, 6, 0, 0.3] }),
            layer(P.lime, [scallop(132, 0, 78, 15, 5)], { z: 0.22, color2: P.leaf, pat: [2, 6, 0, 0.3] }),
            ...flowersLayers(side === "A"
                ? [[30, 13, 3.4, P.pink, P.lemon], [58, 11, 3.0, P.lemon, P.marigold], [96, 12, 3.2, P.rose, P.lemon]]
                : [[36, 12, 3.2, P.violet, P.lemon], [78, 13, 3.4, P.pink, P.marigold], [120, 11, 3.0, P.lemon, P.tangerine]]),
        ], { color2: P.lime, pat: [2, 6, 0, 0.3] });

    // ── ornate lamp post (canvas-drawn): post + flared lantern + glow ─────
    const lampPost = (cx) => K([
        [cx - 1.6, 0], [cx + 1.6, 0], [cx + 1.6, 40], [cx + 4.4, 42], [cx + 5.4, 48],
        [cx + 4.2, 54], [cx + 3.0, 55], [cx + 3.6, 58], [cx - 3.6, 58], [cx - 3.0, 55],
        [cx - 4.2, 54], [cx - 5.4, 48], [cx - 4.4, 42], [cx - 1.6, 40],
    ]);
    const lamp = (cx) =>
        panel(P.ink, lampPost(cx), [], [
            layer(P.lemon, [circle(cx, 49, 3.6, 14)], { z: 0.12, color2: P.marigold, pat: [2, 2.2, 0, 0.3] }), // glowing globe
            layer(P.navy, [rect(cx - 1.0, 0, cx + 1.0, 38)], { z: 0.05 }), // post highlight
            layer(P.marigold, [tri([cx - 3.6, 58], [cx + 3.6, 58], [cx, 62])], { z: 0.14 }), // little finial
        ], { color2: P.navy, pat: [1, 3, 0, 0.2] });

    // ── confetti on the page floor ─────────────────────────────────────────
    //  Flat scraps lying on the page: tiny discs and rectangles, one thin
    //  sheet per colour.
    const confetti = (side) => {
        let seed = side === "L" ? 5 : 9;
        const rand = () => (seed = seed * 1664525 + 1013904223 >>> 0) / 4294967296;
        const colors = [P.red, P.lemon, P.cobalt, P.pink, P.leaf, P.tangerine, P.violet, P.aqua];
        const bins = colors.map(() => []);
        for (let i = 0; i < 90; i++) {
            const x = -10 + rand() * 146;
            const y = 22 + rand() * 120;
            if (y > 150) continue;
            const c = Math.floor(rand() * colors.length);
            bins[c].push(rand() < 0.5
                ? K(circle(x, y, 1 + rand() * 0.8, 10))
                : K(rect(x, y, x + 2.2, y + 1.1)));
        }
        return colors.map((color, i) => flat(`sqConf${side}${i}`, side,
            bins[i][0] || K(circle(0, 30, 0.5, 6)), {
                color,
                layers: [layer(color, bins[i].slice(1), { z: 0, th: 0.3 })],
            }));
    };

    // ── paw-print decals pressed into the plaza floor ─────────────────────
    const paws = (side) => {
        const spots = side === "A" ? [[70, 10], [84, 16], [98, 12]] : [[66, 14], [80, 10], [96, 16]];
        const L = [];
        for (const [x, y] of spots) {
            L.push(layer(P.plum, [circle(x, y, 2.0, 10)], { z: 1.0 }));
            L.push(layer(P.plum, [circle(x - 2.4, y + 2.2, 0.9, 8), circle(x, y + 3.0, 0.9, 8), circle(x + 2.4, y + 2.2, 0.9, 8)], { z: 1.0 }));
        }
        return panel(P.cream, rect(60, 0, 110, 22), [], L, { hideCard: true });
    };

    // ══════════════════════════════════════════════════════════════════════
    //  ASSEMBLE — keep the floor, then stack the cards back to front
    // ══════════════════════════════════════════════════════════════════════
    return {
        name: base.name,
        thickness: base.thickness,
        pieces: [
            ...base.pieces.slice(0, 4), // plaza and path
            ...confetti("L"),
            ...confetti("R"),

            // — no sky paper; the town stands on the open page —

            // — invisible rig the garland hangs from (must come before the banners) —
            garlandRig,

            // — townscape (image cards): houses sit behind, filling each page —
            vstrip("houses", -44,
                card(25, 110, 44, housesUrl, 1.5, null),
                card(25, 120, 58, housesUrl, 1.2, null)),

            // — CLOCKTOWER: the centrepiece, split down the spine so it FOLDS
            //   with the pages. The PNG was sliced in
            //   half: the LEFT half (pre-flipped to cancel the left page's mirror)
            //   rides page A anchored at the gutter (x0=0) extending left; the
            //   RIGHT half rides page B extending right. Together they stand as
            //   one tower centred on the spine and crease shut when the book
            //   closes. Each half card = 42 wide × 92 tall (full ≈ 84×92, ar .91).
            vstrip("clocktower", -44,
                card(0, 46, 122, clocktowerLUrl, 1, null),
                card(0, 46, 122, clocktowerRUrl, 1, null)),

            // — aerial bunting: two strands draped across & folding with the pages —
            garland("bunting1", 36, 96, 62, 0),
            garland("bunting2", 34, 132, 86, 2),

            // — bakery (LEFT, large & forward-left; the PNG carries its own
            //   rose arch + lamp) and the carrot signpost (RIGHT, at the edge) —
            vstrip("shopRow",-10,
                card(86, 170, 74, bakeryUrl, 1, { icon: "🍰", text: "The valley's signature sweets, fresh from the oven." }),
                card(100, 140, 70, signpostUrl, 1, { icon: "🥕", text: "This way to the carrot market." })),

            // — drawn paper lawn + lamps (mid-left on A, far-right on B;
            //   the bakery already brings its own lamp on the far left) —
            vstrip("greens", 20, greens("A"), greens("B")),
            vstrip("lamps", 16, lamp(88), lamp(90)),

            // — Officer Naya: RIGHT page, pushed further right of the tower —
            vstrip("rabbit", 40, blank(),
                card(40, 100, 64, rabbitUrl, 1.1, { icon: "🐰", text: "“Not so fast! Officer Naya is always one step ahead.”" })),

            // — street props: WANTED easel front-left (by the bakery/raccoon),
            //   carrot crate front-right —
            vstrip("props", 36,
                card(94, 128, 32, wantedUrl, 1, { icon: "📋", text: "WANTED: one very clever raccoon." }),
                card(98, 150, 50, crateUrl, 1, null)),

            // — the raccoon thief: LEFT page, well forward & near the spine so he
            //   reads as the central hero at a clearly closer depth than Naya —
            vstrip("raccoon", 80,
                card(20, 88, 64, raccoonUrl, 1.1, { icon: "🦝", text: "“Just borrowing a few sweets… no one will notice!”" }),
                blank()),

            // — paw prints pressed into the floor (drawn decal) —
            paws("A"),
        ],
    };
}
