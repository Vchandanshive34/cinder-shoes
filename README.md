# Cinder · 02 — 3D scroll-animated shoe landing page

A single-page site with a sticky, scroll-driven 3D shoe rendered in
[three.js](https://threejs.org). The shoe — sole, midsole, upper, eyelets,
laces, heel tab — is an original model built entirely from code in
`js/shoe.js` (no external `.glb`/`.obj` files), so there's nothing to
license or attribute.

## Structure

```
.
├── index.html        # markup + copy for the 4 sections
├── css/
│   └── style.css      # layout, type, color tokens
├── js/
│   ├── shoe.js         # procedural shoe geometry (the "model")
│   └── main.js         # scene, lighting, scroll-to-animation logic
├── package.json
└── .gitignore
```

## Run it locally

No build step — it's static HTML/CSS/JS and loads three.js from a CDN.

```bash
# option 1: just open it
open index.html

# option 2: serve it (recommended, avoids CORS quirks in some browsers)
npm start
# then visit http://localhost:5500
```

## Push to GitHub

```bash
cd cinder-shoe-hero
git init
git add .
git commit -m "Initial commit: Cinder · 02 scroll hero"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## Deploy (optional)

Since it's fully static, GitHub Pages works out of the box:

1. Push to GitHub (above).
2. Repo → **Settings → Pages** → Source: `main` branch, `/ (root)`.
3. Your page will be live at `https://<your-username>.github.io/<your-repo>/`.

## Customizing

- **Shoe shape/colors** — edit `js/shoe.js`. The sole silhouette is a 2D
  `THREE.Shape` (see `soleFootprint`) that gets extruded and lofted, so
  changing the curve points reshapes the whole sole.
- **Scroll keyframes** — edit the `keyframes` array in `js/main.js` to
  change how the shoe rotates/moves at each section.
- **Copy/sections** — edit `index.html`; add or remove `<section>` blocks
  and extend the `keyframes` array to match.
