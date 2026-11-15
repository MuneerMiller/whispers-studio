# What a scheduled run does

Each run starts on a fresh machine and follows this file from top to bottom. CLAUDE.md's rules apply throughout. Never print, log or commit a key value.

## 1. Setup and checks
1. `python3 -m pip install --break-system-packages -q -r audio/requirements.txt`, then `cd remotion && npm ci && cd ..`.
2. `node scripts/check.mjs`. If anything says FAIL, stop and report which check failed (variable names only).

## 2. Numbers (first run of the day only, the 08:40 run)
1. `node scripts/metrics.mjs`. It writes `log/metrics.json` and prints which formats get the most comments, likes and views.
2. Keep the table for the report and for step 4.

## 3. Post
For each account, stories first, then brand:
1. `CODE=$(node scripts/next.mjs <account>)`. If it exits with an error, skip that account and report why. Never guess: a guess could double-post. If it prints nothing, the queue is empty: go to step 4 first, then come back.
2. `node scripts/render.mjs $CODE`. A video lands in `work/$CODE.mp4`; a carousel lands as JPEG slides in the folder `work/$CODE/`. Check it: for a video, frames at 0s, 1.5s and the last second (`ffmpeg -ss <t> -i work/$CODE.mp4 -frames:v 1 <png>`); for a carousel, look at every slide. The hook must be readable, with nothing cut off and no typos. If it's broken, fix the entry in `plan/queue.json` (shorter text usually fixes it) and render again. If it's still broken, skip it and report.
3. `node scripts/publish.mjs --account <account> --file <work/$CODE.mp4, or the folder work/$CODE for a carousel> --caption-file work/$CODE.txt --code $CODE --format "<format>"`. Run it once only: if it errors after "PUBLISHED" was printed, don't run it again.
4. Confirm it printed "deleted Cloudinary copy" and that `work/` is empty.

## 4. Refill the queue (only when an account has fewer than 6 unposted posts)
Write 12 new posts for that account into `plan/queue.json`, using the same shape as the existing entries.
- **Formats:** use what's working. Base it on `log/metrics.json` if there are at least 10 posts with numbers; give the top 2 formats by comments per post 2 posts each out of 3, and try the rest in the remaining slots. Without enough numbers, mix all the formats evenly.
- **What works best:**
  - These come from research on the 2026 algorithm: DM sends are the strongest signal for reaching new people, followed by watch time and real comments.
  - **Keyword-fishing CTAs are penalised:** "comment YES", "tag a friend", "share if…".
  - So ask for an opinion and a reason ("Agree? Tell us why", "Which one, and why?"). On carousels, name who to send it to ("Send this to the friend who…").
- **Formats, in order of priority:**
  - **Meme carousel** (`MemeCarousel`): a hook slide, then 3–8 relatable one-liners in a post-card look, then a question slide with `sendTo`. This is built to be sent to friends. Use `dark: true` for brand.
  - **Text story** (`ChatReel`, stories only): a fictional chat that builds to a twist in the last 1–2 messages, then a question ("Who's wrong?", "What would you do?").
    - It is always fiction, and the caption must contain "Dramatised story." The video labels itself.
    - Keep 5–9 messages, short and texting-style.
    - No emoji inside the messages, because they don't render.
  - **Hot take** (`TextReel` with layout `flag`, `items: ["Agree","Disagree"]`, kicker "Hot take"): a confident, divisive statement about dating, friendship, work or etiquette that people will argue about.
    - It must be spicy, but never about race, religion, gender stereotypes, bodies, politics, or real people or brands.
  - **TextReel layouts:** `question`, `finish` (finish the sentence), `choice` (would you rather: exactly 2 items), `rank` (3–5 items), `flag` (red flag or not), `scale` (rate it 1–10).
- **Mix:** for stories, of every 3 posts, 1 carousel, 1 text story, and 1 hot take or other TextReel. For brand, alternate carousels (warm, wholesome, "things we never say") with TextReels.
- **Backgrounds:** stories rotate `ring`, `drop`, `spiro` and `gradient`; brand always uses `gradient`.
- **Writing:**
  - Questions people can answer in one second (A or B, a number, one word) and topics they'll argue about: dating, friendships, family, work, money habits, guilty habits, petty behaviour, social etiquette.
  - Stories can be cheeky and spicy, within Instagram's rules. Brand is warmer: kindness, honesty, growth, nostalgia, small wins.
  - Write for everyone, wherever they are; never target one country.
  - No real people or brands. Nothing sexual, nothing about self-harm, and no "how are you really" check-ins (nobody replies to comments yet).
  - Don't repeat a question already in the queue.
- **Captions:** start with the question or statement itself, so every caption starts differently. Then add one short nudge to comment, then this paragraph, then 4–5 general hashtags:
  "Whispers is a place to say what you can't say anywhere else, anonymously. Opening soon. Follow to be first in."
- **Codes:** continue the numbering: stories codes are `ig-<format>-NN`, brand codes are `igb-<format>-NN`.
- Run `node scripts/validate-queue.mjs` and fix everything it lists. Then render 2 of the new posts and check their frames as in step 3.

## 5. Save and report
1. `node scripts/save.mjs "Run <date> <time>: <what happened>"` saves `log/` and `plan/` to GitHub. If it fails, report the error; don't retry by other means.
2. Report: for each account, the code, format and post link (or why it was skipped); whether the queue was refilled; and, on the 08:40 run, the top 3 formats by comments per post. Keep it short.
