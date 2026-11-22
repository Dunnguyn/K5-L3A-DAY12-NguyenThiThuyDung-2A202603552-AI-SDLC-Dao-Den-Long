import { tuning as C } from '../config/game.js';

// Private integer representation; only the adapter rounds the public fuel value.
export const FUEL_SCALE = C.tick_rate;
export const MAX_FUEL_UNITS = C.fuel_max * FUEL_SCALE;
export const LOW_FUEL_UNITS = C.low_fuel_threshold * FUEL_SCALE;
export const compareIds = (a,b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
export const inventoryCapacity = p => Math.min(C.capacity_max, C.firefly_capacity + 2 * p.successful_lights);
export const fuelValue = l => Math.round(l.fuel_units * 10 / FUEL_SCALE) / 10;
export const activeSafeZone = l => l.lit && l.fuel_units >= LOW_FUEL_UNITS;
export const lanternCost = l => l.ever_lit ? C.relight_cost : C.lantern_cost;
export const refuelUse = (l,bag) => Math.min(bag,Math.ceil((MAX_FUEL_UNITS-l.fuel_units)/(C.fuel_per_mote*FUEL_SCALE)));
// Read-only interaction interface shared by step 5 and browser prompts.
export function interactionTarget(s) {
  const p=s.player,dist=l=>Math.hypot(p.x-l.x,p.y-l.y,p.z-l.z);
  return s.lanterns.filter(l=>(!l.lit||l.fuel_units<MAX_FUEL_UNITS)&&dist(l)<=C.lantern_radius)
    .sort((a,b)=>dist(a)-dist(b)||compareIds(a,b))[0]??null;
}
export function fuelUnits(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > C.fuel_max)
    throw Error('invalid lantern fuel: expected finite 0..100');
  const units = Math.round(value * FUEL_SCALE);
  if (Math.abs(value * FUEL_SCALE - units) > 1e-8)
    throw Error('invalid lantern fuel: must be representable in units of 1/60');
  return units;
}
export function resetDrain(e) {
  e.drain_ticks = 0;
  e.drain_target_lantern_id = null;
}
export function drainingTarget(s,e) {
  if (e.state !== 'drain' || e.eviction_ticks > 0) return null;
  const l = s.lanterns.find(l => l.id === e.target_lantern_id);
  return l?.lit && l.fuel_units < LOW_FUEL_UNITS &&
    Math.hypot(e.x-l.x,e.z-l.z) <= C.lantern_radius ? l : null;
}

// Step 2: latch contributors, aggregate once, sample, then switch exhausted lamps off.
export function advanceFuel(s,emit) {
  const contributions = new Map(), due = [];
  for (const e of s.shades.slice().sort(compareIds)) {
    const l = drainingTarget(s,e);
    if (!l) { resetDrain(e); continue; }
    if (e.drain_target_lantern_id !== l.id) resetDrain(e);
    e.drain_target_lantern_id = l.id;
    e.drain_ticks++;
    contributions.set(l.id,(contributions.get(l.id) ?? 0)+1);
    if (e.drain_ticks % C.tick_rate === 0) due.push({l,e});
  }
  const lamps = s.lanterns.slice().sort(compareIds);
  for (const l of lamps) if (l.lit)
    l.fuel_units = Math.max(0,l.fuel_units-C.fuel_decay_per_s-C.drain_per_s*(contributions.get(l.id) ?? 0));
  due.sort((a,b)=>compareIds(a.l,b.l)||compareIds(a.e,b.e));
  for (const {l,e} of due) emit(s,'fuel_drain',{lantern_id:l.id,shade_id:e.id,fuel:fuelValue(l)});
  for (const l of lamps) if (l.lit && l.fuel_units === 0) {
    l.lit = false;
    l.progress = 0;
    l.ever_lit = true;
    emit(s,'lantern_out',{lantern_id:l.id});
  }
}

// Step 5 is exported for exact full-fuel boundary tests without bypassing step-2 decay.
export function interactLantern(s,emit) {
  const p = s.player;
  if (p.respawn_ticks || !p.flames || !p.light) return;
  const l = interactionTarget(s);
  if (!l) return;
  if (l.lit) {
    const used = refuelUse(l,p.light);
    if (!used) return;
    l.fuel_units = Math.min(MAX_FUEL_UNITS,l.fuel_units+used*C.fuel_per_mote*FUEL_SCALE);
    p.light -= used;
    s.score += used*C.firefly_score;
    emit(s,'refuel',{lantern_id:l.id,amount:used,fuel:fuelValue(l)});
    return;
  }
  const cost = lanternCost(l);
  const used = Math.min(p.light,cost-l.progress);
  l.progress += used;
  p.light -= used;
  s.score += used*C.firefly_score;
  if (l.progress === cost) {
    const relight = l.ever_lit;
    l.lit = true;
    l.fuel_units = MAX_FUEL_UNITS;
    l.ever_lit = true;
    l.relit_count += Number(relight);
    p.successful_lights++;
    s.score += relight ? C.relight_score : C.lantern_score;
    emit(s,'lantern_lit',{lantern_id:l.id,relight});
  }
}
