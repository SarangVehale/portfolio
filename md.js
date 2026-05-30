/* ─────────────────────────────────────────────────────────────────────────
   md.js — a tiny Markdown renderer.

   Exposes `window.md.render(markdown_string)` and `window.md.escapeHtml(s)`.

   Supports: # / ## / ### headings, paragraphs, **bold**, *italic*,
   `inline code`, ```fenced code```, [links](url), ![alt](src),
   - / * unordered lists, 1. ordered lists, > blockquotes, --- hr.

   Security model:
     - All input is HTML-escaped before any inline processing.
     - URL schemes on links and images are restricted to http(s), mailto,
       relative paths, and #-hashes. Anything else (notably `javascript:`
       and untrusted `data:` URIs) is replaced with `#`.
     - The renderer never produces script tags, event-handler attributes,
       or style attributes.

   This is intentionally minimal. If you need footnotes, tables, or task
   lists, drop in a real Markdown parser (marked, markdown-it) and call it
   from app.js instead.
   ───────────────────────────────────────────────────────────────────── */

(function () {
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* Allow http(s), mailto, tel, relative paths, anchor links, and image
     data: URIs (PNG/JPEG/SVG only). Everything else collapses to `#`. */
  function sanitizeUrl(href, isImage) {
    const s = String(href).trim();
    if (/^(https?:|mailto:|tel:)/i.test(s)) return s;
    if (s.startsWith("#") || s.startsWith("/") || s.startsWith("./") || s.startsWith("../")) return s;
    if (isImage && /^data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);base64,/i.test(s)) return s;
    // relative path without protocol (e.g. photos/foo.jpg)
    if (!/^[a-z][a-z0-9+.-]*:/i.test(s)) return s;
    return "#";
  }

  function inline(s) {
    // Obsidian-style wikilinks: [[target]] or [[target|display text]].
    // Render with a placeholder href that app.js post-processes once it
    // knows about the entry table. Unresolved links get .wikilink-missing.
    s = s.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, display) => {
      const text = (display || target).trim();
      const href = "#__wiki__/" + encodeURIComponent(target.trim());
      return `<a href="${href}" class="wikilink">${escapeHtml(text)}</a>`;
    });
    // images
    s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
      (_, alt, src) => `<img alt="${escapeHtml(alt)}" src="${escapeHtml(sanitizeUrl(src, true))}">`);
    // links — text has already been HTML-escaped by the caller
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
      (_, text, href) => {
        const safe = sanitizeUrl(href, false);
        const isExternal = /^https?:/.test(safe);
        const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<a href="${escapeHtml(safe)}"${attrs}>${text}</a>`;
      });
    // inline code
    s = s.replace(/`([^`]+)`/g, (_, c) => `<code>${escapeHtml(c)}</code>`);
    // bold + italic
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
    // Auto-link bare URLs. Run AFTER explicit-link processing so we don't
    // double-wrap. We're operating on already-escaped text, so `&` is now
    // `&amp;` — the URL pattern accepts those entities. Negative lookbehind
    // via the leading char class skips matches already inside an attribute
    // (preceded by `"`, `'`, `=`) or already inside a tag (preceded by `>`).
    s = s.replace(
      /(^|[^"'=>])(https?:\/\/(?:&amp;|[A-Za-z0-9._~!$()*+,;:@%#\/?=\-])+)/g,
      (_, pre, url) => {
        const m = url.match(/^(.*?)([.,;:!?]+)$/);
        const clean = m ? m[1] : url;
        const trail = m ? m[2] : "";
        // `clean` is already HTML-escaped (callers pass escaped text in),
        // but defensively re-escape on insertion so a future widening of
        // the URL char class can't break out of the attribute or text.
        const safeHref = escapeHtml(clean);
        return `${pre}<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${safeHref}</a>${trail}`;
      }
    );
    return s;
  }

  function render(md) {
    if (!md) return "";
    md = String(md).replace(/\r\n/g, "\n");
    md = md.replace(/^\n+|\n+$/g, "");

    const lines = md.split("\n");
    const out = [];
    let i = 0;

    function flushPara(buf) {
      if (buf.length) {
        // NOTE: we do NOT unescape any HTML tags here. The previous
        // implementation re-allowed <tag>...</tag> patterns which was a
        // self-XSS vector if anyone with repo-write access wrote literal
        // HTML in their markdown.
        out.push(`<p>${inline(escapeHtml(buf.join(" ")))}</p>`);
      }
    }

    while (i < lines.length) {
      const line = lines[i];

      // fenced code
      if (/^```/.test(line)) {
        const buf = [];
        i++;
        while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
        i++;
        out.push(`<pre><code>${escapeHtml(buf.join("\n"))}</code></pre>`);
        continue;
      }

      // headings
      const h = line.match(/^(#{1,4})\s+(.*)$/);
      if (h) {
        const lvl = h[1].length;
        out.push(`<h${lvl}>${inline(escapeHtml(h[2]))}</h${lvl}>`);
        i++;
        continue;
      }

      // hr
      if (/^\s*---\s*$/.test(line)) { out.push("<hr>"); i++; continue; }

      // blockquote
      if (/^>\s?/.test(line)) {
        const buf = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) {
          buf.push(lines[i].replace(/^>\s?/, ""));
          i++;
        }
        out.push(`<blockquote>${inline(escapeHtml(buf.join(" ")))}</blockquote>`);
        continue;
      }

      // unordered list
      if (/^[-*]\s+/.test(line)) {
        const buf = [];
        while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
          buf.push(`<li>${inline(escapeHtml(lines[i].replace(/^[-*]\s+/, "")))}</li>`);
          i++;
        }
        out.push(`<ul>${buf.join("")}</ul>`);
        continue;
      }

      // ordered list
      if (/^\d+\.\s+/.test(line)) {
        const buf = [];
        while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
          buf.push(`<li>${inline(escapeHtml(lines[i].replace(/^\d+\.\s+/, "")))}</li>`);
          i++;
        }
        out.push(`<ol>${buf.join("")}</ol>`);
        continue;
      }

      // blank line
      if (/^\s*$/.test(line)) { i++; continue; }

      // paragraph
      const buf = [line];
      i++;
      while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(#{1,4}\s|>|---|\d+\.\s|[-*]\s|```)/.test(lines[i])) {
        buf.push(lines[i]); i++;
      }
      flushPara(buf);
    }

    return out.join("\n");
  }

  window.md = { render, escapeHtml, sanitizeUrl };
})();
