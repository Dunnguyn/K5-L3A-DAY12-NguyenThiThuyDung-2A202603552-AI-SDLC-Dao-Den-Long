# Test Contract migration v1.1 -> v1.2

**Core/Headless known v1.2 delta implemented; see current verification in phase-3.md.** Ticket-03 section 7 supplies a known delta, not the missing official v1.0 schema. D below means published requirement; P identifies the internal policy approved through [ADR approval](../decisions/ADR-phase-3-lantern-fuel.md).

## Tuning and behavior

| Path / rule | v1.1 actual | v1.2 expected | Source |
|---|---|---|---|
| contract_version | 1.1 | "1.2" | D section 7 |
| tuning.fuel_max | Absent | 100 | D |
| tuning.fuel_decay_per_s | Absent | 1.0 | D |
| tuning.fuel_per_mote | Absent | 10 | D |
| tuning.relight_cost | Absent | 5 | D |
| tuning.win_ratio | Absent | 0.6 | D |
| tuning.drain_per_s | Absent | 5 | D |
| tuning.low_fuel_threshold | Absent | 30 | D |
| tuning.capacity_max | Absent | 20 | D |
| tuning.night1_duration_s | 300 | 240 | D |
| tuning.night2_duration_s | 330 | 270 | D |
| tuning.night3_duration_s | 360 | 300 | D |
| Internal firefly_score | 10 | 5 per mote, including refuel | Behavior D section 5; official base key semantics unverified |
| Internal lantern_score / pulse_score / win_flame_bonus | 100 / 5 / 50 | Retain first-light 100, normal pulse 5, flame 50; add relight 40, draining-target pulse total 15, dawn lamp 50 | Behavior D; private constant names are not new official keys |
| Internal win_time_score_multiplier | 2 | Time bonus removed; retire or explicitly leave unused | Behavior D; official base key removal unspecified |
| Internal firefly_capacity / lantern_cost | 10 / 10 | Base capacity 10; first-light cost 10; these no longer mean maximum capacity or every ignition cost | D sections 1,4 |
| Maps, movement, pulse range/cost/timers, spawn caps | Ticket-02 | Unchanged unless explicitly replaced | Inherited |

Do not change RNG, seed, existing position/velocity/TTL names, CLI envelope or unrelated snapshot cadence. Manifest version 1.2 and local wrapper `internal-draft-1` are different concepts; no inferred official scenario-version change.

## Snapshot

| Local path | Known change | Validation / open policy |
|---|---|---|
| lanterns[].lit, progress, id, pos | Retain; lit can become false again | D: out clears business deposited. P: retain existing progress name; cost now 10 or 5 |
| lanterns[].fuel | New numeric field, one decimal; off = 0 | Finite, 0..100. A8 distinguishes numeric rounding from lexical "100.0"; do not expose private F60 as an invented official field |
| lanterns[].ever_lit | New Boolean | Remains true after out. P: fresh false, ignition true; reject null/wrong type |
| lanterns[].relit_count | New count | P: initial 0, nonnegative safe integer, increment on actual relight; no published scenario override |
| player.capacity | New derived field | min(20,10+2*successful_lights); values 10,12,14,16,18,20. Validate bag against current capacity. Snapshot successful_lights is not published |
| shades[].state | Add drain | Preserve spawning/wander/chase/recoil/stunned; do not add drain to Drifter enum |
| Other required arrays and tick/sim_tick fields | Preserve v1.1 | No dropped arrays or changed clock semantics |
| Local state.end_reason | Replace winning victory with dawn_survived | Official delta retires all_lit; losses remain dawn/no_flames |
| events | Existing known forms plus table below | Official base envelope remains unverified |

Raw fuel, not rounded snapshot fuel, drives safety, eligibility and dawn floor. Snapshot 30.0 may be unsafe; snapshot 100 may be eligible for refuel. Validators must not invent an extra successful_lights snapshot requirement.

## Scenario

| Addition | Published default | Approved internal policy |
|---|---|---|
| Lamp lit/fuel/ever_lit | **lit=true with omitted fuel -> 100** | A5: local scenario.lanterns merges canonical IDs; retain 5/6/7 map lamps, [] does not delete them; reject unknown/duplicate IDs |
| Other lamp defaults and consistency | Unspecified | A4: off fuel 0; ever_lit defaults to lit; reject lit with zero fuel, off with positive fuel, lit with ever_lit=false; no synthetic runtime lighting events |
| player.successful_lights | Reset each night; pre-lit lamps excluded | P: omitted 0; nonnegative safe integer; normalize before bag validation; capacity derived, no unpublished direct override |
| shades[].target_lantern_id | Unspecified | A5: known canonical ID required for initial drain; optional/null otherwise. A pre-AI fixture may place player nearby |
| Fuel precision | Unspecified real input | A4: F60 lattice restriction requires explicit approval and conversion tolerance; alternative exact decimal/rational arithmetic. Never silently round 29.99 across 30 |
| Existing Drifter/Charm replacement and wind/player overrides | Inherited | Retain; no invented disable-future-spawns or time override to simplify tests |

No automatic legacy runtime based on fixture filename. Old action syntax may remain valid while outcomes and scores change. An optional v1.1 runtime would require separate authorization.

## Events and payloads

| Event | Published / existing fields | Validation and timing |
|---|---|---|
| refuel | lantern_id, amount, fuel | Step 5; none when used=0. A1 proposes amount=used motes: positive integer bounded by bag/capacity and ceil(100/10)=10. Alternative actual fuel added changes type/oracle. Final fuel finite 0..100, rounded once; valid ID |
| lantern_out | lantern_id | Immediately after step 2 at fuel<=0; once per transition; off lamps do not repeat it |
| fuel_drain | lantern_id, shade_id, fuel | Every 60 ticks while draining. A2 must settle per-actor/global cadence, resets and final-tick order. Valid references; final fuel 0..100; no invented amount |
| lantern_lit | Existing fields plus relight:Boolean | Only on completion, false first time / true if ever_lit before ignition. Retain local lantern_id; no invented required score/timestamp |
| game_over | reason adds dawn_survived; all_lit retired | dawn/no_flames remain. Current Core has no game_over event; A8 proposes one local type/reason event at step 11, without claiming official envelope |
| drifter_steal | Existing drifter_id, amount, carried | Theft amount remains <=3; carried can reach 17 with capacity 20 |
| player_hit from fall | Existing source/lost | Lost inventory can be 20; validate dynamic limits without changing existing drop rules |

For every new/changed field: valid, missing, null, wrong type, negative, fractional where integer required, over-range and malformed reference tests. Test n-1/n/n+1 timing, duplicates, multi-Shade batches, pause and terminal freeze. Type-only event checks are insufficient.

## Breaking changes

1. Required snapshot additions and drain enum affect strict clients.
2. Dawn-only victory, shorter duration and new reason invalidate instant-clear replay expectations.
3. Lamps are no longer permanent or excluded from interaction; safe zones depend on fuel.
4. Capacity, bag validation, carried/lost payload limits and HUD must migrate together.
5. Exact scores and time-bonus assertions require explicit old-to-new mapping.
6. Weak/off targeting changes actual Phase 2 wander behavior; expected event streams need versioning.
7. Full Night 3 now has 18,000 active ticks. A 21,600 input-tick run includes a terminal tail; retain the CLI input budget unless explicitly changed.
8. Accessibility preferences are browser settings, not invented official headless fields.

**OFFICIAL CONTRACT COMPLIANCE NOT VERIFIED.** A1/A2/A4/A5/A8 were approved for the internal adapter; this does not verify the missing official base.

Implementation precision: scenario fuel must lie on the 1/60 lattice (tolerance 1e-8 internal unit). Snapshot/event fuel is numeric and rounded to one decimal, without imposing a textual trailing zero. See the ADR resolution and Core verification report. Browser changes remain deferred.
