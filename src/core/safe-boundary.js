import {tuning as C} from '../config/game.js';
// Classify a computed boundary point consistently: projection roundoff must not
// repeatedly re-arm the 30-tick evacuation. This is a machine-precision guard,
// not a change to the six-metre gameplay radius.
export function insideSafeBoundary(l,e){
 const dx=e.x-l.x,dz=e.z-l.z,r2=C.lantern_safe_radius**2;
 return dx*dx+dz*dz<r2-16*Number.EPSILON*r2;
}
export function projectSafeBoundary(l,e){
 const dx=e.x-l.x,dz=e.z-l.z,d=Math.sqrt(dx*dx+dz*dz),r=C.lantern_safe_radius;
 // Radial normalization avoids platform-specific atan2 -> sin/cos composition.
 e.x=l.x+(d?dx/d:1)*r;e.z=l.z+(d?dz/d:0)*r;
}
