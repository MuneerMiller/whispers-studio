# Viral playbook

This is the living strategy. Every run that writes posts reads it first. The weekly trend scout rewrites the "Right now" section every Monday from fresh research and our own numbers. Keep it short and concrete. Last updated: 2026-11-17 (scout run 1).

## Principles that don't change
- **Win the first second.** The first frame must already say something that stops the thumb: drama, a secret, a dare, a hot take. No intros, no logos, no labels.
- **Watch time and replays decide reach.** Build curiosity that only resolves at the end (a redact reveal, a twist, a countdown), and keep the video short (7–20s).
- **Sends beat likes.** Make things people send to one specific friend ("send this to your month twin", "don't show this to your best friend").
- **Comments come from tension, not instructions.** Pick a side, rate it, guess, confess. Never "comment YES" or "tag a friend": those are treated as engagement bait.
- **Steal formats, not content.** Find outliers anywhere (a post doing 3x+ its creator's normal views), copy the *structure*, and write our own words for our niche.
- **Look organic:** no brand marks, no format labels, captions like a person typed them.

## Tactics to use (from studying top creators, incl. Robert McKeaveney's breakdowns)
- **Pause challenge:** "Only 1% can pause at the right time 👀". One storyboard scene gets a `secret` that shows for exactly one frame. People rewatch, scrub and comment what they saw. Use about 1 in 8 posts, and make the secret worth finding: a confession, the twist, a funny line.
- **Outlier remix:**
  - When `log/metrics.json` marks a post `outlier: true` (2x+ the account's median views), make 2 variations of it straight away: same format, new hook or new story.
  - The format earned that, not the words.
- **Repost rule:** after about 30 days, repost the best post with one thing changed (the hook line, the colours or the ending). The audience has turned over by then.
- **Retention shape:** a hook in second 0, a turn or escalation every 2–3 seconds, and the payoff at the very end.
  - If a format's views hold but watch time is low, shorten it.
- **Highlight the thing:** circles, arrows or a colour pop on the key word (`slam` already colours the last word).

## Views plan (started 2026-11-18, review on 2026-11-25)
**Diagnosis:** after 60 posts, every Reel lands at 100–200 views with almost no likes, comments or shares, and no outliers. When everything stalls in the same range, the problem is the account's trust and the retention signals, not one weak hook. Two things made it worse: a brand-new account jumping to 10 near-identical videos a day (it reads like a content farm), and nothing telling us *where* viewers swipe away.

**What changed:**
1. **Posting: 3 a day per account** (the 12:40, 18:40 and 22:40 runs). The other runs only reply to comments. Run this for 7 days, then compare the median views with the 10-a-day week.
2. **Retention numbers:** `metrics.mjs` now saves `avg_watch_s` (average watch time) and `skip_rate` (% who swipe away in the first seconds) for every Reel. Judge formats on these first. A good Reel holds a viewer for most of its length and has a skip rate well under 50%.
3. **Queue reordered:** winners go first, with a weighted mix so the same format never runs back to back. Stories: unpopular opinions, hot takes, red flag or fair, text stories, rate it, tier lists. Brand: hot takes, unpopular opinions, tier lists, POV, deep questions. Losers moved to `plan/parked.json`.
4. **Storyboards** drop to about 1 in 4 until they beat the median. They averaged 106 views on stories, below the account's 130.

**Rules for every new post from now on (retention first):**
- **6–10 seconds.** Short Reels get finished and replayed, and a replay counts as watch time. Only stories that need it go longer.
- **Frame 0 is the hook,** in big, high-contrast text in the middle third of the screen (not hidden under the caption or the buttons). Never fade in from black.
- **The last frame leads back into the first** (a loop), or ends on a question that makes people rewatch.
- **One idea per video,** and the caption's first line repeats it in plain words people search for, e.g. "splitting the bill on a first date". Use 3–5 hashtags about the topic, not the same generic set on every post.
- **Ask a question people want to answer:** "which one and why", "be honest", "what would you do". Never "comment YES".

**First retention numbers (18 Nov, 54 Reels with watch time and skip rate):**
- **Movement in the first second decides everything.** The still `gradient` background (every brand text post) had an 80% skip rate and 2.2s average watch time. Text over the moving `ring` background had 38% skip and 6.3s watch, the best of all. Tier lists did 43% and 5.8s. The still gradient is now banned.
- **The stories account held viewers far better than brand** (skip 35–60% vs 68–98%), almost entirely because of the backgrounds.
- **Storyboards lost 69% in the first seconds** (4.0s watch, 11 posts), even though they're animated. Their first frame doesn't stop people. Keep them at 1 in 4, and open every one with the boldest line already fully on screen over a moving background.
- **Chat stories and voice stories hold the people who stay** (7.8–9.2s watch), so story formats work once the opening lands.
- **Targets:** skip rate under 40%, and average watch time over 60% of the video's length.

**What only Muneer can do (Instagram treats automated likes, follows and comments as spam, so the runs don't):** about 10 minutes a day on each account in the Instagram app. Watch Reels in the niche (relationships, confessions, relatable text posts), like a few, leave 2–3 real comments on bigger pages, and reply to anyone who comments. Pin the best post on each profile. Optionally, add a trending sound to a post in the app.

## Right now (updated weekly by the trend scout)
Scout run 2026-11-17 (research from 31 Oct–16 Nov 2026).

**What's working on our accounts** (40 posts, 14–16 Nov; no storyboards posted yet; almost no comments, likes or shares anywhere, so views are the only usable signal; no outliers yet):
- Stories median 120 views. Best: unpopular opinion "Splitting the bill on a first date is fine" 170, hot take "3 hours to reply" 151 (1 like), text story "I called in sick" 146, tier list "Breakup excuses" 128 (1 like), unsent note 119, guess the ending 105 (1 like).
- Stories flops: voice story 9, deep question 22, 3am searches 25, prompt post 9.
- Brand median 149. Best: tier list "Ways people say I love you" 214 (2 likes, the best brand post), hot take "Saying sorry first" 213, deep question "Which friendship ended without goodbye" 183, finish the sentence 160, POV 154.
- All 6 meme carousels and both bingo cards report 0 views and 0 reach. Check on Instagram whether they really got no reach or whether the numbers are just missing for carousels and images before writing more of them.
- Note: `metrics.mjs` matches posts by current caption, so 32 of 40 posts show as format "unknown" (captions were rewritten after posting). Joining by permalink with `log/posts.jsonl` gives the numbers above.

**What the research says this week:**
- Ranking hasn't changed: watch time, sends per reach and likes per reach are the top signals, and sends count more with non-followers. Reels are tested on a small group of non-followers first. Skip rate (people leaving in the first 3s) is the hook metric, so the hook text must be on screen within about half a second.
- Originality rules now cover photos and carousels too (since 30 Apr 2026). Series linking ended on 28 Oct 2026; for multi-part stories, put "Part 2" in the on-screen hook. Keep the caption and on-screen text about one topic so "Your Algorithm" files the post correctly.
- What's trending is "structured authenticity": identity statements ("Not everyone who…"), timestamp cold opens ("06:04."), conflict stated in line one, life-stage lines ("Money comes back…"), and setup→punchline memes ("Me: … / Also me:").

**Formats to lean on this week:**
1. Hot takes and unpopular opinions (`TextReel` flag): our steadiest stories format. Money, texting and etiquette topics.
2. Tier lists: best brand post, and they get likes on both accounts.
3. Storyboards built on this week's hook styles: "Not everyone who…", a timestamp cold open into a chat with a redact payoff, "Me: / Also me:", and two-part stories with "Part 2:" as the hook.
4. Text stories and chat storyboards (conflict in the hook line, twist in the last message).
5. Brand: warm hot takes, deep questions about friendship, and life-stage lines.

**Hooks to try:**
- "Not everyone who keeps your secrets is keeping them for you."
- "02:47. He's still typing."
- "Me: I'm completely over him. / Also me at 2am:"
- "Money comes back. These years don't."
- "Only 1% can pause at the right time."
- "Part 2: I opened the letter."
- "My sister borrowed my car. Then this text."
- "Lending money to a friend is just paying to lose them."
- "Excuses for leaving someone on read, ranked"
- "06:04. A text from Dad."

**Retire:**
- Voice stories (9 views), 3am searches (25) and deep questions on stories (22). Keep deep questions on brand only.
- Plain prompt posts (9 views).
- Hold new meme carousels and bingo cards until the 0-reach question is answered.
- Slow word-by-word openings: frame 0 should already show the hook's first full line.

**Built on 2026-11-17 (from the scout's ideas):**
- `clock` scene: `{"type":"clock","time":"02:47","text":"He's still typing."}` gives a phone buzz, the minute ticks over, then the line lands.
- `meme` scene: `{"type":"meme","me":"…","alsoMe":"…"}`; the second row lands on a boom.
- The first scene's line is now on screen in full on frame 0 (`instant`, the default for a first `slam`).
- `metrics.mjs` now matches posts by media id from `log/posts.jsonl`.
- **Carousels and bingo:** image and carousel posts reach almost no non-followers on a new account with no followers, which is why they showed 0. Unposted meme carousels were turned into storyboard list Reels, and bingo now posts as a Reel (the card with a slow push-in and music). Don't write new `MemeCarousel` posts until the accounts have 1,000+ followers.

**Ideas to build** (don't build these from a posting run):
- `clock` storyboard scene: a big timestamp (e.g. "02:47") that ticks once with a phone-buzz sound, then the line slams in under it, for timestamp cold opens.
- `meme` storyboard scene: a two-row "Me: … / Also me: …" panel where the second row lands on a beat, so setup→punchline memes don't need three scenes.
- `instant` option on `slam`/`glitch`: show the whole first line on frame 0 (no word-by-word build), to cut skip rate.
- Carousel audio: publish meme carousels and tier lists with a soft track (Instagram now lets you replace audio on carousels), since silent carousels may be ranked lower.
- Fix `metrics.mjs` to match posts by permalink or media id from `log/posts.jsonl`, not by caption.

## Log of experiments
Each line gives the date, what was tried and what happened. The scout appends here.
- 2026-11-18: cut from 10 to 3 posts a day per account; queue reordered to the winning formats; losers parked; watch time and skip rate now tracked. Compare median views on 2026-11-25.
- 2026-11-17: storyboards and the pause challenge introduced. Results pending.
- 2026-11-17: identity-statement storyboards ("Not everyone who…": ig-sb-09, igb-sb-05). Results pending.
- 2026-11-17: timestamp cold opens into a chat with a redact payoff (ig-sb-10, igb-sb-08). Results pending.
- 2026-11-17: "Me: / Also me:" setup→punchline storyboards (ig-sb-11, igb-sb-07). Results pending.
- 2026-11-17: two-part story with "Part 2:" as the on-screen hook (ig-sb-12, then ig-sb-13). Results pending.
- 2026-11-17: life-stage line "Money comes back. These years don't." (igb-sb-06). Results pending.
- 2026-11-17: pause challenges with a payoff secret: "the group chat has a second group chat" (ig-pause-02) and "someone is quietly proud of you" (igb-pause-02). Results pending.
- 2026-11-17: more hot takes and tier lists, the best formats on our own numbers (ig-hot-08, ig-tier-03, ig-flg-05, igb-hot-05, igb-tier-02, igb-rate-03). Results pending.
