# Portfolio — Sarang Vehale

A tiny, framework-free portfolio + blog. The entire site renders from one
Markdown manifest (`content.md`) and the files it points at. No build step,
no database, no CMS — edit a `.md` file, refresh the page.

**Quick links:**
- [EDITING.md](EDITING.md) — the **how to update** guide (phone, laptop, anywhere)
- [DEPLOY.md](DEPLOY.md) — step-by-step deployment recipes
- [SECURITY.md](SECURITY.md) — threat model and defences

---

- [What's in this folder](#whats-in-this-folder)
- [Running it locally](#running-it-locally)
- [Deploying](#deploying)
- [Maintaining content](#maintaining-content)
  - [Adding things — quick reference](#adding-things--quick-reference)
  - [Friction-free defaults](#friction-free-defaults)
  - [Editing on any device — the GitHub edit link](#editing-on-any-device--the-github-edit-link)
  - [Searching — Cmd+K](#searching--cmdk)
  - [Editing each section](#editing-each-section)
  - [Markdown that works](#markdown-that-works)
  - [Dates and sorting](#dates-and-sorting)
  - [Tags](#tags)
  - [External vs internal links](#external-vs-internal-links)
  - [Photos and framing](#photos-and-framing)
  - [Google Drive certificate links](#google-drive-certificate-links)
- [Customising the design](#customising-the-design)
- [Entry-kind schema](#entry-kind-schema)
- [How the site works](#how-the-site-works)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

---

## What's in this folder

```
.
├── index.html         Page shell, styles, and DOM scaffolding.
├── app.js             Loads content.md, renders pages, runs the router.
├── md.js              Minimal Markdown renderer (no dependencies).
├── content.md         Manifest: site header + list of content files.
├── content/           Per-section Markdown files.
│   ├── about.md       Single entry, renders the About page.
│   ├── skills.md      Single entry, renders the Skills page.
│   ├── contact.md     Single entry, extra body on the Contact page.
│   ├── experience.md  Work history (`kind: experience` entries).
│   ├── projects.md    Software / research (`kind: project`).
│   ├── writing.md     Blog posts (`kind: post`).
│   ├── notes.md       Idea dumps, how-tos, running logs (`kind: note`).
│   ├── notes/         Optional: one-file-per-note (Obsidian-style).
│   │   └── *.md       — each file is a single note with YAML frontmatter.
│   └── certificates.md Course / program certificates (`kind: certificate`).
├── photos/            Homepage hero photos (randomised + crossfaded).
├── README.md          You are here.
├── EDITING.md         Phone / laptop / browser editing workflows.
├── DEPLOY.md          Step-by-step deployment recipes.
└── SECURITY.md        Threat model and defences.
```

---

## Running it locally

The site fetches `content.md` and the files in `content/` over HTTP. Browsers
block `fetch()` on the `file://` scheme, so **double-clicking `index.html`
won't work**. Start a tiny local server in this folder instead. Pick any:

```bash
# Python (almost always available)
python3 -m http.server 8000

# Node (if installed)
npx serve .

# PHP (if installed)
php -S localhost:8000
```

Then open <http://localhost:8000>.

You can edit any `.md` file while the server is running — just refresh.
There's no hot-reload because the whole point is that you don't need one.

---

## Deploying

See **[DEPLOY.md](DEPLOY.md)** for full walkthroughs. The short version:

- **GitHub Pages** — push this folder to a repo, enable Pages in Settings.
- **Netlify** — drag the folder onto <https://app.netlify.com/drop>.
- **Vercel** — `vercel` from the folder (Vercel CLI).
- **Cloudflare Pages** — connect the repo, no build command needed.

All of these are free for personal sites. Custom domain instructions are in
DEPLOY.md.

---

## Maintaining content

This is the section you'll come back to. Everything content-related lives in
**Markdown files** with simple key-value frontmatter. There are no required
fields besides `kind:` — leave fields out if you don't have them.

### Adding things — quick reference

| Task                                 | Where                                                                                          |
| ------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Update bio / now-line / social links | Header block at the top of `content.md`                                                        |
| **Add a note** (anything!)           | New `---` block in `content/notes.md`, **or** drop a file in `content/notes/` and add a `file:` line in `content.md` |
| Add a project                        | New `---` block in `content/projects.md`                                                       |
| Add a blog post                      | New `---` block in `content/writing.md`                                                        |
| Add a work experience                | New `---` block in `content/experience.md` (match `org:` to nest with existing)                |
| Add a certificate                    | New `---` block in `content/certificates.md`                                                   |
| Edit Skills, About, Contact          | Body of `content/skills.md`, `content/about.md`, `content/contact.md`                          |
| Add a homepage photo                 | Drop file in `photos/`, add a `photo:` line in `content.md`                                    |
| Add a brand-new section              | Create `content/<name>.md`, add `file: content/<name>.md` to `content.md`                      |

## Two ways to organise content

The site supports two patterns. Pick per-section based on what's
ergonomic for that kind of content.

### Single multi-entry file (structured)

For sections with a fixed schema, keep everything in one file. Each
entry is separated by `---`. Used for `about`, `skills`, `contact`,
`faq`, `experience`, `projects`, `certificates`.

```
content/projects.md   →   all your projects, ---separated
content/experience.md →   all your roles, ---separated
```

To add an entry, scroll to the bottom of the file, type `---`, write.

### Auto-discovered folder (Obsidian-style)

For free-form content where you just want to "drop a file and have it
appear" — used for `blog` and `blog/notes`. The site discovers every
`.md` in the folder via the GitHub Contents API (cached 5 min):

```
content/blog/foo.md         →   blog post titled "Foo"
content/blog/notes/bar.md   →   note titled "Bar" under blog
```

Folder = section. Subfolders become subdirs on the site. No manifest
to maintain — push the file, refresh the page.

To declare a folder as auto-discovered, add a `dir:` line in
`content.md`:

```
dir: content/blog
dir: content/blog/notes
```

The site needs `repo:` set in `content.md` (already done) so it knows
which GitHub repo to query. Public repos only.

## Friction-free defaults

Every entry in `content/*.md` can omit fields when they're obvious:

- **`kind:`** is inferred from the filename or the folder. Anything in
  `content/blog/` is automatically `kind: post`. Anything in
  `content/blog/notes/` is `kind: note`. Same for the other section
  files (`about.md` → `about`, etc.).
- **`date:`** defaults to **today**. You can also write `date: today` or
  `date: yesterday` literally. For multiple entries on the same day, use
  a full ISO datetime (`2026-05-15T14:30`) to nail down the order.
- **`title:`** defaults to the **first line of the body**, then to the
  filename if there's no body either. The renderer strips Markdown
  markers (`# `, `**`, etc.) automatically.
- **`draft: true`** hides an entry from the site. Useful for committing
  work-in-progress without it showing up publicly.

The bare minimum blog note is a one-line file:

```
content/blog/notes/random-thought.md:
Just had a thought about X.
```

No title, no date, no kind, no frontmatter. The site fills it all in.

## Editing this site

The whole site is a folder of Markdown files. You update content by
editing `.md` files and committing them — either locally (laptop) or
directly on GitHub (phone, any browser). The full guide with every
workflow recipe is in **[EDITING.md](EDITING.md)**.

Short version:
- **From your laptop**: open the folder in Obsidian or any editor →
  edit → `git push`.
- **From your phone / a browser**: navigate to the file in your GitHub
  repo → tap **✎** → edit in the web editor → commit. Works in Safari,
  Chrome, or the GitHub mobile app.

## Searching — Cmd+K

Press **⌘K** (Mac) or **Ctrl+K** (Windows / Linux), or just `/` anywhere,
to open a global search. Type to filter across every project, post, note,
experience, and certificate. ↑↓ to navigate, ↵ to open, Esc to close.

## Two ways to organise notes

The `note` kind is intentionally broad — quick thoughts, how-to guides,
running logs, idea dumps. Two patterns are supported, and you can mix
them freely:

### A. Multi-entry file

Keep many short notes together in `content/notes.md`. Each note is a
`---`-separated block. Best for quick thoughts you want to scan in one
file. Frontmatter is optional.

### B. One file per note (Obsidian-friendly)

For a longer note you'd rather treat as its own document, drop it in
`content/notes/` as `<slug>.md`. Use Obsidian-style YAML frontmatter at
the top:

```
---
title: How to disable OneDrive on Windows
date: 2025-11-22
tags: [windows, how-to, privacy]
---

Body markdown here.
```

Then add one line to `content.md`:

```
file: content/notes/disable-onedrive-windows.md
```

See `content/notes/disable-onedrive-windows.md` for a working example.

Obsidian opens both styles cleanly. The YAML wrapper above is the same
format Obsidian uses when you edit properties via its UI, so editing in
Obsidian round-trips without surprises.

### Editing each section

Every `.md` file in `content/` works the same way. Each **entry** is a block
separated by `---` on its own line. Each block starts with frontmatter
(simple `key: value` lines), then a blank line, then a Markdown body.

```
kind:    project
title:   My new thing
date:    2026-05-01
tags:    rust, systems
summary: One-line teaser shown in the index.
link:    https://github.com/me/my-thing   ← optional; if present, the entry
                                            opens this URL instead of a body

This is the body. **Markdown** works here — headings, lists, links,
blockquotes, fenced code, etc. See "Markdown that works" below.
```

To **remove** something: delete the whole block (its `---` and contents).
To **reorder** something: don't bother — the site sorts everything by `date:`
descending. Change the date if you want different positioning.

### Linking between pages

Two ways to link from one Markdown file to another:

**Obsidian-style wikilinks** — drop `[[...]]` anywhere in your prose
and the renderer resolves it to the right page:

```
See [[CERTIFY-ED]] for context.
See [[CERTIFY-ED|the validation framework]] for context.
[[faq|frequently asked questions]] · [[skills]]
```

The target can be:
- an entry's `title:` (case-insensitive),
- a file's basename without `.md` (e.g. `faq`, `disable-onedrive-windows`),
- or an entry slug.

If you write `[[target|display text]]`, the part after `|` is what
shows; otherwise the target itself becomes the link text.

**Standard Markdown links to .md files** — the same resolution happens
when you write a normal link whose URL ends in `.md`:

```
[the FAQ](faq.md)
[that OneDrive guide](notes/disable-onedrive-windows.md)
```

Both forms resolve to the right hash route (`#/faq`,
`#/entry/<slug>`, etc.). Unresolved wikilinks render with a dimmed,
dashed underline so you can spot typos.

## Markdown that works

The site ships its own tiny renderer (`md.js`). It handles the common 80%
and stops there. If you need more, swap in `marked` or `markdown-it`.

| Syntax                     | Result                          |
| -------------------------- | ------------------------------- |
| `# Heading`                | H1 (don't use inside a body — the title comes from frontmatter) |
| `## Heading`               | Section heading                 |
| `### Heading`              | Subsection                      |
| `**bold**`                 | **bold**                        |
| `*italic*`                 | *italic*                        |
| `` `inline code` ``        | `inline code`                   |
| ` ``` ` fenced block       | code block                      |
| `[label](url)`             | link                            |
| `![alt](url)`              | image                           |
| `- item` or `* item`       | unordered list                  |
| `1. item`                  | ordered list                    |
| `> quoted line`            | blockquote                      |
| `***`                      | horizontal rule                 |

**Pitfalls:**

- `---` on its own line **always** ends an entry. Use `***` for hr inside a
  body.
- Tables, footnotes, task lists, and HTML inside Markdown are **not**
  supported by the included renderer.
- Lines beginning with `#` at the *top* of a block are treated as comments
  until the first `key: value` line. After the body starts, `#` headings
  render normally.

### Dates and sorting

- Use `YYYY-MM-DD` (e.g. `2026-05-15`). The string sort works because it's
  ISO 8601.
- Within a list page, entries are sorted **newest first**.
- For ongoing work, set `date:` to the start date and leave `end:` blank —
  the experience page will render `Aug 2025 — present`.
- The homepage doesn't show dates; sections do.

### Tags

Add a comma-separated `tags:` line. Tags are lowercased automatically.

```
tags: rust, systems, cli
```

Tags display next to entries in their index pages. They aren't currently
clickable to filter, but you can search by tag from the URL bar in your
browser's find-on-page.

### External vs internal links

- For a `project` entry, set `link: https://…` to **make the whole card
  open externally** (e.g. a GitHub repo, live site, Figma file). The body
  is then ignored on the index — it's still there if you ever drop the
  `link:` later.
- Leave `link:` blank to make the entry open in the **reader view** with
  the body rendered.
- Inside any body, `[text](https://…)` opens in a new tab automatically;
  relative or `#`-hash links open in the same tab.

### Photos and framing

The homepage shows one photo at a time, picked randomly per page load.
Every 30 minutes it crossfades to a different one.

Each photo line lives in the header block of `content.md`:

```
photo: photos/14-puppy.jpeg | center 70%
photo: photos/05-cats-falling.jpeg | center top
photo: photos/04-sunbird.jpeg
```

- **Path** is relative to the project root.
- **`| focal-position`** is optional (defaults to `center`). It controls
  which part of the image is visible inside the 16:9 hero crop. Any CSS
  `object-position` value works:
  - keywords: `center`, `top`, `bottom`, `left`, `right`
  - two-value forms: `right top`, `center bottom`
  - percent forms: `center 30%`, `50% 20%`

To add a photo: drop the file into `photos/` and add a line. To remove:
delete the line (and optionally the file).

See `photos/README.md` for recommended specs and tips.

### Google Drive certificate links

For `kind: experience` (cert field) and `kind: certificate` (link field),
the value should be a Drive **viewer URL**, like:

```
https://drive.google.com/file/d/1abc...xyz/view
```

**Sharing settings matter.** Inside Drive, right-click the file → Share →
General access → "Anyone with the link" → Viewer. Without this, the link
will 403 anyone who isn't logged in to your account.

Until you swap a placeholder URL in, the site renders `link tbd` next to
the entry so nothing looks broken. Find and replace `REPLACE_ME` in
`content/experience.md` and `content/certificates.md` to bulk-update.

---

## Customising the design

All design tokens live in the `:root { … }` block near the top of the
`<style>` section in `index.html`.

### Colours

```css
--bg:        #faf5ea;   /* page background — warm-white ~3000K */
--surface:   #fefbf2;   /* code blocks, subtle lifts */
--ink:       #2a2620;   /* main text — warm-dark, not pure black */
--ink-soft:  #58513f;   /* secondary text */
--ink-faint: #908872;   /* tertiary / mono labels */
--rule:      #d9d2bf;   /* borders, dividers */
--accent:    #7a3f17;   /* links on hover, accent highlights */
```

For dark mode, edit `html[data-theme="dark"] { … }` right below.

### Fonts

```css
--serif: 'Newsreader', Georgia, 'Times New Roman', serif;
--mono:  'JetBrains Mono', ui-monospace, Menlo, monospace;
```

The Google Fonts import URL is just above the `<style>` block — update both
sides if you swap families.

### Dark mode

The footer of every page has a `[dark]` / `[light]` toggle that flips
`html[data-theme]` and persists the choice in `localStorage`. No build flag
needed; users can decide.

### Spacing & layout

- Sub-page text column width: `.page { max-width: 38rem; }`.
- Homepage centering: see `.home { … }`.
- Most spacing uses `rem` so bumping `body { font-size }` scales the whole
  site proportionally.

---

## Entry-kind schema

| kind          | required           | optional fields                                            |
| ------------- | ------------------ | ---------------------------------------------------------- |
| `about`       | —                  | (body only)                                                |
| `skills`      | —                  | (body only)                                                |
| `contact`     | —                  | (body only — supplements header `link:` lines)             |
| `experience`  | `role`, `org`, `date` | `end`, `location`, `cert`, `summary`                    |
| `project`     | `title`, `date`    | `tags`, `summary`, `link` (external URL)                   |
| `post`        | `title`, `date`    | `tags`, `summary`                                          |
| `note`        | (none)             | `title`, `date`, `tags`, `summary` — all defaulted        |
| `certificate` | `title`, `date`    | `issuer`, `link`                                           |

Required fields are only "required" in the sense that without them the
entry won't make sense. With the friction-free defaults, **`kind:`,
`date:`, and `title:` can always be omitted** — the system will fill
them in.

**Header-only fields** (top block of `content.md`):

| field      | purpose                                                                |
| ---------- | ---------------------------------------------------------------------- |
| `name`     | Display name (homepage hero)                                           |
| `role`     | Role line, shown in About page meta and as document title              |
| `location` | Used for the homepage clock — first comma-segment becomes the city     |
| `tz`       | IANA timezone for the clock (e.g. `Asia/Kolkata`)                      |
| `tagline`  | One-liner under the homepage name                                      |
| `now`      | What you're working on now — shown under the homepage nav              |
| `link:`    | Repeated. Header social/contact links. Format: `Label \| URL`          |
| `photo:`   | Repeated. Homepage hero photos. Format: `path \| focal-position`       |
| `file:`    | Repeated. Files to load from `content/`. Order doesn't matter.         |

---

## How the site works

In one paragraph: `index.html` defines the page chrome and styles, then loads
`md.js` (Markdown renderer) and `app.js`. On boot, `app.js` fetches
`content.md`, parses the header, fetches every file under `file:` in
parallel, parses each as `---`-separated entries with frontmatter, and
indexes them by `kind`. The URL hash (`#/about`, `#/experience`, etc.) picks
a page renderer; the renderer pulls the matching entries and writes HTML
into `#page-body`. The homepage is its own renderer with a live clock and
photo crossfader. Dark mode is a single `data-theme` attribute on `<html>`
persisted in `localStorage`. There's no router library, no JSX, no React,
no Web Components — just functions and template literals.

If you ever want to refactor, the parser in `app.js > parseBlock()` is the
beating heart. Everything downstream consumes whatever shape it produces.

---

## Security

The site is fully static, has no backend, no user input, no third-party
JavaScript, and ships with a strict Content-Security-Policy and URL
sanitisation in the Markdown renderer. The full threat model and the
list of defences in place is in [SECURITY.md](SECURITY.md). The bottom
line: keep your GitHub account secure (2FA, hardware key) and the site
itself has effectively no attack surface.

---

## Troubleshooting

**"Can't load content.md" screen appears.**
You opened `index.html` from `file://`. Start a local server (see [Running
it locally](#running-it-locally)) or deploy.

**An entry isn't showing up.**
1. Check it has a valid `kind:`.
2. Check the file is referenced by a `file:` line in `content.md`.
3. Check the `---` separators have nothing on the same line.
4. Open DevTools → Network: did the `.md` file 404?

**Dates are wrong / out of order.**
Use `YYYY-MM-DD`. `2025-08` won't sort correctly against `2025-08-15`.

**Photos aren't rotating.**
First check at least two `photo:` lines exist. The crossfade happens every
30 minutes — adjust the interval in `app.js > setupHero()` if you want
faster.

**Photo focal position has no effect.**
Make sure there's a `|` (pipe) between the path and the focal value. The
parser uses `|` as the delimiter, not a space or colon.

**Certificate link goes to a Google login screen.**
The Drive sharing setting is restricted. Open the file in Drive → Share →
"Anyone with the link" → Viewer.

**Custom domain isn't working after deploying.**
DNS can take up to 24 hours. Verify your CNAME/A records match the host's
docs (see DEPLOY.md).

**I want a feature this doesn't have.**
The site is ~700 lines total — `app.js`, `md.js`, and the inline CSS in
`index.html`. Tweaking is the intended path.
