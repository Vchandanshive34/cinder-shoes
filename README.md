# Cinder 02

A scroll-driven product page for a fictional carbon-plate racing shoe, plus a
demonstration storefront. The landing page poses a single product photograph
against a generated backdrop; the storefront's product images are drawn from
parametric curves.

**Live:** https://vchandanshive34.github.io/cinder-shoes/

## What's here

```
index.html    the landing page — markup, styles, scroll choreography
assets/       the hero photograph, full size and a phone-sized variant
store.html    the storefront — product grid, filters, cart
.nojekyll     tells GitHub Pages to serve files as-is, skipping Jekyll
README.md     this file
```

## Two pages

`index.html` is the scroll-driven 3D landing page. `store.html` is a
demonstration storefront: working filters, sort, size selection, a cart drawer
that persists to `localStorage`, wishlist, and a light/dark toggle. There is no
checkout and no payment path — it's a front-end exercise, and the page says so
in three places.

Every product image on the storefront is an inline SVG generated from the same
parametric curve system as the 3D model. `gen_shoes.js` defines four lasts —
race flat, trainer, Chelsea boot, loafer — as sets of `bottom` / `stack` / `top`
control points, and emits three SVG paths each (sole, upper, accent band). The
storefront recolours those three paths per colourway, which is why twelve
products need zero image files.

There is **no WebGL and no 3D library**. The landing page is about 31 KB of
HTML/CSS/JS plus one 156 KB image. Google Fonts is the only external
dependency, and the page degrades to system fonts without it.

## Posing a photograph

A photograph can't rotate, so the hero is *posed* rather than turned. `KEYS` in
the inline script holds one entry per scroll chapter:

| Field | Meaning |
| --- | --- |
| `x` `y` | position, in percent of the image's own box |
| `sc` | scale |
| `rot` | in-plane rotation |
| `tilt` | `rotateY` under a 1400px perspective — the parallax that reads as depth |
| `call` | opacity of the annotated callout overlay |
| `atm` | backdrop intensity: glow, skyline, sparks, swirls |

Values are interpolated with smoothstep between chapters, then damped per frame,
so scrolling fast never snaps. Pointer position feeds a small parallax on top.

The backdrop is a single 2-D canvas: the dotted skyline is drawn once to an
offscreen canvas and blitted with a parallax offset, and ~150 sparks drift over
it. The orbiting arcs are three blurred SVG ellipses spun by CSS.

## The hero image

`assets/shoe.webp` was keyed out of a studio shot on white. A global
"remove all white" punches holes through the midsole, which is itself near-white
(min channel 249 against the background's 254), so the cutout instead takes only
near-pure-white pixels, labels connected regions, and drops the ones touching the
border. Three clean-up passes follow: dilate the background 3 px to eat the
anti-aliased rim, drop small foreground islands that were showing up as a dotted
outline, and cut below the outsole because the drop shadow is too close in value
to key cleanly. Edge pixels are then un-premultiplied against white
(`C_true = (C_obs - 255(1-a)) / a`) so the rim doesn't glow on a dark ground.

## How the shoe is built

The model is lofted from a set of one-dimensional profile curves, each
interpolated with a shape-preserving cubic (PCHIP) so the silhouette has no
ripples at the control points:

| Curve | What it describes |
| --- | --- |
| `zLat` / `zMed` | half-widths of the last, lateral and medial sides |
| `soleBottom` | the rocker — heel bevel and toe spring |
| `stack` | midsole thickness above the outsole rim |
| `topH` | height of the upper's top edge above the footbed |
| `throatW` | half-width of the ankle-and-lace opening |

Those drive `upperPoint(x, side, v)`, a parametric surface that runs from the
midsole edge at `v = 0` to the top edge at `v = 1`. Around the toe and heel the
top edge is the centreline ridge; between `THROAT_X0` and `THROAT_X1` it becomes
the collar rim, which is what makes the opening a real hole rather than a seam.
Everything else — collar binding, tongue, laces, heel counter, toe cap, side
blade — is placed by evaluating that same surface, so nothing can drift out of
register with the body.

Proportions are tuned against a real 270 mm last: 107 mm at the collar, a notch
at 78, roughly flat through the lace panel at 80 → 72, and the toe box falling
away to 51.

## Adding colourways

`WAYS` near the top of the landing page's script holds one entry per colourway,
each pointing at its own files:

```js
{ id:"ion", nm:"Ion Wash", code:"CND2-118",
  img:"assets/shoe-ion.webp", sm:"assets/shoe-ion-sm.webp", sw:["#C7D4E2","#E8EDF2"] }
```

Two of the three currently point at the Ember shot because only one photograph
exists. Drop more files into `assets/` and change `img` and `sm` — nothing else
moves. The hero cross-fades between them.

## Notes

- The page commits to a single dark theme by design and paints every colour
  explicitly, so it holds up regardless of the viewer's system theme.
- `prefers-reduced-motion` is respected: idle rotation, sparks, swirl spin and
  pointer parallax all stop, while scroll-driven posing stays (it's user-driven).
- If WebGL is unavailable or JavaScript is off, a flat SVG profile of the same
  shoe renders instead.
- This is a demo for a product that does not exist. Nothing on the page takes
  payment and no order is placed.
