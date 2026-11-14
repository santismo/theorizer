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

Choose **Cards** beside Dice (or in the composer) for a single-card chord browser. Swipe left to move forward and draw a new chord at the end of the trail; swipe right to revisit earlier cards. The arrow buttons and keyboard arrows also navigate. Tap the card to audition it, and **+** adds it to the shared saved-chord grid. The trail and slider setting survive switching modes during the session.

Cards has its own Connected–Random selector. Connected weights shared chord tones, short voice movement, and root relationships using the current card. Random samples every distinct root/quality combination in the chosen palette equally. No key, mode, genre, modulation, or composer setting participates in card generation. Card settings expose only the palette, sound, and file controls. Dice and Compose retain their existing behavior.
