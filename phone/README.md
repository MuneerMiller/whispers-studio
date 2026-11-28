# Phone posting (Whispers Poster)

The Android app Whispers Poster posts one video a day per account in the Instagram app, so it can use a trending song,
which the Instagram API can't. Everything it does is driven by these files:

- `config.json`: `enabled` turns phone jobs on for the scheduled runs (RUN.md, 13:40 slot).
- `jobs.json`: the posts waiting for the phone (written by `scripts/phone-job.mjs`, cleared by `scripts/phone-sweep.mjs`).
- `steps.json`: the taps, as selectors. When Instagram changes a screen, fix this file. The app reads it on every post.

## Fixing steps.json
In the app: "Record me posting one Reel by hand" logs every button Muneer taps (id, text, description). "Save the
screen in 10 seconds" dumps every element on a screen. "Share last report" holds the screen where a post failed.
Turn those into selectors: prefer `id`, then `desc`, then `text`.

## Cleanup
The app deletes its downloaded video and any copy Instagram saves to the gallery (only files from that post's time
window), and phone-sweep deletes the Cloudinary copy. Nothing is kept.
