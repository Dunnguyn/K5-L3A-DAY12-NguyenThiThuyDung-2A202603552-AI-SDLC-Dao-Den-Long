# Visual asset and rights inventory

| Asset | Source and location | Rights / distribution | Runtime load |
|---|---|---|---|
| Island ground, huts, bamboo, stones, flowers, bridge planks, tower details and banners | Original procedural Three.js geometry in `src/browser/decor.js` and `renderer.js` | Project-authored implementation code; no downloaded model | Bundled JavaScript |
| Ground moss and lamp paper maps | Deterministic `DataTexture` bytes generated in `src/browser/renderer.js` | Project-authored procedural texture; no source image | In memory, 64×64 and 32×32 RGBA |
| Mây mesh and animation | Original procedural geometry in `src/browser/character.js` | Project-authored implementation; VinUni exercise character rights remain outside the repository code license | Bundled JavaScript |
| Shade wisp, Drifter ribbons and paper lantern shape | Original procedural geometry in `src/browser/renderer.js` | Project-authored implementation; exercise character rights remain outside the code license | Bundled JavaScript |
| UI ornaments and panels | CSS in `src/browser/app.css` | Project-authored CSS | Bundled CSS |
| Three.js | npm dependency `three`, bundled by Vite | MIT; see `docs/licenses/three-MIT.txt` | Local bundle |

No separately downloaded GLB, texture, font, stock audio or external runtime CDN was used. The approved direction allowed licensed external assets, but this implementation uses a procedural fallback until a specific asset's redistribution rights can be verified. `CREDITS.md` already distinguishes original code from the lab premise and third-party software. No license claim is made over the exercise's characters or story.
