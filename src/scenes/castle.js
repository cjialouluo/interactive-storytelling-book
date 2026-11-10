// ════════════════════════════════════════════════════════════════════════
//  Lucia Valley scene
// ════════════════════════════════════════════════════════════════════════
//
//  Coordinate system of a gutter "v" strip panel:
//    x = 0 at the spine (centre)  →  grows toward the OUTER edge (~176)
//    y = 0 at the floor           →  grows UP the standing wall
//    Panel A pops up on the LEFT page, panel B on the RIGHT page.
//
//  Paper look: every panel/layer can carry { color2, pat:[type,scale,ang,str] }
//  which the engine renders as a two-tone printed pattern (1 stripes, 2 dots,
//  3 grid, 4/5 waves). We layer base → shade → highlight for depth.
//
import catUrl from "../pics/crown-cat.png";
import lambUrl from "../pics/luna-lamb.png";

export function buildCastle(api, base) {
    const { P, rect, circle, panel, layer, vstrip } = api;

    // ── primitive shape helpers (return raw [x,y] point arrays) ────────────
    const dome = (cx, baseY, w, h, n = 26) => {
        const p = [
            [cx - w / 2, baseY]
        ];
        for (let i = 0; i <= n; i++) {
            const t = i / n;
            p.push([cx - w / 2 + w * t, baseY + h * Math.sin(Math.PI * t)]);
        }
        p.push([cx + w / 2, baseY]);
        return p;
    };

    // a row of rounded lobes (bush / hill top)
    const scallop = (cx, baseY, w, h, bumps) => {
        const p = [
            [cx - w / 2, baseY]
        ];
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

    const cloud = (cx, cy, s) => {
        // fluffy top lobes; the underside is an uneven shallow arc
        const bumps = [
            [-2.0, -0.05, 0.85],
            [-1.15, 0.52, 1.2],
            [-0.2, 0.82, 1.5],
            [0.85, 0.62, 1.25],
            [1.8, 0.12, 0.95]
        ];
        const p = [];
        for (const [dx, dy, r] of bumps) {
            const bx = cx + dx * s,
                by = cy + dy * s;
            for (let a = 0; a <= 9; a++) {
                const ang = Math.PI - (Math.PI * a) / 9;
                p.push([bx + r * s * Math.cos(ang), by + r * s * Math.sin(ang)]);
            }
        }
        const [xR, yR] = p[p.length - 1];
        const [xL, yL] = p[0];
        const n = 26;
        for (let i = 1; i < n; i++) {
            const t = i / n; // 0 at the right tip, 1 at the left
            const x = xR + (xL - xR) * t;
            const yChord = yR + (yL - yR) * t;
            const dip =
                Math.sin(Math.PI * t) * 0.62 +
                Math.sin(Math.PI * t * 2.2 + 0.45) * 0.2 +
                Math.sin(Math.PI * t * 3.5) * 0.08;
            p.push([x, yChord - dip * s]);
        }
        return p;
    };

    const cloud2 = (cx, cy, s) => {
        // five lobes on top, three lobes along the bottom
        const bumps = [
            [-2.55, 0.2, 0.58],
            [-1.4, 0.48, 0.84],
            [-0.15, 0.72, 1.05],
            [1.1, 0.55, 0.9],
            [2.3, 0.32, 0.68]
        ];
        const yOther = (x, skip) => {
            let y = -Infinity;
            bumps.forEach(([dx, dy, r], i) => {
                if (i === skip) return;
                const d = x - (cx + dx * s),
                    rr = r * s;
                if (d * d <= rr * rr) y = Math.max(y, cy + dy * s + Math.sqrt(rr * rr - d * d));
            });
            return y;
        };
        const p = [];
        bumps.forEach(([dx, dy, r], i) => {
            for (let a = 0; a <= 16; a++) {
                const ang = Math.PI - (Math.PI * a) / 16;
                const x = cx + (dx + r * Math.cos(ang)) * s;
                const y = cy + (dy + r * Math.sin(ang)) * s;
                if (y >= yOther(x, i) - 0.015 * s) p.push([x, y]);
            }
        });
        // right, middle, left — outer two share the end lobes' side points
        const unders = [
            [1.83, 0.32, 1.15],
            [-0.05, 0.02, 1.28],
            [-2.03, 0.2, 1.1]
        ];
        const [xR] = p[p.length - 1];
        const [xL] = p[0];
        for (let i = 1; i < 48; i++) {
            const x = xR + (xL - xR) * (i / 48);
            let y = Infinity;
            for (const [dx, dy, r] of unders) {
                const d = x - (cx + dx * s),
                    rr = r * s;
                if (d * d <= rr * rr) y = Math.min(y, cy + dy * s - Math.sqrt(rr * rr - d * d));
            }
            if (y < Infinity) p.push([x, y]);
        }
        return p;
    };

    const tri = (a, b, c) => [a, b, c];
    const rrect = (cx, cy, w, h, ang) => {
        const c = Math.cos(ang),
            s = Math.sin(ang);
        return [
                [-w / 2, -h / 2],
                [w / 2, -h / 2],
                [w / 2, h / 2],
                [-w / 2, h / 2]
            ]
            .map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c]);
    };

    // wavy swallowtail pennant from a pole top at (x,y).
    // mirror flips the whole flag so the tail streams the other way.
    const pennant = (x, y, len, h, mirror = false) => {
        const n = 12;
        const dir = mirror ? -1 : 1;
        const wav = (t) => Math.sin(t * Math.PI * 2.0) * h * 0.22; // ripple
        const top = [],
            bot = [];
        for (let i = 0; i <= n; i++) {
            const t = i / n,
                px = x + dir * len * t;
            top.push([px, y + h * 0.5 + wav(t)]);
            bot.push([px, y - h * 0.5 + wav(t)]);
        }
        const notch = [x + dir * len * 0.82, y + wav(0.92)]; // forked tail
        const pts = [...top, notch, ...bot.reverse()];
        return mirror ? pts.reverse() : pts;
    };

    // Four trapezoid sails: narrow at the hub, a little wider at the tip.
    // r is the half-width at the root; the tip is wider. One outline, joined
    // only inside the hub so the sails stay separate.
    const fourSails = (cx, cy, R, r, skew) => {
        const r0 = 2.8;
        const w0 = r;
        const w1 = r * 2.35;
        const p = [];
        for (let k = 0; k < 4; k++) {
            const th = k * Math.PI / 2 + skew;
            const rx = Math.cos(th),
                ry = Math.sin(th);
            const px = -ry,
                py = rx;
            const at = (rad, w) => [cx + rx * rad + px * w, cy + ry * rad + py * w];
            p.push(at(r0, -w0), at(R, -w1), at(R, w1), at(r0, w0));
        }
        return p;
    };

    // arched opening / gate: rectangle with a rounded top
    const archRect = (x0, x1, baseY, topY) => {
        const cx = (x0 + x1) / 2,
            r = (x1 - x0) / 2;
        const p = [
            [x0, baseY],
            [x0, topY - r]
        ];
        for (let a = 0; a <= 12; a++) {
            const ang = Math.PI - (Math.PI * a) / 12;
            p.push([cx + r * Math.cos(ang), topY - r + r * Math.sin(ang)]);
        }
        p.push([x1, baseY]);
        return p;
    };

    // 5-petal bloom → array of petal outlines (+ caller adds a centre)
    const bloom = (cx, cy, r) => {
        const petals = [];
        for (let a = 0; a < 5; a++) {
            const ang = -Math.PI / 2 + (a * 2 * Math.PI) / 5;
            petals.push(circle(cx + r * 0.95 * Math.cos(ang), cy + r * 0.95 * Math.sin(ang), r * 0.6, 12));
        }
        return petals;
    };

    // ── hills (soft layered ranges) ────────────────────────────────────────
    const hills = () => [
        layer(P.plum, [dome(58, 0, 130, 58)], { z: 0.1, color2: P.violet, pat: [2, 9, 0, 0.3] }),
        layer(P.violet, [dome(150, 0, 150, 38)], { z: 0.15, color2: P.plum, pat: [2, 9, 0, 0.25] }),
        layer(P.emerald, [dome(44, 0, 170, 32)], { z: 0.35, color2: P.leaf, pat: [2, 6, 0, 0.35] }),
        layer(P.leaf, [dome(140, 0, 160, 28)], { z: 0.45, color2: P.lime, pat: [2, 6, 0, 0.35] }),
        layer(P.lime, [dome(96, 0, 130, 20)], { z: 0.7, color2: P.leaf, pat: [2, 5, 0, 0.3] }),
        // sunny highlight ridge along the big green hill
        layer(P.mint, [dome(96, 10, 110, 9)], { z: 0.75 }),
    ];

    const hills2 = () => [
        layer(P.violet, [dome(88, 0, 180, 68)], { z: 0.1, color2: P.violet, pat: [2, 9, 0, 0.3] }),
        layer(P.violet, [dome(150, 0, 150, 78)], { z: 0.15, color2: P.plum, pat: [2, 9, 0, 0.25] }),
        layer(P.leaf, [dome(64, 0, 200, 52)], { z: 0.35, color2: P.lime, pat: [2, 6, 0, 0.35] }),
        layer(P.leaf, [dome(150, 0, 160, 48)], { z: 0.45, color2: P.lime, pat: [2, 6, 0, 0.35] }),
        layer(P.lime, [dome(96, 0, 130, 20)], { z: 0.7, color2: P.leaf, pat: [2, 5, 0, 0.3] }),
        // sunny highlight ridge along the big green hill
        layer(P.mint, [dome(96, 10, 110, 9)], { z: 0.75 }),
    ];

    // ── castle (centre, mirrored across the spine) ─────────────────────────
    const castle = (side) => [
        layer(P.sand, [rect(0, 26, 52, 50)], { z: 1.9, color2: P.cream, pat: [1, 3, 0, 0.25] }), // curtain wall
        // crenellations on the wall
        layer(P.sand, [rect(4, 50, 10, 54), rect(16, 50, 22, 54), rect(28, 50, 34, 54), rect(40, 50, 46, 54)], { z: 1.92 }),
        layer(P.cream, [rect(0, 26, 18, 74)], { z: 2.0, color2: P.sand, pat: [1, 3, 0, 0.22] }), // central keep
        layer(P.cream, [rect(2, 74, 7, 78), rect(11, 74, 16, 78)], { z: 2.02 }), // keep crenellations
        layer(P.violet, [tri([0, 94], [18, 78], [0, 78])], { z: 2.05, color2: P.plum }), // keep roof (half → mirrors to peak)
        layer(P.cream, [rect(26, 26, 40, 64)], { z: 2.0, color2: P.sand, pat: [1, 3, 0, 0.22] }), // side tower
        layer(P.pink, [tri([26, 64], [40, 64], [33, 80])], { z: 2.05, color2: P.rose }), // side tower roof
        layer(P.marigold, archRect(5, 11, 36, 46).length ? [archRect(5, 11, 46, 56), archRect(30, 36, 36, 46)] : [], { z: 2.1 }), // arched windows
        layer(P.plum, [archRect(1, 11, 26, 40)], { z: 2.15 }), // central gate
        layer(P.lemon, [archRect(2.5, 9.5, 26, 37)], { z: 2.17, color2: P.marigold }), // gate inner
        // wavy swallowtail flags on thin poles
        layer(P.cream, [rect(0.3, 78, 1.1, 103), rect(32.6, 80, 33.4, 95)], { z: 2.2 }), // poles
        layer(P.lemon, (side === "B" ? [pennant(1.1, 99, 14, 7, false), pennant(33.4, 91, 9, 6, false)] : [pennant(33.4, 91, 9, 6, true)]), { z: 2.22, color2: P.marigold, pat: [1, 2.2, 0, 0.35] }),
    ];

    // ── windmill (left page only) — sails spin when dragged ────────────────
    const windmill = (cx, baseY) => {
        const hubY = baseY + 38;
        return [
            layer(P.cream, [
                [
                    [cx - 15, baseY],
                    [cx + 15, baseY],
                    [cx + 10, baseY + 30],
                    [cx - 10, baseY + 30]
                ]
            ], { z: 1.5, color2: P.sand, pat: [1, 3, 0, 0.25] }),
            layer(P.plum, [tri([cx - 13, baseY + 30], [cx + 13, baseY + 30], [cx, baseY + 46])], { z: 1.68, color2: P.violet }),
            layer(P.marigold, [archRect(cx - 4.5, cx + 4.5, baseY + 2, baseY + 14)], { z: 1.58, color2: P.lemon }), // door
            layer(P.lemon, [circle(cx, baseY + 22, 4, 16)], { z: 1.58, color2: P.marigold }), // round window
            // ↻ rotating sails (grab and drag to spin)
            {
                color: P.violet,
                z: 2.15, // in front of the roof (z 1.98); higher z draws closer
                color2: P.cream,
                pat: [1, 2.6, 0.35, 0.5],
                hint: { text: "Drag the sails to spin" },
                spin: { center: [cx, hubY], disc: fourSails(cx, hubY, 22, 2.3, 0.32), holes: [], layers: [], hangers: [] },
            },
            layer(P.marigold, [circle(cx, hubY, 3.4, 14)], { z: 2.22 }), // hub stays on top of the sails
        ];
    };

    const sun = (cx, cy) => [
        layer(P.marigold, [circle(cx, cy, 26, 28)], { z: 0.05 }),
        layer(P.lemon, [circle(cx, cy, 19.5, 24)], { z: 0.08, color2: P.marigold, pat: [2, 4, 0, 0.3] }),
    ];

    // ── pine trees (3 tiers) ───────────────────────────────────────────────
    const pine = (cx, baseY, h) => {
        const w = h * 0.64;
        const tiers = [];
        for (let k = 0; k < 3; k++) {
            const y0 = baseY + k * h * 0.26,
                y1 = y0 + h * 0.46,
                ww = w * (1 - k * 0.24);
            tiers.push(tri([cx - ww / 2, y0], [cx + ww / 2, y0], [cx, y1]));
        }
        return tiers;
    };
    const treeLayers = (cx, baseY, h, z) => [
        layer(P.brown, [rect(cx - 1.6, baseY - 1, cx + 1.6, baseY + h * 0.14)], { z }),
        layer(P.forest, pine(cx, baseY, h), { z: z + 0.05, color2: P.emerald, pat: [2, 4, 0, 0.3] }),
        layer(P.emerald, pine(cx, baseY + h * 0.05, h * 0.82), { z: z + 0.1 }),
    ];

    // ── bush row (base silhouette + shade + highlight + dots) ──────────────
    const bushLayers = (cx, w, h, tone, hi) => [
        layer(tone, [scallop(cx, 0, w, h * 0.72, Math.max(3, Math.round(w / 26)))], { z: 0.12 }),
        layer(hi, [scallop(cx, h * 0.22, w * 0.82, h * 0.5, Math.max(3, Math.round(w / 30)))], { z: 0.3 }),
    ];

    // ── flowers scattered on a strip ───────────────────────────────────────
    const flowersLayers = (spots) => {
        const out = [];
        for (const [x, y, r, pc, cc] of spots) {
            out.push(layer(pc, bloom(x, y, r), { z: 0.9 }));
            out.push(layer(cc, [circle(x, y, r * 0.5, 12)], { z: 0.95 }));
        }
        return out;
    };

    // ── backdrop panel ─────────────────────────────────────────────────────
    const backdrop = (side) => {
        const L = [
            ...castle(side),
        ];
        if (side === "A") L.push(...windmill(116, 3), ...hills(),
            layer(P.white, [cloud(145, 85, 6), cloud2(75, 100, 8.5)], { z: 3.0, color2: P.cream, pat: [2, 7, 0, 0.18] }), );
        if (side === "B") L.push(...sun(122, 74), ...hills2());
        return panel(P.sky, rect(0, 0, 176, 124), [], L, { color2: "#8fd0ff", pat: [2, 26, 0, 0.14] });
    };

    // ── midground: green ridge + pine trees ────────────────────────────────
    const ridge = (side) =>
        panel(P.emerald, scallop(84, 0, 184, 34, 8), [], [
            layer(P.leaf, [scallop(70, 0, 150, 24, 6)], { z: 0.25, color2: P.lime, pat: [2, 5, 0, 0.3] }),
            ...(side === "A" ? [...treeLayers(154, 4, 52, 0.4), ...treeLayers(132, 6, 38, 0.38)] : [...treeLayers(138, 4, 78, 0.4), ...treeLayers(102, 6, 48, 0.38)]),
        ], { color2: P.leaf, pat: [2, 6, 0, 0.35] });

    // ── foreground: bushes + flowers (+ fence on the right page) ───────────
    const front = (side) => {
        const L = [
            ...bushLayers(60, 150, 30, P.emerald, P.leaf),
            ...bushLayers(130, 110, 26, P.leaf, P.lime),
            ...flowersLayers([
                [28, 26, 4.2, P.pink, P.lemon],
                [52, 22, 3.6, P.lemon, P.marigold],
                [96, 24, 4.0, P.rose, P.lemon],
                [122, 20, 3.4, P.pink, P.marigold],
            ]),
        ];
        if (side === "B")
            L.push(layer(P.cream, [
                rect(128, 0, 132, 22), rect(146, 0, 150, 22), rect(164, 0, 168, 22),
                rect(124, 13, 170, 17),
            ], { z: 1.0, color2: P.sand }));
        return panel(P.leaf, scallop(84, 0, 184, 36, 8), [], L, { color2: P.lime, pat: [2, 6, 0, 0.3] });
    };

    // ── bridge: yellow arch over the spine ─────────────────────────────────
    const archBand = (R, H, t) => {
        const outer = [],
            inner = [];
        const steps = 22;
        for (let i = 0; i <= steps; i++) {
            const a = (Math.PI / 2) * (i / steps);
            outer.push([R * Math.sin(a), H * Math.cos(a)]);
            inner.push([(R - t) * Math.sin(a), (H - t) * Math.cos(a)]);
        }
        return [...outer, ...inner.reverse()];
    };
    const bridge = () => {
        const p = panel(P.marigold, archBand(56, 30, 11), [], [
            layer(P.lemon, [archBand(53, 27, 4.5)], { z: 0.3, color2: P.marigold, pat: [1, 2.4, Math.PI / 2, 0.4] }),
        ], { color2: P.lemon, pat: [1, 3, 0, 0.25] });
        return vstrip("bridge", 50, p, p);
    };

    // ── characters (lamb left, crown cat right) ────────────────────────────
    const card = (x0, x1, y1, img, hint) =>
        panel(P.cream, rect(x0, 0, x1, y1), [], [], img ? { image: img, imageScale: 1, hideCard: true, hint } : {});
    const couple = vstrip("luciaPair", 76,
        card(22, 86, 60, lambUrl, { icon: "🐑", text: "“Welcome to Lucia's Valley! Let's go to the castle together~”" }),
        card(22, 86, 60, catUrl, { icon: "👑", text: "“This valley is under my protection.”" }));

    return {
        name: base.name,
        thickness: base.thickness,
        pieces: [
            ...base.pieces.slice(0, 4), // floor, path, and the page itself
            vstrip("backdrop", -24, backdrop("A"), backdrop("B")),
            vstrip("ridgeRow", 8, ridge("A"), ridge("B")),
            vstrip("bushRow", 40, front("A"), front("B")),
            bridge(),
            couple,
        ],
    };
}