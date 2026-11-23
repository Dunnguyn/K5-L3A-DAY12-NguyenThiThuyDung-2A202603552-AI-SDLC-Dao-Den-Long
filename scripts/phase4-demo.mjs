import { chromium } from '@playwright/test';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { makeServer } from './start.mjs';

const out = resolve('docs/demo/demo.mp4');
const bench = JSON.parse(await readFile('docs/proof/phase-4/bench.json', 'utf8'));
const soak = JSON.parse(await readFile('docs/proof/phase-4/soak.json', 'utf8'));
const server = makeServer();
await new Promise(done => server.listen(0, '127.0.0.1', done));
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
const game = await context.newPage();
const recorder = await context.newPage();
let sections = [];
try {
  await recorder.goto('about:blank');
  await recorder.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = 1280; canvas.height = 720;
    document.body.append(canvas);
    const ctx = canvas.getContext('2d');
    const chunks = [];
    const media = new MediaRecorder(canvas.captureStream(10), { mimeType: 'video/mp4;codecs=avc1.42E01E', videoBitsPerSecond: 3000000 });
    media.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
    window.demo = { canvas, ctx, chunks, media };
    media.start();
  });
  const draw = async (image, heading, detail, seconds) => {
    const data = image ? `data:image/png;base64,${image.toString('base64')}` : null;
    await recorder.evaluate(async ({ data, heading, detail }) => {
      const { ctx, canvas } = window.demo;
      ctx.fillStyle = '#101521'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (data) {
        const img = new Image(); img.src = data; await img.decode();
        ctx.drawImage(img, 0, 0, 1280, 720);
        ctx.fillStyle = 'rgba(5, 10, 20, .86)'; ctx.fillRect(0, 0, 1280, 100);
      }
      ctx.fillStyle = '#fff'; ctx.font = 'bold 32px sans-serif'; ctx.fillText(heading, 28, 42);
      ctx.font = '22px sans-serif';
      detail.split('\n').forEach((line, i) => ctx.fillText(line, 28, 76 + i * 30));
    }, { data, heading, detail });
    sections.push({ heading, seconds });
    await new Promise(done => setTimeout(done, seconds * 1000));
  };
  await game.goto(`http://127.0.0.1:${server.address().port}`);
  await game.locator('#start-campaign').waitFor();
  await draw(await game.screenshot(), 'Đảo Đèn Lồng — actual browser session', 'Phase 4 preparation; not a v1.0.0 release', 3);
  await game.locator('#open-settings').click();
  await draw(await game.screenshot(), 'Accessibility settings', 'Nine remappable keys, reduced motion, large text and palette', 4);
  await game.locator('#settings-back').click();
  await game.locator('#start-campaign').click();
  await game.locator('#enter-night').click();
  await game.bringToFront();
  await game.waitForTimeout(800);
  for (let i = 0; i < 12; i++) {
    if (i % 4 === 0) await game.keyboard.down('w');
    if (i % 4 === 2) await game.keyboard.up('w');
    if (i === 5) await game.keyboard.press('Space');
    if (i === 8) await game.keyboard.press('e');
    await draw(await game.screenshot(), 'Night 1 — live browser gameplay', 'Real keyboard input; shared Core snapshot and renderer', 1);
  }
  await game.keyboard.up('w');
  const historic = async (name, title, detail, seconds) => draw(await readFile(name), title, detail, seconds);
  await historic('docs/proof/phase-4/ws3/screenshots/leaderboard-saved.png', 'Leaderboard — recorded WS3 browser evidence', 'Persistent local file; same dataset exported by CLI', 4);
  await historic('docs/proof/phase-4/ws3/screenshots/low-fuel-reduced.png', 'Low fuel — recorded WS3 browser evidence', 'Static warning under reduced motion', 4);
  const gateBench = JSON.parse(await readFile('docs/proof/phase-4/final-gate/bench.json', 'utf8'));
  const gateResult = JSON.parse(await readFile('docs/proof/phase-4/final-gate/soak.json', 'utf8'));
  await draw(null, 'Standalone benchmark — actual gate result', `30 s: avg ${gateBench.avg_fps.toFixed(2)} FPS, P1 ${gateBench.p1_low_fps.toFixed(2)} FPS\nload ${gateBench.load_ms.toFixed(0)} ms. Live command follows; capture run may differ.`, 5);
  await draw(null, 'Soak — actual independent gate result', `10 Nights, 0 crashes. RSS ${gateResult.mem_start_mb.toFixed(2)} -> ${gateResult.mem_end_mb.toFixed(2)} MiB\nCeiling ${(gateResult.mem_start_mb * 1.2).toFixed(2)} MiB: FAIL / release BLOCKED. Live command follows.`, 5);
  const liveCommand = async (title, command, args, { shell = false, minSeconds = 3 } = {}) => {
    let lines = [], elapsed = 0, stdout = '';
    const paint = async () => recorder.evaluate(({ title, command, lines, elapsed }) => {
      const { ctx, canvas } = window.demo;
      ctx.fillStyle = '#101521'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffcf5c'; ctx.font = 'bold 30px sans-serif'; ctx.fillText(title, 30, 48);
      ctx.fillStyle = '#fff'; ctx.font = '21px monospace';
      const visible = [`> ${command}`, `Elapsed ${elapsed}s — actual subprocess output`, ...lines].slice(-21);
      visible.forEach((line, i) => ctx.fillText(line.slice(0, 104), 30, 92 + i * 29));
    }, { title, command: `${command} ${args.join(' ')}`, lines, elapsed });
    const child = spawn(command, args, { shell, stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout.on('data', data => { stdout += String(data); });
    for (const stream of [child.stdout, child.stderr]) stream.on('data', data => {
      lines.push(...String(data).replace(/\r/g, '').split('\n').filter(Boolean));
      lines = lines.slice(-19);
    });
    const started = Date.now();
    let done = false, code = null;
    child.on('close', value => { done = true; code = value; });
    while (!done) { elapsed = Math.floor((Date.now() - started) / 1000); await paint(); await new Promise(r => setTimeout(r, 500)); }
    try {
      const actual = JSON.parse(stdout);
      if (actual.result?.avg_fps !== undefined) lines = [`Measured avg_fps ${actual.result.avg_fps.toFixed(2)}; p1_low ${actual.result.p1_low_fps.toFixed(2)}`, `Measured load_ms ${actual.result.load_ms.toFixed(2)}; scene Shades ${actual.scene.shadeCount}`, `Concurrent-capture threshold: ${actual.result.avg_fps >= 60 && actual.result.p1_low_fps >= 30 && actual.result.load_ms <= 10000 ? 'PASS' : 'FAIL'} (not standalone gate)`];
      else if (actual.mem_start_mb !== undefined) lines = [`Measured RSS ${actual.mem_start_mb.toFixed(2)} -> ${actual.mem_end_mb.toFixed(2)} MiB`, `Limit ${(actual.mem_start_mb * 1.2).toFixed(2)} MiB; ${actual.nights} Nights; ${actual.crashes} crashes`];
      else if (actual.state) lines = [`Headless result state: ${actual.state.state ?? actual.state.status}`, `sim_tick: ${actual.state.sim_tick}; score: ${actual.state.score ?? actual.state.night_score}`];
    } catch { /* non-JSON test output remains visible verbatim */ }
    lines.push(`Process exit code ${code}`);
    if (title.startsWith('Live soak')) lines.push('Release gate remains BLOCKED: repeated clean RSS runs failed.');
    elapsed = Math.floor((Date.now() - started) / 1000);
    await paint();
    if (elapsed < minSeconds) await new Promise(r => setTimeout(r, (minSeconds - elapsed) * 1000));
    sections.push({ heading: title, seconds: Math.max(elapsed, minSeconds), actual_command: true, exit_code: code });
  };
  await liveCommand('Live unit test execution', process.platform === 'win32' ? 'npm.cmd' : 'npm', ['test', '--', '--reporter=dot'], { shell: process.platform === 'win32', minSeconds: 5 });
  await liveCommand('Live headless verification', process.execPath, ['scripts/headless.mjs', '--night', '1', 'docs/proof/phase-3/core/dawn-input-replay-2026-11-21T11-41-43-778Z/night-1.input.json'], { minSeconds: 4 });
  await liveCommand('Live benchmark (concurrent video capture)', process.execPath, ['scripts/bench-render.mjs', '--seed', '42', '--duration', '30', '--out', 'docs/proof/phase-4/final-gate/demo-bench.json'], { minSeconds: 35 });
  await liveCommand('Live soak — single run, actual result', process.execPath, ['scripts/soak.mjs', '--seed', '7', '--nights', '10', '--out', 'docs/proof/phase-4/final-gate/demo-soak.json'], { minSeconds: 5 });
  const demoSoak = JSON.parse(await readFile('docs/proof/phase-4/final-gate/demo-soak.json', 'utf8'));
  const gateSoak = JSON.parse(await readFile('docs/proof/phase-4/final-gate/soak.json', 'utf8'));
  await recorder.bringToFront();
  await draw(null, 'Soak release gate — BLOCKED', `Live sample: ${demoSoak.mem_start_mb.toFixed(2)} -> ${demoSoak.mem_end_mb.toFixed(2)} MiB\nIndependent gate: ${gateSoak.mem_start_mb.toFixed(2)} -> ${gateSoak.mem_end_mb.toFixed(2)} MiB; ceiling ${(gateSoak.mem_start_mb * 1.2).toFixed(2)}\nRepeated clean processes exceeded the Ticket-04 RSS limit.`, 7);
  const base64 = await recorder.evaluate(async () => {
    const { media, chunks } = window.demo;
    await new Promise(done => { media.onstop = done; media.stop(); });
    const blob = new Blob(chunks, { type: 'video/mp4' });
    return await new Promise(done => { const reader = new FileReader(); reader.onload = () => done(reader.result.split(',')[1]); reader.readAsDataURL(blob); });
  });
  await mkdir(resolve('docs/demo'), { recursive: true });
  await writeFile(out, Buffer.from(base64, 'base64'));
  const playable = await recorder.evaluate(async base64 => {
    const video = document.createElement('video');
    video.src = `data:video/mp4;base64,${base64}`;
    return await new Promise(done => { video.onloadedmetadata = () => done({ duration: video.duration, width: video.videoWidth, height: video.videoHeight }); video.onerror = () => done({ error: 'metadata load failed' }); });
  }, base64);
  console.log(JSON.stringify({ out, bytes: Buffer.byteLength(base64, 'base64'), sections, playable }));
} finally {
  await context.close(); await browser.close();
  await new Promise(done => server.close(done));
}
