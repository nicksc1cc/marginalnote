# Marginal Note

Anonymous journal of essays on artificial intelligence, ethics, and the world as it becomes.
Notes in the margins of the machine age.

**URL:** https://marginalnote.com (domain available — register it at any registrar, then add a `CNAME` file with `marginalnote.com` and point the domain's DNS at GitHub Pages).

**Hosting:** GitHub Pages (static site, no build step required — pure HTML/CSS/JS).

## Structure

```
marginalnote/
├── index.html             # Essay index (generated)
├── about.html             # Anonymous about / house rules
├── 404.html
├── feed.xml               # RSS (generated)
├── sitemap.xml / robots.txt
├── assets/
│   ├── css/theme.css      # Editorial design system
│   ├── js/site.js         # Progress bar, reveal, keyboard nav
│   └── favicon.svg
├── drafts/                # Markdown sources — write here
├── essays/                # Generated HTML pages
└── scripts/build.py       # Draft → page + index + feed
```

## Publish an essay

1. Write markdown in `drafts/<slug>.md` with YAML front matter (title, description, date, category, optional number/words).
2. `python3 scripts/build.py` — builds the page, updates index + RSS.
3. Commit and push — GitHub Pages deploys automatically.

## Writing voice

The author is anonymous; the argument stands on its own. Calm, analytical, one sentence per idea, no hype vocabulary, mechanism over metaphor, ~850–1,100 words. See the `marginal-note-writer` skill for the full voice guide and house rules.