# photos/

Source photographs for the `/photos/` page.

1. Drop the image in this folder.
2. Add a line to `photos.txt`: `file | caption`.
3. Run `python3 scripts/build_pages.py` (needs Pillow). It writes resized WebP
   copies to `images/photos/` without EXIF or GPS metadata, and rebuilds the page.
4. Commit the new files and push.

Only files listed in `photos.txt` are published. The illustrations in this
folder (05 to 12) are not listed, because they look like downloaded artwork
rather than photographs taken by the site owner.
