// Save this run's changes (log/, plan/) back to GitHub using GITHUB_TOKEN, without the token ever appearing
// in a command line, a remote URL or the output.  node scripts/save.mjs "commit message"
import { execFileSync } from 'node:child_process';
import { env } from './lib.mjs';

const msg = process.argv[2] || 'Scheduled run: log and queue';
const token = env('GITHUB_TOKEN');
const auth = `AUTHORIZATION: basic ${Buffer.from(`x-access-token:${token}`).toString('base64')}`;
const git = (...args) => execFileSync('git', ['-c', `http.https://github.com/.extraheader=${auth}`, '-c', 'user.name=Whispers bot', '-c', 'user.email=noreply@anthropic.com', ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const scrub = (s) => String(s).replaceAll(token, '[hidden]').replace(/basic [A-Za-z0-9+/=]{20,}/g, 'basic [hidden]');

try {
  git('add', 'log', 'plan');
  if (!git('status', '--porcelain', 'log', 'plan').trim()) { console.log('nothing to save'); process.exit(0); }
  git('commit', '-q', '-m', msg);
  for (let i = 0; i < 3; i++) {
    try { git('pull', '--rebase', '-q', 'https://github.com/MuneerMiller/whispers-studio', 'main'); git('push', '-q', 'https://github.com/MuneerMiller/whispers-studio', 'HEAD:main'); console.log('saved to GitHub'); process.exit(0); }
    catch (e) { if (i === 2) throw e; }
  }
} catch (e) {
  console.error(`save failed: ${scrub(e.stderr || e.message)}`);
  process.exit(1);
}
