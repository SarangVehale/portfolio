# ═══════════════════════════════════════════════════════════════════════════
# CONTENT.MD — site manifest + header.
#
# The site config lives in this file. The actual content lives in the files
# listed under `file:` below. Each linked file is a Markdown file containing
# one or more `---`-separated entries (each with simple `key: value`
# frontmatter and a Markdown body).
#
# ─── ADDING A NEW SECTION ────────────────────────────────────────────────
#   1. Create a new .md file in content/ (e.g. content/talks.md).
#   2. Add a `file: content/talks.md` line below.
#   3. Inside the file, add one or more entries with `kind: <something>`.
#
# ─── ADDING A NEW ENTRY TO AN EXISTING SECTION ───────────────────────────
#   1. Open the section file (e.g. content/projects.md).
#   2. Type `---` on its own line.
#   3. Add frontmatter and your Markdown body.
#
# ─── SPLITTING A SECTION INTO ONE-FILE-PER-ENTRY ─────────────────────────
#   If you'd rather have each project in its own file, just create
#   content/projects/foo.md and add a `file: content/projects/foo.md` line
#   here. The site doesn't care whether one file has 1 entry or 20.
#
# ─── ENTRY KINDS ─────────────────────────────────────────────────────────
#   about        — single entry, renders the About page
#   skills       — single entry, renders the Skills page
#   contact      — single entry, renders extra body on Contact page
#   experience   — work role. Group by `org` (same string = nested together)
#                  Fields: role, org, location, date, end, cert, summary
#   project      — software/research. Fields: title, date, tags, summary, link
#   post         — blog post. Fields: title, date, tags, summary
#   note         — ANYTHING ELSE you want to write. Quick thoughts, how-tos,
#                  running logs, idea dumps. Renders inline on the notes page.
#                  ALL frontmatter is optional. Just write.
#   certificate  — completion certificate. Fields: title, issuer, date, link
#
# ─── FRICTION-FREE DEFAULTS ──────────────────────────────────────────────
# Entries inherit `kind:` from their file name, so you don't need to write
# it: anything in content/notes.md (or content/notes/*.md) is automatically
# `kind: note`. Same for every other section file.
# `date:` defaults to today if omitted; you can also write `date: today` or
# `date: yesterday` literally. Use a full ISO datetime (2026-05-15T14:30)
# if you write multiple entries on the same day and want a specific order.
# `title:` defaults to the first line of the body if omitted, then the
# filename if there's no body either.
#
# ─── OBSIDIAN COMPATIBILITY ──────────────────────────────────────────────
# Files can start with a YAML frontmatter block (`---\nkey: value\n---`)
# the way Obsidian / Jekyll write them. That's parsed as ONE entry per file.
# Files without that wrapper can still hold multiple entries separated by
# `---` lines (the original style). Mix freely.
# ═══════════════════════════════════════════════════════════════════════════

name:     Sarang Vehale
role:     Cybersecurity & Quantum Researcher
location: Pune, India
tz:       Asia/Kolkata
tagline:  Working at the intersection of cybersecurity, quantum computing, and systems engineering.
now:      CERTIFY-ED is on arXiv and being pushed to SciPost. Maintaining a Proxmox homelab. Learning Japanese.

# ── Header links ─────────────────────────────────────────────────────────
link: email    | mailto:sarangvehale2@gmail.com
link: github   | https://github.com/SarangVehale
link: linkedin | https://linkedin.com/in/sarang-vehale-a76210247
link: resume   | https://drive.google.com/file/d/REPLACE_ME_WITH_RESUME_PDF/view

# ── Repo (enables "✎ edit on GitHub" links on every page) ────────────────
# Set this to your GitHub repo URL (no trailing slash) to make every page
# and every note show an edit link that jumps straight into GitHub's web
# editor. Leave blank to hide the links. `branch` defaults to "main".
repo:   https://github.com/SarangVehale/portfolio
branch: main

# ── Homepage hero photos ─────────────────────────────────────────────────
# The homepage picks one of these at random on each load and slowly
# crossfades to a different random one every 30 minutes.
#
# Format:   photo: path | focal-position
# The focal-position is optional; if set, it controls which part of the
# image stays visible inside the 16:9 hero crop. Any valid CSS
# `object-position` works:  center, top, bottom, left, right,
# `center 30%`, `50% 20%`, `right top`, etc.
# Default is `center`.
#
# To add a photo: drop the file into the photos/ folder and add a new
# `photo:` line below. See photos/README.md for more.
photo: photos/01-shepherd-golden-hour.jpeg | center 35%
photo: photos/02-arch-courtyard.jpeg       | center 40%
photo: photos/03-jaipur-stained-glass.jpeg | center 55%
photo: photos/04-sunbird.jpeg              | center 45%
photo: photos/05-cats-falling.jpeg         | center top
photo: photos/06-panda-nap.jpeg            | center 60%
photo: photos/07-cat-flowers.jpeg          | center 55%
photo: photos/08-cat-cherry.jpeg           | center 40%
photo: photos/09-cat-wall-autumn.jpeg      | center 35%
photo: photos/10-cat-wall-sunset.jpeg      | center 45%
photo: photos/11-cat-grass.jpeg            | center 60%
photo: photos/12-cat-window.jpeg           | center 50%
photo: photos/13-river.jpeg                | center 60%
photo: photos/14-puppy.jpeg                | center 70%
photo: photos/15-ipod-book.jpeg            | center 60%

# ── Content files (loaded in this order, but entries are sorted by date) ─
file: content/about.md
file: content/faq.md
file: content/skills.md
file: content/contact.md
file: content/experience.md
file: content/projects.md
file: content/writing.md
file: content/notes.md
file: content/certificates.md

# Per-file notes (Obsidian-style — each file is one note). Optional.
# Drop a new .md into content/notes/ and add a `file:` line here.
file: content/notes/disable-onedrive-windows.md
