// ════════════════════════════════════════════════════════════════════════
//  BOOK — the physical book: its cover and its body (cloth, pages, ribbon).
// ════════════════════════════════════════════════════════════════════════
//
//  This is the editable "art layer" for the book itself (page 0, the closed
//  cover you see first). Change the text, colours and the die-cut window here;
//  the engine reads these values when it builds the cover and the body.
//
//  cover
//    • title / subtitle / footer – the embossed wording on the front
//    • cloth   – cover fabric colour (hex)
//    • foil    – colour of the embossed title + frame (hex)
//    • window  – the die-cut "window" on the front:
//        · w, h  – its size
//        · image – OPTIONAL. Import a PNG/SVG at the top of this file and set
//                  it here to drop a picture into the window. When null, the
//                  engine draws its built-in paper illustration instead.
//        · crop  – OPTIONAL. Show only the CENTRE of the image (zoom in).
//                  A number 0–1 (e.g. 0.7 = keep the middle 70%), or an
//                  object { x, y } to crop width/height independently.
//                  Omit or set to 1 / null to show the whole image.
//
//  body
//    • pageEdge – colour of the stacked page edges (hex)
//    • ribbon   – colour of the ribbon bookmark (hex)
//
//  Example window image:
//    import windowArt from "../pics/your-cover-art.png";
//    ... window: { w: 132, h: 150, image: windowArt }

import windowArt from "../pics/cover.jpg";

export const BOOK = {
    cover: {
        title: "Lucia's Valley",
        subtitle: "F A N T A S T I C   S T O R I E S",
        footer: "L U C I A ' S   V A L L E Y",
        cloth: "#1a5f22",
        foil: "#e8bf6a",
        window: {
            w: 152,
            h: 160,
            image: windowArt,
            crop: 0.8,
        },
    },
    body: {
        pageEdge: "#e9c87a",
        ribbon: "#1e5551",
    },
};

export default BOOK;
