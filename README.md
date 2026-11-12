# AThoughtfulHermit

A static site for reflective thoughts and ideas—chronicles on closeness, time, and becoming—presented as a full-page featured piece driven by a rolling strip of all entries.

## Local preview

```bash
python3 -m http.server 8765
```

Open [http://127.0.0.1:8765/](http://127.0.0.1:8765/).

## Layout

- **Header** — author portrait and AThoughtfulHermit brand over the cabin background
- **Feature panel** — the focused chronicle (title, excerpts, Essay / View cartoon)
- **Rolling strip** — all chronicles; three visible at a time on desktop; focus moves with prev/next, click, or arrow keys and updates the feature panel

Initial focus is the newest chronicle (*The Geography of Distance*).

## Repository layout

| File | Role |
| --- | --- |
| `index.html` | Page shell, essay templates, modal |
| `style.css` | Layout, cabin theme, strip, modal |
| `chronicles.js` | Chronicle metadata (source of truth for feature + strip) |
| `script.js` | Focus/strip sync and modal behavior |
| `images/` | Brand art, author portrait, chronicle cartoons |

## GitHub Pages

Publish from the `main` branch root. After enabling Pages on the repository, the site serves as static files with no build step.
