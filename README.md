# whispers-studio

Content tools for the Whispers social accounts, run by Claude. See `CLAUDE.md` for the rules.

- `remotion/`: video formats (Remotion 4). `PromptPost` is the one in use now. The rest are kept for later.
- `audio/`: procedural music bed (`mixgen.py`) and voice tools (Kokoro TTS and word timings).
- `plan/queue.json`: posts waiting to be made.
- `scripts/render.mjs`, `scripts/publish.mjs`, `scripts/check.mjs`.
- `log/posts.jsonl`: what was posted, with links. No media.
