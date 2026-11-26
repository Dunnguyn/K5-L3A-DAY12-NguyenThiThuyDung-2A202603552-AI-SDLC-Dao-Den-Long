# Credits and rights

- **Premise and characters:** Đảo Đèn Lồng, Mây, Bóng Mực and the lab scenario originate from the VinUni AI SDLC Day 12 exercise. Their rights are not granted by this repository's MIT code license.
- **Implementation and visual assets:** Three.js geometry, materials, UI and textures in this repository were authored for the project with Codex assistance. No separately downloaded model, stock texture, font or music asset was identified in the current source inventory.
- **Post-release visual remaster work:** Procedural huts, bamboo, tower detail, ground and paper textures, Mây mesh, Shade wisps and UI ornaments are authored in `src/browser/decor.js`, `character.js`, `renderer.js` and `app.css`. No external art file or runtime CDN was added. See `docs/visual-remaster/ASSET_INVENTORY.md` for file-by-file scope; this work is not part of the existing v1.0.0 Release asset.
- **Audio:** Browser audio is synthesized in code with Web Audio. No external sound file is bundled.
- **Third-party software:** Three.js (MIT) is bundled into the built browser asset. Vite (MIT), Vitest (MIT) and Playwright (Apache-2.0) are development/build/test tools and are not copied as node_modules into the distribution ZIP. The full Three.js MIT notice is bundled as three-MIT.txt in the ZIP and stored at docs/licenses/three-MIT.txt. See package-lock.json and each upstream package's license for transitive notices.
- **AI:** OpenAI Codex assisted with code, tests, documentation and evidence review. AI generated work was reviewed through the recorded commands and tests.

The existing LICENSE applies to original implementation code. It does not relicense the lab brief, premise or characters. No right to license third-party material beyond its original terms is asserted.
