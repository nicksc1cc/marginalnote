#!/usr/bin/env python3
"""
Marginal Note — essay pipeline.
Turns a markdown essay in drafts/ into a published HTML page in essays/
and refreshes index.html + feed.xml.

Usage:
    python3 scripts/build.py                          # build all essays
    python3 scripts/build.py drafts/my-essay.md       # build one essay

Essay front matter (YAML-like, top of file between --- lines):
    title: The Efficiency Trap
    description: One-sentence deck shown on the index and OG
    date: 2026-10-14
    category: Ethics | AI | World | Technology | Culture
    number: 4                 # essay number (optional, auto if missing)
    words: 1200               # optional word count override
    reading_minutes: 6        # optional
    body_markup:
        # dropcap: true  # removed in clean redesign
"""
import json, re, sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DRAFTS = ROOT / "drafts"
ESSAYS = ROOT / "essays"
TEMPLATE = ROOT / "scripts" / "essay_template.html"


def slugify(title: str) -> str:
    s = title.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def read_front_matter(text: str):
    if not text.startswith("---"):
        return {}, text
    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}, text
    fm_text, body = parts[1], parts[2]
    fm = {}
    for line in fm_text.strip().splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            fm[k.strip()] = v.strip().strip('"').strip("'")
    return fm, body


def markdown_to_html(body: str, dropcap=False) -> str:
    """Small safe renderer for the page-copy subset of markdown we use."""
    lines = body.strip().splitlines()
    out = []
    para = []
    in_blockquote = False
    in_list = False

    def close_para():
        nonlocal para
        if para:
            txt = " ".join(para)
            txt = inline(txt)
            out.append(f"<p>{txt}</p>")
            para = []

    def inline(t):
        t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
        t = re.sub(r"(?<!\*)\*([^*]+?)\*(?!\*)", r"<em>\1</em>", t)
        t = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', t)
        t = re.sub(r"`([^`]+)`", r"<code>\1</code>", t)
        return t

    for raw in lines:
        line = raw.rstrip()
        if not line.strip():
            close_para()
            out.append("")
            continue

        if line.startswith("### "):
            close_para()
            out.append(f"<h3>{inline(line[4:])}</h3>")
        elif line.startswith("## "):
            close_para()
            out.append(f"<h2>{inline(line[3:])}</h2>")
        elif line.startswith("- "):
            close_para()
            out.append(f"<ul><li>{inline(line[2:])}</li></ul>")
        elif line.startswith("> "):
            close_para()
            out.append(f"<blockquote><p>{inline(line[2:])}</p></blockquote>")
        elif line.startswith("NOTE:"):
            close_para()
            out.append(f'<p class="note">{inline(line[6:])}</p>')
        elif line.strip() == "---":
            close_para()
            out.append("<hr>")
        else:
            para.append(line)

    close_para()

    html = "\n".join(out)
    if dropcap:
        pass
    return html


def count_words(text: str) -> int:
    body = re.sub(r"^---.*?---", "", text, flags=re.DOTALL)
    return len(re.findall(r"\w+", body))


def reading_minutes(word_count: int) -> int:
    return max(2, round(word_count / 220))


def essay_template() -> str:
    return TEMPLATE.read_text()


def build_essay(md_path: Path, force_number=None) -> dict:
    text = md_path.read_text()
    fm, body = read_front_matter(text)

    title = fm.get("title", md_path.stem.replace("-", " ").title())
    category = fm.get("category", "Notes")
    description = fm.get("description", "")
    date = fm.get("date", datetime.now().strftime("%Y-%m-%d"))
    words = int(fm.get("words", 0)) or count_words(text)
    minutes = int(fm.get("reading_minutes", 0)) or reading_minutes(words)
    dropcap = fm.get("dropcap", "true").lower() == "true"

    number = force_number or int(fm["number"]) if "number" in fm else None
    if number is None:
        # find next number from existing essays
        number = 0

    slug = md_path.stem
    date_display = datetime.strptime(date, "%Y-%m-%d").strftime("%d %b %Y") if re.match(r"\d{4}-\d{2}-\d{2}", date) else date
    next_essay = prev_essay = ""

    body_html = markdown_to_html(body, dropcap=dropcap)

    tpl = essay_template()
    page = (tpl
        .replace("<!-- TITLE -->", title)
        .replace("<!-- OG_TITLE -->", title)
        .replace("<!-- OG_DESC -->", description or "A marginal note on artificial intelligence, ethics, and the world as it becomes.")
        .replace("<!-- SHADOW_TITLE -->", title)
        .replace("<!-- BYLINE -->", f"{category} \u00b7 {date_display}")
        .replace("<!-- BODY -->", body_html)
        .replace("<!-- CANONICAL -->", f"https://marginalnote.com/essays/{slug}.html")
    )

    dest = ESSAYS / f"{slug}.html"
    dest.write_text(page)
    return {
        "number": number, "title": title, "slug": slug, "category": category,
        "date": date, "description": description, "words": words, "minutes": minutes,
        "path": f"essays/{slug}.html",
    }


def build_index(essays: list):
    """Regenerate index.html from the essay registry."""
    order = sorted(essays, key=lambda e: int(e["date"].replace("-", "")), reverse=True)
    rows = []
    for i, e in enumerate(order):
        rows.append(f'''
        <a class="essay-item" href="{e['path']}">
          <span class="title">{e['title']}</span><br>
          <span class="excerpt">{e['description']}</span><br>
          <span class="meta">{e['category']} · {e['date']}</span>
        </a>''')

    index_path = ROOT / "index.html"
    idx = index_path.read_text()
    rows_html = "\n".join(rows)
    idx = re.sub(r'<!-- ESSAYS -->.*?<!-- /ESSAYS -->',
                 f'<!-- ESSAYS -->{rows_html}\n        <!-- /ESSAYS -->', idx, flags=re.DOTALL)
    index_path.write_text(idx)

    # Feed
    feed_items = []
    for e in order[:10]:
        feed_items.append(f'''
    <item>
      <title>{e['title']}</title>
      <link>https://marginalnote.com/{e['path']}</link>
      <guid>https://marginalnote.com/{e['path']}</guid>
      <pubDate>{datetime.strptime(e['date'], '%Y-%m-%d').strftime('%a, %d %b %Y 00:00:00 +0000')}</pubDate>
      <description>{e['description']}</description>
    </item>''')
    feed = (ROOT / "feed.xml").read_text()
    feed = re.sub(r'<!-- ITEMS -->.*?<!-- /ITEMS -->', f'<!-- ITEMS -->{feed_items}\n  <!-- /ITEMS -->', feed, flags=re.DOTALL)
    (ROOT / "feed.xml").write_text(feed)


def main():
    registry_path = ROOT / ".essays.json"
    essays = []
    if registry_path.exists():
        essays = json.loads(registry_path.read_text())

    if len(sys.argv) > 1:
        targets = [Path(a) for a in sys.argv[1:]]
    else:
        targets = sorted(DRAFTS.glob("*.md"))

    for t in targets:
        print(f"Building {t.name}…")
        essay = build_essay(t)
        essays = [e for e in essays if e["slug"] != essay["slug"]]
        essays.append(essay)
        print(f"  → Nº {essay['number']:02d} · {essay['title']} ({essay['path']})")

    registry_path.write_text(json.dumps(essays, indent=2))
    build_index(essays)
    print("Index + feed rebuilt.")


if __name__ == "__main__":
    main()