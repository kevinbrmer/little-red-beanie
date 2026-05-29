# Audio Asset Manifest — Pitch-Variante v1.0

> Sourced into `prompts/system-prompt-v1.md` `<audio_assets>` section.
> Real audio procurement is a separate track. The two IDs below are placeholders
> that the app maps to actual MP3/OGG files in `assets/audio/` once they exist.

## Asset IDs

```
audio_sea_waves_01:               gentle ocean waves on a calm shore, soft and rhythmic, looping
audio_iran_music_traditional_01:  traditional iranian instrumental (santur / setar), slow, calm, looping
```

## Procurement notes

- **Sources:** Pixabay Music (CC0), Freesound.org (CC0/CC-BY), or equivalent royalty-free libraries.
- **Format:** MP3 (44.1 kHz, 128 kbps stereo) for browser-friendly loop playback. Keep each track 30–60 s, seamless loop.
- **Volume:** Pre-normalize to −18 LUFS. The app fades both tracks in over ~1 s on Phase 5 Stage 5b entry and out over ~1 s at session end.
- **Mixing:** `audio_sea_waves_01` sits underneath at ~60 % volume, `audio_iran_music_traditional_01` at ~40 % volume — sea is the texture, music is the cultural anchor.
- **Licensing:** Track sources + license terms in `output/asset-sources.md` (to be created during procurement).

## Usage in Phase 5

Both audio IDs are used together in Stage 5b consent (`child_words="yes"`) — Hard Rule in the system prompt enforces this combination. Audio is NOT played when:

- Stage 5a (offer not yet accepted)
- Stage 5b silence-fallback (child stayed silent, no consent)
- `escalated=true` (Co-Regulation overrides — calm visuals only, no audio bedding)
