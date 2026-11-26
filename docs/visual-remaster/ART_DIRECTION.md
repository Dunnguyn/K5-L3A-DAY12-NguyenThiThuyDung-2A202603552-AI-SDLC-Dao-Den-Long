# Premium visual remaster — art direction

**Approved statement:** “A premium stylized Vietnamese fantasy world of floating islands, warm lantern lights, bamboo villages, soft moonlit clouds and expressive characters. Cinematic but readable, magical but grounded in Vietnamese visual identity.”

## Visual grammar implemented

- **Night 1, Đảo Bến:** a gentle riverside landing, stilted thatch houses, mooring posts, clustered grass, warm paper lamps and low cloud silhouettes. The dock stays inside the original disk; none of these meshes changes collision.
- **Night 2, Đảo Cau:** two distinct bamboo groves, extra bamboo planks on the exact existing bridge, wind-reactive cloth markers and clear jump pads. Cloth animation reads Core wind state; it never applies force.
- **Night 3, Đảo Chuông:** moss-toned stones, a more legible bell tower, narrow decorative wood ribs, terrace stones and banners. The decorative tower pieces add no climbable surface or stairs.
- **Mây:** natural stylized proportions, cream linen silhouette, nón lá, red scarf, woven satchel, belt lantern and face detail. Walk, air, dash and idle motion read the Core player snapshot. No root motion is applied.
- **Threat and light:** Shade gains a pooled ink wisp silhouette; paper lamps have bamboo caps, a procedural paper map and retain fuel/safe/out/partial indicators. The distinguishable palette remains active.
- **UI:** warm paper and brass accents on restrained midnight panels; serif display title and readable system body text. Existing 18 px minimum and ×1.25 large-text preference remain in effect.

## Technical constraints

The scene uses the same `src/data/worlds.js` descriptors and Shared Core states. Procedural placement is deterministic and visual-only. Repeated grass, stone, flowers and bamboo use `InstancedMesh`; static decorative geometry is merged by material. There are no new dynamic lights, collider meshes, external network assets or source-of-truth map changes. The standard benchmark renders the same upgraded Night 1 visuals as gameplay, with its required 200 moving Shades and 100 motes.

The phase-1–4 tags, v1.0.0 Release and existing proof remain untouched. P4-SOAK-03 remains FAIL.
