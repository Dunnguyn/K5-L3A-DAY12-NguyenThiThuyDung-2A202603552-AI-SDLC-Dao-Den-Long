import {mkdirSync} from 'node:fs';
// Default commands append a new run, preserving committed and previous evidence.
export function proofDirectory(layer,label){const dir=process.env.PROOF_DIR||`docs/proof/phase-3/${layer}/${label}-${new Date().toISOString().replace(/[:.]/g,'-')}`;mkdirSync(dir,{recursive:true});return dir;}
