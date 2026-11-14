# AThoughtfulHermit

A static site for reflective thoughts and ideas—chronicles on closeness, time, and becoming—presented as a full-page featured piece driven by a rolling strip of all entries.

Live site: [https://jmaret.github.io/AThoughtfulHermit/](https://jmaret.github.io/AThoughtfulHermit/)

## Local preview

```bash
python3 -m http.server 8765
```

Open [http://127.0.0.1:8765/](http://127.0.0.1:8765/).

## Layout

- **Header** — author portrait, brand, and weekly subscribe form
- **Feature panel** — focused chronicle with Essay, View cartoon, Send this article now, Like / Dislike
- **Rolling strip** — all chronicles; three visible on desktop; focus drives the feature panel
- **Emails** — cabin-background HTML for weekly article-of-the-week and on-demand sends

## Free-tier engagement stack

No AWS. Browser stays on GitHub Pages; secrets live in Supabase + GitHub Actions.

| Piece | Free tier |
| --- | --- |
| Site | GitHub Pages |
| DB + API | Supabase free (Postgres + Edge Functions) |
| Email | Resend free |
| Weekly cron | GitHub Actions |

### 1. Create Supabase + Resend

1. Create a free Supabase project.
2. Run [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql) in the SQL editor.
3. Create a Resend account and API key. Set Edge Function secrets:

```bash
supabase secrets set \
  RESEND_API_KEY=re_xxx \
  RESEND_FROM="AThoughtfulHermit <onboarding@resend.dev>" \
  SITE_URL=https://jmaret.github.io/AThoughtfulHermit \
  CRON_SECRET=long-random-string
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are normally injected automatically for Edge Functions.

4. Deploy functions:

```bash
supabase functions deploy subscribe
supabase functions deploy confirm
supabase functions deploy unsubscribe
supabase functions deploy send-article-now
supabase functions deploy send-weekly
supabase functions deploy react
supabase functions deploy reaction-counts
```

5. Put the public project URL and **anon** key into [`config.js`](config.js).

### 2. Build / store a weekly edition

Mark exactly one chronicle with `isArticleOfTheWeek: true` in [`chronicles.js`](chronicles.js), then:

```bash
node scripts/build-email.mjs geography-distance --week 2026-11-17
node scripts/print-edition-upsert.mjs editions/geography-distance-2026-11-17.json
```

Run the printed SQL in Supabase. Emails use the Thoughtful Hermit cabin image as a full background (`images/AThoughtFulHermit.jpg` on Pages) with a parchment content card.

### 3. Weekly GitHub Action

Repo secrets:

- `SUPABASE_FUNCTIONS_URL` — e.g. `https://xxxx.supabase.co/functions/v1`
- `SUPABASE_ANON_KEY` — anon key
- `CRON_SECRET` — same value set in Supabase secrets

Workflow: [`.github/workflows/weekly-email.yml`](.github/workflows/weekly-email.yml) (Mondays 15:00 UTC, plus manual dispatch).

### Behavior notes

- **Subscribe** uses double opt-in (confirm link).
- **Unsubscribe** is a one-click token link in emails / function URL.
- **Send this article now** rate-limits to 3 sends per email per hour.
- **Likes / dislikes** are anonymous (`localStorage` visitor key); no comments.

## Repository layout

| Path | Role |
| --- | --- |
| `index.html` / `style.css` / `script.js` | Static UI |
| `chronicles.js` | Chronicle metadata |
| `config.js` / `engagement.js` | Public config + subscribe / send-now / reactions |
| `editions/` | Built weekly email HTML + metadata |
| `scripts/build-email.mjs` | Cabin-background email builder |
| `supabase/migrations/` | Schema + RLS |
| `supabase/functions/` | Edge Functions |
| `.github/workflows/weekly-email.yml` | Weekly send cron |

## GitHub Pages

Publish from the `main` branch root. After enabling Pages, the site serves as static files with no build step.
