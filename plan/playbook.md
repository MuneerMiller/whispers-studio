# Viral playbook

This is the living strategy. Every run that writes posts reads it first. The weekly trend scout rewrites the "Right now" section every Monday from fresh research and our own numbers. Keep it short and concrete. Last updated: 2026-11-24 (24 Nov plan added).

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

## 24 Nov plan (Muneer asked for research and fixes in every area, and 4 posts a day)
**Where we are (98 Reels):** since 18 Nov viewers stay longer (stories skip 55% → 46%, watch 4.9s → 5.8s; brand skip 80% → 46%, watch 2.8s → 6.0s), but views haven't moved: about 150 a post on both accounts, best 243. Skip rate barely predicts views (correlation -0.13), so every post is stuck in Instagram's first test audience of about 100–200 people and none has been pushed further. Comments are near zero, and the only real sends were one post (21 shares).

**What the research says (Nov 2026):**
- Instagram ranks Reels mainly on watch time and completion, sends per reach, and likes per reach. Sends matter most for reaching non-followers ([SocialPilot](https://www.socialpilot.co/blog/instagram-reels-algorithm), [Buffer](https://buffer.com/resources/instagram-algorithms/)).
- Skip-rate benchmarks: under 20% good, 20–30% healthy, 30–40% needs work, over 40% a problem ([Retensis](https://retensis.com/blog/instagram-reels-skip-rate-benchmarks-2026)). We're at 36–75%, so **the first second is still the biggest problem**.
- Fixes that work: content from the first second, a high-contrast text hook on frame 0, movement within half a second, and **sound from frame 0 (a spoken line or a sharp sound, never silence)**.
- Keyword captions help Instagram's search and topic matching more than hashtags.
- Replying to comments goes with about 21% more engagement per post ([Buffer, 700k posts](https://buffer.com/resources/instagram-comments-engagement/)). The runs already reply; Muneer's 10 minutes in the app still help.
- Trial Reels (shown to non-followers first) unlock at 1,000 followers. Use them from then on to test hooks.
- Our own best evidence agrees: the one narrated Reel had the lowest skip (33%) and the longest watch (9.2s). Silent text over music averages 47% skip.

**What changed today:**
1. **4 posts a day per account,** at 09:40, 13:40, 18:40 and 22:40 (Johannesburg time).
2. **Spoken hook A/B test:** `TextReel` now reads its hook aloud from frame 0 when `props.voice` is true (render.mjs, Kokoro voice). Every other text post is voiced; entries carry `"ab": "voice"` or `"ab": "silent"`. The 07:40 run reports the comparison. **Decision rule:** after 15 voiced posts, if voiced skip is 5+ points lower, voice every text post.
3. **Voice stories are back,** about 1 in 8 stories posts.
4. **Parked:** storyboards cut to at most 1 in 8 (72% skip, 2.4s watch), storyboard lists, unsent notes (74% skip), and brand hot takes and unpopular opinions (75% skip, 64 median views). 18 queued posts moved to `plan/parked.json`.
5. **16 new posts at the front of the queues,** built on the winners: "which is harder" (the only real send signal), red flag or fair, rate it, finish the sentence, and brand deep questions.
6. **Captions:** no more "Whispers is a place… opening soon" paragraph, which read like an ad. Plain searchable first line, one nudge to answer or send, 3–5 topic hashtags.

**Still to build** (bigger levers, not done in this change): a bigger, centred hook on frame 0 (`center` option, see Ideas to build); storyboard `list` scenes that open full.

## Right now (updated weekly by the trend scout)
Scout run 2026-11-23 (our posts 14–22 Nov; research from 14–21 Nov 2026).

**What's working on our accounts** (84 Reels with numbers; still no outliers, since nothing reached 2x median; comments ≈ 0, so judge on views, skip rate, watch time and sends):
- **Stories is improving, brand is flat.** Stories median 132 overall, but **152 for the 15 posts since the 3-a-day change on 18 Nov** (last week 120). Brand median 151, also 151 since 18 Nov. The full comparison is still due 25 Nov.
- **Red flag or fair is our best format.** Median 183 views, 37.7% skip, 7.0s watch over 4 stories posts. Best: "They still follow their ex's mom on Instagram" 199, "Still having your ex's number saved under a fake name" 196.
- **Other low-skip stories formats:** finish the sentence ("The most petty thing I've ever done was…" 186, 35% skip, 2 likes), rate it 1–10 ("Checking out someone else on a date" 181, 39% skip) and tier lists (37% skip).
- **Brand best:** deep question "What are you outgrowing right now?" 235; finish the sentence "Best thing that happened this year" 230 (11.1s watch, the longest watch on either account) and 230 for igb-fin-04; rate it "How much do you say what you mean?" 219; would you rather 211.
- **The one real send signal:** brand "Which is harder to say? I'm sorry / I need help" (igb-cho-01) got **21 shares from 98 reach (21% sends per reach)**, while 1% counts as excellent for cold audiences. It got only 126 views because it ran on the old still gradient. The format (two short, heavy phrases, pick one) is worth remixing on the moving background. The next best was 2 shares (ig-wyr-02).
- **Storyboards still lose people at the start.** Stories: 123 median, 66.5% skip, 4.0s watch. Brand: 152 median, 77.8% skip, 2.9s watch. Storyboard lists were worst (101 views, 67% skip). Rendered check today: after the hook cuts, a `list` scene shows ~0.4s of empty black before item 1 appears.
- **Brand skips far more than stories on the same `ring` background** (63% vs 44%). The difference is the writing. Brand hot takes with Agree/Disagree buttons get 2.6s watch and 75% skip ("Saying sorry first…" 213 views, 84% skip), and brand unpopular opinions have a 92 median. Concrete, specific scenarios hold people; abstract statements don't.

**What the research says this week:**
- **No ranking change.** No announced change for Oct or Nov. Watch time, sends per reach and likes per reach are still the main signals, and sends matter most with non-followers ([Ethical SMM, 15 Nov](https://ethicalsmm.com/blog/instagram-updates-november-2026); [Flock Social, 14 Nov](https://flocksocial.com/blog/instagram-algorithm)). One blog benchmark puts above 1% sends per reach as excellent for cold audiences ([Onwards and Up](https://onwardsandup.co.uk/instagram-trial-reels-small-creators/)). Meta reportedly tightened filtering of "low-quality" content in Reels and Explore around 18 Nov ([Dainik Jagran](https://english.dainikjagranmpcg.com/technology/instagram-to-limit-inappropriate-content-in-reels-explore-and-feed/article-44825), single source), another reason to keep volume low and every post distinct. Mosseri's only November feature was editing Stories for 15 minutes after posting (18 Nov, [Gizmodo](https://gizmodo.com/instagram-now-lets-you-edit-stories-you-already-posted-2000841943)).
- **Year-end text-overlay trends** ([NewEngen, 20 Nov](https://newengen.com/insights/instagram-trends/)):
  - "It's NO-vember": stacked "NO" lines naming habits to drop. It expires on 1 Dec.
  - "Dear Santa, I'm a size…": a wishlist joke with a twist.
  - "I feel like I haven't done much this year": year-end reflection.
  - "No, no, no… yes!": a run of no's that ends on a yes payoff.
- **Emotional hooks are outperforming neutral ones** ([Lightreel, 21 Nov](https://lightreel.ai/blogs/whats-trending-on-instagram)):
  - Life-stage contrast: "Everyone my age is [milestone], and I'm still [problem]."
  - "Things I stopped doing."
  - Stark text on black before anything else.
  - Lightreel also lists an "Is it cheating?" couples debate, which fits our red flag format.
  - Carousels had no breakout this week.
- **"Zoom in" hidden message** ([InMagic, 16 Nov](https://inmagic.ai/top-10-instagram-reels-to-try-this-week/)): tiny text that viewers have to zoom or pause to read. It's the same mechanic as our pause challenge, and evidence that it's still working.
- I found no new Robert McKeaveney material this week, so the tactics above stand.

**Formats to lean on this week:**
1. **Red flag or fair** (stories): concrete "is it cheating?"-style scenarios about exes, phones, stories and close friends. No Agree/Disagree buttons.
2. **"Which is harder"** (`TextReel` choice, both accounts, new format name so we can track it): two short, heavy phrases ("I miss you" / "I'm proud of you"). The caption names who to send it to. This is the send play.
3. **Finish the sentence with this week's hooks:** life-stage contrast ("Everyone my age is…, and I'm still…") and year-end lines ("I haven't done much this year, except…", "A small win nobody clapped for").
4. **Rate it 1–10 and tier lists:** lowest skip after red flags.
5. **Seasonal storyboards, at most 1 in 5:** NO-vember until 30 Nov, then "Dear Santa" through December. Open on stark text, put the punchline in a `redact`, and end on a sendable question.
- **Brand:** prioritise deep questions and finish the sentence over hot takes.

**Hooks to try:**
- "They text their ex 'happy birthday' every single year."
- "They have a 'close friends' story and you're not on it."
- "Which is harder to say to an ex? I was wrong / I miss you"
- "Which is harder to hear? 'You've changed' / 'I'm not mad, just disappointed'"
- "Everyone my age is getting engaged, and I'm still…"
- "Everyone my age is buying houses. I'm just proud I…"
- "I feel like I haven't done much this year, except…"
- "It's NO-vember." (until 30 Nov)
- "Dear Santa, all I want this year is…" (redact: "for them to text first. Just once.")
- "'We need to talk' texts, ranked by how scared you should be"

**Retire:**
- Brand hot takes and unpopular opinions with Agree/Disagree buttons: 75% skip and 2.6s watch, with a 92 median for unpopular opinions. Already-queued ones can run, but write no new ones this week.
- Storyboard `list` posts until the empty-start fix below is built (101 views, 67% skip).
- NO-vember posts after 30 Nov. If one is still unposted on 1 Dec, skip it.
- Still retired: voice stories, 3am searches, deep questions on stories, plain prompt posts, new meme carousels and bingo cards, and the still gradient.

**Ideas to build** (don't build these from a posting run):
- **List scene opens full:** a storyboard `list` scene should show item 1 on its first frame. Right now it shows ~0.4s of empty black after the cut, the likely cause of part of the storyboards' 66–78% skip.
- **`fineprint` storyboard scene** for the "zoom in" trend: one normal line plus a second line in very small text (about 18px) that stays up for the whole scene, so viewers zoom or pause to read it, e.g. `{"type":"fineprint","text":"Read the small print.","small":"…"}`.
- **`center` option on TextReel `choice` and `question`:** put the title in the middle third at about 1.5x size (it's now small, top-left) and A/B test it against the current layout on "Which is harder" posts.
- **"No, no, no… yes!" scene:** 3–4 lines each stamped with a red NO on a beat, then a final line stamped with a green YES, for the year-end trend.

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
- 2026-11-23: "Which is harder" A/B on the moving ring background, remixing the 21-share brand post (ig-hard-01, igb-hard-01, igb-hard-02). Watch sends per reach. Results pending.
- 2026-11-23: red flag or fair with "is it cheating?"-style scenarios (ig-flg-06, ig-flg-07). Results pending.
- 2026-11-23: life-stage contrast finish-the-sentence, "Everyone my age is…" (ig-fin-04, igb-fin-06). Results pending.
- 2026-11-23: year-end reflection prompts (ig-fin-05 "haven't done much this year", igb-fin-07 "small win nobody clapped for"). Results pending.
- 2026-11-23: seasonal storyboards: NO-vember (ig-sb-14, igb-sb-12; expire 1 Dec) and Dear Santa with a redact payoff (ig-sb-15, igb-sb-13). Results pending.
- 2026-11-23: other posts: rate it "watching stories but ignoring texts" (ig-rate-04), tier list "'We need to talk' texts" (ig-tier-04), friendship tier list remixing the best brand tier (igb-tier-08), deep question (igb-deep-10), rate it (igb-rate-05) and would you rather (igb-wyr-08). Results pending.
- 2026-11-24: 4 posts a day per account (09:40, 13:40, 18:40, 22:40). Compare median views per post with 18–23 Nov on 1 Dec.
- 2026-11-24: spoken-hook A/B on TextReels (`ab: voice` vs `ab: silent`), starting with ig-hard-02, ig-rate-05, ig-flg-09, igb-hard-03, igb-rate-06, igb-wyr-09, igb-fin-09 and every other queued text post. Watch skip rate first.
- 2026-11-24: voice story back as a test (ig-voice-02, ring background). Watch skip rate and watch time.
- 2026-11-24: captions without the "Whispers is a place…" paragraph, with a searchable first line. Results pending.
