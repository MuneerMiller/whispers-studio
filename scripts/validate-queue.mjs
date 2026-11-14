// Check plan/queue.json before saving it. Exits 1 with the problems listed.  node scripts/validate-queue.mjs
import fs from 'node:fs';
const q = JSON.parse(fs.readFileSync('plan/queue.json', 'utf8'));
const LAYOUTS = ['question', 'finish', 'choice', 'rank', 'flag', 'scale'];
const BGS = ['gradient', 'ring', 'drop', 'spiro'];
const BANNED = [/link in bio/i, /download (the|our) app/i, /dramatised/i, /whisper #\d/i, /#southafrica/i];
const norm = (s) => String(s ?? '').normalize('NFC').replace(/\s+/g, ' ').trim().slice(0, 80);
const problems = [];
const codes = new Set(), starts = new Map();
for (const p of q) {
  const where = p.code ?? '(no code)';
  if (!/^igb?-[a-z]+-\d{2,3}$/.test(p.code ?? '')) problems.push(`${where}: code must look like ig-xxx-01 (stories) or igb-xxx-01 (brand)`);
  if (codes.has(p.code)) problems.push(`${where}: duplicate code`); codes.add(p.code);
  if (!['stories', 'brand'].includes(p.account)) problems.push(`${where}: account must be stories or brand`);
  if ((p.account === 'brand') !== p.code?.startsWith('igb-')) problems.push(`${where}: brand codes start igb-, stories codes start ig-`);
  if (p.composition === 'TextReel') {
    const pr = p.props ?? {};
    if (!LAYOUTS.includes(pr.layout)) problems.push(`${where}: layout must be one of ${LAYOUTS}`);
    if (!BGS.includes(pr.bg)) problems.push(`${where}: bg must be one of ${BGS}`);
    if (!pr.title || pr.title.length > 90) problems.push(`${where}: title missing or over 90 characters`);
    if (!pr.cta || pr.cta.length > 34) problems.push(`${where}: cta missing or over 34 characters`);
    if (pr.layout === 'choice' && (pr.items?.length !== 2 || pr.items.some((i) => i.length > 60))) problems.push(`${where}: choice needs exactly 2 items, each up to 60 characters`);
    if (pr.layout === 'rank' && (!(pr.items?.length >= 3 && pr.items.length <= 5) || pr.items.some((i) => i.length > 55))) problems.push(`${where}: rank needs 3-5 items, each up to 55 characters`);
    if (p.account === 'brand' && pr.bg !== 'gradient') problems.push(`${where}: brand posts use the gradient background`);
  }
  if (!p.caption || p.caption.length > 2000) problems.push(`${where}: caption missing or too long`);
  const k = norm(p.caption);
  if (starts.has(k)) problems.push(`${where}: caption starts the same as ${starts.get(k)} (first 80 characters must differ)`); else starts.set(k, p.code);
  const text = `${p.caption} ${JSON.stringify(p.props ?? {})}`;
  for (const b of BANNED) if (b.test(text)) problems.push(`${where}: contains banned text ${b} (see CLAUDE.md content rules)`);
}
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log(`queue ok: ${q.length} posts`);
