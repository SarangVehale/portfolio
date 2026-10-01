#!/usr/bin/env python3
"""prerender.py — generate static, crawler-readable HTML snapshots.

Why this exists
----------------
The live site is a client-rendered SPA: index.html ships as an almost
empty shell, and app.js fetches content.md + content/*.md and renders
everything after the page loads. That's fine for browsers, but most AI
crawlers (GPTBot, ClaudeBot, CCBot, PerplexityBot, and friends) don't
reliably execute JavaScript — they fetch raw HTML. Without this script,
those crawlers see an empty page.

This script re-implements a *simplified* version of app.js's content
parsing and rendering in Python, and writes one real static HTML file
per route (about/index.html, projects/index.html, projects worth their
own page under entry/<slug>/index.html, etc.) straight into dist/. Each
page is a self-contained, unstyled, no-JS document with the actual
page text in it, plus a link back to the interactive site.

This is a crawler-facing mirror, not the primary UX. Humans still get
the interactive SPA — these pages exist so machines reading raw HTML
see real content instead of nothing. It does not need to be pixel- or
feature-identical to app.js's rendering (no wikilink resolution, no
grouping edge cases beyond the common ones); it needs to contain the
same *text*, correctly attributed and dated. If you change how a page
is organised in app.js, consider whether this script's output still
reads sensibly, but a small drift in presentation here is a much
smaller problem than crawlers seeing nothing at all.

Runs at deploy time only, after build-manifest.py and after dist/ has
been assembled. No dependencies: standard library only.
"""

from __future__ import annotations

import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT_MD = ROOT / "content.md"
DIST = ROOT / "dist"
SITE_URL = "https://sarangvehale.github.io/portfolio"

FM_RE = re.compile(r"^([a-zA-Z_][\w-]*)\s*:\s*(.*)$")

KIND_BY_BASENAME = {
    "about.md": "about",
    "faq.md": "faq",
    "skills.md": "skills",
    "contact.md": "contact",
    "experience.md": "experience",
    "projects.md": "project",
    "certificates.md": "certificate",
    "publications.md": "publication",
}
KIND_BY_DIR = {
    "content/experience": "experience",
    "content/projects": "project",
    "content/blog": "post",
    "content/blog/notes": "note",
    "content/certificates": "certificate",
    "content/faq": "faq",
}


def default_kind_for_path(path: str) -> str | None:
    segs = path.split("/")
    base = segs.pop()
    if base in KIND_BY_BASENAME:
        return KIND_BY_BASENAME[base]
    for i in range(len(segs), 0, -1):
        probe = "/".join(segs[:i])
        if probe in KIND_BY_DIR:
            return KIND_BY_DIR[probe]
    return None


def slugify(s: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", (s or "").lower())
    return s.strip("-")[:60]


def parse_block(text: str) -> dict:
    lines = text.split("\n")
    fm: dict = {}
    i = 0
    saw_key = False
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        if not stripped:
            i += 1
            continue
        if stripped.startswith("#"):
            i += 1
            continue
        m = FM_RE.match(line)
        if not m:
            break
        key = m.group(1).lower()
        value = m.group(2).strip()
        inline_list = re.match(r"^\[(.*)\]$", value)
        if inline_list:
            arr = [x.strip().strip("\"'") for x in inline_list.group(1).split(",") if x.strip()]
            fm[key] = (fm.get(key) or []) + arr
            saw_key = True
            i += 1
            continue
        if key in fm:
            if not isinstance(fm[key], list):
                fm[key] = [fm[key]]
            fm[key].append(value)
        else:
            fm[key] = value
        saw_key = True
        i += 1
    while i < len(lines) and not lines[i].strip():
        i += 1
    fm["body"] = "\n".join(lines[i:]).strip()
    fm["_has_content"] = saw_key or bool(fm["body"])
    return fm


def parse_entries(text: str, path: str) -> list[dict]:
    default_kind = default_kind_for_path(path)
    trimmed = text.replace("\r\n", "\n").lstrip("\n")
    if trimmed.startswith("---"):
        m = re.match(r"^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)([\s\S]*)$", trimmed)
        if m:
            fm = parse_block(m.group(1))
            fm["body"] = (m.group(2) or "").strip()
            if not fm.get("kind") and default_kind:
                fm["kind"] = default_kind
            fm["_path"] = path
            return [fm] if fm.get("kind") else []
    blocks = re.split(r"(?m)^\s*---\s*$", text)
    out = []
    for b in blocks:
        fm = parse_block(b)
        if not fm.get("_has_content"):
            continue
        if not fm.get("kind") and default_kind:
            fm["kind"] = default_kind
        if fm.get("kind") and (fm.get("title") or fm.get("body")):
            fm["_path"] = path
            out.append(fm)
    return out


# Maps a content file's basename (no extension, lowercase) to the
# static page that mirrors it, for resolving relative .md links in
# body text (e.g. "[publications](publications.md)" in a project
# body). Filled in by main() before any rendering happens.
BASENAME_ROUTE: dict[str, str] = {}


def render_inline(text: str) -> str:
    text = html.escape(text, quote=False)
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<!\w)_(.+?)_(?!\w)", r"<em>\1</em>", text)
    text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)
    text = re.sub(r"\[([^\]]+)\]\(((?:https?|mailto|tel):[^)\s]+)\)", r'<a href="\2">\1</a>', text)

    def md_link(m: re.Match) -> str:
        label, href = m.group(1), m.group(2)
        base = href.split("/")[-1][:-3].lower()  # strip trailing ".md"
        route = BASENAME_ROUTE.get(base)
        return f'<a href="{route}">{label}</a>' if route else m.group(0)

    text = re.sub(r"\[([^\]]+)\]\(([^)\s]+\.md)\)", md_link, text)
    # [text](#/route) -> the matching static page, same route names as
    # app.js's hash router (notes, writing, about, etc).
    text = re.sub(r"\[([^\]]+)\]\(#/([a-z0-9/-]+)\)", rf'<a href="{SITE_URL}/\2/">\1</a>', text)
    return text


def plain_text(md: str, limit: int = 160) -> str:
    """Strip Markdown syntax down to plain prose, for <meta description>."""
    s = md or ""
    s = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", s)   # [text](url) -> text
    s = re.sub(r"[*_`#>]", "", s)                     # bold/italic/code/heading/quote markers
    s = re.sub(r"\s+", " ", s).strip()
    return (s[: limit - 1] + "…") if len(s) > limit else s


PUB_STATUS_LABEL = {
    "published": "Published",
    "under review": "Under review",
    "submitted": "Submitted",
    "accepted": "Accepted",
}


def render_markdown(body: str) -> str:
    if not body:
        return ""
    parts: list[str] = []
    para: list[str] = []
    items: list[str] = []

    def flush_para():
        if para:
            parts.append("<p>" + render_inline(" ".join(para)) + "</p>")
            para.clear()

    def flush_list():
        if items:
            parts.append("<ul>" + "".join(f"<li>{render_inline(x)}</li>" for x in items) + "</ul>")
            items.clear()

    for raw_line in body.split("\n"):
        s = raw_line.strip()
        if not s:
            flush_para()
            flush_list()
            continue
        h = re.match(r"^(#{1,3})\s+(.*)$", s)
        if h:
            flush_para()
            flush_list()
            level = min(len(h.group(1)) + 1, 4)  # shift down a level; page already has an h1
            parts.append(f"<h{level}>{render_inline(h.group(2))}</h{level}>")
            continue
        li = re.match(r"^[-*]\s+(.*)$", s)
        if li:
            flush_para()
            items.append(li.group(1))
            continue
        bq = re.match(r"^>\s?(.*)$", s)
        if bq:
            flush_para()
            flush_list()
            parts.append(f"<blockquote>{render_inline(bq.group(1))}</blockquote>")
            continue
        if re.match(r"^\d+\.\s+", s):
            flush_para()
            flush_list()
            parts.append(f"<p>{render_inline(s)}</p>")
            continue
        flush_list()
        para.append(s)
    flush_para()
    flush_list()
    return "\n".join(parts)


PAGE_TMPL = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{description}">
<link rel="canonical" href="{canonical}">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'none'; style-src 'self'; img-src 'self' data: https:; base-uri 'self'; form-action 'self';">
</head>
<body>
<header><p><a href="{home}">{site_name}</a> &rsaquo; {crumb}</p></header>
<main>
<h1>{h1}</h1>
{body}
</main>
<footer><p><a href="{interactive}">View the interactive site &rarr;</a></p></footer>
</body>
</html>
"""


def write_page(rel_path: str, *, title: str, description: str, crumb: str, h1: str, body_html: str, interactive_hash: str):
    out_dir = DIST / rel_path
    out_dir.mkdir(parents=True, exist_ok=True)
    canonical = f"{SITE_URL}/{rel_path}/" if rel_path else f"{SITE_URL}/"
    page = PAGE_TMPL.format(
        title=html.escape(title),
        description=html.escape(description or title),
        canonical=canonical,
        home=f"{SITE_URL}/",
        site_name=html.escape(SITE.get("name", "Sarang Vehale")),
        crumb=html.escape(crumb),
        h1=html.escape(h1),
        body=body_html or "<p><em>Nothing here yet.</em></p>",
        interactive=f"{SITE_URL}/{interactive_hash}",
    )
    (out_dir / "index.html").write_text(page, encoding="utf-8")


def fmt_date(d: str | None) -> str:
    if not d:
        return ""
    m = re.match(r"^(\d{4})-(\d{2})-(\d{2})", d)
    if not m:
        return d
    months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return f"{months[int(m.group(2))]} {m.group(1)}"


def main() -> int:
    if not CONTENT_MD.exists():
        print("prerender.py: content.md not found, skipping", file=sys.stderr)
        return 0
    header_text = CONTENT_MD.read_text(encoding="utf-8")
    global SITE
    SITE = parse_block(header_text)

    all_entries: list[dict] = []

    file_lines = SITE.get("file") or []
    if isinstance(file_lines, str):
        file_lines = [file_lines]
    for rel in file_lines:
        p = ROOT / rel
        if p.exists():
            all_entries.extend(parse_entries(p.read_text(encoding="utf-8"), rel))

    dir_lines = SITE.get("dir") or []
    if isinstance(dir_lines, str):
        dir_lines = [dir_lines]
    for rel in dir_lines:
        d = ROOT / rel
        if not d.exists():
            continue
        for f in sorted(d.glob("*.md")):
            if f.name.startswith("_"):
                continue
            rel_path = f"{rel}/{f.name}"
            all_entries.extend(parse_entries(f.read_text(encoding="utf-8"), rel_path))

    # Match app.js: slug = slugify(title || role || kind), de-duplicated.
    seen: dict[str, int] = {}
    for e in all_entries:
        base = slugify(e.get("title") or e.get("role") or e.get("kind") or "") or "untitled"
        seen[base] = seen.get(base, 0) + 1
        e["slug"] = base if seen[base] == 1 else f"{base}-{seen[base]}"

    by_kind: dict[str, list[dict]] = {}
    for e in all_entries:
        by_kind.setdefault(e["kind"], []).append(e)

    global BASENAME_ROUTE
    BASENAME_ROUTE = {
        "about": f"{SITE_URL}/about/",
        "skills": f"{SITE_URL}/skills/",
        "contact": f"{SITE_URL}/contact/",
        "experience": f"{SITE_URL}/experience/",
        "projects": f"{SITE_URL}/projects/",
        "publications": f"{SITE_URL}/publications/",
        "certificates": f"{SITE_URL}/certificates/",
        "faq": f"{SITE_URL}/faq/",
    }

    site_name = SITE.get("name", "Sarang Vehale")
    role = SITE.get("role", "")

    # ── about ──────────────────────────────────────────────────────
    about = (by_kind.get("about") or [None])[0]
    if about:
        write_page(
            "about",
            title=f"About | {site_name}",
            description=plain_text(about.get("body", "")),
            crumb="about",
            h1="About",
            body_html=render_markdown(about.get("body", "")),
            interactive_hash="#/about",
        )

    # ── skills ─────────────────────────────────────────────────────
    skills = (by_kind.get("skills") or [None])[0]
    if skills:
        write_page(
            "skills",
            title=f"Skills | {site_name}",
            description=f"{site_name}'s skills and tools.",
            crumb="skills",
            h1="Skills",
            body_html=render_markdown(skills.get("body", "")),
            interactive_hash="#/skills",
        )

    # ── contact ────────────────────────────────────────────────────
    contact = (by_kind.get("contact") or [None])[0]
    links = SITE.get("link") or []
    if isinstance(links, str):
        links = [links]
    link_items = []
    for l in links:
        parts = [x.strip() for x in l.split("|", 1)]
        if len(parts) == 2:
            label, href = parts
            # These pages live under /portfolio/<section>/, not at the
            # site root like the live SPA always does, so a bare
            # relative value (e.g. "resume.pdf") must be resolved
            # against the site root here or it 404s.
            if not re.match(r"^[a-z][a-z0-9+.-]*:", href):
                href = f"{SITE_URL}/{href.lstrip('/')}"
            link_items.append(f"<li>{html.escape(label)}: <a href=\"{html.escape(href)}\">{html.escape(href)}</a></li>")
    contact_body = render_markdown(contact.get("body", "")) if contact else ""
    if link_items:
        contact_body += "<ul>" + "".join(link_items) + "</ul>"
    write_page(
        "contact",
        title=f"Contact | {site_name}",
        description=f"How to reach {site_name}.",
        crumb="contact",
        h1="Contact",
        body_html=contact_body,
        interactive_hash="#/contact",
    )

    # ── experience (grouped by org, like app.js) ──────────────────
    exp = sorted(by_kind.get("experience") or [], key=lambda e: e.get("date") or "", reverse=True)
    groups: list[dict] = []
    idx: dict[str, int] = {}
    for e in exp:
        key = e.get("org") or e.get("role") or ""
        if key not in idx:
            idx[key] = len(groups)
            groups.append({"org": key, "roles": []})
        groups[idx[key]]["roles"].append(e)
    exp_html = []
    for g in groups:
        exp_html.append(f"<h2>{render_inline(g['org'])}</h2>")
        for e in g["roles"]:
            date_range = f"{fmt_date(e.get('date'))} – {fmt_date(e.get('end')) or 'present'}"
            exp_html.append(f"<h3>{render_inline(e.get('role', ''))}</h3>")
            meta = [date_range]
            if e.get("location"):
                meta.append(e["location"])
            exp_html.append(f"<p><em>{' · '.join(html.escape(m) for m in meta)}</em></p>")
            if e.get("summary"):
                exp_html.append(f"<p>{render_inline(e['summary'])}</p>")
            exp_html.append(render_markdown(e.get("body", "")))
    write_page(
        "experience",
        title=f"Experience | {site_name}",
        description=f"Where {site_name} has worked.",
        crumb="experience",
        h1="Experience",
        body_html="\n".join(exp_html),
        interactive_hash="#/experience",
    )

    # ── projects (list + detail pages for entries with no link:) ──
    projects = sorted(by_kind.get("project") or [], key=lambda e: e.get("date") or "", reverse=True)
    proj_list_html = []
    for p in projects:
        href = p.get("link") or f"{SITE_URL}/entry/{p['slug']}/"
        proj_list_html.append(
            f"<li><a href=\"{html.escape(href)}\"><strong>{render_inline(p.get('title',''))}</strong></a>"
            f" <em>({fmt_date(p.get('date'))})</em><br>{render_inline(p.get('summary',''))}</li>"
        )
        if not p.get("link"):
            write_page(
                f"entry/{p['slug']}",
                title=f"{p.get('title','')} | {site_name}",
                description=plain_text(p.get("summary", "")),
                crumb=f"projects / {p.get('title','')}",
                h1=p.get("title", ""),
                body_html=f"<p><em>{fmt_date(p.get('date'))}</em></p>" + render_markdown(p.get("body", "")),
                interactive_hash=f"#/entry/{p['slug']}",
            )
    write_page(
        "projects",
        title=f"Projects | {site_name}",
        description="Software, research, and hardware projects.",
        crumb="projects",
        h1="Projects",
        body_html="<ul>" + "".join(proj_list_html) + "</ul>",
        interactive_hash="#/projects",
    )

    # ── publications ───────────────────────────────────────────────
    pubs = by_kind.get("publication") or []  # curated order, not date-sorted (matches app.js)
    pub_html = []
    for p in pubs:
        meta = " · ".join(x for x in [p.get("authors"), ", ".join(filter(None, [p.get("venue"), p.get("year")]))] if x)
        status = p.get("statusnote") or PUB_STATUS_LABEL.get((p.get("status") or "").lower(), p.get("status") or "")
        link = f" &middot; <a href=\"{html.escape(p['link'])}\">view</a>" if p.get("link") else ""
        pub_html.append(
            f"<li><strong>{render_inline(p.get('title',''))}</strong><br>"
            f"<em>{render_inline(meta)}</em><br>{render_inline(status)}"
            f"{(' · ' + render_inline(p['role'])) if p.get('role') else ''}{link}</li>"
        )
    write_page(
        "publications",
        title=f"Publications | {site_name}",
        description="Papers and preprints, newest first.",
        crumb="publications",
        h1="Publications",
        body_html="<ul>" + "".join(pub_html) + "</ul>",
        interactive_hash="#/publications",
    )

    # ── certificates ───────────────────────────────────────────────
    certs = sorted(by_kind.get("certificate") or [], key=lambda e: e.get("date") or "", reverse=True)
    cert_html = []
    for c in certs:
        link = f" &middot; <a href=\"{html.escape(c['link'])}\">view</a>" if c.get("link") and "REPLACE_ME" not in c["link"] else ""
        cert_html.append(
            f"<li><strong>{render_inline(c.get('title',''))}</strong><br>"
            f"<em>{render_inline(c.get('issuer',''))} ({fmt_date(c.get('date'))})</em>{link}</li>"
        )
    write_page(
        "certificates",
        title=f"Certificates | {site_name}",
        description="Programs and courses completed.",
        crumb="certificates",
        h1="Certificates",
        body_html="<ul>" + "".join(cert_html) + "</ul>",
        interactive_hash="#/certificates",
    )

    # ── faq ────────────────────────────────────────────────────────
    faqs = by_kind.get("faq") or []
    def faq_order(e):
        try:
            return int(e.get("order", 999))
        except (TypeError, ValueError):
            return 999
    faqs = sorted(faqs, key=faq_order)
    faq_html = []
    for f in faqs:
        faq_html.append(f"<h2>{render_inline(f.get('title',''))}</h2>" + render_markdown(f.get("body", "")))
    write_page(
        "faq",
        title=f"FAQ | {site_name}",
        description="Frequently asked questions.",
        crumb="faq",
        h1="FAQ",
        body_html="\n".join(faq_html),
        interactive_hash="#/faq",
    )

    # ── writing (blog posts, list + detail) ───────────────────────
    posts = sorted(by_kind.get("post") or [], key=lambda e: e.get("date") or "", reverse=True)
    post_list_html = []
    for p in posts:
        post_list_html.append(
            f"<li><a href=\"{SITE_URL}/entry/{p['slug']}/\"><strong>{render_inline(p.get('title',''))}</strong></a>"
            f" <em>({fmt_date(p.get('date'))})</em><br>{render_inline(p.get('summary',''))}</li>"
        )
        write_page(
            f"entry/{p['slug']}",
            title=f"{p.get('title','')} | {site_name}",
            description=plain_text(p.get("summary", "")),
            crumb=f"writing / {p.get('title','')}",
            h1=p.get("title", ""),
            body_html=f"<p><em>{fmt_date(p.get('date'))}</em></p>" + render_markdown(p.get("body", "")),
            interactive_hash=f"#/entry/{p['slug']}",
        )
    write_page(
        "writing",
        title=f"Writing | {site_name}",
        description="Essays and notes from the work.",
        crumb="writing",
        h1="Writing",
        body_html="<ul>" + "".join(post_list_html) + "</ul>",
        interactive_hash="#/writing",
    )

    # ── notes (all render inline on one page, like app.js) ────────
    notes = sorted(by_kind.get("note") or [], key=lambda e: e.get("date") or "", reverse=True)
    note_html = []
    for n in notes:
        if n.get("title"):
            note_html.append(f"<h2>{render_inline(n['title'])}</h2>")
        note_html.append(f"<p><em>{fmt_date(n.get('date'))}</em></p>")
        note_html.append(render_markdown(n.get("body", "")))
    write_page(
        "notes",
        title=f"Notes | {site_name}",
        description="Idea dumps, how-tos, running logs.",
        crumb="notes",
        h1="Notes",
        body_html="\n".join(note_html),
        interactive_hash="#/notes",
    )

    print(f"prerender.py: wrote {sum(1 for _ in DIST.rglob('index.html'))} static pages")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
