# content/

Per-section Markdown files. The parent `../content.md` is the manifest that
lists which files in here get loaded.

**Full content-editing guide is in the root [README.md](../README.md#maintaining-content).**

This README is a quick local cheatsheet.

## File responsibilities

| file              | what it holds                                                  |
| ----------------- | -------------------------------------------------------------- |
| `about.md`        | Single `kind: about` entry — body is the About page            |
| `skills.md`       | Single `kind: skills` entry — body is the Skills page          |
| `contact.md`      | Single `kind: contact` entry — extra body on Contact page      |
| `experience.md`   | Multiple `kind: experience` entries (group by `org:`)          |
| `projects.md`     | Multiple `kind: project` entries                               |
| `writing.md`      | Multiple `kind: post` entries (the blog)                       |
| `notes.md`        | Multiple `kind: note` entries — idea dumps, how-tos, logs      |
| `notes/`          | Optional: one-file-per-note. Each file is a single note with   |
|                   | YAML frontmatter (Obsidian-style). Add a `file:` line in       |
|                   | `../content.md` for each.                                      |
| `certificates.md` | Multiple `kind: certificate` entries with Drive links          |

Every entry's `kind:` is **inferred from its filename or folder**, so you
can skip that line. `date:` defaults to today. `title:` defaults to the
first line of the body, then the filename. The bare minimum entry is
just `---` followed by Markdown.

## Two ways to write notes

The `note` kind is intentionally broad. Two patterns are supported — use
whichever fits each note:

### Multi-entry file

Keep many short notes together in `notes.md`. Each note is separated by
`---` on its own line. Best for quick thoughts you want to scan in one
file.

### One file per note (Obsidian-native)

Drop a `.md` file in `notes/`. Use Obsidian's YAML frontmatter style at
the top:

```
---
title: How to disable OneDrive on Windows
date: 2025-11-22
tags: [windows, how-to, privacy]
---

Body Markdown here.
```

Then add `file: content/notes/<slug>.md` to `../content.md`. See
`notes/disable-onedrive-windows.md` for a working example.

## Adding an entry

In any of the multi-entry files above, scroll to the bottom and add:

```
---

kind:    project
title:   My new thing
date:    2026-05-15
tags:    rust, systems
summary: One-liner shown in the index.

Body in Markdown.
```

Save, refresh. That's it.

## Adding a brand-new section

E.g. you want a `Talks` page.

1. Create `content/talks.md` and put entries inside it with
   `kind: talk`.
2. Add `file: content/talks.md` to `../content.md`.

The site will automatically pick up the new `kind:` value and you can add
it to the homepage nav by editing the `sections` array in `app.js >
renderHome()` (it's only a couple of lines).

## Schema and Markdown reference

See the root [README.md](../README.md#entry-kind-schema) for:
- Every entry kind's required and optional fields
- The exact Markdown subset the included renderer supports
- Date format rules and sorting behaviour
- Tag handling
- Gotchas (e.g. `---` always splits entries, use `***` for hr inside body)
