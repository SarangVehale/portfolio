# ═══════════════════════════════════════════════════════════════════════════

# CONTENT.MD — site manifest + header.

#

# The site config lives in this file. Content lives in the files referenced

# by `file:` and `dir:` directives below.

#

# ─── HOW IT WORKS ────────────────────────────────────────────────────────

#

# Two ways to register content:

#

# file: content/<path>.md Loads one specific file.

# dir: content/<path> Loads EVERY .md file in that folder.

# Discovered live via the GitHub API; no

# manifest to maintain. Drop a file, push,

# it shows up.

#

# Folder = section. Files inherit their `kind:` from the folder they live

# in. Subdirs become subdirs on the site:

#

# content/blog/foo.md → a blog post (kind: post)

# content/blog/notes/bar.md → a note (kind: note, parented under

# blog → renders as a `[#Notes]`

# subdir link on the blog page)

#

# To add a new section folder:

# 1. mkdir content/<name>/

# 2. Add `dir: content/<name>` here.

# 3. (Optional) tell app.js what `kind:` to assign — see KIND_BY_DIR in

# app.js if your folder name doesn't match an existing kind.

#

# ─── ENTRY KINDS ─────────────────────────────────────────────────────────

# about — single entry, renders the About page

# skills — single entry, renders the Skills page

# contact — single entry, renders extra body on Contact page

# experience — work role. Group by `org` (same string = nested together)

# project — software/research

# post — blog post. Lives in content/blog/

# note — anything else. Lives in content/blog/notes/

# Renders inline (no click-through), under the blog page

# as a `[#Notes]` subdir.

# faq — Q&A. Lives in content/faq.md, subdir of about.

# certificate — completion certificate

#

# ─── FRICTION-FREE DEFAULTS ──────────────────────────────────────────────

# Entries inherit `kind:` from their containing folder, so you never need

# to write `kind:`. `date:` defaults to today (also accepts `today`,

# `yesterday`, or ISO datetime). `title:` defaults to the first line of

# the body, then the filename if there's no body either.

#

# ─── OBSIDIAN COMPATIBILITY ──────────────────────────────────────────────

# Files can start with `---\nkey: value\n---` YAML frontmatter (the same

# format Obsidian writes). One file = one entry in the YAML-wrapped style.

# A bare `key: value` block followed by `---` then more entries is also

# supported for files that hold many entries.

# ═══════════════════════════════════════════════════════════════════════════

name: Sarang Vehale
role: Cybersecurity & Quantum Researcher
location: Pune, India
tz: Asia/Kolkata
tagline: Working at the intersection of cybersecurity, quantum computing, and systems engineering.
now: CERTIFY-ED is on arXiv and being pushed to SciPost. Maintaining a Proxmox homelab. Learning Japanese.

# ── Header links ─────────────────────────────────────────────────────────

link: email | mailto:sarangvehale2@gmail.com
link: github | https://github.com/SarangVehale
link: linkedin | https://linkedin.com/in/sarangvehale
link: resume | https://ggl.link/4FbABLZ

# ── Repo (required for the auto-folder discovery via GitHub API) ─────────

repo: https://github.com/SarangVehale/portfolio
branch: main

# ── Homepage hero photos ─────────────────────────────────────────────────

# Just drop image files into the photos/ folder. The `photodir:` line below

# auto-discovers every .jpg/.png/.webp inside (via the GitHub API). New

# files appear on the homepage with no edit here. No manifest to maintain.

#

# To customise the crop for a specific photo, add a `photo:` line below.

# These act as PER-FILE OVERRIDES on top of auto-discovery:

# Format: photo: <path> | <focal-position>

# Any CSS `object-position` works: `center 30%`, `right top`, `50% 20%`...

photodir: photos

# Focal-position overrides for specific images (optional — without these,

# they'd auto-load with `center` focal).

photo: photos/01-shepherd-golden-hour.jpeg | center 35%
photo: photos/02-arch-courtyard.jpeg | center 40%
photo: photos/03-jaipur-stained-glass.jpeg | center 55%
photo: photos/04-sunbird.jpeg | center 45%
photo: photos/05-cats-falling.jpeg | center top
photo: photos/06-panda-nap.jpeg | center 60%
photo: photos/07-cat-flowers.jpeg | center 55%
photo: photos/08-cat-cherry.jpeg | center 40%
photo: photos/09-cat-wall-autumn.jpeg | center 35%
photo: photos/10-cat-wall-sunset.jpeg | center 45%
photo: photos/11-cat-grass.jpeg | center 60%
photo: photos/12-cat-window.jpeg | center 50%
photo: photos/13-river.jpeg | center 60%
photo: photos/14-puppy.jpeg | center 70%
photo: photos/15-ipod-book.jpeg | center 60%

# ── Structured single-entry files (one source of truth per page) ─────────

file: content/about.md
file: content/skills.md
file: content/contact.md
file: content/faq.md
file: content/experience.md
file: content/projects.md
file: content/certificates.md

# ── Auto-discovered folders (drop a .md file in, it shows up) ────────────

dir: content/blog
dir: content/blog/notes
