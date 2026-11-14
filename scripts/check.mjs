// Health check: are all keys present and working? Prints usernames and OK/FAIL only, never key values.
import { env, account, ig } from './lib.mjs';

let ok = true;
for (const name of ['stories', 'brand']) {
  try {
    const acct = account(name);
    const me = await ig('GET', '/me', { fields: 'user_id,username' }, acct.token);
    const idMatch = String(me.user_id) === acct.userId;
    console.log(`${name}: @${me.username} ${idMatch ? 'OK' : `FAIL (user ID in settings does not match ${me.user_id})`}`);
    ok &&= idMatch;
  } catch (e) { console.log(`${name}: FAIL ${e.message}`); ok = false; }
}
try {
  const cloud = env('CLOUDINARY_CLOUD_NAME');
  const auth = Buffer.from(`${env('CLOUDINARY_API_KEY')}:${env('CLOUDINARY_API_SECRET')}`).toString('base64');
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/usage`, { headers: { Authorization: `Basic ${auth}` } });
  const u = await res.json();
  if (!res.ok) throw new Error(u.error?.message ?? res.status);
  console.log(`cloudinary: OK (storage used ${(u.storage?.usage / 1e6).toFixed(1)} MB)`);
  env('CLOUDINARY_UPLOAD_PRESET');
} catch (e) { console.log(`cloudinary: FAIL ${e.message}`); ok = false; }
process.exit(ok ? 0 : 1);
