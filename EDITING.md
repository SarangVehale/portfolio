# Editing this portfolio

The site is a folder of Markdown files. There is no admin panel, no
"new post" button, no database. Editing means **changing a `.md` file
and saving it**, then making that change visible to the world (one
commit to your GitHub repo). Everything below is variations on that
pattern.

---

## Three places you can edit from

### 1. Your laptop, in Obsidian (or any editor)

The most comfortable mode. Open the whole project folder as an Obsidian
vault — the `.md` structure maps cleanly onto Obsidian's notes view.
Backlinks, tags, graph view all work. Edit, save, then in a terminal:

```bash
git add -A
git commit -m "note: thought about X"
git push
```

Your site updates in ~30–60 seconds.

If you prefer not to use Obsidian, every text editor works the same way
— it's just files. VS Code, Sublime, vim, nano. The format is plain
Markdown plus a few `key: value` lines at the top.

### 2. Your phone — editing on GitHub directly

This is the one that's genuinely friction-free, and probably what you
care about most.

There's no edit button on the public-facing site (intentional — it's a
public site and the button just gets in the way). Instead, you go
through GitHub. Two paths:

**Path A — the GitHub mobile app.** Open the app → your `portfolio`
repo → **Code** → navigate to `content/notes.md` (or whichever file
you want to edit) → tap the file → tap the **✎** in the top right.
Type, scroll to bottom, tap **Commit**. Done.

**Path B — github.com in a mobile browser.** Same thing, just a browser.
Sign in if needed → repo → navigate to the file → **✎ Edit** button
at the top right of the file view → type → "**Commit changes...**" at
the bottom → "**Commit changes**".

Both paths work the same way. The GitHub Actions pipeline rebuilds
Pages in ~30–60 seconds and your site updates. No clone, no terminal,
no app required beyond a browser.

### 2½. Pro tip — bookmark your common files

To skip the navigation step, bookmark the GitHub edit URLs for the
files you change most:

- Notes: `https://github.com/<you>/portfolio/edit/main/content/notes.md`
- Blog: `https://github.com/<you>/portfolio/edit/main/content/writing.md`
- FAQ: `https://github.com/<you>/portfolio/edit/main/content/faq.md`
- Header (bio, links, photos): `https://github.com/<you>/portfolio/edit/main/content.md`

Add them to your phone's home screen. Then "writing a quick thought"
is one tap from anywhere.

### 3. Anywhere with a browser — GitHub Codespaces (overkill, but works)

If you ever need a full editor on someone else's machine, your repo's
**Code** → **Codespaces** button gives you a VS Code in a browser tab
with the repo cloned. Free 60 hours/month per personal account.

---

## Workflow recipes

### Quick idea dump

The lowest-friction case. From your phone:

1. Open your `notes.md` bookmark (see "Pro tip" above) — or navigate to
   the file in your repo on GitHub.
2. Scroll to the bottom of the editor.
3. Type:
   ```
   ---

   Just had a thought about X. The thing is that…
   ```
4. Commit.

No title, no date, no tags needed. The site fills them in (kind=note,
date=today, title=first line).

### Linking between notes (Obsidian-style)

You can cross-reference any other page or entry from inside your
Markdown:

```
See [[CERTIFY-ED]] for context.
Read [[disable-onedrive-windows|my OneDrive guide]] first.
Compare with [the FAQ](faq.md).
```

The site resolves these to the correct hash route automatically.
Targets can be entry titles, filenames (without `.md`), or slugs.

When you open the project in Obsidian, the same `[[...]]` syntax
works as Obsidian's own backlinks — so the graph view shows the
connections you've drawn between notes.

### Long how-to (its own file)

1. In GitHub, navigate to `content/notes/` → tap **+** → "Create new
   file" → name it `<your-topic>.md`.
2. Paste:
   ```
   ---
   title: How to do the thing
   tags: [linux, how-to]
   ---

   Body markdown here.
   ```
3. Commit.
4. In GitHub, open `content.md`, hit **✎**, and add a line:
   ```
   file: content/notes/<your-topic>.md
   ```
5. Commit.

Done — file 2 commits later it's on the site. (You can do both in one
commit if you stage them in the same browser session.)

### Half-finished post

Add `draft: true` to its frontmatter. The site parses the entry but
hides it. Useful when you want to commit work-in-progress to free up
local edits but don't want it visible yet.

```
---
title: A post I'm still drafting
draft: true
---

Body…
```

Remove the line when ready.

### Adding a photo

1. Take the photo. Move it onto your laptop or any cloud-synced folder
   you can reach from `git`.
2. From the project folder:
   ```bash
   cp ~/Downloads/that-photo.jpeg photos/16-trekking.jpeg
   ```
   Then edit `content.md` and add:
   ```
   photo: photos/16-trekking.jpeg | center 30%
   ```
3. Commit and push.

Doing this from the phone is harder because GitHub's web UI can't
upload binary files into subfolders as cleanly. Easiest: use the GitHub
mobile app, navigate to `photos/`, tap **+** → **Upload files**.

### Updating bio or now-line

Edit the header of `content.md`. From any device:

- ✎ edit any sub-page footer → **edit this section** is for the section
  file, but the homepage edit is in `content.md` itself. Open
  `content.md` directly in GitHub and edit the top block.

(I'll add a homepage "✎ edit header" link in the next iteration if
this becomes a frequent path.)

### Resetting a mistake

GitHub keeps every commit. To undo:

- In GitHub, open the file → **History** (top right) → click an older
  version → **⋯** → **Revert**.

Or from a terminal:
```bash
git revert HEAD
git push
```

---

## Anti-friction shortcuts

| You want…                           | Shortcut                                                 |
| ----------------------------------- | -------------------------------------------------------- |
| Find any note / project / post      | Press **⌘K** (or Ctrl+K, or just `/`) anywhere on site   |
| Jump to a file you edit often       | Bookmark its GitHub edit URL on your phone               |
| Mark a note as work-in-progress     | Add `draft: true` to its frontmatter                     |
| Write with no frontmatter at all    | Just `---` and your text in `content/notes.md`           |
| Reorder entries                     | You can't — they sort by `date:` automatically           |
| Group experience under one company  | Use the exact same `org:` string on multiple entries     |
| Pin a photo to a specific crop      | `photo: path \| center 30%` (any CSS object-position)    |

---

## What you DON'T have to do

- You don't have to register pages anywhere — drop a file, the site picks it up.
- You don't have to write `kind:` — it's inferred from the file/folder.
- You don't have to write `date:` — defaults to today.
- You don't have to write `title:` — first line of body becomes the title.
- You don't have to rebuild anything — GitHub Pages rebuilds for you.
- You don't have to manage a "publish" workflow — everything in `main`
  is live, drafts excluded via `draft: true`.

---

## Mental model

Treat the repo as your **public Obsidian vault**. Everything visible on
the site is just a Markdown file. Everything hidden is either drafted
(`draft: true`) or simply not committed yet. The site is what you can
see; the repo is what you've written.

If something feels harder than that, it's a bug in the system. Open
an issue, or just rip it out of the code.
