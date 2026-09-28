# Color Lab

A color theory site for West-MEC Coding Year 1, inspired by coolors.co.

Run it through a local server (VS Code Live Server, or `python -m http.server` in this folder) or GitHub Pages. Menu links point to folders like `pages/wheel/`, so opening `index.html` straight from the file system will not follow them.

## Pages

| Page | What students do |
|---|---|
| Color Basics | How screens mix red, green, and blue light; an R / G / B / Alpha builder that writes the color as rgb(), rgba(), hex, and hex with alpha (with each hex pair color coded), plus its tints / shades / tones; the 12-part artist wheel (primary, secondary, tertiary); warm vs cool; color meanings |
| Color Wheel | Drag a base color around a hue / saturation wheel; handles show complementary, analogous, triadic, split complementary, square, and monochromatic |
| Generator | Coolors-style: Space for a new palette, lock, copy, move, add / remove, undo (Ctrl + Z), harmony modes |
| Inspector | HEX, RGB, RGBA, and hex with alpha; transparency (alpha) row, shades, tints, tones, hues, temperature; harmonies; color blindness simulator; contrast on white and black. Link to one color with `?hex=4ECDC4` |

Color codes on the site are web formats only: hex, rgb(), and rgba(). The hue / saturation / lightness math in `color.js` runs behind the scenes (the wheel and harmonies need it), but no page shows an hsl() code.
| Contrast | WCAG AA / AAA grades, swap, palette quick picks, and "Fix it for me" |
| Visualizer | The saved palette on a mock website using the 60-30-10 rule |
| Root Builder | For the tribute website: pick a primary, then choose the secondary (analogous or tint / shade), contrast (complement, lighter or darker), triadic, and extra (neutral or split complementary) colors. Lighter / Darker buttons on every role, a live tribute preview, five readability checks, and a Copy CSS button for the finished `:root` block |

## How the pieces fit

- `shared/js/color.js`: all the color math (conversions, harmonies, contrast, color names, color blindness). No page code in here.
- `shared/js/palette.js`: the saved palette (localStorage, this browser only), copy-to-clipboard, the "Copied" message, and swatch rows.
- `shared/js/navbar.js`: the header and nav. Add a page to `sitePages` to add it to the menu.
- Each page has its own folder with `index.html`, a CSS file, and a JS file.

The palette a student makes in any tool is saved and shows up in every other tool.

Color blindness simulation uses the Machado et al. (2009) matrices. Contrast follows WCAG 2.
