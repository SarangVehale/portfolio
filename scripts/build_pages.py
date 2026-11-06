#!/usr/bin/env python3
"""Build the pages around the homepage. Python 3 standard library, plus Pillow
only when photos change.

    python3 scripts/build_pages.py

What it does:
  - writes the shared header and footer into index.html (between the
    <!-- header:start/end --> and <!-- footer:start/end --> markers)
  - blog/: one page per post in content/blog/*.md and content/blog/notes/*.md
  - uses/:    from content/blog/gear.md
  - photos/:  from photos/photos.txt, resized to images/photos/ with metadata stripped
  - sitemap.xml

Posts: a markdown file with front matter (title, date, tags, summary). Add
`draft: true` to keep a post off the site.
"""
import html
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://sarangvehale.github.io/portfolio/"
SCHOLAR = "https://scholar.google.com/citations?user=x-3dXnMAAAAJ&amp;hl=en"
E = html.escape

PAGES = [  # (folder, label, glyph, glyph class)
    ("blog", "Blog", "लेख", "dev"),
    ("uses", "Uses", "道具", "jp"),
    ("photos", "Photos", "चित्र", "dev"),
]
SECTIONS = [("record", "Record"), ("research", "Research"), ("workshop", "Workshop"),
            ("publications", "Publications"), ("training", "Training"),
            ("questions", "Questions"), ("about", "About"), ("contact", "Contact")]


# ---------------------------------------------------------------- chrome
def header(r, current=None):
    nav = "\n".join(
        f'      <a class="hdr-link" href="{r}{p}/"{" aria-current=\"page\"" if p == current else ""}>'
        f'<span class="{c}" aria-hidden="true">{g}</span>{l}</a>'
        for p, l, g, c in PAGES)
    menu_pages = "\n".join(f'    <a href="{r}{p}/"><span class="{c}">{g}</span>{l}</a>' for p, l, g, c in PAGES)
    menu_sections = "\n".join(
        f'    <a href="{r}#{i}"><span class="mono">|{n + 1:02d}⟩</span>{l}</a>' for n, (i, l) in enumerate(SECTIONS))
    return f'''<nav class="hdr" aria-label="Primary">
  <div class="wrap hdr-in">
    <a class="hdr-brand" href="{r or './'}"><span class="jp" aria-hidden="true">知</span>Sarang Vehale</a>
    <div class="hdr-nav">
{nav}
    </div>
    <div class="hdr-right">
      <span class="ver ver--far"><span class="star" aria-hidden="true"></span>Open to PhD positions</span>
      <a class="ver ver--mid" href="{SCHOLAR}" target="_blank" rel="noopener">Google Scholar</a>
      <a class="btn btn--sm" href="{r}#contact">Contact</a>
      <a class="btn btn--sm btn--bone" href="{r}resume.pdf">Résumé</a>
      <button class="burger" type="button" aria-label="Open menu" aria-expanded="false"><span></span><span></span></button>
    </div>
  </div>
  <div class="menu">
    <p class="label menu-h">Pages</p>
{menu_pages}
    <p class="label menu-h">On the homepage</p>
{menu_sections}
    <a href="{SCHOLAR}" target="_blank" rel="noopener"><span class="mono">GS</span>Google Scholar</a>
    <a href="{r}resume.pdf"><span class="mono">pdf</span>Résumé</a>
  </div>
</nav>'''


CREDITS = ('Art, public domain or CC0 unless noted, via Wikimedia Commons: '
           '<a href="https://commons.wikimedia.org/wiki/File:MET_DT240.jpg" target="_blank" rel="noopener">Shiva Nataraja</a> (Metropolitan Museum of Art), '
           '<a href="https://commons.wikimedia.org/wiki/File:8th_century_Standing_Shiva_Mahadeva,_Kashmir,_India,_Clevelandart_1989.369.jpg" target="_blank" rel="noopener">Shiva Mahadeva</a> (Cleveland Museum of Art), '
           '<a href="https://commons.wikimedia.org/wiki/File:Kofukuji_Ashura_2.jpg" target="_blank" rel="noopener">Ashura of Kofuku-ji</a>, '
           '<a href="https://commons.wikimedia.org/wiki/File:Saraswati_by_Raja_Ravi_Varma.jpg" target="_blank" rel="noopener">Saraswati</a> (Raja Ravi Varma, 1894), '
           'Hokusai\'s Great Wave (Metropolitan Museum of Art). Experience plates: '
           '<a href="https://commons.wikimedia.org/wiki/File:Seki.jpeg" target="_blank" rel="noopener">Seki Takakazu</a>, '
           '<a href="https://commons.wikimedia.org/wiki/File:2nd_century_BCE_and_11th_century_CE,_Double_book_manuscript,_Patanjali_Mahabhasya_and_Kaiyata_Mah%C4%81bh%C4%81%E1%B9%A3yaprad%C4%ABpa,_Sanskrit_Hindu_text_India,_now_at_University_of_Pennsylvania_01.jpg" target="_blank" rel="noopener">Mahābhāṣya manuscript</a> (University of Pennsylvania), '
           '<a href="https://commons.wikimedia.org/wiki/File:Rediscovered_circa_16th_century_Arthashastra_manuscript_in_Grantha_script_from_the_Oriental_Research_Institute_(ORI)_which_was_found_in_1905_05.jpg" target="_blank" rel="noopener">Arthaśāstra manuscript</a> (ORI Mysore), '
           '<a href="https://commons.wikimedia.org/wiki/File:Lilavati_of_Bhaskaracharya_II,_Sanskrit_language,_Newar_script.jpg" target="_blank" rel="noopener">Līlāvatī manuscript</a>, '
           '<a href="https://commons.wikimedia.org/wiki/File:Solvay_conference_1927.jpg" target="_blank" rel="noopener">Solvay Conference 1927</a>, and '
           '<a href="https://commons.wikimedia.org/wiki/File:Kriegsspiel_1824.jpg" target="_blank" rel="noopener">Kriegsspiel 1824 reconstruction</a> by Matthew Kirschenbaum, '
           '<a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a>.')


def footer(r):
    pages = "".join(f'<li><a class="ftr-link" href="{r}{p}/">{l}</a></li>' for p, l, g, c in PAGES)
    home = "".join(f'<li><a class="ftr-link" href="{r}#{i}">{l}</a></li>' for i, l in SECTIONS[:5])
    return f'''<footer class="ftr">
  <div class="wrap">
    <div class="ftr-top">
      <div>
        <div class="ftr-mark" aria-hidden="true"><span class="jp">知</span><span class="dev">ज्ञ</span></div>
        <p class="ftr-tag">From darkness,<br>lead me to light.</p>
        <p class="ftr-jp"><span class="dev" lang="sa">तमसो मा ज्योतिर्गमय</span> · <span class="jp" lang="ja">闇より光へ</span> · Bṛhadāraṇyaka Upaniṣad 1.3.28</p>
      </div>
      <div class="ftr-cols">
        <div class="ftr-col"><p class="ftr-head">Pages</p><ul>{pages}</ul></div>
        <div class="ftr-col"><p class="ftr-head">Home</p><ul>{home}</ul></div>
        <div class="ftr-col"><p class="ftr-head">Elsewhere</p><ul>
          <li><a class="ftr-link" href="https://github.com/SarangVehale" target="_blank" rel="noopener">GitHub</a></li>
          <li><a class="ftr-link" href="{SCHOLAR}" target="_blank" rel="noopener">Google Scholar</a></li>
          <li><a class="ftr-link" href="https://orcid.org/0009-0001-5911-9503" target="_blank" rel="noopener">ORCID</a></li>
          <li><a class="ftr-link" href="https://linkedin.com/in/sarangvehale" target="_blank" rel="noopener">LinkedIn</a></li>
          <li><a class="ftr-link" href="mailto:sarangvehale2@gmail.com">Email</a></li>
        </ul></div>
      </div>
    </div>
    <div class="ftr-huge" aria-hidden="true"><span>SARANG</span></div>
    <p class="ftr-credits">{CREDITS}</p>
    <div class="ftr-bottom">
      <span>© {date.today().year} Sarang Vehale · <span class="jp">知</span></span>
      <span class="ftr-ai">Halftones generated from public-domain works · geometry drawn in code</span>
      <span>UK spelling, no trackers.</span>
    </div>
  </div>
</footer>'''


def page(r, current, title, desc, body, canonical, extra_head=""):
    return f'''<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{E(title)}</title>
<meta name="description" content="{E(desc)}">
<meta name="author" content="Sarang Vehale">
<link rel="canonical" href="{SITE}{canonical}">
<meta property="og:title" content="{E(title)}">
<meta property="og:description" content="{E(desc)}">
<meta property="og:type" content="website">
<meta property="og:url" content="{SITE}{canonical}">
<meta property="og:image" content="{SITE}images/art/og.png">
<meta name="theme-color" content="#000000">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'none'">
<meta name="referrer" content="strict-origin-when-cross-origin">
<link rel="icon" href="data:,">
<link rel="preload" href="{r}assets/fonts/fraunces-normal-300_700-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="{r}assets/fonts/spacegrotesk-normal-300_700-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="{r}assets/site.css">
<script src="{r}assets/site.js"></script>{extra_head}
</head>
<body class="subpage">
<a class="skip" href="#main">Skip to content</a>
{header(r, current)}
<main id="main">
{body}
</main>
{footer(r)}
</body>
</html>
'''


def sheet_head(n, title, dv, jp):
    return (f'<div class="sheet-head"><span class="sheet-n">{n}</span><p class="sheet-t">{title}</p>'
            f'<span class="sheet-lead"></span><span class="sheet-g" aria-hidden="true">'
            f'<span class="dev">{dv}</span><span class="jp">{jp}</span></span></div>')


# ---------------------------------------------------------------- markdown
def inline(t):
    t = E(t, quote=False)
    codes = []
    t = re.sub(r"`([^`]+)`", lambda m: codes.append(m.group(1)) or f"\x00{len(codes) - 1}\x00", t)
    t = re.sub(r"!\[([^\]]*)\]\(([^)\s]+)\)", r'<img src="\2" alt="\1" loading="lazy">', t)
    t = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)",
               lambda m: f'<a class="link" href="{m.group(2)}"'
                         + (' target="_blank" rel="noopener"' if m.group(2).startswith("http") else "")
                         + f">{m.group(1)}</a>", t)
    t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?!\w)", r"<em>\1</em>", t)
    t = re.sub(r"(?<!\w)_(?!\s)(.+?)(?<!\s)_(?!\w)", r"<em>\1</em>", t)
    t = re.sub(r"\x00(\d+)\x00", lambda m: f"<code>{codes[int(m.group(1))]}</code>", t)
    return t


def markdown(src):
    """A small, strict subset: headings, paragraphs, lists, code, quotes, rules."""
    lines = src.replace("\r\n", "\n").split("\n")
    out, i = [], 0
    while i < len(lines):
        ln = lines[i]
        if ln.startswith("```"):
            lang = ln[3:].strip()
            buf = []
            i += 1
            while i < len(lines) and not lines[i].startswith("```"):
                buf.append(lines[i])
                i += 1
            i += 1
            out.append(f'<pre class="code"{f" data-lang={chr(34)}{E(lang)}{chr(34)}" if lang else ""}><code>{E(chr(10).join(buf))}</code></pre>')
            continue
        m = re.match(r"^(#{1,4})\s+(.*)", ln)
        if m:
            lvl = min(len(m.group(1)) + 1, 4)
            out.append(f"<h{lvl}>{inline(m.group(2))}</h{lvl}>")
            i += 1
            continue
        if re.match(r"^\s*(---|\*\*\*)\s*$", ln):
            out.append("<hr>")
            i += 1
            continue
        if ln.startswith("^"):
            # author's aside marker, rendered as a margin note
            out.append(f'<p class="aside">{inline(ln.lstrip("^#").strip().rstrip("^"))}</p>')
            i += 1
            continue
        if ln.startswith(">"):
            buf = []
            while i < len(lines) and lines[i].startswith(">"):
                buf.append(lines[i].lstrip("> "))
                i += 1
            out.append(f"<blockquote><p>{inline(' '.join(buf))}</p></blockquote>")
            continue
        m = re.match(r"^(\s*)([-*]|\d+\.)\s+(.*)", ln)
        if m:
            tag = "ol" if m.group(2)[0].isdigit() else "ul"
            items = []
            while i < len(lines):
                mm = re.match(r"^(\s*)([-*]|\d+\.)\s+(.*)", lines[i])
                if mm:
                    items.append(mm.group(3))
                elif lines[i].startswith("   ") and items and lines[i].strip():
                    items[-1] += " " + lines[i].strip()
                else:
                    break
                i += 1
            out.append(f"<{tag}>" + "".join(f"<li>{inline(x)}</li>" for x in items) + f"</{tag}>")
            continue
        if not ln.strip():
            i += 1
            continue
        buf = []
        while i < len(lines) and lines[i].strip() and not re.match(r"^(#{1,4}\s|```|>|\s*([-*]|\d+\.)\s|\^)", lines[i]):
            buf.append(lines[i].strip())
            i += 1
        out.append(f"<p>{inline(' '.join(buf))}</p>")
    return "\n".join(out)


def frontmatter(text):
    meta = {}
    m = re.match(r"^---\n(.*?)\n---\n?", text, re.S)
    if m:
        for line in m.group(1).split("\n"):
            if ":" in line:
                k, v = line.split(":", 1)
                v = v.strip()
                if v.startswith("[") and v.endswith("]"):
                    v = [x.strip() for x in v[1:-1].split(",") if x.strip()]
                meta[k.strip()] = v
        text = text[m.end():]
    return meta, text


# ---------------------------------------------------------------- writing
GLYPHS = [("文", "jp"), ("लेख", "dev"), ("記", "jp"), ("टीप", "dev"), ("筆", "jp"), ("ग्रंथ", "dev")]


def load_posts():
    posts = []
    for kind, folder in (("essay", ROOT / "content/blog"), ("note", ROOT / "content/blog/notes")):
        for f in sorted(folder.glob("*.md")):
            meta, body = frontmatter(f.read_text(encoding="utf8"))
            if str(meta.get("draft", "")).lower() == "true":
                continue
            if f.stem == "gear":
                continue  # shown on /uses/
            title = meta.get("title")
            first = re.search(r"^#{1,3}\s+(.+)$", body, re.M)
            if not title and first:
                title = first.group(1).strip()
            if first and title and first.group(1).strip().lower() == str(title).lower():
                body = body.replace(first.group(0), "", 1)  # no repeated title
            d = meta.get("date", "")
            try:
                dt = date.fromisoformat(d)
            except (TypeError, ValueError):
                dt = None
            words = len(re.findall(r"\w+", body))
            posts.append(dict(slug=f.stem, kind=kind, title=(title or f.stem).strip(),
                              summary=meta.get("summary", ""), tags=meta.get("tags", []) or [],
                              date=dt, words=words, body=body))
    posts.sort(key=lambda p: (p["date"] or date.min), reverse=True)
    for n, p in enumerate(posts):
        p["glyph"] = GLYPHS[n % len(GLYPHS)]
    return posts


def fmt_date(d):
    return d.strftime("%-d %b %Y") if d else "Undated"


def post_card(p, r, lead=False):
    g, gc = p["glyph"]
    tags = "".join(f"<span>{E(t)}</span>" for t in p["tags"][:3])
    return f'''<a class="wcard{' wcard--lead' if lead else ''} wcard--{p['kind']} reveal" href="{r}blog/{p['slug']}/">
  <span class="wcard-g {gc}" aria-hidden="true">{g}</span>
  <span class="wcard-top"><span class="tag">{'Essay' if p['kind'] == 'essay' else 'Note'} // {fmt_date(p['date'])}</span><span class="tag">{max(1, round(p['words'] / 220))} min</span></span>
  <span class="wcard-t">{E(p['title'])}</span>
  {f'<span class="wcard-s">{E(p["summary"])}</span>' if p['summary'] else ''}
  <span class="wcard-tags">{tags}</span>
</a>'''


def build_writing(posts):
    r = "../"
    lead, rest = (posts[0], posts[1:]) if posts else (None, [])
    essays = [p for p in rest if p["kind"] == "essay"]
    notes = [p for p in rest if p["kind"] == "note"]
    body = f'''<header class="phero">
  <div class="phero-art"><span class="imgtag imgtag--bl">Saraswati</span><div class="bone-art art-saraswati" role="img" aria-label="Halftone of Raja Ravi Varma's Saraswati with her veena."></div></div>
  <div class="mark mark--br mark--dev dev" aria-hidden="true">लेख</div>
  <div class="wrap phero-in">
    {sheet_head('|01⟩', 'Blog', 'लेख', '文')}
    <h1 class="phero-h reveal">Blog<span class="phero-sub"><span class="dev">लेख</span><span class="jp">文章</span></span></h1>
    <p class="phero-lede reveal">Longer pieces and short notes: systems, homelabs, and what building things teaches. Newest first.</p>
    <div class="phero-stats reveal">
      <div class="spec"><span class="spec__k">Essays</span><span class="spec__lead"></span><span class="spec__v tnum">{sum(p['kind'] == 'essay' for p in posts)}</span></div>
      <div class="spec"><span class="spec__k">Notes</span><span class="spec__lead"></span><span class="spec__v tnum">{sum(p['kind'] == 'note' for p in posts)}</span></div>
    </div>
  </div>
</header>
<section class="sheet sheet--flow">
  <div class="wrap">
    <div class="wgrid">
      {post_card(lead, r, True) if lead else '<p>Nothing published yet.</p>'}
      {''.join(post_card(p, r) for p in essays)}
    </div>
    {f'<p class="label notes-h">Notes <span class="dev">टिप्पणी</span> <span class="jp">覚書</span></p><div class="wgrid wgrid--notes">' + ''.join(post_card(p, r) for p in notes) + '</div>' if notes else ''}
  </div>
</section>'''
    out = ROOT / "blog"
    out.mkdir(exist_ok=True)
    (out / "index.html").write_text(page(r, "blog", "Blog · Sarang Vehale",
                                         "Essays and notes by Sarang Vehale on systems, homelabs and building things.",
                                         body, "blog/"), encoding="utf8")
    for k, p in enumerate(posts):
        rr = "../../"
        g, gc = p["glyph"]
        nxt = posts[(k + 1) % len(posts)] if len(posts) > 1 else None
        tags = "".join(f"<span>{E(t)}</span>" for t in p["tags"])
        body = f'''<article class="post">
  <header class="post-head">
    <div class="mark mark--tr {gc}" aria-hidden="true">{g}</div>
    <div class="wrap">
      {sheet_head('|' + ('文' if p['kind'] == 'essay' else '記') + '⟩', 'Essay' if p['kind'] == 'essay' else 'Note', 'लेख', '文')}
      <a class="post-back tag" href="{rr}blog/">← All posts</a>
      <h1 class="post-h">{E(p['title'])}</h1>
      {f'<p class="post-sum">{E(p["summary"])}</p>' if p['summary'] else ''}
      <div class="post-meta">
        <div class="spec"><span class="spec__k">Date</span><span class="spec__lead"></span><span class="spec__v">{fmt_date(p['date'])}</span></div>
        <div class="spec"><span class="spec__k">Reading</span><span class="spec__lead"></span><span class="spec__v">{max(1, round(p['words'] / 220))} min</span></div>
        <div class="spec"><span class="spec__k">Tags</span><span class="spec__lead"></span><span class="spec__v wcard-tags">{tags}</span></div>
      </div>
    </div>
  </header>
  <div class="wrap post-body">
    <div class="prose">
{markdown(p['body'])}
    </div>
  </div>
  {f'<div class="wrap post-next"><p class="label">Next</p>{post_card(nxt, rr)}</div>' if nxt else ''}
</article>'''
        d = out / p["slug"]
        d.mkdir(exist_ok=True)
        (d / "index.html").write_text(page(rr, "blog", f"{p['title']} · Sarang Vehale",
                                           p["summary"] or p["title"], body, f"blog/{p['slug']}/"), encoding="utf8")
    # remove pages for posts that no longer exist
    keep = {p["slug"] for p in posts}
    for d in out.iterdir():
        if d.is_dir() and d.name not in keep:
            for f in d.iterdir():
                f.unlink()
            d.rmdir()


# ---------------------------------------------------------------- uses
def build_uses():
    src = ROOT / "content/blog/gear.md"
    meta, body = frontmatter(src.read_text(encoding="utf8"))
    groups, cur, asides, updated = [], None, [], ""
    for ln in body.split("\n"):
        m = re.match(r"^##\s+(.*)", ln)
        if m:
            cur = [m.group(1).strip(), [], []]
            groups.append(cur)
            continue
        m = re.match(r"^\s*-\s+([^:]+):\s*(.*)", ln)
        if m and cur:
            cur[1].append((m.group(1).strip(), m.group(2).strip()))
            continue
        if ln.strip().startswith("^"):
            (cur[2] if cur and cur[1] else asides).append(ln.strip().lstrip("^#").strip().rstrip("^"))
            continue
        if ln.strip().lower().startswith("updated"):
            updated = ln.strip()
    glyph = {"desk": ("机", "jp"), "computers": ("यंत्र", "dev"), "edc": ("携", "jp"), "my watches": ("घड़ी", "dev")}
    cards = []
    for name, items, notes in groups:
        key = re.sub(r"\s*\d+$", "", name.lower())
        g, gc = glyph.get(key, ("具", "jp"))
        rows = "".join(f'<div class="spec"><span class="spec__k">{E(k)}</span><span class="spec__lead"></span>'
                       f'<span class="spec__v">{inline(v)}</span></div>' for k, v in items)
        nts = "".join(f'<p class="aside">{inline(n)}</p>' for n in notes)
        cards.append(f'''<section class="ucard reveal{' ucard--wide' if len(items) > 8 else ''}">
  <div class="ucard-head"><span class="ucard-g {gc}" aria-hidden="true">{g}</span><h2>{E(name.upper() if len(name) <= 3 else name[0].upper() + name[1:])}</h2><span class="tag">{len(items)} items</span></div>
  <div class="ucard-rows">{rows}</div>{nts}
</section>''')
    r = "../"
    body = f'''<header class="phero phero--uses">
  <div class="phero-art phero-art--geo"><span class="imgtag imgtag--bl">Split keyboard</span><svg class="geo" data-geo="keyboard" role="img" aria-label="A split keyboard layout, drawn in code."></svg></div>
  <div class="wrap phero-in">
    {sheet_head('|02⟩', 'Uses', 'साधन', '道具')}
    <h1 class="phero-h reveal">Uses<span class="phero-sub"><span class="dev">साधन</span><span class="jp">道具</span></span></h1>
    <p class="phero-lede reveal">{E(meta.get('summary', 'What I use.'))}.</p>
    <p class="tag reveal">{E(updated)}</p>
  </div>
</header>
<section class="sheet sheet--flow">
  <div class="wrap">
    <div class="ugrid">{''.join(cards)}</div>
    {''.join(f'<p class="aside">{inline(a)}</p>' for a in asides)}
  </div>
</section>'''
    out = ROOT / "uses"
    out.mkdir(exist_ok=True)
    (out / "index.html").write_text(page(r, "uses", "Uses · Sarang Vehale",
                                         "The desk, computers, everyday carry and watches Sarang Vehale uses.",
                                         body, "uses/"), encoding="utf8")


# ---------------------------------------------------------------- photos
def build_photos():
    listing = ROOT / "photos/photos.txt"
    entries = []
    for ln in listing.read_text(encoding="utf8").split("\n"):
        ln = ln.strip()
        if not ln or ln.startswith("#"):
            continue
        parts = [x.strip() for x in ln.split("|")]
        entries.append((parts[0], parts[1] if len(parts) > 1 else "", parts[2] if len(parts) > 2 else ""))
    dst = ROOT / "images/photos"
    dst.mkdir(parents=True, exist_ok=True)
    figs = []
    for n, (fname, cap, tag) in enumerate(entries):
        stem = Path(fname).stem
        big, small = dst / f"{stem}.webp", dst / f"{stem}-t.webp"
        srcf = ROOT / "photos" / fname
        if not big.exists() or big.stat().st_mtime < srcf.stat().st_mtime:
            try:
                from PIL import Image, ImageOps
            except ImportError:
                sys.exit("Pillow is needed to process new photos: pip install pillow")
            im = ImageOps.exif_transpose(Image.open(srcf)).convert("RGB")  # metadata is not carried over
            im.thumbnail((1800, 1800), Image.LANCZOS)
            im.save(big, quality=80, method=6)
            t = im.copy()
            t.thumbnail((760, 760), Image.LANCZOS)
            t.save(small, quality=74, method=6)
        w, h = webp_size(small)
        g, gc = GLYPHS[n % len(GLYPHS)]
        figs.append(f'''<figure class="ph reveal">
  <button type="button" class="ph-btn" data-full="../images/photos/{stem}.webp" data-cap="{E(cap)}" aria-label="Open photo: {E(cap)}">
    <img src="../images/photos/{stem}-t.webp" alt="{E(cap)}" width="{w}" height="{h}" loading="lazy">
    <span class="imgtag imgtag--bl">{E(tag or cap)}</span>
  </button>
</figure>''')
    r = "../"
    body = f'''<header class="phero phero--photos">
  <div class="phero-art"><span class="imgtag imgtag--bl">Great Wave</span><div class="bone-art art-wave" role="img" aria-label="Halftone of Hokusai's Great Wave."></div></div>
  <div class="wrap phero-in">
    {sheet_head('|03⟩', 'Photos', 'चित्र', '写真')}
    <h1 class="phero-h reveal">Photos<span class="phero-sub"><span class="dev">चित्र</span><span class="jp">写真</span></span></h1>
    <p class="phero-lede reveal">Things I stopped to look at. Grey until you look at them too; open any one at full size.</p>
    <div class="phero-stats reveal"><div class="spec"><span class="spec__k">Photographs</span><span class="spec__lead"></span><span class="spec__v tnum">{len(entries)}</span></div></div>
  </div>
</header>
<section class="sheet sheet--flow">
  <div class="wrap"><div class="phgrid">{''.join(figs)}</div></div>
</section>
<dialog class="photo-lb" id="photo-lb" aria-label="Photo">
  <div class="plb-inner"><button class="lb-close" type="button">ESC ✕</button><img alt=""><p class="plb-cap"></p></div>
</dialog>'''
    out = ROOT / "photos"
    (out / "index.html").write_text(page(r, "photos", "Photos · Sarang Vehale", "Photographs by Sarang Vehale.",
                                         body, "photos/"), encoding="utf8")


def webp_size(p):
    b = Path(p).read_bytes()[:40]
    if b[12:16] == b"VP8X":
        return 1 + int.from_bytes(b[24:27], "little"), 1 + int.from_bytes(b[27:30], "little")
    if b[12:16] == b"VP8 ":
        return int.from_bytes(b[26:28], "little") & 0x3FFF, int.from_bytes(b[28:30], "little") & 0x3FFF
    if b[12:16] == b"VP8L":
        bits = int.from_bytes(b[21:25], "little")
        return (bits & 0x3FFF) + 1, ((bits >> 14) & 0x3FFF) + 1
    return 800, 600


# ---------------------------------------------------------------- homepage + sitemap
def patch_index():
    f = ROOT / "index.html"
    s = f.read_text(encoding="utf8")
    s = re.sub(r"<!-- header:start -->.*?<!-- header:end -->",
               lambda m: "<!-- header:start -->\n" + header("") + "\n<!-- header:end -->", s, flags=re.S)
    s = re.sub(r"<!-- footer:start -->.*?<!-- footer:end -->",
               lambda m: "<!-- footer:start -->\n" + footer("") + "\n<!-- footer:end -->", s, flags=re.S)
    f.write_text(s, encoding="utf8")


def sitemap(posts):
    urls = ["", "blog/", "uses/", "photos/"] + [f"blog/{p['slug']}/" for p in posts]
    body = "\n".join(f"  <url><loc>{SITE}{u}</loc></url>" for u in urls)
    (ROOT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n<!-- generated by scripts/build_pages.py -->\n'
        f'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{body}\n</urlset>\n', encoding="utf8")


if __name__ == "__main__":
    posts = load_posts()
    build_writing(posts)
    build_uses()
    build_photos()
    patch_index()
    sitemap(posts)
    print(f"{len(posts)} posts, uses, photos, header and footer written")
