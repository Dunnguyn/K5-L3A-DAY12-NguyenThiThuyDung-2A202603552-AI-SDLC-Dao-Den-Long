function parse(argv, required, integers) {
  const values = {};
  for (let i = 0; i < argv.length; i += 2) {
    const flag = argv[i];
    if (!required[flag] || Object.hasOwn(values, flag) || i + 1 >= argv.length || argv[i + 1].startsWith('--')) throw new Error(`invalid or duplicate flag: ${flag ?? '(missing)'}`);
    values[flag] = argv[i + 1];
  }
  for (const flag of Object.keys(required)) if (!Object.hasOwn(values, flag)) throw new Error(`missing required flag: ${flag}`);
  for (const [flag, kind] of Object.entries(integers)) {
    const value = Number(values[flag]);
    if (!Number.isSafeInteger(value) || value < (kind === 'seed' ? 0 : 1)) throw new Error(`invalid ${flag}`);
    values[flag] = value;
  }
  if (!values['--out'].trim()) throw new Error('invalid --out');
  return values;
}
export function parseBenchArgs(argv) { const v=parse(argv,{'--seed':1,'--duration':1,'--out':1},{'--seed':'seed','--duration':'positive'});return{seed:v['--seed'],duration:v['--duration'],out:v['--out']}; }
export function parseSoakArgs(argv) { const v=parse(argv,{'--seed':1,'--nights':1,'--out':1},{'--seed':'seed','--nights':'positive'});return{seed:v['--seed'],nights:v['--nights'],out:v['--out']}; }
