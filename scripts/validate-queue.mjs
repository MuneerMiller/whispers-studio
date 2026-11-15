// Check plan/queue.json before saving it. Exits 1 with the problems listed.  node scripts/validate-queue.mjs
import fs from 'node:fs';
const q = JSON.parse(fs.readFileSync('plan/queue.json', 'utf8'));
const LAYOUTS = ['question', 'finish', 'choice', 'rank', 'flag', 'scale'];
const BGS = ['gradient', 'ring', 'drop', 'spiro'];
const BANNED = [/link in bio/i, /download (the|our) app/i, /whisper #\d/i, /#southafrica/i];
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
  if (p.composition === 'MemeCarousel') {
    const pr = p.props ?? {};
    if (!pr.hook || pr.hook.length > 70) problems.push(`${where}: hook missing or over 70 characters`);
    if (!(pr.slides?.length >= 3 && pr.slides.length <= 8) || pr.slides.some((x) => x.length > 140)) problems.push(`${where}: 3-8 slides, each up to 140 characters`);
    if (!pr.question || pr.question.length > 80) problems.push(`${where}: question missing or over 80 characters`);
  }
  if (p.composition === 'ChatReel') {
    const pr = p.props ?? {};
    if (!pr.hook || pr.hook.length > 60) problems.push(`${where}: hook missing or over 60 characters`);
    if (!(pr.messages?.length >= 4 && pr.messages.length <= 12) || pr.messages.some((m) => !['me', 'them'].includes(m.from) || !m.text || m.text.length > 90)) problems.push(`${where}: 4-12 messages, from me/them, each up to 90 characters`);
    if (!/dramatised story/i.test(p.caption ?? '')) problems.push(`${where}: chat stories must say "Dramatised story" in the caption`);
    if (/\p{Extended_Pictographic}/u.test(JSON.stringify(pr))) problems.push(`${where}: no emoji inside the video text (they don't render); use them in the caption only`);
  }
  const FICTION = ['ChatReel', 'NotesReel', 'TwistReel', 'VoiceStory'];
  if (FICTION.includes(p.composition) && !/dramatised story/i.test(p.caption ?? '')) problems.push(`${where}: fiction formats must say "Dramatised story." in the caption`);
  if (!FICTION.includes(p.composition) && /dramatised/i.test(p.caption ?? '')) problems.push(`${where}: only chat stories are dramatised; prompt posts must not invent stories`);
  const pr2 = p.props ?? {};
  if (p.composition === 'TierList' && (!(pr2.items?.length >= 4 && pr2.items.length <= 8) || pr2.items.some((x) => !'SABCD'.includes(x.tier) || x.text.length > 40))) problems.push(`${where}: tier list needs 4-8 items, tier S/A/B/C/D, each up to 40 characters`);
  if (p.composition === 'NotesReel' && (!(pr2.lines?.length >= 3 && pr2.lines.length <= 7) || pr2.lines.some((x) => x.length > 70))) problems.push(`${where}: notes need 3-7 lines, each up to 70 characters`);
  if (p.composition === 'SearchReel' && (!pr2.query || pr2.query.length > 22 || !(pr2.suggestions?.length >= 3 && pr2.suggestions.length <= 5) || pr2.suggestions.some((x) => (pr2.query + x).length > 46))) problems.push(`${where}: search needs a query up to 22 characters and 3-5 suggestions; query+suggestion up to 46 characters`);
  if (p.composition === 'TwistReel' && (!(pr2.setup?.length >= 2 && pr2.setup.length <= 4) || pr2.setup.some((x) => x.length > 70) || !pr2.ending || pr2.ending.length > 110)) problems.push(`${where}: twist needs 2-4 setup lines up to 70 characters and an ending up to 110`);
  if (p.composition === 'VoiceStory' && (!pr2.story || pr2.story.split(/\s+/).length < 40 || pr2.story.split(/\s+/).length > 110)) problems.push(`${where}: voice story needs 40-110 words`);
  if (p.composition === 'BingoCard' && (pr2.cells?.length !== 24 || pr2.cells.some((x) => x.length > 40))) problems.push(`${where}: bingo needs exactly 24 cells, each up to 40 characters`);
  if (!p.caption || p.caption.length > 2000) problems.push(`${where}: caption missing or too long`);
  const k = norm(p.caption);
  if (starts.has(k)) problems.push(`${where}: caption starts the same as ${starts.get(k)} (first 80 characters must differ)`); else starts.set(k, p.code);
  const text = `${p.caption} ${JSON.stringify(p.props ?? {})}`;
  for (const b of BANNED) if (b.test(text)) problems.push(`${where}: contains banned text ${b} (see CLAUDE.md content rules)`);
}
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log(`queue ok: ${q.length} posts`);
