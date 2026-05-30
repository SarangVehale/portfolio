#!/usr/bin/env python3
"""build-manifest.py — generate manifest.json from the actual filesystem.

Runs at deploy time. Eliminates the runtime dependency on the GitHub
Contents API (60 unauth req/hr per IP), which was occasionally returning
empty arrays and leaving the blog and notes pages blank for visitors.

How it works
------------
Parses content.md for `dir:` and `photodir:` directives, then writes
manifest.json mapping each directive to the list of files actually on
disk. The site reads this manifest before falling back to the API.

Outputs
-------
manifest.json at repo root, e.g.:
  {
    "dirs": {
      "content/blog":       ["content/blog/foo.md", ...],
      "content/blog/notes": ["content/blog/notes/bar.md", ...]
    },
    "photodirs": {
      "photos": ["photos/01.jpg", ...]
    }
  }

No dependencies. Standard library only. Idempotent.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT_MD = ROOT / "content.md"
MANIFEST = ROOT / "manifest.json"
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}


def list_md(rel: str) -> list[str]:
    p = ROOT / rel
    if not p.is_dir():
        return []
    return sorted(
        f"{rel}/{f.name}"
        for f in p.iterdir()
        if f.is_file() and f.suffix.lower() == ".md" and not f.name.startswith("_")
    )


def list_images(rel: str) -> list[str]:
    p = ROOT / rel
    if not p.is_dir():
        return []
    return sorted(
        f"{rel}/{f.name}"
        for f in p.iterdir()
        if f.is_file()
        and f.suffix.lower() in IMAGE_EXTS
        and not f.name.startswith(".")
        and not f.name.startswith("_")
    )


def parse_directives(content: str, key: str) -> list[str]:
    pat = re.compile(rf"^{key}:\s*(.+?)\s*$", re.M)
    return [m.group(1).rstrip("/") for m in pat.finditer(content)]


def main() -> int:
    if not CONTENT_MD.exists():
        print("content.md not found", file=sys.stderr)
        return 2
    content = CONTENT_MD.read_text(encoding="utf-8")

    dirs = parse_directives(content, "dir")
    photodirs = parse_directives(content, "photodir")

    # Fail loudly on typo'd directives so blank pages don't ship silently.
    missing = [d for d in dirs + photodirs if not (ROOT / d).is_dir()]
    if missing:
        for d in missing:
            print(f"ERROR: directive points at non-existent folder: {d}", file=sys.stderr)
        print(
            "Fix the path in content.md (or create the folder) and re-run.",
            file=sys.stderr,
        )
        return 2

    # Warn on filenames likely to break URL fetches (the runtime encodes
    # path segments, but a heads-up still helps catch oddities early).
    risky = []
    for paths in (
        [list_md(d) for d in dirs] + [list_images(d) for d in photodirs]
    ):
        for p in paths:
            if any(c in p.split("/")[-1] for c in " #?%"):
                risky.append(p)
    for p in risky:
        print(f"WARN: filename contains URL-reserved characters: {p}", file=sys.stderr)

    manifest = {
        "dirs": {d: list_md(d) for d in dirs},
        "photodirs": {d: list_images(d) for d in photodirs},
    }

    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    total_md = sum(len(v) for v in manifest["dirs"].values())
    total_im = sum(len(v) for v in manifest["photodirs"].values())
    print(
        f"manifest.json: {total_md} .md files across {len(dirs)} dir(s), "
        f"{total_im} images across {len(photodirs)} photodir(s)"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
