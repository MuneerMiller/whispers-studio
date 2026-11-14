// Shared helpers. Secrets come only from environment variables and are never printed or logged.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const IG = 'https://graph.instagram.com/v24.0';

export function env(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable ${name} (set it in the cloud environment settings, never in chat or in a file)`);
  return v.trim();
}

// Which Instagram account: "stories" = @whispers_anon (whispers.mark), "brand" = @whispers_app (theee.confessions).
export function account(name) {
  const key = { stories: 'STORIES', brand: 'BRAND' }[name];
  if (!key) throw new Error(`Unknown account "${name}": use stories or brand`);
  return { name, userId: env(`IG_${key}_USER_ID`), token: env(`IG_${key}_ACCESS_TOKEN`) };
}

// Never let a token reach output: strip it from any error text.
const scrub = (s) => String(s).replace(/(access_token=)[^&\s"]+/g, '$1[hidden]').replace(/IGAA[A-Za-z0-9_-]{10,}/g, '[hidden]');

export async function ig(method, pathname, params, token) {
  const url = new URL(IG + pathname);
  const body = new URLSearchParams({ ...params, access_token: token });
  let res;
  if (method === 'GET') {
    for (const [k, v] of body) url.searchParams.set(k, v);
    res = await fetch(url);
  } else {
    res = await fetch(url, { method, body });
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) throw new Error(scrub(`Instagram ${method} ${pathname} failed: ${JSON.stringify(json.error ?? json)}`));
  return json;
}

const sign = (params) => {
  const base = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join('&');
  return crypto.createHash('sha1').update(base + env('CLOUDINARY_API_SECRET')).digest('hex');
};

export async function cloudinaryUpload(file) {
  const cloud = env('CLOUDINARY_CLOUD_NAME');
  const type = /\.(mp4|mov|webm)$/i.test(file) ? 'video' : 'image';
  const params = { timestamp: Math.floor(Date.now() / 1000), upload_preset: env('CLOUDINARY_UPLOAD_PRESET') };
  const form = new FormData();
  form.set('file', new Blob([fs.readFileSync(file)]), path.basename(file));
  for (const [k, v] of Object.entries(params)) form.set(k, String(v));
  form.set('api_key', env('CLOUDINARY_API_KEY'));
  form.set('signature', sign(params));
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/${type}/upload`, { method: 'POST', body: form });
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(`Cloudinary upload failed: ${json.error?.message ?? res.status}`);
  return { url: json.secure_url, publicId: json.public_id, type };
}

export async function cloudinaryDelete({ publicId, type }) {
  const cloud = env('CLOUDINARY_CLOUD_NAME');
  const params = { invalidate: 'true', public_id: publicId, timestamp: Math.floor(Date.now() / 1000) };
  const form = new URLSearchParams({ ...params, api_key: env('CLOUDINARY_API_KEY'), signature: sign(params) });
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/${type}/destroy`, { method: 'POST', body: form });
  const json = await res.json();
  if (json.result !== 'ok') throw new Error(`Cloudinary delete of ${publicId} returned ${JSON.stringify(json)}`);
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
