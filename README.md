# Theorizer

A browser-based harmony workspace with physical chord dice, genre-aware progression generation, guitar fingerings, chord auditioning, MIDI export, and saved songs.

## GitHub Pages

GitHub Pages publishes the built site from the root of the `gh-pages` branch. The editable source and a copy of the built site (`docs/`) are on `main`. Pages is already enabled.

Site: https://santismo.github.io/theorizer/

## Development

Use Node.js 22.13 or later. Run `npm install`, then `npm run dev`. Run `npm run build` to update `docs/` before committing changes to `main`. Publish the contents of `docs/` at the root of `gh-pages` to update the live site.

Cards is the default, with the Simple seventh-chord palette and Tonal movement logic. The top mode switch opens Cards, Dice, or Compose. In Dice mode, Choose **1–8 dice sets** above the dice. Each set has its own note and chord dice. Roll all sets together, then use **+ Add all** to keep one selected chord from every set in order (or **+** for a single set). Connected rolls follow the preceding saved chord and earlier sets in the batch. Tap a set’s chord name to audition it, or tap an individual die to reroll it. The extra chord dice in Settings remain alternative choices within each set. One Undo reverses the whole addition; empty bars are filled first. If the full batch would exceed the existing 16-chord section limit, Add all stays disabled and explains how to make room. Saved chords wrap into four columns and scroll with the page. Tap a saved chord to hear it; tap its three-dot handle for options or hold and drag to reorder across rows.

Saved progressions are stored locally in each browser and website address. Existing saves on the ChatGPT-hosted site do not automatically appear on GitHub Pages.

## Cards

Choose **Cards** beside Dice (or in the composer) for a single-card chord browser. Swipe left to advance, swipe right to go back, or tap a small neighboring card. The previous card appears at the top left; the exact upcoming card is at the top right. Tap the main card or the play icon to audition it. Keyboard arrows also navigate.

Changing Connected–Random or the palette redraws the next preview, replacing the future trail while preserving the current card and all earlier cards. Connected weights shared chord tones, short voice movement, and root relationships. Random samples distinct root/quality combinations in the palette. Key, mode, genre, modulation, and composer settings do not participate in card generation.

Choose **1–16** beside **+** to add that many chords to the shared saved-chord grid. A batch starts with the current card, then the visible next preview, followed by sequentially generated cards. The main card advances to the last added chord, with another preview ready. Empty bars fill first; a batch exceeding the remaining 16-bar section capacity is disabled, never silently truncated. One Undo removes the batch. The small refresh icon to the right of the count clears the active section’s kept chords and the card trail, then draws a fresh current card and preview with the same palette, logic, sliders, sound, and batch count. Other sections and saved library entries are untouched; Undo restores cleared kept chords. Card history, slider, palette, and count survive switching modes during the session. Dice and Compose retain their existing behavior.

### Shared generation logic

Settings in Cards and Dice offer **Connection**, **Tonal movement** (the default), and **Voice movement**, each with its own slider. The default **Simple** palette contains only m7, dominant 7, maj7, and fully diminished dim7; the D20 repeats each quality five times. Classic, Extended, and Altered remain available.

**Tonal movement** compares the possible major, natural-minor, and harmonic-minor key collections of adjacent chords. Similar favors a shared or nearby key. Moving toward Modulated increases both the chance of a distant step and the preference for larger distances. It chooses no persistent tonal center, has no fixed cadence queue or settling period, and ignores composer key metadata and old saved tonal routes. Even the low end can drift through different keys over successive draws. Extended chords use their best-fitting key collections. This is a generation heuristic, not a claim of a uniquely correct key analysis.

**Connection** favors shared tones and root relationships at the left, with uniform unique-chord sampling at Random. **Voice movement** favors small playable note movements at Smooth and larger changes at Angular; its voicings survive saving, playback, and MIDI export. All modes respect held dice and generate multi-set rolls sequentially.

The full composer uses the same black studio palette, outlined chord cards, and persistent top mode switch. Its sections, theory controls, editing, playback, and exports remain available.

Validation covers nearby-key drift, increasing modulation distance/frequency, independence from prior centers and composer metadata, palette membership, held dice, shared card/dice logic, and exact preview/batch consumption.
