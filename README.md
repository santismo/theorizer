# Theorizer

A browser-based harmony workspace with physical chord dice, genre-aware progression generation, guitar fingerings, chord auditioning, MIDI export, and saved songs.

## GitHub Pages

The ready-to-publish site is in `docs/`. In repository **Settings → Pages**, choose **Deploy from a branch**, **main**, and **/docs**, then save.

Site: https://santismo.github.io/theorizer/

## Development

Use Node.js 22.13 or later. Run `npm install`, then `npm run dev`. Run `npm run build` to update `docs/` before committing changes.

Dice mode is the default. Keep a rolled chord with **+**. Saved chords wrap into four columns and scroll with the page. Tap a saved chord to hear it; tap its three-dot handle for options or hold and drag to reorder across rows.

Saved progressions are stored locally in each browser and website address. Existing saves on the ChatGPT-hosted site do not automatically appear on GitHub Pages.
