/* ───────────────────────────────────────────────────────────────────────────
   app.js — multi-page portfolio rendered from content.md.

   This file does four jobs:
     1. Loads the manifest at content.md, then fetches every file: it lists.
     2. Parses each .md into entries (frontmatter + Markdown body).
     3. Routes the URL hash to a page renderer (home / about / experience /
        projects / writing / notes / certificates / skills / contact / reader).
     4. Manages homepage chrome — the live Pune clock, the photo shuffle,
        and the dark-mode toggle.

   You shouldn't need to edit this file to update content. Everything that
   shows up on the site comes from content.md and the files it points to.
   See the top of content.md for the schema.
   ─────────────────────────────────────────────────────────────────────── */

(function () {
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ─────────── theme (3-mode cycle, persisted to localStorage) ────
     States: '' (warm, default) → 'white' → 'dark' → ''
     The footer toggle shows what comes next. */
  const THEME_CYCLE = ["", "white", "dark"];
  const THEME_LABEL = { "": "warm", "white": "white", "dark": "dark" };
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme !== null) document.documentElement.dataset.theme = savedTheme;
  function toggleTheme(e) {
    if (e) e.preventDefault();
    const cur = document.documentElement.dataset.theme || "";
    const idx = THEME_CYCLE.indexOf(cur);
    const next = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
    if (next) document.documentElement.dataset.theme = next;
    else delete document.documentElement.dataset.theme;
    localStorage.setItem("theme", next);
    refreshThemeLink();
  }
  function refreshThemeLink() {
    const cur = document.documentElement.dataset.theme || "";
    const idx = THEME_CYCLE.indexOf(cur);
    const nextLabel = THEME_LABEL[THEME_CYCLE[(idx + 1) % THEME_CYCLE.length]];
    const a = $("#theme-toggle"), b = $("#theme-toggle-2");
    if (a) a.textContent = `[${nextLabel}]`;
    if (b) b.textContent = `[switch to ${nextLabel}]`;
  }

  /* ─────────── content.md parser ────────────────────────────────── */
  /* The site's content.md is now a *manifest*: site header + a list of
     `file:` lines pointing at content/*.md files. Each linked file is itself
     a Markdown file of `---`-separated entry blocks.                       */
  function parseManifest(text) {
    const blocks = text.split(/^\s*---\s*$/m);
    const header = parseBlock(blocks[0], true);
    // collect inline entries too (back-compat with old-style content.md)
    const inlineEntries = blocks.slice(1).map(b => parseBlock(b, false)).filter(e => e.kind);
    return { header, inlineEntries };
  }
  function parseEntries(text, path) {
    const defaultKind = defaultKindForPath(path);

    // Obsidian / Jekyll style: file starts with `---\nfrontmatter\n---\nbody`.
    // Treat as a single entry per file.
    const trimmed = text.replace(/\r\n/g, "\n").replace(/^\n+/, "");
    if (/^---\s*\n/.test(trimmed)) {
      const m = trimmed.match(/^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)([\s\S]*)$/);
      if (m) {
        const e = parseBlock(m[1], false);
        e.body = (m[2] || "").trim();
        e._hasContent = true;   // explicit YAML wrapper always counts
        const filled = applyDefaults(e, defaultKind, path);
        return isDraft(filled) ? [] : [filled].filter(x => x.kind);
      }
    }

    // Multi-entry style: blocks separated by `---` on their own line.
    return text.split(/^\s*---\s*$/m)
               .map(b => parseBlock(b, false))
               .filter(e => e._hasContent)
               .map(e => applyDefaults(e, defaultKind, path))
               .filter(e => e.kind && (e.title || e.body))
               .filter(e => !isDraft(e));
  }

  /* Per-file/folder default kind. Files inside a subdirectory inherit from
     the folder name. More-specific (longer) folder paths win over shorter
     ones — e.g. content/blog/notes wins over content/blog. */
  const KIND_BY_BASENAME = {
    "about.md":        "about",
    "faq.md":          "faq",
    "skills.md":       "skills",
    "contact.md":      "contact",
    "experience.md":   "experience",
    "projects.md":     "project",
    "certificates.md": "certificate",
  };
  const KIND_BY_DIR_PATH = {
    "content/experience":   "experience",
    "content/projects":     "project",
    "content/writing":      "post",
    "content/blog":         "post",
    "content/blog/notes":   "note",
    "content/notes":        "note",
    "content/certificates": "certificate",
    "content/faq":          "faq",
  };
  /* Implicit parents — kinds that always appear as subdirs of another
     page. Entries can still set `parent:` explicitly to override. */
  const KIND_PARENTS = {
    note: "post",   // notes appear as a subdir of blog
    faq:  "about",  // FAQ appears as a subdir of about
  };
  function defaultKindForPath(path) {
    if (!path) return null;
    const segs = path.split("/");
    const file = segs.pop();
    if (KIND_BY_BASENAME[file]) return KIND_BY_BASENAME[file];
    // Walk dir segments from deepest to shallowest — longest match wins.
    for (let i = segs.length; i > 0; i--) {
      const probe = segs.slice(0, i).join("/");
      if (KIND_BY_DIR_PATH[probe]) return KIND_BY_DIR_PATH[probe];
    }
    return null;
  }
  function filenameToTitle(path) {
    if (!path) return "";
    return path.split("/").pop()
      .replace(/\.md$/i, "")
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  /* ─────────── GitHub directory listing ─────────────────────────────
     For each `dir:` directive in content.md, list the .md files in that
     folder using the GitHub Contents API. CORS-open, no auth required
     for public repos. Cached in localStorage for 5 minutes so refreshes
     don't burn through the 60/hr rate limit.

     Files starting with `_` are skipped (reserved for future manifests).
     ─────────────────────────────────────────────────────────────── */
  async function listDirFromGitHub(dirPath) {
    if (!SITE || !SITE.repo) {
      console.warn(`Cannot auto-discover ${dirPath}: no repo: set in content.md`);
      return [];
    }
    const m = SITE.repo.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/);
    if (!m) {
      console.warn(`Cannot parse repo URL: ${SITE.repo}`);
      return [];
    }
    const owner = m[1];
    const repo  = m[2];
    const branch = (SITE.branch || "main").trim();
    const cleanPath = dirPath.replace(/\/$/, "");
    const cacheKey = `dir:${owner}/${repo}@${branch}/${cleanPath}`;

    // localStorage cache (5min TTL)
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const { ts, files } = JSON.parse(raw);
        if (Date.now() - ts < 5 * 60 * 1000) return files;
      }
    } catch (_) { /* ignore corrupt cache */ }

    try {
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURI(cleanPath)}?ref=${encodeURIComponent(branch)}`;
      const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const list = await res.json();
      if (!Array.isArray(list)) throw new Error("Unexpected response");
      const files = list
        .filter(f => f.type === "file" && /\.md$/i.test(f.name) && !f.name.startsWith("_"))
        .map(f => `${cleanPath}/${f.name}`);
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), files }));
      } catch (_) { /* localStorage full / disabled */ }
      return files;
    } catch (err) {
      console.warn(`Could not list ${dirPath}:`, err.message);
      // Best-effort fallback: return last cached value even if stale.
      try {
        const raw = localStorage.getItem(cacheKey);
        if (raw) return JSON.parse(raw).files || [];
      } catch (_) {}
      return [];
    }
  }

  /* Fill in sensible defaults for fields the user omitted. */
  function applyDefaults(e, defaultKind, path) {
    if (!e.kind && defaultKind) e.kind = defaultKind;
    if (!e.date || /^today$/i.test(e.date)) e.date = todayISO();
    if (/^yesterday$/i.test(e.date))         e.date = daysAgoISO(1);
    if (!e.title && e.body)                  e.title = deriveTitle(e.body);
    if (!e.title && path)                    e.title = filenameToTitle(path);
    if (path)                                e._path = path;
    if (!e.parent && KIND_PARENTS[e.kind])   e.parent = KIND_PARENTS[e.kind];
    return e;
  }

  /* Drafts are entries with `draft: true` (or `draft: 1`) in frontmatter.
     They're parsed normally but kept out of the visible site so you can
     commit work-in-progress without it showing up. */
  function isDraft(e) {
    const v = e.draft;
    return v === true || v === "true" || v === "1" || v === 1;
  }
  function todayISO() {
    const d = new Date();
    const tz = d.getTimezoneOffset() * 60000;
    return new Date(d - tz).toISOString().slice(0, 10);
  }
  function daysAgoISO(n) {
    const d = new Date(Date.now() - n * 86400000);
    const tz = d.getTimezoneOffset() * 60000;
    return new Date(d - tz).toISOString().slice(0, 10);
  }
  function deriveTitle(body) {
    const first = body.split("\n").find(l => l.trim());
    if (!first) return "";
    return first
      .replace(/^#+\s*/, "")
      .replace(/^[-*]\s+/, "")
      .replace(/^>\s+/, "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .trim()
      .slice(0, 80);
  }

  const FM_RE = /^([a-zA-Z_][\w-]*)\s*:\s*(.*)$/;

  function parseBlock(text, isHeader) {
    const lines = text.split("\n");
    const fm = {};
    let i = 0;
    let sawFrontmatterKey = false;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();
      if (!trimmed) { i++; continue; }
      if (trimmed.startsWith("#")) { i++; continue; }
      const m = line.match(FM_RE);
      if (!m) break;
      const key = m[1].toLowerCase();
      let value = m[2].trim();

      // Obsidian / YAML inline list:  tags: [a, b, c]
      const inlineList = value.match(/^\[(.*)\]$/);
      if (inlineList) {
        const arr = inlineList[1].split(",").map(s => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
        fm[key] = (fm[key] || []).concat(arr);
        i++;
        continue;
      }

      // Obsidian / YAML block list:
      //   tags:
      //     - a
      //     - b
      if (value === "" && i + 1 < lines.length && /^\s+-\s+/.test(lines[i + 1])) {
        const arr = [];
        i++;
        while (i < lines.length && /^\s+-\s+/.test(lines[i])) {
          arr.push(lines[i].replace(/^\s+-\s+/, "").trim().replace(/^["']|["']$/g, ""));
          i++;
        }
        fm[key] = (fm[key] || []).concat(arr);
        continue;
      }

      if (fm[key] !== undefined) {
        if (!Array.isArray(fm[key])) fm[key] = [fm[key]];
        fm[key].push(value);
      } else {
        fm[key] = value;
      }
      sawFrontmatterKey = true;
      i++;
    }
    while (i < lines.length && !lines[i].trim()) i++;
    fm.body = lines.slice(i).join("\n").trim();
    // Mark whether the block had any real content (so comment-only blocks
    // at the top of a file don't get turned into phantom entries).
    fm._hasContent = sawFrontmatterKey || !!fm.body;

    if (typeof fm.tags === "string") {
      fm.tags = fm.tags.split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
    } else if (Array.isArray(fm.tags)) {
      fm.tags = fm.tags.flatMap(t => t.split(",").map(x => x.trim().toLowerCase())).filter(Boolean);
    } else {
      fm.tags = [];
    }

    if (isHeader) {
      const linkValues = fm.link == null ? [] : (Array.isArray(fm.link) ? fm.link : [fm.link]);
      fm.links = linkValues.map(s => {
        const [label, href] = s.split("|").map(x => (x || "").trim());
        return { label, href };
      }).filter(l => l.label && l.href);
      delete fm.link;

      // Files manifest
      const fileValues = fm.file == null ? [] : (Array.isArray(fm.file) ? fm.file : [fm.file]);
      fm.files = fileValues.map(s => s.trim()).filter(Boolean);
      delete fm.file;

      // Directories manifest (auto-discovered via GitHub API)
      const dirValues = fm.dir == null ? [] : (Array.isArray(fm.dir) ? fm.dir : [fm.dir]);
      fm.dirs = dirValues.map(s => s.trim().replace(/\/+$/, "")).filter(Boolean);
      delete fm.dir;

      // Photo manifest (hero shuffle on homepage). Each line is
      // `path | focal-position`, where focal-position is any valid CSS
      // `object-position` value (e.g. `center top`, `50% 30%`). Defaults to
      // `center` if omitted.
      const photoValues = fm.photo == null ? [] : (Array.isArray(fm.photo) ? fm.photo : [fm.photo]);
      fm.photos = photoValues.map(s => {
        const [src, focal] = s.split("|").map(x => (x || "").trim());
        return { src, focal: focal || "center" };
      }).filter(p => p.src);
      delete fm.photo;
    }
    return fm;
  }

  /* ─────────── helpers ──────────────────────────────────────────── */
  function slugify(s) {
    return (s || "").toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60);
  }
  function fmtDate(d, opts) {
    if (!d) return "";
    // accept YYYY-MM-DD or full ISO datetime
    const dt = d.includes("T") ? new Date(d) : new Date(d + "T00:00:00");
    if (isNaN(dt)) return d;
    return dt.toLocaleDateString("en-US", opts || { month: "short", day: "numeric", year: "numeric" });
  }
  function fmtMonth(d) { return fmtDate(d, { month: "short", year: "numeric" }); }

  /* Relative date for recent items — falls back to absolute date past 7 days. */
  function fmtRelativeDate(d) {
    if (!d) return "";
    const dt = d.includes("T") ? new Date(d) : new Date(d + "T00:00:00");
    if (isNaN(dt)) return d;
    const now = new Date();
    const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.round((startOfDay(now) - startOfDay(dt)) / 86400000);
    if (diffDays === 0)            return "today";
    if (diffDays === 1)            return "yesterday";
    if (diffDays > 1 && diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays === -1)           return "tomorrow";
    return fmtDate(d, { weekday: "long", month: "long", day: "numeric", year: "numeric" }).toLowerCase();
  }

  /* Build a GitHub web-editor URL for a source file. (Used internally
     by the future-self if we ever want a one-tap edit button again;
     not rendered anywhere on the public-facing site.) */
  function editUrl(path) {
    if (!SITE || !SITE.repo || !path) return null;
    const branch = (SITE.branch || "main").trim();
    const repo = SITE.repo.replace(/\/+$/, "");
    return `${repo}/edit/${branch}/${path}`;
  }

  /* Build a GitHub "create new file" URL pre-named for a missing
     wikilink target. Defaults the new file to content/notes/<slug>.md
     with a YAML title frontmatter pre-filled. */
  function newFileUrl(target) {
    if (!SITE || !SITE.repo) return null;
    const branch = (SITE.branch || "main").trim();
    const repo = SITE.repo.replace(/\/+$/, "");
    const slug = String(target)
      .replace(/[^A-Za-z0-9_-]+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || "new-note";
    const body = `---\ntitle: ${target}\n---\n\n`;
    return `${repo}/new/${branch}/content/notes/?filename=${slug}.md&value=${encodeURIComponent(body)}`;
  }
  function readingTime(md) {
    const w = (md || "").split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(w / 220));
  }
  function dateRange(start, end) {
    const a = fmtMonth(start);
    const b = end ? fmtMonth(end) : "present";
    return `${a} — ${b}`;
  }

  /* ─────────── state ────────────────────────────────────────────── */
  let SITE = null;
  let entries = [];
  const bySlug = {};

  /* ─────────── homepage ─────────────────────────────────────────── */
  function renderHome() {
    document.title = `${SITE.name} — ${SITE.role}`;
    $("[data-bind=name]").textContent = SITE.name;
    $("[data-bind=tagline]").textContent = SITE.tagline || SITE.role;
    $("[data-bind=city]").textContent = (SITE.location || "").split(",")[0].trim();
    $$("[data-bind='footer-name']").forEach(el => el.textContent = SITE.name);
    $$("[data-bind='footer-name-2']").forEach(el => el.textContent = SITE.name);
    $("#year").textContent = new Date().getFullYear();
    const metaYear = $("#home-meta-year");
    if (metaYear) metaYear.textContent = new Date().getFullYear();
    $("#year2").textContent = new Date().getFullYear();

    if (SITE.now) {
      $("[data-bind=now]").hidden = false;
      $("[data-bind=now-text]").textContent = SITE.now;
    }

    // Build nav based on which sections have entries
    const sections = [
      { id: "about",        label: "about",        always: true },
      { id: "experience",   label: "experience",   always: true },
      { id: "projects",     label: "projects",     always: true },
      { id: "writing",      label: "blog",         always: true },
      { id: "certificates", label: "certificates", always: true },
      { id: "skills",       label: "skills",       always: true },
      { id: "contact",      label: "contact",      always: true },
    ];
    const visible = sections.filter(s => s.always);
    $("#home-nav").innerHTML = visible.map((s, i) =>
      `${i ? '<span class="slash">//</span>' : ""}<a href="#/${s.id}">${s.label}</a>`
    ).join("");

    // clock
    function tickClock() {
      const tz = SITE.tz || "UTC";
      try {
        const opts = { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false };
        $("#clock").textContent = new Intl.DateTimeFormat([], opts).format(new Date());
        const tzAbbr = new Intl.DateTimeFormat([], { timeZone: tz, timeZoneName: "short" })
          .formatToParts(new Date()).find(p => p.type === "timeZoneName");
        if (tzAbbr) $("#tz-abbr").textContent = tzAbbr.value;
      } catch (err) {
        $("#clock").textContent = "—";
      }
    }
    tickClock();
    if (!window.__clockTick) {
      window.__clockTick = setInterval(tickClock, 1000);
    }

    setupHero(SITE.photos || []);
  }

  /* ─────────── hero photo shuffle ──────────────────────────────── */
  function setupHero(photos) {
    const a = $("#hero-a"), b = $("#hero-b"), empty = $("#hero-empty");
    if (!a || !b) return;
    if (!photos.length) {
      a.hidden = true; b.hidden = true;
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;

    // Shuffle a copy so the first photo on each load is random.
    const order = photos.slice().sort(() => Math.random() - 0.5);
    let i = 0;
    let showA = true;

    function preload(src) { const im = new Image(); im.src = src; }
    // pre-load all so crossfades are instant
    order.forEach(p => preload(p.src));

    function next() {
      const photo = order[i % order.length];
      const cur = showA ? a : b;
      const prev = showA ? b : a;
      cur.src = photo.src;
      cur.style.objectPosition = photo.focal || "center";
      cur.alt = "";
      cur.classList.add("active");
      prev.classList.remove("active");
      showA = !showA;
      i++;
    }
    next();
    if (window.__heroTick) clearInterval(window.__heroTick);
    // Crossfade to a different photo every 30 minutes.
    window.__heroTick = setInterval(next, 30 * 60 * 1000);
  }

  /* ─────────── sub-page renderers ──────────────────────────────── */
  /* setCrumb takes either a string (single-segment breadcrumb) or an array
     of {label, route} objects (hierarchy). Top-level pages render plain;
     nested pages render as [#name] / [##name] etc. based on depth. */
  function setCrumb(parts) {
    const list = Array.isArray(parts) ? parts : [{ label: parts }];
    const crumb = $(".crumb");
    if (!crumb) return;
    const segs = list.map((p, i) => {
      const display = i === 0
        ? escapeHtml(p.label)
        : `[${"#".repeat(i)}${escapeHtml(p.label)}]`;
      const isLast = i === list.length - 1;
      return p.route && !isLast
        ? `<a href="${p.route}">${display}</a>`
        : `<span>${display}</span>`;
    });
    crumb.innerHTML = `<a href="#">home</a>` + segs.map(s => `<span class="sep">/</span>${s}`).join("");
  }
  function setTitle(t)      { $("#page-title").textContent = t; }
  function setLead(t) {
    const el = $("#page-lead");
    if (t) { el.textContent = t; el.hidden = false; }
    else   { el.hidden = true; }
  }

  /* Subdir nav — renders [#child] / [##grandchild] links for any page
     that has children (entries declaring `parent: <pageId>`). */
  const KIND_LABEL = {
    faq: "FAQ", post: "Writing", note: "Notes",
    project: "Projects", certificate: "Certificates",
    experience: "Experience", skills: "Skills", about: "About", contact: "Contact",
  };
  function findEntryByPageId(id) {
    const lower = String(id || "").toLowerCase();
    return entries.find(e => e.kind === lower)
        || (bySlug && bySlug[lower])
        || byBasename[lower]
        || null;
  }
  function depthOfEntry(e, seen) {
    seen = seen || new Set();
    if (!e || !e.parent || seen.has(e.slug)) return 0;
    seen.add(e.slug);
    const p = findEntryByPageId(e.parent);
    return 1 + depthOfEntry(p, seen);
  }
  function showSubdirs(pageId) {
    const el = $("#page-subdirs");
    if (!el) return;
    if (!pageId) { el.hidden = true; el.innerHTML = ""; return; }
    const lower = String(pageId).toLowerCase();
    const kids = entries.filter(e => (e.parent || "").toLowerCase() === lower);
    if (!kids.length) { el.hidden = true; el.innerHTML = ""; return; }
    kids.sort((a, b) => (parseInt(a.order || 999) - parseInt(b.order || 999))
                     || (a.title || "").localeCompare(b.title || ""));
    const seenRoutes = new Set();
    const links = [];
    for (const k of kids) {
      const route = routeForEntry(k);
      if (!route || seenRoutes.has(route)) continue;
      seenRoutes.add(route);
      const depth = depthOfEntry(k);
      const hashes = "#".repeat(Math.max(1, depth));
      const label = KIND_LABEL[k.kind] || (k.kind[0].toUpperCase() + k.kind.slice(1));
      links.push(`<a class="subdir" href="${route}">[${hashes}${escapeHtml(label)}]</a>`);
    }
    if (!links.length) { el.hidden = true; el.innerHTML = ""; return; }
    el.innerHTML = links.join(" ");
    el.hidden = false;
  }

  /* ─────────── markdown rendering w/ link resolution ─────────────── */
  /* Look-up tables built after entries are loaded, used to rewrite
     wikilinks ([[target]]) and relative .md paths ([text](file.md))
     into the right `#/` hash routes. */
  const byTitleLower = {};   // title (lowercased) → entry
  const byBasename   = {};   // filename without .md (lowercased) → entry
  const byPath       = {};   // full content/.../file.md path → entry
  function buildLookups() {
    Object.keys(byTitleLower).forEach(k => delete byTitleLower[k]);
    Object.keys(byBasename).forEach(k => delete byBasename[k]);
    Object.keys(byPath).forEach(k => delete byPath[k]);
    for (const e of entries) {
      if (e.title) byTitleLower[e.title.toLowerCase()] = e;
      if (e._path) {
        byPath[e._path] = e;
        const base = e._path.split("/").pop().replace(/\.md$/i, "").toLowerCase();
        if (!byBasename[base]) byBasename[base] = e;
      }
    }
  }

  /* Map an entry to its public hash route (or external URL). */
  function routeForEntry(e) {
    if (!e) return null;
    switch (e.kind) {
      case "about":       return "#/about";
      case "faq":         return "#/faq";
      case "skills":      return "#/skills";
      case "contact":     return "#/contact";
      case "note":        return "#/notes";
      case "experience":  return "#/experience";
      case "certificate": return (e.link && !e.link.includes("REPLACE_ME")) ? e.link : "#/certificates";
      case "project":
      case "post":        return e.link || ("#/entry/" + e.slug);
    }
    return null;
  }

  function resolveWikilink(target) {
    const key = String(target).trim().toLowerCase();
    return byTitleLower[key] || byBasename[key] || bySlug[key] || null;
  }

  function resolveRelativeMdPath(href) {
    // Strip leading ./, ../, /. If no folder, assume content/.
    let p = href.replace(/^\.\//, "").replace(/^\.\.\//, "").replace(/^\//, "");
    if (!p.includes("/")) p = "content/" + p;
    else if (!p.startsWith("content/")) p = "content/" + p;
    if (byPath[p]) return byPath[p];
    // also try treating href as basename only
    const base = href.split("/").pop().replace(/\.md$/i, "").toLowerCase();
    return byBasename[base] || null;
  }

  function postProcessLinks(html) {
    // Resolve wikilink placeholders → real routes, OR to a GitHub
    // "new file" URL when unresolved so clicking creates the note.
    html = html.replace(/href="#__wiki__\/([^"]+)"/g, (_m, raw) => {
      const target = decodeURIComponent(raw);
      const e = resolveWikilink(target);
      if (e) return `href="${routeForEntry(e)}"`;
      const create = newFileUrl(target);
      if (create) {
        return `href="${create}" target="_blank" rel="noopener noreferrer" class="wikilink-missing" title="Create “${target.replace(/"/g, "&quot;")}” on GitHub"`;
      }
      return `href="#" class="wikilink-missing" title="No entry named “${target.replace(/"/g, "&quot;")}”"`;
    });
    // Resolve relative .md links to their routes.
    html = html.replace(/<a([^>]*?)href="([^"]+\.md(?:#[^"]*)?)"([^>]*)>/g, (m, pre, href, post) => {
      if (/^https?:/i.test(href)) return m;
      const anchor = href.match(/#.*$/);
      const path = href.replace(/#.*$/, "");
      const e = resolveRelativeMdPath(path);
      if (!e) return m;
      const route = routeForEntry(e) + (anchor ? anchor[0] : "");
      return `<a${pre}href="${route}"${post}>`;
    });
    return html;
  }

  /* Render a Markdown body and resolve every internal link in one go. */
  function renderMd(body) {
    return postProcessLinks(window.md.render(body || ""));
  }

  function renderAbout() {
    setCrumb([{ label: "about" }]);
    setTitle("About"); setLead("");
    showSubdirs("about");
    const e = entries.find(x => x.kind === "about");
    const body = e ? e.body : "_Add an entry with `kind: about` in content.md._";
    $("#page-body").className = "prose";
    $("#page-body").innerHTML = renderMd(body);
  }

  function renderSkills() {
    setCrumb([{ label: "skills" }]);
    setTitle("Skills"); setLead("");
    showSubdirs("skills");
    const e = entries.find(x => x.kind === "skills");
    const body = e ? e.body : "_Add an entry with `kind: skills` in content.md._";
    $("#page-body").className = "prose skills";
    $("#page-body").innerHTML = renderMd(body);
  }

  function renderFaq() {
    setCrumb([{ label: "about", route: "#/about" }, { label: "faq" }]);
    setTitle("FAQ");
    setLead("Things people ask. Updated when they ask new things.");
    showSubdirs("faq");
    const list = entries.filter(x => x.kind === "faq")
                        .sort((a, b) => (a.order || 999) - (b.order || 999));
    if (!list.length) {
      $("#page-body").className = "";
      $("#page-body").innerHTML = `<p class="empty">Add entries to <code>content/faq.md</code>.</p>`;
      return;
    }
    $("#page-body").className = "faq";
    $("#page-body").innerHTML = list.map(e => `
      <section class="faq-item">
        <h2 class="faq-q">${escapeHtml(e.title || "")}</h2>
        <div class="faq-a prose">${renderMd(e.body)}</div>
      </section>
    `).join("");
  }

  function renderContact() {
    setCrumb([{ label: "contact" }]);
    setTitle("Contact"); setLead("");
    showSubdirs("contact");
    const e = entries.find(x => x.kind === "contact");
    let html = "";
    if (e && e.body) {
      html = `<div class="prose">${renderMd(e.body)}</div>`;
    }
    const links = SITE.links || [];
    if (links.length) {
      html += `<dl class="contact-grid" style="${e && e.body ? 'margin-top:2rem;' : ''}">` +
        links.map(l => {
          const isMail = l.href.startsWith("mailto:");
          const isExternal = /^https?:/.test(l.href);
          const attrs = isExternal ? ' target="_blank" rel="noopener"' : '';
          const display = isMail ? l.href.replace("mailto:", "") : l.href.replace(/^https?:\/\//, "");
          return `<dt>${l.label}</dt><dd><a href="${l.href}"${attrs}>${display}</a></dd>`;
        }).join("") +
        `</dl>`;
    }
    $("#page-body").className = "";
    $("#page-body").innerHTML = html || `<p class="empty">No contact info yet.</p>`;
  }

  function renderExperience() {
    setCrumb([{ label: "experience" }]);
    setTitle("Experience");
    setLead("Where I've worked, what I built, and certificates where applicable.");
    showSubdirs("experience");
    const list = entries.filter(e => e.kind === "experience")
                       .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    if (!list.length) {
      $("#page-body").className = "";
      $("#page-body").innerHTML = `<p class="empty">No experience entries yet.</p>`;
      return;
    }

    // Group by `org` while preserving date-descending order of first appearance.
    const groups = [];
    const idx = new Map();
    list.forEach(e => {
      const key = e.org || e.role || "";
      if (!idx.has(key)) { idx.set(key, groups.length); groups.push({ org: key, roles: [] }); }
      groups[idx.get(key)].roles.push(e);
    });

    $("#page-body").className = "list-section";
    $("#page-body").innerHTML = groups.map(g => {
      const headerLocation = g.roles[0].location || "";
      const isMulti = g.roles.length > 1;
      const rangeAll = isMulti
        ? (() => {
            const starts = g.roles.map(r => r.date).filter(Boolean).sort();
            const ends   = g.roles.map(r => r.end || r.date).filter(Boolean).sort();
            return dateRange(starts[0], ends[ends.length - 1]);
          })()
        : null;
      return `
        <section class="exp-group${isMulti ? ' multi' : ''}">
          <header class="exp-group-head">
            <div class="exp-org-name">${escapeHtml(g.org)}</div>
            <div class="exp-group-meta">
              ${headerLocation ? `<span>${escapeHtml(headerLocation)}</span>` : ""}
              ${isMulti ? `<span class="sep">·</span><span>${escapeHtml(g.roles.length + " roles")}</span><span class="sep">·</span><span>${rangeAll}</span>` : ""}
            </div>
          </header>
          ${g.roles.map(e => {
            const cert = e.cert && !e.cert.includes("REPLACE_ME")
              ? ` <span class="sep">·</span> <a class="cert" href="${e.cert}" target="_blank" rel="noopener">certificate ↗</a>`
              : (e.cert ? ` <span class="sep">·</span> <span style="color:var(--ink-faint)">certificate (link tbd)</span>` : "");
            return `
              <article class="exp-role-item">
                <div class="exp-role">${escapeHtml(e.role || e.title || "")}</div>
                <div class="exp-meta">
                  <span>${dateRange(e.date, e.end)}</span>
                  ${e.location && e.location !== headerLocation ? `<span class="sep">·</span><span>${escapeHtml(e.location)}</span>` : ""}
                  ${cert}
                </div>
                ${e.summary ? `<p class="exp-summary">${escapeHtml(e.summary)}</p>` : ""}
                ${e.body ? `<div class="exp-body prose">${renderMd(e.body)}</div>` : ""}
              </article>`;
          }).join("")}
        </section>`;
    }).join("");
  }

  function renderCertificates() {
    setCrumb([{ label: "certificates" }]);
    setTitle("Certificates");
    setLead("Programs and courses I've completed. Click through for the certificate where linked.");
    showSubdirs("certificates");
    const list = entries.filter(e => e.kind === "certificate")
                       .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    if (!list.length) {
      $("#page-body").className = "";
      $("#page-body").innerHTML = `<p class="empty">No certificates yet.</p>`;
      return;
    }
    $("#page-body").className = "list-section";
    $("#page-body").innerHTML = list.map(c => {
      const linkPart = c.link && !c.link.includes("REPLACE_ME")
        ? `<a href="${c.link}" target="_blank" rel="noopener">view ↗</a>`
        : `<span style="color:var(--ink-faint)">link tbd</span>`;
      return `
        <div class="cert-item">
          <div class="cert-main">
            <div class="cert-title">${escapeHtml(c.title || "")}</div>
            ${c.issuer ? `<div class="cert-issuer">${escapeHtml(c.issuer)}</div>` : ""}
          </div>
          <div class="cert-side">${fmtMonth(c.date)} ${linkPart}</div>
        </div>`;
    }).join("");
  }

  let currentNotesTag = null;

  function renderNotesInline() {
    setCrumb([{ label: "notes" }]);
    setTitle("Notes");
    setLead("Idea dumps, how-tos, running logs — anything I want to find again.");
    showSubdirs("note");
    let list = entries.filter(e => e.kind === "note")
                      .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    if (currentNotesTag) list = list.filter(e => (e.tags || []).includes(currentNotesTag));
    if (!list.length) {
      $("#page-body").className = "";
      $("#page-body").innerHTML = `<p class="empty">Open <code>content/notes.md</code> and add a <code>---</code> block. Or drop a new file into <code>content/notes/</code>.</p>`;
      return;
    }
    $("#page-body").className = "diary";
    const tagBanner = currentNotesTag
      ? `<div class="tag-filter-banner">Filtered by <span>#${currentNotesTag}</span> · <button id="clear-notes-tag">clear</button></div>`
      : "";
    $("#page-body").innerHTML = tagBanner + list.map(e => {
      const dateLong = fmtDate(e.date, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
      const dateLabel = fmtRelativeDate(e.date) || dateLong.toLowerCase();
      const hasExplicitTitle = e.title && !looksDerived(e);
      const tagsHtml = (e.tags || []).length
        ? `<div class="note-tags">${e.tags.map(t => `<button class="tag" data-tag="${escapeHtml(t)}">${escapeHtml(t)}</button>`).join("")}</div>`
        : "";
      return `
        <article class="diary-entry">
          <header class="diary-head">
            <time class="diary-date">${dateLabel}</time>
            ${hasExplicitTitle ? `<h2 class="diary-title">${escapeHtml(e.title)}</h2>` : ""}
          </header>
          <div class="diary-body prose">${renderMd(e.body)}</div>
          ${tagsHtml}
        </article>`;
    }).join("");

    $$(".note-tags .tag", $("#page-body")).forEach(b => {
      b.addEventListener("click", () => {
        currentNotesTag = currentNotesTag === b.dataset.tag ? null : b.dataset.tag;
        renderNotesInline();
      });
    });
    const clear = $("#clear-notes-tag");
    if (clear) clear.addEventListener("click", () => { currentNotesTag = null; renderNotesInline(); });
  }

  /* If the title equals what we would have derived from the body, treat it
     as auto-generated and don't render a separate heading for it. */
  function looksDerived(e) {
    if (!e.body || !e.title) return false;
    return deriveTitle(e.body) === e.title;
  }

  function renderList(kind, label, lead) {
    setCrumb([{ label: label.toLowerCase() }]);
    setTitle(label);
    setLead(lead || "");
    showSubdirs(kind);
    const list = entries.filter(e => e.kind === kind)
                       .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    if (!list.length) {
      $("#page-body").className = "";
      $("#page-body").innerHTML = `<p class="empty">No ${kind}s yet.</p>`;
      return;
    }
    $("#page-body").className = "list-section";
    $("#page-body").innerHTML = list.map(e => {
      const isExternal = !!e.link;
      const dateStr = fmtMonth(e.date);
      const tagsHtml = (e.tags || []).map(t => `<span class="tag">${t}</span>`).join("");
      return `
        <article class="list-item" data-slug="${e.slug}" data-external="${isExternal ? '1':'0'}" ${isExternal ? `data-href="${e.link}"` : ''}>
          <div class="list-row">
            <span class="list-title">${escapeHtml(e.title || "")}</span>
            <span class="list-arrow">${isExternal ? "↗" : "→"}</span>
          </div>
          ${e.summary ? `<p class="list-summary">${escapeHtml(e.summary)}</p>` : ""}
          <div style="display:flex;justify-content:space-between;align-items:baseline;gap:.5rem;flex-wrap:wrap;">
            ${tagsHtml ? `<div class="list-tags">${tagsHtml}</div>` : "<div></div>"}
            <span class="list-date">${dateStr}</span>
          </div>
        </article>`;
    }).join("");

    $$(".list-item", $("#page-body")).forEach(el => {
      el.addEventListener("click", () => {
        if (el.dataset.external === "1") {
          const safe = safeExternal(el.dataset.href);
          if (safe) window.open(safe, "_blank", "noopener,noreferrer");
        } else location.hash = "#/entry/" + el.dataset.slug;
      });
    });
  }

  function renderReader(slug) {
    const e = bySlug[slug];
    if (!e) { render404("entry/" + slug); return; }
    const KIND_PAGE = { project: "projects", post: "writing", note: "notes" };
    const section = KIND_PAGE[e.kind] || "entry";
    setCrumb([
      { label: section, route: "#/" + section },
      { label: (e.title || "").toLowerCase() },
    ]);
    setTitle(e.title || "Untitled");
    setLead("");
    showSubdirs(null);

    const meta = [];
    meta.push(`<span>${e.kind}</span>`);
    if (e.date) meta.push(`<span class="sep">·</span><span>${fmtDate(e.date)}</span>`);
    if (e.kind === "post" && e.body) meta.push(`<span class="sep">·</span><span>${readingTime(e.body)} min read</span>`);
    if ((e.tags || []).length) meta.push(`<span class="sep">·</span><span>${e.tags.map(t => "#"+t).join("  ")}</span>`);

    $("#page-body").className = "";
    $("#page-body").innerHTML = `
      <div class="reader-meta">${meta.join("")}</div>
      ${e.summary ? `<p class="reader-summary">${escapeHtml(e.summary)}</p>` : ""}
      <div class="prose">${renderMd(e.body || "_No content yet._")}</div>
      <p style="margin-top:3rem;font-family:var(--mono);font-size:11px;letter-spacing:.04em;">
        <a href="#/${section}">← back to ${section}</a>
      </p>
    `;
  }

  function escapeHtml(s) { return window.md.escapeHtml(s || ""); }

  /* Restrict navigations triggered by `link:` / `cert:` etc. to safe
     schemes only. Mirrors md.js#sanitizeUrl. */
  function safeExternal(url) {
    const s = String(url || "").trim();
    return /^(https?:|mailto:|tel:)/i.test(s) ? s : null;
  }

  /* ─────────── router ──────────────────────────────────────────── */
  /* 404 fallback for unknown hash routes. */
  function render404(badRoute) {
    setCrumb([{ label: "404" }]);
    setTitle("Not found");
    setLead("");
    showSubdirs(null);
    $("#page-body").className = "";
    $("#page-body").innerHTML = `
      <p style="color:var(--ink-soft);text-wrap:pretty">No page at <code>#/${escapeHtml(badRoute)}</code>. It may have moved, been renamed, or never existed.</p>
      <p style="font-family:var(--mono);font-size:11px;color:var(--ink-faint);margin-top:2rem;letter-spacing:0.04em">try <button class="cmdk-trigger" style="background:none;border:0;border-bottom:1px dotted var(--rule);font:inherit;color:inherit;cursor:pointer;padding:0">⌘K · search</button> or <a href="#">go home</a></p>
    `;
  }

  function showHome() {
    $("#page-home").hidden = false;
    $("#page-sub").hidden = true;
    renderHome();
    window.scrollTo(0, 0);
  }
  function showSub() {
    $("#page-home").hidden = true;
    $("#page-sub").hidden = false;
    window.scrollTo(0, 0);
  }

  function route() {
    const h = location.hash || "";
    refreshThemeLink();

    const entryMatch = h.match(/^#\/entry\/(.+)$/);
    if (entryMatch) { showSub(); renderReader(decodeURIComponent(entryMatch[1])); return; }

    const sectionMatch = h.match(/^#\/(.+)$/);
    const section = sectionMatch ? sectionMatch[1] : "";

    switch (section) {
      case "":             showHome(); return;
      case "about":        showSub(); renderAbout(); return;
      case "faq":          showSub(); renderFaq(); return;
      case "experience":   showSub(); renderExperience(); return;
      case "projects":     showSub(); renderList("project", "Projects", "Software, research, and the occasional piece of hardware."); return;
      case "writing":      showSub(); renderList("post", "Writing", "Essays and notes from the work."); return;
      case "notes":        showSub(); renderNotesInline(); return;
      case "certificates": showSub(); renderCertificates(); return;
      case "skills":       showSub(); renderSkills(); return;
      case "contact":      showSub(); renderContact(); return;
      default:             if (section) { showSub(); render404(section); return; }
                           showHome(); return;
    }
  }

  /* ─────────── boot ────────────────────────────────────────────── */
  async function boot() {
    let text;
    try {
      const res = await fetch("content.md?v=" + Date.now(), { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      text = await res.text();
    } catch (err) {
      document.body.innerHTML = `
        <main style="max-width:540px;margin:8rem auto;padding:0 2rem;font-family:var(--serif);color:var(--ink);">
          <h1 style="font-size:1.5rem;margin:0 0 1rem;">Can't load <code>content.md</code></h1>
          <p style="color:var(--ink-soft)">This site reads your content from <code>content.md</code> over HTTP. If you opened <code>index.html</code> by double-clicking, the browser blocks that.</p>
          <p style="color:var(--ink-soft)">Run a local server in this folder:</p>
          <pre style="background:var(--surface);border:1px solid var(--rule);padding:1rem;font-family:var(--mono);font-size:13px;">python3 -m http.server 8000</pre>
          <p style="color:var(--ink-soft)">Then open <a href="http://localhost:8000">http://localhost:8000</a>. Or deploy to GitHub Pages / Netlify / Vercel.</p>
          <p style="color:var(--ink-faint);font-family:var(--mono);font-size:12px;margin-top:2rem;">Error: ${err.message}</p>
        </main>`;
      return;
    }

    const parsed = parseManifest(text);
    SITE = parsed.header;

    // Resolve `dir:` directives → concrete file paths via GitHub API.
    const dirFiles = (await Promise.all((SITE.dirs || []).map(listDirFromGitHub))).flat();

    // Combine explicit file: lines + auto-discovered dir contents, dedupe.
    const seenPaths = new Set();
    const allFiles = [...(SITE.files || []), ...dirFiles].filter(p => {
      if (seenPaths.has(p)) return false;
      seenPaths.add(p);
      return true;
    });

    // Fetch every file in the manifest (in parallel) and parse entries.
    const fileResults = await Promise.all(allFiles.map(async (path) => {
      try {
        const r = await fetch(path + "?v=" + Date.now(), { cache: "no-store" });
        if (!r.ok) throw new Error("HTTP " + r.status);
        return { path, text: await r.text(), error: null };
      } catch (err) {
        console.warn("Failed to load", path, err.message);
        return { path, text: "", error: err.message };
      }
    }));
    const fileEntries = fileResults.flatMap(r => r.text ? parseEntries(r.text, r.path) : []);
    const collected = [...parsed.inlineEntries, ...fileEntries];

    entries = collected.map(e => ({ ...e, slug: slugify(e.title || e.role || e.kind) }));
    // De-duplicate slugs (append -2, -3, etc. for collisions)
    const seen = {};
    entries.forEach(e => {
      const base = e.slug || "untitled";
      seen[base] = (seen[base] || 0) + 1;
      if (seen[base] > 1) e.slug = base + "-" + seen[base];
    });
    entries.forEach(e => { bySlug[e.slug] = e; });

    buildLookups();

    // wire theme toggles (re-bound after each render where the link exists)
    document.addEventListener("click", (ev) => {
      const t = ev.target;
      if (t && (t.id === "theme-toggle" || t.id === "theme-toggle-2")) {
        toggleTheme(ev);
      }
    });

    window.addEventListener("hashchange", route);

    $("#boot-loader").style.display = "none";
    $("#app").style.display = "";
    route();
    setupCmdK();
  }

  /* ─────────── Cmd+K global search modal ───────────────────────────── */
  function setupCmdK() {
    const modal = $("#cmdk");
    const input = $("#cmdk-input");
    const results = $("#cmdk-results");
    if (!modal || !input || !results) return;
    let activeIdx = 0;
    let matches = [];

    function open() {
      modal.hidden = false;
      input.value = "";
      activeIdx = 0;
      renderMatches("");
      setTimeout(() => input.focus(), 10);
    }
    function close() { modal.hidden = true; }

    function indexable() {
      return entries.filter(e => e.kind && e.kind !== "about" && e.kind !== "skills" && e.kind !== "contact");
    }
    function score(e, q) {
      const text = ((e.title || "") + " " + (e.summary || "") + " " + (e.tags || []).join(" ") + " " + (e.body || "")).toLowerCase();
      const idx = text.indexOf(q);
      if (idx === -1) return -1;
      // bias toward early matches and matches in title
      let s = 1000 - idx;
      if ((e.title || "").toLowerCase().includes(q)) s += 1000;
      return s;
    }
    function navTarget(e) {
      const sectionMap = { project: "projects", post: "writing", note: "notes", note_inline: "notes", certificate: "certificates", experience: "experience" };
      if (e.kind === "note")        return "#/notes";
      if (e.kind === "experience")  return "#/experience";
      if (e.kind === "certificate") return e.link && !e.link.includes("REPLACE_ME") ? e.link : "#/certificates";
      if (e.kind === "project")     return e.link ? e.link : "#/entry/" + e.slug;
      if (e.kind === "post")        return "#/entry/" + e.slug;
      return "#/" + (sectionMap[e.kind] || "");
    }

    function renderMatches(q) {
      q = q.trim().toLowerCase();
      const pool = indexable();
      let scored;
      if (!q) {
        // empty query: show recent across all sections
        scored = pool.slice().sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 12);
      } else {
        scored = pool.map(e => ({ e, s: score(e, q) }))
                     .filter(x => x.s >= 0)
                     .sort((a, b) => b.s - a.s)
                     .slice(0, 20)
                     .map(x => x.e);
      }
      matches = scored;
      activeIdx = 0;
      results.innerHTML = matches.map((e, i) => {
        const kind = (e.kind || "").toUpperCase();
        const date = e.date ? fmtDate(e.date, { month: "short", day: "numeric", year: "numeric" }) : "";
        const subtitle = e.summary || (e.body || "").slice(0, 100);
        return `
          <li class="cmdk-result${i === 0 ? " active" : ""}" data-i="${i}">
            <div class="cmdk-row">
              <span class="cmdk-kind">${kind}</span>
              <span class="cmdk-title">${escapeHtml(e.title || "(untitled)")}</span>
              <span class="cmdk-date">${date}</span>
            </div>
            ${subtitle ? `<div class="cmdk-sub">${escapeHtml(subtitle).slice(0, 140)}</div>` : ""}
          </li>`;
      }).join("") || `<li class="cmdk-empty">No matches.</li>`;

      $$(".cmdk-result", results).forEach(el => {
        el.addEventListener("mouseenter", () => setActive(+el.dataset.i));
        el.addEventListener("click", () => choose(matches[+el.dataset.i]));
      });
    }
    function setActive(i) {
      activeIdx = Math.max(0, Math.min(matches.length - 1, i));
      $$(".cmdk-result", results).forEach((el, j) => el.classList.toggle("active", j === activeIdx));
      const el = results.children[activeIdx];
      if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest" });
    }
    function choose(e) {
      if (!e) return;
      const target = navTarget(e);
      close();
      if (/^https?:/.test(target)) {
        const safe = safeExternal(target);
        if (safe) window.open(safe, "_blank", "noopener,noreferrer");
      } else location.hash = target;
    }

    input.addEventListener("input", () => renderMatches(input.value));
    input.addEventListener("keydown", (ev) => {
      if (ev.key === "ArrowDown") { ev.preventDefault(); setActive(activeIdx + 1); }
      else if (ev.key === "ArrowUp") { ev.preventDefault(); setActive(activeIdx - 1); }
      else if (ev.key === "Enter") { ev.preventDefault(); choose(matches[activeIdx]); }
      else if (ev.key === "Escape") { ev.preventDefault(); close(); }
    });
    modal.addEventListener("click", (ev) => {
      if (ev.target === modal || ev.target.classList.contains("cmdk-backdrop")) close();
    });

    document.addEventListener("keydown", (ev) => {
      // Cmd+K / Ctrl+K to open; "/" anywhere outside an input to open
      const isCmdK = (ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "k";
      const isSlash = ev.key === "/" && !["INPUT","TEXTAREA"].includes(document.activeElement.tagName);
      if (isCmdK || isSlash) {
        ev.preventDefault();
        if (modal.hidden) open(); else close();
      }
    });

    // Wire up the trigger pill (if present) on every page.
    document.addEventListener("click", (ev) => {
      if (ev.target && ev.target.closest && ev.target.closest(".cmdk-trigger")) {
        ev.preventDefault();
        open();
      }
    });
  }

  boot();
})();
