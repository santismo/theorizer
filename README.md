# Theorizer

A browser-based harmony workspace with physical chord dice, genre-aware progression generation, guitar fingerings, chord auditioning, MIDI export, and saved songs.

## GitHub Pages

GitHub Pages publishes the built site from the root of the `gh-pages` branch. The editable source and a copy of the built site (`docs/`) are on `main`. Pages is already enabled.

Site: https://santismo.github.io/theorizer/

## Development

Use Node.js 22.13 or later. Run `npm install`, then `npm run dev`. Run `npm run build` to update `docs/` before committing changes to `main`. Publish the contents of `docs/` at the root of `gh-pages` to update the live site.

Dice mode is the default. Choose **1–8 dice sets** above the dice. Each set has its own note and chord dice. Roll all sets together, then use **+ Add all** to keep one selected chord from every set in order (or **+** for a single set). Connected rolls follow the preceding saved chord and earlier sets in the batch. Tap a set’s chord name to audition it, or tap an individual die to reroll it. The extra chord dice in Settings remain alternative choices within each set. One Undo reverses the whole addition; empty bars are filled first. If the full batch would exceed the existing 16-chord section limit, Add all stays disabled and explains how to make room. Saved chords wrap into four columns and scroll with the page. Tap a saved chord to hear it; tap its three-dot handle for options or hold and drag to reorder across rows.

Saved progressions are stored locally in each browser and website address. Existing saves on the ChatGPT-hosted site do not automatically appear on GitHub Pages.

## Cards

Choose **Cards** beside Dice (or in the composer) for a single-card chord browser. Swipe left to advance, swipe right to go back, or tap a small neighboring card. The previous card appears at the top left; the exact upcoming card is at the top right. Tap the main card or the play icon to audition it. Keyboard arrows also navigate.

Changing Connected–Random or the palette redraws the next preview, replacing the future trail while preserving the current card and all earlier cards. Connected weights shared chord tones, short voice movement, and root relationships. Random samples distinct root/quality combinations in the palette. Key, mode, genre, modulation, and composer settings do not participate in card generation.

Choose **1–16** beside **+** to add that many chords to the shared saved-chord grid. A batch starts with the current card, then the visible next preview, followed by sequentially generated cards. The main card advances to the last added chord, with another preview ready. Empty bars fill first; a batch exceeding the remaining 16-bar section capacity is disabled, never silently truncated. One Undo removes the batch. Card history, slider, palette, and count survive switching modes during the session. Dice and Compose retain their existing behavior.

### Card logic

**Settings → Card logic** selects **Connection** (the default Connected–Random behavior) or **Tonal movement** (Similar–Modulated). Each remembers its own slider value during the session.

Tonal movement ranks 24 major/minor centers from the last eight sounding chords, using recency, scale fit, tonic character, and cadence evidence. Settings shows the estimated/current center and alternatives; these are hypotheses, especially with only one chord. No composer key or genre is used. At Similar, generated cards stay around the inferred center. Increasing modulation increases how often a route starts and favors more distant destination scales. Routes use a shared pivot when available, then a dominant and tonic arrival, carrying their destination across preview swipes and bulk additions. A new home is committed at arrival and receives a short settling period. The built-in palette remains respected. Changing the modulation amount or palette redraws the next preview without rewriting past cards. Tonal cards retain their own key metadata when kept.

Validation includes stable home behavior, recognized major/minor cadences, composer-metadata independence, higher modulation frequency/distance, exact planned arrivals, and preview/batch consistency. The inference and modulation choices are heuristics rather than a claim of a uniquely correct musical analysis.
