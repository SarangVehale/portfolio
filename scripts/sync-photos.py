#!/usr/bin/env python3
"""sync-photos.py — keeps content.md in sync with the photos/ folder.

What it does
------------
Scans `photos/` for image files. Then rewrites the contiguous block of
`photo:` lines in `content.md` so that:

  * every image in photos/ has a `photo:` line
  * existing focal-positions are preserved (you can hand-edit them and
    they'll survive subsequent runs)
  * lines pointing at deleted files are dropped
  * new entries default to `center 50%`
  * everything is column-aligned for readability

When it runs
------------
Locally only — invoked by `scripts/sync-photos.sh`, or directly:

    python3 scripts/sync-photos.py [--dry-run]

There is no CI workflow for this anymore; the old auto-commit-back
flow added more friction than it removed. Run the script, review the
diff, commit and push by hand.

Why
---
You could let the in-browser GitHub Contents API discover photos at load
time (and the site does, as a fallback). But having concrete `photo:`
lines in content.md means you can:
  * hand-tune the focal position per photo without a separate config
  * see exactly what'll appear on the site by reading one file
  * commit the focal you chose so reviewers see the design intent

No dependencies; standard library only.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PHOTOS_DIR = ROOT / "photos"
CONTENT_MD = ROOT / "content.md"

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}
PHOTO_LINE_RE = re.compile(r"^photo:\s*([^|\s][^|]*?)\s*(?:\|\s*(.+?))?\s*$")
DEFAULT_FOCAL = "center 50%"
ALIGN_COL = 36  # column at which the `|` lands when path is short enough


def list_photos() -> list[str]:
    """Return repo-relative paths of every image in photos/, sorted."""
    if not PHOTOS_DIR.is_dir():
        return []
    out = []
    for entry in sorted(PHOTOS_DIR.iterdir()):
        name = entry.name
        if name.startswith(".") or name.startswith("_"):
            continue
        if entry.is_file() and entry.suffix.lower() in IMAGE_EXTS:
            out.append(entry.relative_to(ROOT).as_posix())
    return out


def parse_existing(content: str) -> dict[str, str]:
    """Return {path: focal_string} for every `photo:` line in content."""
    out = {}
    for line in content.splitlines():
        m = PHOTO_LINE_RE.match(line)
        if not m:
            continue
        path = m.group(1).strip()
        focal = (m.group(2) or "").strip() or DEFAULT_FOCAL
        out[path] = focal
    return out


def format_block(items: list[tuple[str, str]]) -> list[str]:
    """Render (path, focal) pairs as column-aligned `photo:` lines."""
    if not items:
        return []
    max_len = max(len(p) for p, _ in items)
    col = max(max_len + 1, ALIGN_COL)
    return [f"photo: {p}{' ' * (col - len(p))}| {f}" for p, f in items]


def rewrite_content(content: str, existing: dict[str, str], current: list[str]) -> str:
    """Replace the existing photo: block (or append if none) with one
    entry per current file, preserving existing focals.

    Refuses to touch the file if `photo:` lines are split across
    non-contiguous regions — that would mean blindly deleting whatever
    sits between them. Better to fail loudly than to nuke content.
    """
    items = [(p, existing.get(p, DEFAULT_FOCAL)) for p in current]
    new_block = format_block(items)

    lines = content.splitlines()
    photo_idxs = [i for i, ln in enumerate(lines) if PHOTO_LINE_RE.match(ln)]

    if photo_idxs:
        first, last = photo_idxs[0], photo_idxs[-1]
        # Sanity check: every line in [first, last] should either be a
        # `photo:` line or whitespace. If anything else lives in the
        # gap, the block isn't contiguous and we must not splice.
        for i in range(first, last + 1):
            if i in photo_idxs or lines[i].strip() == "":
                continue
            raise SystemExit(
                f"ERROR: `photo:` lines in content.md are non-contiguous "
                f"(line {first + 1}..{last + 1} contains other content at line {i + 1}). "
                f"Move all `photo:` lines into one block and re-run."
            )
        new_lines = lines[:first] + new_block + lines[last + 1:]
    else:
        # No existing block — append at end with a separator.
        new_lines = lines + ["", "# Auto-managed by scripts/sync-photos.py"] + new_block

    out = "\n".join(new_lines)
    if content.endswith("\n") and not out.endswith("\n"):
        out += "\n"
    return out


def diff_summary(old: dict[str, str], new_paths: list[str]) -> tuple[list[str], list[str]]:
    old_set = set(old.keys())
    new_set = set(new_paths)
    return sorted(new_set - old_set), sorted(old_set - new_set)


def main() -> int:
    dry = "--dry-run" in sys.argv

    if not CONTENT_MD.exists():
        print("content.md not found", file=sys.stderr)
        return 2

    content = CONTENT_MD.read_text(encoding="utf-8")
    existing = parse_existing(content)
    current = list_photos()
    new_content = rewrite_content(content, existing, current)

    if new_content == content:
        print(f"no changes ({len(current)} photo entries already in sync)")
        return 0

    added, removed = diff_summary(existing, current)
    for p in added:
        print(f"  + {p}")
    for p in removed:
        print(f"  - {p}")

    if dry:
        print(f"\n[dry-run] would update content.md ({len(current)} entries)")
        return 0

    CONTENT_MD.write_text(new_content, encoding="utf-8")
    print(f"\nupdated content.md ({len(current)} photo entries)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
