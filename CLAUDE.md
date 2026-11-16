# Whispers studio

Claude runs the Whispers social accounts from here: it renders posts, publishes them, replies to comments and keeps the tracker up to date. The owner is Muneer.

## Accounts

| Key | Instagram | Login email | What goes there |
|---|---|---|---|
| `stories` | @whispers_anon | whispers.mark@gmail.com | Story-account formats: prompt posts, dramatised stories (labelled), verdicts, rankings |
| `brand` | @whispers_app | theee.confessions@gmail.com | The app's own feed: carousels, whisper of the day, wholesome posts. Once the app is live, real whispers come from the app's own pipeline, not from here |

Instagram only for now (Muneer's decision, Nov 2026). Don't make TikTok, YouTube or X packs unless he asks.

## Keys

All keys are environment variables of the cloud environment: `IG_STORIES_*`, `IG_BRAND_*`, `CLOUDINARY_*`, `GITHUB_TOKEN` (write access to this repo only) (names are in `.env.example`).
- Never print, log, commit or paste a key value. Never write a `.env` file.
- If a key is missing or invalid, run `node scripts/check.mjs` and tell Muneer which one, by name only.
- Instagram tokens last 60 days from 14 Nov 2026. Check them with `scripts/check.mjs`. From mid-December, remind Muneer to generate new ones (the "Generate token" button in the Meta dashboard).

## Scheduled runs

The scheduled task's prompt only says to clone this repo and follow `RUN.md`. To change what the runs do, change `RUN.md`, not the task.

## How to post

1. First run in a session only: `cd remotion && npm ci && cd ..` and `python3 -m pip install --break-system-packages -r audio/requirements.txt` (render.mjs also does this by itself if the packages are missing).
2. `node scripts/render.mjs <code>` renders `work/<code>.mp4` and `work/<code>.txt` from `plan/queue.json`.
3. Look at frames 0, 1.5s and the end (`ffmpeg -ss`) before posting. Check that the hook is readable on frame 0, nothing is cut off and the spelling is right.
4. `node scripts/publish.mjs --account <stories|brand> --file work/<code>.mp4 --caption-file work/<code>.txt --code <code> --format "<format>"`
5. Save `log/` and `plan/` with `node scripts/save.mjs "<message>"` (it uses `GITHUB_TOKEN`). `scripts/next.mjs` reads what's already posted from Instagram, so a failed save never causes a double post.
6. Add the post to the tracker Sheet "Whispers content experiments" (Posts tab: code, date, platform, account, format, content type, hook, background, length).

## Cleanup (Muneer's rule: no clutter)

- `publish.mjs` deletes the Cloudinary copy after every attempt and deletes the local files after a successful post.
- Never commit videos, audio or images of posts. `.gitignore` blocks them; keep it that way.

## Content rules (non-negotiable)

- Never present invented confessions as real users' whispers. Fiction formats carry a small, quiet "dramatised" tag on screen (the templates add it) and "Dramatised story." in the caption.
- No other labels on screen (Muneer, Nov 2026): no WHISPERS wordmark, no format names ("Deep question", "POV", "Tier list", "Bingo"), no call-to-action pills, no "swipe" or "opening soon". Posts should feel organic. Put the invitation to comment in the caption instead.
- Don't use fake whisper numbers, fake countries or fake counts.
- Pre-launch (now): the app isn't open yet. Don't say "link in bio" or "download the app". Use "Opening soon. Follow to be first in" and invite answers in the comments.
- Never repost a comment or DM as a confession. Every DM gets the same reply: the app link (once it's live) plus the SADAG line, 0800 567 567, for anyone who sounds at risk.
- If a comment sounds like someone is in danger, reply with the SADAG line and tell Muneer straight away.
- Every caption must start differently from every other caption (`next.mjs` recognises posted items by the first 80 characters).
- Write for everyone, wherever they are. Don't target one country.
