# Whispers studio

Claude runs the Whispers social accounts from here: it renders posts, publishes them, replies to comments and keeps the tracker up to date. The owner is Muneer.

## Accounts

| Key | Instagram | Login email | What goes there |
|---|---|---|---|
| `stories` | @whispers_anon | whispers.mark@gmail.com | Story-account formats: prompt posts, dramatised stories (labelled), verdicts, rankings |
| `brand` | @whispers_app | theee.confessions@gmail.com | The app's own feed: carousels, whisper of the day, wholesome posts. Once the app is live, real whispers come from the app's own pipeline, not from here |

TikTok, YouTube and X have no posting API set up. For those, render the same videos into a daily pack and tell Muneer. He uploads them by hand.

## Keys

All keys are environment variables of the cloud environment: `IG_STORIES_*`, `IG_BRAND_*`, `CLOUDINARY_*` (names are in `.env.example`).
- Never print, log, commit or paste a key value. Never write a `.env` file.
- If a key is missing or invalid, run `node scripts/check.mjs` and tell Muneer which one, by name only.
- Instagram tokens last 60 days from 14 Nov 2026. Check them with `scripts/check.mjs`. From mid-December, remind Muneer to generate new ones (the "Generate token" button in the Meta dashboard).

## How to post

1. First run in a session only: `cd remotion && npm ci && cd ..` and `python3 -m pip install --break-system-packages -r audio/requirements.txt` (render.mjs also does this by itself if the packages are missing).
2. `node scripts/render.mjs <code>` renders `work/<code>.mp4` and `work/<code>.txt` from `plan/queue.json`.
3. Look at frames 0, 1.5s and the end (`ffmpeg -ss`) before posting. Check that the hook is readable on frame 0, nothing is cut off and the spelling is right.
4. `node scripts/publish.mjs --account <stories|brand> --file work/<code>.mp4 --caption-file work/<code>.txt --code <code> --format "<format>"`
5. If this session can push to GitHub, commit `log/posts.jsonl` and push to `main`. Scheduled runs usually can't, and don't need to: `scripts/next.mjs` reads what's already posted from Instagram itself.
6. Add the post to the tracker Sheet "Whispers content experiments" (Posts tab: code, date, platform, account, format, content type, hook, background, length).

## Cleanup (Muneer's rule: no clutter)

- `publish.mjs` deletes the Cloudinary copy after every attempt and deletes the local files after a successful post.
- Never commit videos, audio or images of posts. `.gitignore` blocks them; keep it that way.
- Daily packs for TikTok, YouTube and X: delete each file once Muneer says it is up, or after 3 days.

## Content rules (non-negotiable)

- Never present invented confessions as real users' whispers. Invented stories must say "Dramatised story" on screen and in the caption.
- Don't use fake whisper numbers, fake countries or fake counts.
- Pre-launch (now): the app isn't open yet. Don't say "link in bio" or "download the app". Use "Opening soon. Follow to be first in" and invite answers in the comments.
- Never repost a comment or DM as a confession. Every DM gets the same reply: the app link (once it's live) plus the SADAG line, 0800 567 567, for anyone who sounds at risk.
- If a comment sounds like someone is in danger, reply with the SADAG line and tell Muneer straight away.
